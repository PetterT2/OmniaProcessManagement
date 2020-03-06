import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore, ProcessStore, OPMSpecialRouteVersion } from '../../../fx';
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
    @Inject(ProcessStore) processStore: ProcessStore;

    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private opmProcessIds: Array<string> = null;

    created() {
        this.init();
    }

    init() {
        let referenceData = this.currentProcessStepReferenceData;
        let rootProcessStepId = (referenceData.processStep as ExternalProcessStep).rootProcessStepId;
        if (rootProcessStepId) {
            this.processStore.actions.loadProcessByProcessStepId.dispatch(rootProcessStepId, OPMSpecialRouteVersion.LatestPublished).then(process => {
                this.opmProcessIds = [process.opmProcessId.toString()];
            }).catch(err => {
                this.opmProcessIds = [Guid.empty.toString()];
            })
        }
        else {
            this.opmProcessIds = [];
        }
    }

    mounted() {
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

                    {
                        this.opmProcessIds ?
                            <opm-process-picker
                                model={this.opmProcessIds}
                                onModelChange={(processes, unresolvedOPMProcessIds) => {
                                    if (processes[0]) {
                                        let process = processes[0];
                                        referenceData.processStep.title = process.rootProcessStep.title;
                                        referenceData.processStep.multilingualTitle = process.rootProcessStep.multilingualTitle;
                                        (referenceData.processStep as ExternalProcessStep).rootProcessStepId = process.rootProcessStep.id;

                                        this.saveState();
                                    }
                                }}>
                            </opm-process-picker> :
                            <v-skeleton-loader
                                loading={true}
                                height="150"
                                type="paragraph">
                            </v-skeleton-loader>
                    }


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

