import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject, Utils } from "@omnia/fx";
import { Prop } from 'vue-property-decorator'
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogPositions, StyleFlow, VueComponentBase, HeadingStyles, DialogStyles } from '@omnia/fx/ux';
import { IPermissionDialog } from './IPermissionDialog';
import { PermissionDialogStyles } from '../../models';
import './PermissionDialog.css';
import { PrincipalService } from '@omnia/fx-sp';
import { OPMPermissionDialogLocalization } from './loc/localize';
import { Parameters, UserIdentity, PermissionBinding, SecurityIdentities, RolePermissionSetting, RoleDefinitions } from '@omnia/fx-models';
import { Enums, Security, AuthorAndDefaultReaderUpdateInput } from '../../fx/models';
import { SecurityService } from '@omnia/fx/services';
import { OPMContext } from '../../fx/contexts';
import { PermissionService } from '../../fx';

declare var Zepto: any;


@Component
export default class PermissionDialog extends VueComponentBase implements IWebComponentInstance, IPermissionDialog {
    @Prop() close: () => void;


    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SecurityService) securityService: SecurityService;
    @Inject(PermissionService) permissionService: PermissionService;
    @Inject(OPMContext) opmContext: OPMContext;

    @Localize(OPMPermissionDialogLocalization.namespace) loc: OPMPermissionDialogLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    styles = StyleFlow.use(PermissionDialogStyles);

    private headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };

    errMsg: string = '';
    hasPermission: boolean = false;
    isLoading: boolean = false;
    isSaving: boolean = false;
    showSaveBtn: boolean = false;
    contextParams = {
        [Parameters.AppInstanceId]: this.opmContext.teamAppId.toString(),
        [Security.Parameters.SecurityResourceId]: this.opmContext.teamAppId.toString()
    }

    authors: Array<UserIdentity> = [];
    defaultReaders: Array<UserIdentity> = [];

    created() {
        this.isLoading = true;

        this.securityService.hasWritePermissionForRoles([RoleDefinitions.AppInstanceAdmin, Security.OPMRoleDefinitions.Author], {
            [Parameters.AppInstanceId]: this.opmContext.teamAppId.toString()
        }).then((hasPermission) => {
            this.hasPermission = hasPermission;
            if (this.hasPermission) {
                this.loadData();
            } else {
                this.isLoading = false;
            }
        })
    }



    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    loadData() {
        return new Promise<void>((resolve, reject) => {
            this.securityService.getPermissionBindings([Security.OPMRoleDefinitions.Author, Security.OPMRoleDefinitions.Reader], this.contextParams).then((result) => {
                if (result[Security.OPMRoleDefinitions.Author] && result[Security.OPMRoleDefinitions.Reader]) {

                    this.authors = this.mapToUserIdentities(result[Security.OPMRoleDefinitions.Author]);
                    this.defaultReaders = this.mapToUserIdentities(result[Security.OPMRoleDefinitions.Reader]);
                }
                this.isLoading = false;
                resolve();
            });
        })
    }

    mapToUserIdentities(permissionBindings: PermissionBinding[]): UserIdentity[] {
        let identities: string[] = [];
        for (const binding of permissionBindings) {
            identities = [...identities, ...this.getPermissionIdentities(binding)];
        }
        return identities.map<UserIdentity>(i => { return { uid: i } });
    }

    getPermissionIdentities(permissionBinding: PermissionBinding): string[] {
        if (permissionBinding.identity == SecurityIdentities.OverridenRulesBindingIdentity) {
            const result = [];
            if (permissionBinding.userDefinedRules && permissionBinding.userDefinedRules.length > 0) {
                for (const rule of permissionBinding.userDefinedRules) {
                    if (rule.logicalOperator == 'AND') {
                        return [];
                    }
                    result.push(rule.roleId);
                }
            }
            return result;
        }
        return [permissionBinding.identity];
    }

    save() {  
        this.isSaving = true;

        let updateInput: AuthorAndDefaultReaderUpdateInput = {
            teamAppId: this.opmContext.teamAppId,
            authors: this.authors,
            defaultReaders: this.defaultReaders
        }

        this.errMsg = "";
        this.permissionService.updateOPMPermissions(updateInput).then(() => {
            this.isSaving = false;
            this.close();
        }).catch(errMsg => {
            this.isSaving = false;
            this.errMsg = errMsg;
        })
    }


    renderPermissions() {
        let h = this.$createElement;


        return [
            <v-card class="mb-4">
                <v-card-text>
                    <div class={[this.styles.label, 'mb-3']}>{this.loc.Authors}</div>
                    <omfx-people-picker
                        multiple
                        showSpecialIdentities
                        label=' '
                        disabled={this.isSaving}
                        model={this.authors}
                        onModelChange={(model) => { this.authors = model }}></omfx-people-picker>
                </v-card-text>
            </v-card>,
            <v-card class="mb-4">
                <v-card-text>
                    <div class={[this.styles.label, 'mb-3']}>{this.loc.DefaultReaders}</div>
                    <omfx-people-picker
                        multiple
                        showSpecialIdentities
                        disabled={this.isSaving}
                        label=' '
                        model={this.defaultReaders}
                        onModelChange={(model) => { this.defaultReaders = model }}></omfx-people-picker>
                </v-card-text>
            </v-card>
        ]
    }



    render(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                width="600px"
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.close() }}
                model={{ visible: true }}
                hideCloseButton
                position={DialogPositions.Right}>
                <div>
                    <div class={this.omniaTheming.promoted.header.class}>
                        <omfx-heading styles={this.headingStyle} size={0}><span>{this.loc.DialogTitle}</span></omfx-heading>
                    </div>
                    <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                        <div data-omfx>
                            <div class={this.styles.dialogContent}>
                                <v-container>
                                    {

                                        this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="card"></v-skeleton-loader> :
                                            !this.hasPermission ? this.loc.NoPermissionMsg : this.renderPermissions()
                                    }
                                </v-container>
                            </div>
                        </div>
                        <v-card-actions class={this.styles.dialogFooter}>
                            <v-spacer></v-spacer>
                            {
                                this.errMsg &&
                                <v-tooltip class="mr-2" top {
                                    ...this.transformVSlot({
                                        activator: (ref) => {
                                            const toSpread = {
                                                on: ref.on
                                            }
                                            return [
                                                <v-icon {...toSpread} color="red" size='18'>fas fa-exclamation-circle</v-icon>
                                            ]
                                        }
                                    })}>
                                    <span>{this.errMsg}</span>
                                </v-tooltip>
                            }
                            {
                                this.hasPermission &&
                                <v-btn
                                    loading={this.isSaving}
                                    disabled={this.isLoading}
                                    dark={!this.isLoading}
                                    color={this.omniaTheming.themes.primary.base}
                                    onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}
                                </v-btn>
                            }
                            <v-btn text
                                dark={this.omniaTheming.promoted.body.dark}
                                onClick={() => { this.close(); }}>
                                {this.omniaUxLoc.Common.Buttons.Cancel}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </omfx-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PermissionDialog);
});

