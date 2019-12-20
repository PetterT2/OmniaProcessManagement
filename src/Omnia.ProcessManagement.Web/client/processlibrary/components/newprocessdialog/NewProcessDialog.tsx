import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Utils } from '@omnia/fx';
import { OmniaTheming, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation, DialogModel, IValidator } from '@omnia/fx/ux';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessLibraryStyles } from '../../../models';
import { ProcessService, ProcessTemplateStore, ProcessTypeStore, ProcessStore } from '../../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { ProcessType, ProcessTemplate, Process, RootProcessStep, ProcessActionModel, ProcessVersionType, ProcessData, ProcessTypeItemSettings, OPMEnterprisePropertyInternalNames } from '../../../fx/models';
import { Guid, GuidValue } from '@omnia/fx-models';
import { INewProcessDialog } from './INewProcessDialog';
import { OPMContext } from '../../../fx/contexts';

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

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    validator: FormValidator = null;

    private classes = StyleFlow.use(ProcessLibraryStyles, this.styles);
    private isLoading: boolean = false;
    private isSaving: boolean = false;
    private errMessage: string = "";
    private processTypes: Array<ProcessType> = [{ id: Guid.empty, multilingualTitle: "test 1" } as ProcessType];
    private processTemplates: Array<ProcessTemplate> = [];
    private process: Process;
    private selectedTemplate: ProcessTemplate = null;
    private selectedProcessType: ProcessType = null;

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
            versionType: ProcessVersionType.Draft,
            checkedOutBy: null
        } as Process;
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.validator = new FormValidator(this);
        this.init();
    }

    private init() {
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
            processData[this.process.id.toString()] = {} as ProcessData;
            let model: ProcessActionModel = {
                process: this.process,
                processData: processData
            };
            this.processStore.actions.createDraft.dispatch(model).then(() => {
                this.isSaving = false;
                this.closeCallback(true);
            }).catch((err) => {
                this.errMessage = err;
                this.isSaving = false;
            });
        }
    }

    renderForm(h) {
        return (
            <v-container class={this.classes.centerDialogBody}>
                <div>
                    <v-select
                        rules={new FieldValueValidation().IsRequired(true).getRules()}
                        return-object="true"
                        label={this.loc.ProcessType}
                        v-model={this.selectedProcessType}
                        items={this.processTypes} item-text="multilingualTitle" item-value="id"
                        onChange={(value) => { this.selectProcessType(value); }}
                    ></v-select>
                </div>

                <div v-show={this.processTemplates.length > 1}>
                    <v-select
                        rules={new FieldValueValidation().IsRequired(true).getRules()}
                        label={this.loc.ProcessTemplate}
                        v-model={this.selectedTemplate}
                        items={this.processTemplates}
                        return-object="true"
                        item-text="multilingualTitle" item-value="id"></v-select>

                </div>
                {
                    this.selectedTemplate == null ?
                        <div class={[this.classes.error, 'mr-2 mb-3 ']}>{this.loc.Messages.NoProcessTemplateValidation}</div>
                        : null
                }
                < div >
                    <omfx-multilingual-input
                        requiredWithValidator={this.validator}
                        model={this.process.rootProcessStep.title}
                        onModelChange={(title) => {
                            this.process.rootProcessStep.title = title;
                        }}
                        forceTenantLanguages
                        label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
                </div>
            </v-container>
        )
    }

    render(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.closeCallback(false); }}
                model={{ visible: true }}
                hideCloseButton
                width="600px"
                position={DialogPositions.Center}>
                <div>
                    <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                        <v-toolbar-title>{this.loc.Buttons.NewProcess}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={() => { this.closeCallback(false); }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                        <div data-omfx>
                            {
                                this.isLoading ?
                                    <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
                                    : this.renderForm(h)}
                        </div>
                        <v-card-actions class={this.classes.dialogFooter}>
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
                </div>
            </omfx-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, NewProcessDialog);
});

