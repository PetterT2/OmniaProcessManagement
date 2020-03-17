﻿import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { OmniaTheming, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation, DialogModel, IValidator } from '@omnia/fx/ux';
import { ProcessLibraryStyles } from '../../../models';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { IProcessHistoryDialog } from './IProcessHistoryDialog';
import { ProcessData, Process, CenterConfigurableHeightDialogStyles } from '../../../fx/models';
import { OPMCoreLocalization } from '../../../core/loc/localize';
import { ProcessLibraryFields, DefaultDateFormat } from '../../Constants';
import { TenantRegionalSettings, GuidValue, User } from '@omnia/fx-models';
import { ProcessService, OPMRouter, OPMUtils, ProcessRendererOptions } from '../../../fx';
import { UserService } from '@omnia/fx/services';
declare var moment;
import '../../../core/styles/dialog/CenterConfigurableHeightDialogStyles.css';

@Component
export class ProcessHistoryDialog extends VueComponentBase<{}, {}, {}> implements IWebComponentInstance, IProcessHistoryDialog {
    @Prop() styles: typeof ProcessLibraryStyles | any;
    @Prop() opmProcessId: GuidValue;
    @Prop() closeCallback: () => void;
    @Prop() viewPageUrl: string;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(UserService) userService: UserService;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private classes = StyleFlow.use(ProcessLibraryStyles);
    private myCenterDialogStyles = StyleFlow.use(CenterConfigurableHeightDialogStyles);
    private isLoading: boolean = false;
    private userDisplayNameDic: { [uid: string]: User } = {};

    dateFormat: string = DefaultDateFormat;
    errMessage: string = "";
    publishedHeaders = [
        { text: this.coreLoc.Columns.Edition, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Revision, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Title, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Published, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Comment, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.ApprovedBy, align: 'left', sortable: false }
    ];
    processHistories: Array<Process> = [];


    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.init();
    }

    private init() {
        if (this.styles) {
            this.classes = StyleFlow.use(ProcessLibraryStyles, this.styles);
        }
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.isLoading = true;
        this.processService.getProcessHistory(this.opmProcessId).then((processes) => {
            this.processHistories = processes;
            this.processHistories.sort((a, b) => {
                var aEdition = a.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Edition];
                var bEdition = b.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Edition];
                var aRevision = a.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Revision] || 0;
                var bRevision = b.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Revision] || 0;
                if (aEdition == bEdition) {
                    return aRevision == bRevision ? 0 : (aRevision < bRevision ? 1 : -1);
                }
                else return aEdition < bEdition ? 1 : -1;
            })
            var usersUIDS = [];
            processes.forEach(f => {
                if (usersUIDS.indexOf(f.publishedBy) == -1)
                    usersUIDS.push(f.publishedBy);
            });
            if (usersUIDS.length > 0) {
                this.userService.resolveUsersByUIDs(usersUIDS).then(users => {
                    users.users.forEach(u => {
                        this.userDisplayNameDic[u.uid] = u;
                    })
                    this.isLoading = false;
                })
            }
            else
                this.isLoading = false;
        }).catch((err) => {
            this.errMessage = err;
            this.isLoading = false;
        })
    }

    private viewProcess(process: Process) {
        if (this.viewPageUrl) {
            var viewUrl = OPMUtils.createProcessNavigationUrl(process, process.rootProcessStep, this.viewPageUrl, false);
            var win = window.open(viewUrl, '_blank');
            win.focus();
        } else {
            this.closeCallback();
            OPMRouter.navigate(process, process.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
        }
    }

    renderItems(h, item: Process) {
        let enterpriseProperties = item.rootProcessStep.enterpriseProperties;
        return (
            <tr>
                {
                    this.publishedHeaders.map(header => {
                        switch (header.text) {
                            case this.coreLoc.Columns.Edition:
                                return (
                                    <td>
                                        {enterpriseProperties[ProcessLibraryFields.Edition]}
                                    </td>
                                );
                            case this.coreLoc.Columns.Revision:
                                return (
                                    <td>
                                        {enterpriseProperties[ProcessLibraryFields.Revision] && enterpriseProperties[ProcessLibraryFields.Revision] > 0 ? enterpriseProperties[ProcessLibraryFields.Revision] : ''}
                                    </td>
                                );
                            case this.coreLoc.Columns.Title:
                                return (
                                    <td>
                                        <a onClick={() => { this.viewProcess(item); }}>{item.rootProcessStep.multilingualTitle}</a>
                                    </td>
                                );

                            case this.coreLoc.Columns.Published:
                                return (
                                    <td>
                                        {moment(item.publishedAt).isValid() ? moment(item.publishedAt).format(this.dateFormat) : ""}
                                    </td>
                                );
                            case this.coreLoc.Columns.Comment:
                                return (
                                    <td>
                                        {item.rootProcessStep.comment}
                                    </td>
                                );
                            case this.coreLoc.Columns.ApprovedBy:
                                return (
                                    <td>
                                        {
                                            Utils.isNullOrEmpty(this.userDisplayNameDic[item.publishedBy]) ? ""
                                                : this.userDisplayNameDic[item.publishedBy].displayName
                                        }
                                    </td>
                                );
                        }
                    })
                }
            </tr>
        )
    }

    renderBody(h) {
        return (
            <v-data-table headers={this.publishedHeaders}
                items={this.processHistories}
                hide-default-footer
                items-per-page={Number.MAX_SAFE_INTEGER}
                scopedSlots={{
                    item: p => this.renderItems(h, p.item)
                }}>
                <div slot="no-data">
                    {this.coreLoc.Messages.MessageNoItem}
                </div>
            </v-data-table>
        )
    }

    render(h) {
        return (
            <omfx-dialog
                contentClass={this.myCenterDialogStyles.dialogContentClass}
                hideCloseButton
                model={{ visible: true }}
                width="1200px"
                position={DialogPositions.Center}
                persistent
                dark={this.theming.body.bg.dark}>
                <v-app-bar dark={this.theming.chrome.bg.dark}
                    color={this.theming.chrome.bg.color.base}
                    absolute
                    scroll-off-screen
                    flat>
                    <v-toolbar-title>{this.loc.ProcessHistory}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={this.closeCallback}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-app-bar>
                {this.isLoading ?
                    <v-progress-linear
                        color={this.theming.colors.primary.base}
                        indeterminate
                    ></v-progress-linear> : null}
                <v-card flat class={[this.myCenterDialogStyles.bodyWrapper]}>
                    <v-card-text class={this.myCenterDialogStyles.contentWrapper}>
                        {!this.isLoading ? this.renderBody(h) : null}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <span class={[this.classes.error, 'mr-2']}>{this.errMessage}</span>
                        <v-btn
                            text
                            light={!this.omniaTheming.promoted.body.dark}
                            onClick={() => { this.closeCallback(); }}>
                            {this.omniaUxLoc.Common.Buttons.Close}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </omfx-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessHistoryDialog);
});

