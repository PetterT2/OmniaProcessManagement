import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Utils } from '@omnia/fx';
import { OmniaTheming, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessLibraryStyles } from '../../../models';
import { ProcessTemplateStore, ProcessTypeStore, ProcessStore, CurrentProcessStore, ProcessDefaultData } from '../../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { ProcessType, ProcessTemplate, Process, RootProcessStep, ProcessActionModel, ProcessVersionType, ProcessData, ProcessTypeItemSettings, OPMEnterprisePropertyInternalNames, VDialogScrollableDialogStyles } from '../../../fx/models';
import { Guid, GuidValue, MultilingualString, BuiltInEnterprisePropertyInternalNames } from '@omnia/fx-models';
import { INewProcessDialog } from './INewProcessDialog';
import { OPMContext } from '../../../fx/contexts';
import { ProcessDesignerStore } from '../../../processdesigner/stores';
import { ProcessDesignerUtils } from '../../../processdesigner/Utils';
import { DisplayModes } from '../../../models/processdesigner';
import { ProcessDesignerItemFactory } from '../../../processdesigner/designeritems';
import { OPMCoreLocalization } from '../../../core/loc/localize';
import '../../../core/styles/dialog/VDialogScrollableDialogStyles.css';

@Component
export class NewProcessDialog extends VueComponentBase<{}, {}, {}> implements IWebComponentInstance, INewProcessDialog {
    @Prop() styles: typeof ProcessLibraryStyles | any;
    @Prop() closeCallback: (isUpdate: boolean) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessStore) processStore: ProcessStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(OPMContext) opmContext: OPMContext;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    validator: FormValidator = null;
    dialogVisible: boolean = true;

    private classes = StyleFlow.use(ProcessLibraryStyles);
    private isLoading: boolean = false;
    private isSaving: boolean = false;
    private errMessage: string = "";
    private processTypes: Array<ProcessType> = [];
    private processTemplates: Array<ProcessTemplate> = [];
    private process: Process;
    private selectedTemplate: ProcessTemplate = null;
    private selectedProcessType: ProcessType = null;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);

    created() {
        let id: GuidValue = Guid.newGuid();
        this.process = {
            id: id,
            opmProcessId: Guid.newGuid(),
            rootProcessStep: {
                id: id,
                title: null,
                processTemplateId: null,
                enterpriseProperties: {}
            } as RootProcessStep,
            versionType: ProcessVersionType.Draft
        } as Process;
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.validator = new FormValidator(this);
        this.init();
    }

    private init() {
        if (this.styles) {
            this.classes = StyleFlow.use(ProcessLibraryStyles, this.styles);
        }
        this.isLoading = true;
        let promises: Array<Promise<any>> = [
            this.processTypeStore.actions.ensureLoadProcessTypes.dispatch(),
            this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch()
        ]

        Promise.all(promises).then(() => {
            this.processTypes = this.processTypeStore.getters.all();

            if (this.processTypes.length > 0) {
                this.selectedProcessType = this.processTypes[0];
                this.selectProcessType(this.selectedProcessType);
            }
            this.isLoading = false;
        }).catch((err) => {
            this.errMessage = err;
            this.isLoading = false;
        })
    }

    private selectProcessType(processType: ProcessType) {
        this.selectedTemplate = null;
        if (processType) {
            let processTypeItemSettings: ProcessTypeItemSettings = processType.settings as ProcessTypeItemSettings;
            if (processTypeItemSettings.processTemplateIds)
                this.processTemplates = this.processTemplateStore.getters.processTemplates().filter(t =>
                    processTypeItemSettings.processTemplateIds.findIndex(s => s == t.id) > -1);
            if (this.processTemplates.length > 0) {
                let processTemplateId = processTypeItemSettings.defaultProcessTemplateId ? processTypeItemSettings.defaultProcessTemplateId : this.processTemplates[0].id;
                this.selectedTemplate = this.processTemplates.find(p => p.id == processTemplateId);
            }
        }
    }

    private addNewProcess() {
        this.errMessage = "";
        if (this.validator.validateAll()) {
            this.isSaving = true;
            this.process.teamAppId = this.opmContext.teamAppId;
            this.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType] = this.selectedProcessType.id;
            this.process.rootProcessStep.processTemplateId = this.selectedTemplate.id;
            let processData: { [processStepId: string]: ProcessData } = {};
            processData[this.process.id.toString()] = {
                canvasDefinition: ProcessDefaultData.canvasDefinition
            } as ProcessData;
            let model: ProcessActionModel = {
                process: this.process,
                processData: processData
            };
            this.processStore.actions.createDraft.dispatch(model).then((newProcess: Process) => {
                this.isSaving = false;
                this.processDesignerStore.actions.setProcessToShow.dispatch(newProcess, newProcess.rootProcessStep)
                    .then(() => {
                        this.currentProcessStore.actions.checkOut.dispatch().then(() => {
                            ProcessDesignerUtils.openProcessDesigner();
                            this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
                        })
                    })
                this.closeCallback(true);
            }).catch((err) => {
                this.errMessage = err;
                this.isSaving = false;
            });
        }
    }

    renderForm(h) {
        return (
            <div>
                <v-select
                    rules={new FieldValueValidation().IsRequired(true).getRules()}
                    return-object="true"
                    label={this.loc.ProcessType}
                    v-model={this.selectedProcessType}
                    items={this.processTypes} item-text="multilingualTitle" item-value="id"
                    onChange={(value) => { this.selectProcessType(value); }}
                ></v-select>
                {this.processTemplates.length > 1 ?
                    <v-select
                        rules={new FieldValueValidation().IsRequired(true).getRules()}
                        label={this.loc.ProcessTemplate}
                        v-model={this.selectedTemplate}
                        items={this.processTemplates}
                        return-object="true"
                        item-text="multilingualTitle" item-value="id"></v-select>
                    : null}
                {
                    this.selectedTemplate == null ?
                        <div class={[this.classes.error, 'mr-2 mb-3 ']}>{this.coreLoc.Messages.NoProcessTemplateValidation}</div>
                        : null
                }
                <omfx-multilingual-input
                    requiredWithValidator={this.validator}
                    model={this.process.rootProcessStep.title}
                    onModelChange={(title: MultilingualString) => {
                        this.process.rootProcessStep.title = title;
                        if (!this.process.rootProcessStep.enterpriseProperties)
                            this.process.rootProcessStep.enterpriseProperties = {};
                        this.process.rootProcessStep.enterpriseProperties[BuiltInEnterprisePropertyInternalNames.Title] = JSON.stringify(title);
                    }}
                    forceTenantLanguages
                    label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
            </div>
        )
    }
    render(h) {
        return (
            <v-dialog
                v-model={this.dialogVisible}
                width="600px"
                scrollable
                persistent
                dark={this.theming.body.bg.dark}>
                <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                    <v-card-title
                        class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                        dark={this.theming.chrome.bg.dark}>
                        <div>{this.coreLoc.ProcessActions.NewProcess}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={() => { this.closeCallback(false); }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    {this.isLoading ? <v-progress-linear
                        v-show={this.isLoading}
                        color={this.theming.colors.primary.base}
                        indeterminate
                    ></v-progress-linear> : null}
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        {!this.isLoading ?
                            this.renderForm(h)
                            : null}
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <span class={[this.classes.error, 'mr-2']}>{this.errMessage}</span>
                        <v-btn
                            loading={this.isSaving}
                            text
                            class="pull-right"
                            dark={this.omniaTheming.promoted.body.dark}
                            color={this.omniaTheming.themes.primary.base}
                            onClick={() => { this.addNewProcess(); }}>
                            {this.omniaUxLoc.Common.Buttons.Create}
                        </v-btn>
                        <v-btn
                            text
                            disabled={this.isSaving}
                            class="pull-right"
                            light={!this.omniaTheming.promoted.body.dark}
                            onClick={() => { this.closeCallback(false); }}>
                            {this.omniaUxLoc.Common.Buttons.Cancel}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, NewProcessDialog);
});

