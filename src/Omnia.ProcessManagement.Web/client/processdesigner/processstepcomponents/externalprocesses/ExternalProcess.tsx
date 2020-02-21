import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { ExternalProcessStep } from '../../../fx/models';
import { ProcessDesignerStore } from '../../stores';
import { MultilingualStore } from '@omnia/fx/store';

export class ExternalProcessTabRenderer extends TabRenderer {

    constructor() {
        super();
    }
    generateElement(h): JSX.Element {
        return (<ExternalProcessComponent key={Guid.newGuid().toString()}></ExternalProcessComponent>);
    }
}

interface ExternalProcessProps {

}

@Component
class ExternalProcessComponent extends VueComponentBase<ExternalProcessProps, {}, {}>
{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;

    created() {
        this.init();
    }

    init() {
    }

    mounted() {
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    get currentProcessStepReferenceData() {
        let referenceData = this.currentProcessStore.getters.referenceData();

        return referenceData.current;
    }

    saveState() {
        this.processDesignerStore.actions.saveState.dispatch();
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        let referenceData = this.currentProcessStepReferenceData;
        return (
            <v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
                <v-card-text>

                    <opm-processdesigner-addlinkedprocess
                        rootProcessStepId={(referenceData.processStep as ExternalProcessStep).rootProcessStepId}
                        onChange={(title, rootProcessStepId) => {
                            referenceData.processStep.title = title;
                            referenceData.processStep.multilingualTitle = this.multilingualStore.getters.stringValue(title);
                            (referenceData.processStep as ExternalProcessStep).rootProcessStepId = rootProcessStepId;
                            this.saveState();
                        }}>
                    </opm-processdesigner-addlinkedprocess>

                    <omfx-multilingual-input
                        model={(referenceData.processStep as ExternalProcessStep).title}
                        onModelChange={(title) => {
                            referenceData.processStep.title = title;
                            referenceData.processStep.multilingualTitle = this.multilingualStore.getters.stringValue(title);
                            this.saveState();
                        }}
                        forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                </v-card-text>
            </v-card>
        )
    }
}

