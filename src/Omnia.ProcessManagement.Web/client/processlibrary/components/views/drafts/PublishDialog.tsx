import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import {
    OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, FieldValueValidation, FormValidator, VueComponentBase, ConfirmDialogResponse,
    DialogPositions, DialogModel, DialogStyles, HeadingStyles, ImageSource, IconSize
} from '@omnia/fx/ux';
import { UserService } from '@omnia/fx/services';
import { SharePointContext, TermStore, TermData } from '@omnia/fx-sp';
import { Process, Workflow, WorkflowTask, ProcessTypeItemSettings, Enums, ProcessPropertyInfo, PersonPropertyPublishingApprovalSettings, PublishingApprovalSettingsTypes, LimitedUsersPublishingApprovalSettings, TermDrivenPublishingApprovalSettings, PublishProcessWithoutApprovalRequest, PublishProcessWithApprovalRequest, ProcessVersionType, OPMEnterprisePropertyInternalNames, ProcessWorkingStatus } from '../../../../fx/models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { ProcessLibraryListViewStyles, ProcessLibraryStyles } from '../../../../models';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { UserIdentity, User, TenantRegionalSettings, GuidValue, EnterprisePropertySetItem, UserPrincipalType, EnterprisePropertyDefinition, TaxonomyPropertySettings, Guid, PropertyIndexedType } from '@omnia/fx-models';
import { EnterprisePropertySetStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { ProcessTypeStore, OPMUtils, ProcessStore } from '../../../../fx';
import { PublishProcessService } from '../../../services';
import { InternalOPMTopics } from '../../../../fx/messaging/InternalOPMTopics';

interface PublishDialogProps {
    process: Process;
    closeCallback: () => void;
}

@Component
export class PublishDialog extends VueComponentBase<PublishDialogProps>
{
    @Prop() process: Process;
    @Prop() closeCallback: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(TermStore) termStore: TermStore;
    @Inject(UserService) private omniaUserService: UserService;
    @Inject(PublishProcessService) private publishProcessService: PublishProcessService;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(OmniaContext) omniaCtx: OmniaContext;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles);
    private processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);
    private dialogModel: DialogModel = { visible: false };
    private headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };
    private isCheckingPublishingRules: boolean = false;
    private isLoadingProcessApproval: boolean = false;
    private isPublishingOrSending: boolean = false;
    private needToUpdateProcessProperties: boolean = false;
    private isCommentRequired: boolean = false;
    private unlimitedApprover: boolean = false;

    private processTypeSettings: ProcessTypeItemSettings = null;
    private validator: FormValidator = null;
    private selectedApproverPicker: Array<UserIdentity> = [];
    private selectedApprover: UserIdentity;
    private availableApprovers: Array<User> = [];
    private processAccessType: Enums.ProcessViewEnums.ProcessAccessTypes = Enums.ProcessViewEnums.ProcessAccessTypes.DefaultReaderGroup;
    private limitReadAccessUsers: Array<UserIdentity> = [];

    private hasError: boolean = false;
    private errorMessage: string = "";
    private formatter = {
        timeformat: '24hr',
        locale: 'en-us',
        firstdayofweek: 1
    };
    private dueDate: string = "";

    private comment = '';
    private versionPublishingType: Enums.WorkflowEnums.VersionPublishingTypes = Enums.WorkflowEnums.VersionPublishingTypes.NewEdition;

    created() {
        this.dialogModel.visible = true;
    }

    mounted() {
        this.validator = new FormValidator(this);
        this.init();
    }

    private init() {
        this.needToUpdateProcessProperties = false;
        this.isCheckingPublishingRules = true;

        let processTypeId = this.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType]
        Promise.all([
            this.propertyStore.actions.ensureLoadData.dispatch(),
            this.enterprisePropertySetStore.actions.ensureLoadAllSets.dispatch(),
            this.processTypeStore.actions.ensureProcessTypes.dispatch([processTypeId])
        ]).then(() => {
            var processType = this.processTypeStore.getters.byId(processTypeId);
            if (processType) {
                this.processTypeSettings = processType.settings as ProcessTypeItemSettings;
            }
            var propertySet = this.enterprisePropertySetStore.getters.enterprisePropertySets().find(s => s.id == this.processTypeSettings.enterprisePropertySetId);
            if (this.isApprovalRequired()) this.loadListApprover();
            var requiredProperties = propertySet.settings.items.filter(p => p.required);
            this.ensureAllRequiredPropertiesAreFilledIn(requiredProperties);
        })
    }

    private ensureAllRequiredPropertiesAreFilledIn(requiredProperties: Array<EnterprisePropertySetItem>) {
        var enterpriseProperties = this.propertyStore.getters.enterprisePropertyDefinitions();
        requiredProperties.filter(p => p.type != PropertyIndexedType.Boolean).forEach(p => {
            var foundEnterpriseProperty = enterpriseProperties.find(ep => ep.id == p.enterprisePropertyDefinitionId);
            var foundFieldValue = this.process.rootProcessStep.enterpriseProperties[foundEnterpriseProperty.internalName];
            if (Utils.isNullOrEmpty(foundFieldValue) || Utils.isNullOrEmpty(foundFieldValue))
                this.needToUpdateProcessProperties = true;
        })
        if (!this.needToUpdateProcessProperties) this.checkPublishingRules();
        else this.isCheckingPublishingRules = false;
    }

    private loadListApprover() {
        let settings = this.processTypeSettings.publishingApprovalSettings as PersonPropertyPublishingApprovalSettings;
        let enterpriseProperties = this.propertyStore.getters.enterprisePropertyDefinitions();
        let availableApprovers: Array<UserIdentity> = [];
        if (this.processTypeSettings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.TermDriven) {
            this.loadApprovalUsersForTermDriven(enterpriseProperties);
        }
        else {
            switch (this.processTypeSettings.publishingApprovalSettings.type) {
                case PublishingApprovalSettingsTypes.Anyone:
                    this.unlimitedApprover = true;
                    availableApprovers = null;
                    break;
                case PublishingApprovalSettingsTypes.PersonProperty:
                    var foundEnterpriseProperty = enterpriseProperties.find(ep => ep.id == settings.personEnterprisePropertyDefinitionId);
                    var foundFieldValue = this.process.rootProcessStep.enterpriseProperties[foundEnterpriseProperty.internalName];
                    if (!Utils.isArrayNullOrEmpty(foundFieldValue)) {
                        availableApprovers = foundFieldValue;
                    } else {
                        this.errorHandler(this.coreLoc.Messages.MessageNobodyCanApprove);
                    }
                    break;
                case PublishingApprovalSettingsTypes.LimitedUsers:
                    let limitedUsersSettings = this.processTypeSettings.publishingApprovalSettings as LimitedUsersPublishingApprovalSettings;
                    availableApprovers = limitedUsersSettings.users;
                    break;
            }
            this.bindingApprovalUsers(availableApprovers);
        }
    }

    private loadApprovalUsersForTermDriven(enterpriseProperties: EnterprisePropertyDefinition[]) {
        let availableApprovers: Array<UserIdentity> = [];
        let termSettings = this.processTypeSettings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings;
        var foundEnterpriseProperty = enterpriseProperties.find(ep => ep.id == termSettings.taxonomyEnterprisePropertyDefinitionId);
        var foundFieldValue = this.process.rootProcessStep.enterpriseProperties[foundEnterpriseProperty.internalName]
        if (foundFieldValue != null && !Utils.isArrayNullOrEmpty(foundFieldValue)) {
            foundFieldValue.forEach(termId => {
                if (termSettings.settings[termId.toString()])
                    termSettings.settings[termId.toString()].forEach(value => availableApprovers.push(value));
            });
            if (availableApprovers.length == 0) {
                let termSetId = (foundEnterpriseProperty.settings as TaxonomyPropertySettings).termSetId;
                this.termStore.actions.ensureTermSetWithAllTerms.dispatch(termSetId).then(() => {
                    let allTerms = this.termStore.getters.getAllTerms(termSetId);
                    foundFieldValue.forEach(termId => {
                        let parentsId = [termSetId];
                        this.getParentTermsId(allTerms, allTerms.find(t => t.id == termId), parentsId);
                        parentsId.forEach(termId => {
                            if (termSettings.settings[termId.toString()])
                                termSettings.settings[termId.toString()].forEach(value => availableApprovers.push(value));
                        });
                    });
                    this.bindingApprovalUsers(availableApprovers);
                })
            } else {
                this.bindingApprovalUsers(availableApprovers);
            }
        }
    }

    private bindingApprovalUsers(availableApprovers: Array<UserIdentity>) {
        if (availableApprovers == null) {
            this.unlimitedApprover = true;
        }
        else if (availableApprovers.length == 0) {
            this.errorHandler(this.coreLoc.Messages.MessageNobodyCanApprove);
        }
        else {
            this.unlimitedApprover = false;
            this.omniaUserService.resolveUsersByPrincipalNames(availableApprovers.map(p => p.uid)).then((users) => {
                this.availableApprovers = users;
                if (this.availableApprovers.length == 1) {
                    this.selectedApprover = this.availableApprovers[0];
                }
            });
        }
    }

    private getParentTermsId(allTerms: TermData[], term: TermData, parentsId: Array<GuidValue>) {
        if (term == null || term.parentId == null || term.parentId == Guid.empty)
            return;
        parentsId.push(term.parentId);
        this.getParentTermsId(allTerms, allTerms.find(t => t.id == term.parentId), parentsId);
    }

    private checkPublishingRules() {
        let edition: number = this.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition];
        this.isCommentRequired = edition > 0;
        this.isCheckingPublishingRules = false;
    }

    private isApprovalRequired(): boolean {
        return this.processTypeSettings && this.processTypeSettings.publishingApprovalSettings != null &&
            this.versionPublishingType != Enums.WorkflowEnums.VersionPublishingTypes.NewRevision
            && this.process.processWorkingStatus != ProcessWorkingStatus.SentForApproval;
    }

    private publishProcess() {
        this.isPublishingOrSending = true;
        var request: PublishProcessWithoutApprovalRequest = this.generateRequest();

        this.publishProcessService.publishProcessWithoutApproval(request).then(() => {
            this.processStore.actions.refreshPublishedProcess.dispatch(request.opmProcessId);

            InternalOPMTopics.onProcessWorkingStatusChanged.publish(ProcessVersionType.Draft);

            this.isPublishingOrSending = false;
            this.closeCallback();
        }).catch(msg => {
            this.errorHandler(msg);
        });
    }

    private generateRequest(): PublishProcessWithoutApprovalRequest {
        return {
            opmProcessId: this.process.opmProcessId,
            webUrl: this.spContext.pageContext.web.absoluteUrl,
            isRevisionPublishing: this.versionPublishingType == Enums.WorkflowEnums.VersionPublishingTypes.NewRevision,
            comment: this.comment,
            isLimitedAccess: (this.processAccessType == Enums.ProcessViewEnums.ProcessAccessTypes.LimitedAccess) ? true : false,
            limitedUsers: this.limitReadAccessUsers,
            notifiedUsers: [],
            isReadReceiptRequired: false
        };
    }

    private sendProcessToApproval() {
        this.isPublishingOrSending = true;

        let request: PublishProcessWithApprovalRequest = this.generateRequest() as PublishProcessWithApprovalRequest;
        request.approver = this.unlimitedApprover ? this.selectedApproverPicker[0] : this.selectedApprover;
        request.dueDate = OPMUtils.correctDateOnlyValue(this.dueDate);

        this.publishProcessService.publishProcessWithApproval(request).then((result) => {
            InternalOPMTopics.onProcessWorkingStatusChanged.publish(ProcessVersionType.Draft);

            this.isPublishingOrSending = false;
            this.closeCallback();
        }).catch(msg => {
            this.errorHandler(msg);
        });
    }

    private errorHandler(errorMessage: string) {
        this.hasError = true;
        this.isPublishingOrSending = false;
        this.errorMessage = errorMessage;
    }

    private publishDialogClose() {
        this.dialogModel.visible = false;
        if (this.closeCallback) this.closeCallback();
    }

    private readOnlyMode() {
        return !(this.process.processWorkingStatus != ProcessWorkingStatus.SentForApproval &&
            this.process.processWorkingStatus != ProcessWorkingStatus.SendingForApproval);
    }
    private renderErrorForm(h) {
        return (
            <div class="px-3 py-3">
                <div class={["px-3", "py-3", this.listViewClasses.publishDialogErrorFormContent]}>
                    <span>{this.coreLoc.Messages.MessageUpdateProcessPropertiesBeforePublishing}</span>
                </div>
            </div>
        )
    }

    private renderPublishWithApprovalForm(h) {
        return (
            <div>
                {
                    this.unlimitedApprover ?
                        [
                            <omfx-people-picker multiple={false}
                                dark={this.omniaTheming.promoted.body.dark}
                                principalType={UserPrincipalType.Member}
                                label={this.loc.Approval.Approver}
                                model={this.selectedApproverPicker}
                                onModelChange={(model) => {
                                    this.selectedApproverPicker = model;
                                    this.$forceUpdate();
                                }}>
                            </omfx-people-picker>,
                            <omfx-field-validation
                                useValidator={this.validator}
                                checkValue={this.selectedApproverPicker}
                                rules={new FieldValueValidation().IsArrayRequired().getRules()}>
                            </omfx-field-validation>
                        ]
                        :
                        [
                            <v-select v-model={this.selectedApprover} return-object="true" label={this.loc.Approval.Approver}
                                items={this.availableApprovers} item-value="uid" item-text="displayName" onChange={(model) => {
                                    this.selectedApprover = model;
                                    this.$forceUpdate();
                                }}></v-select>,
                            <omfx-field-validation
                                useValidator={this.validator}
                                checkValue={this.selectedApprover}
                                rules={
                                    new FieldValueValidation().IsRequired().getRules()
                                }>
                            </omfx-field-validation>
                        ]
                }
                <omfx-date-time-picker model={this.dueDate}
                    color={this.omniaTheming.themes.primary.base}
                    dark={this.omniaTheming.promoted.body.dark}
                    label={this.loc.Approval.ApprovalDueDate}
                    formatter={this.formatter}
                    pickerMode="date"
                    isRequired={true}
                    onModelChange={(newVal) => { this.dueDate = newVal }}>
                </omfx-date-time-picker>
            </div>
        )
    }

    private renderPublishWithouApprovalForm(h) {
        return [
            <div class="px-3">
                {this.loc.Approval.BeSureToPublishProcess}
            </div>,
            <br />
        ]
    }

    private renderSameSettings(h) {
        return (
            <div>
                {
                    this.isCommentRequired &&
                    [
                        <v-textarea nativeOnInput={(newVal) => {
                            if (newVal != undefined && newVal.target != undefined && newVal.target.value) {
                                this.comment = newVal.target.value;
                            }
                            else this.comment = '';
                        }}
                            v-model={this.comment}
                            label={this.loc.Approval.Comment}
                        ></v-textarea>,
                        <omfx-field-validation
                            useValidator={this.validator}
                            checkValue={this.comment}
                            rules={
                                new FieldValueValidation().IsRequired().getRules()
                            }>
                        </omfx-field-validation>
                    ]
                }
                {this.renderReadRightsSetting(h)}
            </div>
        )
    }

    private renderReadRightsSetting(h) {
        return (
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-header>{this.loc.ReadRights.Label}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card>
                            <v-card-text>
                                <v-radio-group v-model={this.processAccessType} onChange={(newVal) => { this.processAccessType = newVal; }}>
                                    <v-radio label={this.loc.ReadRights.DefaultReaders} v-model={Enums.ProcessViewEnums.ProcessAccessTypes.DefaultReaderGroup}></v-radio>
                                    <v-radio label={this.loc.ReadRights.LimitReadAccess} v-model={Enums.ProcessViewEnums.ProcessAccessTypes.LimitedAccess}></v-radio>
                                    {
                                        (this.processAccessType == Enums.ProcessViewEnums.ProcessAccessTypes.LimitedAccess) ?
                                            <div>
                                                <omfx-people-picker principalType={UserPrincipalType.All}
                                                    dark={this.omniaTheming.promoted.body.dark}
                                                    model={this.limitReadAccessUsers}
                                                    label=""
                                                    multiple
                                                    disabled={false}
                                                    onModelChange={(model) => {
                                                        this.limitReadAccessUsers = model;
                                                    }}>
                                                </omfx-people-picker>
                                                <omfx-field-validation
                                                    useValidator={this.validator}
                                                    checkValue={this.limitReadAccessUsers}
                                                    rules={
                                                        new FieldValueValidation().IsArrayRequired().getRules()
                                                    }>
                                                </omfx-field-validation>
                                            </div>
                                            : null
                                    }
                                </v-radio-group>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        )
    }


    private renderPublishVersionOptions(h) {
        return (
            <div>
                <v-radio-group class='radio-group' v-model={this.versionPublishingType} onChange={(newVal) => { this.versionPublishingType = newVal; }}>
                    <v-radio label={this.loc.Approval.VersionPublishingTypes.PublishNewEdition} v-model={Enums.WorkflowEnums.VersionPublishingTypes.NewEdition}></v-radio>
                    <v-radio label={this.loc.Approval.VersionPublishingTypes.PublishNewRevision} v-model={Enums.WorkflowEnums.VersionPublishingTypes.NewRevision}></v-radio>
                </v-radio-group>
            </div>
        )
    }

    private renderBody(h) {
        let edition: number = this.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMEdition];
        return (
            <v-container class={this.processLibraryClasses.centerDialogBody}>
                {this.needToUpdateProcessProperties && this.renderErrorForm(h)}
                {
                    !this.needToUpdateProcessProperties && [
                        this.processTypeSettings && this.processTypeSettings.allowRevisions && edition > 0 && this.renderPublishVersionOptions(h),
                        this.isApprovalRequired() ? this.renderPublishWithApprovalForm(h) : this.renderPublishWithouApprovalForm(h),
                        this.renderSameSettings(h)
                    ]
                }
            </v-container>
        )
    }

    renderHeader(h) {
        return (
            <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                <v-toolbar-title>{this.coreLoc.ProcessActions.Publish + " " + this.process.rootProcessStep.multilingualTitle}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={() => { this.publishDialogClose(); }}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
        )
    }

    renderFooter(h) {
        return (
            <v-card-actions class={this.processLibraryClasses.dialogFooter}>
                <v-spacer></v-spacer>
                {
                    this.readOnlyMode() ?
                        null
                        :
                        (this.isApprovalRequired() ?
                            <v-btn
                                dark={!(this.isCheckingPublishingRules || this.needToUpdateProcessProperties)}
                                disabled={this.isCheckingPublishingRules || this.needToUpdateProcessProperties}
                                color={this.omniaTheming.themes.primary.base}
                                loading={this.isPublishingOrSending}
                                onClick={() => { this.sendProcessToApproval() }}>{this.loc.Common.Send}
                            </v-btn>
                            :
                            <v-btn
                                dark={!(this.isCheckingPublishingRules || this.needToUpdateProcessProperties)}
                                disabled={this.isCheckingPublishingRules || this.needToUpdateProcessProperties}
                                color={this.omniaTheming.themes.primary.base}
                                loading={this.isPublishingOrSending}
                                onClick={() => { this.publishProcess() }}>{this.coreLoc.ProcessActions.Publish}
                            </v-btn>
                        )
                }

                <v-btn
                    disabled={this.isPublishingOrSending}
                    light={!this.omniaTheming.promoted.body.dark}
                    text
                    onClick={this.publishDialogClose}>{this.omniaUxLoc.Common.Buttons.Cancel}
                </v-btn>
            </v-card-actions>
        )
    }

    render(h) {
        return (
            <div>
                <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                    onClose={this.publishDialogClose}
                    hideCloseButton
                    model={this.dialogModel}
                    contentClass={this.omniaTheming.promoted.body.class}
                    width={'800px'}
                    position={DialogPositions.Center}>
                    <div>
                        {this.renderHeader(h)}
                        <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                            <div data-omfx>
                                {
                                    this.isLoadingProcessApproval || this.isCheckingPublishingRules ?
                                        <v-skeleton-loader loading={true} height="100%" type="card"></v-skeleton-loader>
                                        :
                                        this.renderBody(h)
                                }
                                {this.hasError && <div class={[this.processLibraryClasses.error, "mx-5", "mb-5"]}><span>{this.errorMessage}</span></div>}
                            </div>
                            {this.renderFooter(h)}
                        </v-card>
                    </div>
                </omfx-dialog>
            </div>
        )
    }
}