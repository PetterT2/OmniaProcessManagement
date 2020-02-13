import { Inject, Localize, Utils, SubscriptionHandler, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming, VueComponentBase, FieldValueValidation, FormValidator } from '@omnia/fx/ux';
import { CurrentProcessStore, ProcessTypeStore, ProcessTemplateStore } from '../../fx';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessType, OPMEnterprisePropertyInternalNames, ProcessTemplate, ProcessTypeItemSettings } from '../../fx/models';
import { GuidValue } from '@omnia/fx-models';

@Component
export class ChangeProcessTypeComponent extends VueComponentBase implements IWebComponentInstance {
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private isLoading: boolean = false;
    private processTypes: Array<ProcessType> = [];
    private processTemplates: Array<ProcessTemplate> = [];
    private selectedProcessTypeId: GuidValue;
    private selectedTemplateId: GuidValue;
    validator: FormValidator = null;

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.validator = new FormValidator(this);
        this.init();
    }

    beforeDestroy() {
    }

    private init() {
        this.isLoading = true;
        let promises: Array<Promise<any>> = [
            this.processTypeStore.actions.ensureLoadProcessTypes.dispatch(),
            this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch()
        ]

        Promise.all(promises).then(() => {
            this.processTypes = this.processTypeStore.getters.all();
            let referenceData = this.currentProcessStore.getters.referenceData();
            this.selectedProcessTypeId = referenceData.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType];
            this.selectedTemplateId = referenceData.process.rootProcessStep.processTemplateId;
            let processType: ProcessType = this.processTypes.find(p => p.id == this.selectedProcessTypeId);
            if (processType) {
                let processTypeItemSettings: ProcessTypeItemSettings = processType.settings as ProcessTypeItemSettings;
                if (processTypeItemSettings.processTemplateIds)
                    this.processTemplates = this.processTemplateStore.getters.processTemplates().filter(t =>
                        processTypeItemSettings.processTemplateIds.findIndex(s => s == t.id) > -1);
            }
            this.isLoading = false;
        }).catch((err) => {
            this.isLoading = false;
        })
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleChangeProcessTypePanel.commit(false);
    }

    private onChangedProcessType(processTypeId: GuidValue) {
        let referenceData = this.currentProcessStore.getters.referenceData();
        this.selectedTemplateId = null;
        let processType: ProcessType = this.processTypes.find(p => p.id == processTypeId);
        let processTypeItemSettings: ProcessTypeItemSettings = processType.settings as ProcessTypeItemSettings;
        if (processTypeItemSettings.processTemplateIds)
            this.processTemplates = this.processTemplateStore.getters.processTemplates().filter(t =>
                processTypeItemSettings.processTemplateIds.findIndex(s => s == t.id) > -1);
        if (this.processTemplates.length > 0) {
            if (this.processTemplates.find(t => t.id == referenceData.process.rootProcessStep.processTemplateId) != null)
                this.selectedTemplateId = referenceData.process.rootProcessStep.processTemplateId;
            else
                this.selectedTemplateId = processTypeItemSettings.defaultProcessTemplateId ? processTypeItemSettings.defaultProcessTemplateId : this.processTemplates[0].id;
        }
        this.saveState();
    }

    private saveState() {
        if (this.validator.validateAll()) {
            let referenceData = this.currentProcessStore.getters.referenceData();
            referenceData.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType] = this.selectedProcessTypeId;
            referenceData.process.rootProcessStep.processTemplateId = this.selectedTemplateId;
            this.processDesignerStore.actions.saveState.dispatch();
        }
    }

    private onChangedProcessTemplate(selectedTemplateId: GuidValue) {
        this.selectedTemplateId = selectedTemplateId;
        this.saveState();
    }

    public renderSelection(h) {
        return (
            [<v-select
                class="ml-4 mt-4 mr-4"
                light={!this.omniaTheming.promoted.body.dark}
                dark={this.omniaTheming.promoted.body.dark}
                label={this.pdLoc.ProcessType}
                color={this.omniaTheming.promoted.body.background.base}
                filled
                items={this.processTypes}
                onChange={this.onChangedProcessType}
                item-text="multilingualTitle"
                item-value="id"
                v-model={this.selectedProcessTypeId}>
            </v-select>,
            <v-select
                class="ml-4 mt-4 mr-4"
                rules={new FieldValueValidation().IsRequired(true).getRules()}
                light={!this.omniaTheming.promoted.body.dark}
                dark={this.omniaTheming.promoted.body.dark}
                label={this.pdLoc.ProcessTemplate}
                color={this.omniaTheming.promoted.body.background.base}
                filled
                items={this.processTemplates}
                onChange={this.onChangedProcessTemplate}
                item-text="multilingualTitle"
                item-value="id"
                v-model={this.selectedTemplateId}>
            </v-select>
            ]
        )
    }

    public render(h) {
        return (
            <div>
                <v-toolbar color={this.omniaTheming.promoted.body.primary.base}
                    flat
                    dark
                    tabs>
                    <v-toolbar-title>{this.pdLoc.ChangeProcessType}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={this.onClose} >
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <div>
                    {
                        this.isLoading ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> : this.renderSelection(h)
                    }
                </div>
            </div>
        )
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ChangeProcessTypeComponent);
});
