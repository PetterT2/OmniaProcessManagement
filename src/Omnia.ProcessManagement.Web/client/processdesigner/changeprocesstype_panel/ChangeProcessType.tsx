import { Inject, Localize, Utils, SubscriptionHandler, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore, ProcessTypeStore } from '../../fx';
import { ProcessDesignerPanelStore, ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessType, OPMEnterprisePropertyInternalNames } from '../../fx/models';
import { GuidValue } from '@omnia/fx-models';

@Component
export class ChangeProcessTypeComponent extends VueComponentBase implements IWebComponentInstance {
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerPanelStore) panels: ProcessDesignerPanelStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private isLoading: boolean = false;
    private processTypes: Array<ProcessType> = [];
    private selectedProcessTypeId: GuidValue;

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.init();
    }

    beforeDestroy() {
    }

    private init() {
        this.isLoading = true;
        let promises: Array<Promise<any>> = [
            this.processTypeStore.actions.ensureLoadProcessTypes.dispatch()
        ]

        Promise.all(promises).then(() => {
            this.processTypes = this.processTypeStore.getters.all();
            let referenceData = this.currentProcessStore.getters.referenceData();
            this.selectedProcessTypeId = referenceData.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType];
            this.isLoading = false;
        }).catch((err) => {
            this.isLoading = false;
        })
    }

    private onClose() {
        this.panels.mutations.toggleChangeProcessTypePanel.commit(false);
    }

    private onChangedProcessType() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        referenceData.process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessType] = this.selectedProcessTypeId;
        this.processDesignerStore.actions.saveState.dispatch();
    }

    public renderSelection(h) {
        return (
            <v-select
                class="ml-4 mt-4 mr-4"
                light={!this.theming.body.bg.dark}
                dark={this.theming.body.bg.dark}
                label={this.pdLoc.ProcessType}
                color={this.theming.body.components.color.base}
                filled
                items={this.processTypes}
                onChange={this.onChangedProcessType}
                item-text="multilingualTitle"
                item-value="id"
                v-model={this.selectedProcessTypeId}
            >
            </v-select>
        )
    }

    public render(h) {
        return (
            <div>
                <v-toolbar color={this.theming.chrome.bg.color.base}
                    flat
                    dark={this.theming.chrome.bg.dark}
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
