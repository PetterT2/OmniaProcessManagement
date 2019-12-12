import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { ProcessReferenceData } from '../../../fx/models';
import {
    OmniaTheming, VueComponentBase, RichTextEditorExtension
} from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { ProcessDesignerStore } from '../../stores';

export class ProcessContentTabRenderer extends TabRenderer {
    generateElement(h): JSX.Element {
        return (<ProcessContentComponent key={Guid.newGuid().toString()}></ProcessContentComponent>);
    }
}

export interface ProcessDrawingProps {
}

@Component
export class ProcessContentComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>
{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private currentProcessReferenceData: ProcessReferenceData = null;
    private contentChangedTimewatchId: string = "processstep_contentchanged_" + Utils.generateGuid();

    created() {
        this.init();
    }

    init() {
        this.currentProcessReferenceData = this.currentProcessStore.getters.referenceData();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    onContentChanged(content) {
        var currentContent = JSON.stringify(this.currentProcessReferenceData.current.processData.content);
        var newContent = JSON.stringify(content);
        if (currentContent != newContent) {
            this.processDesignerStore.mutations.setHasDataChangedState.commit(true);
            Utils.timewatch(this.contentChangedTimewatchId, () => {
                this.currentProcessStore.actions.saveState.dispatch().then(() => {
                    this.processDesignerStore.mutations.setHasDataChangedState.commit(false);
                });
            }, 1500)
        }
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <omfx-multilingual-input
                    multipleLines={true}
                    richText={true}
                    model={this.currentProcessReferenceData.current.processData.content}
                    onModelChange={(content) => { this.onContentChanged(content); }}
                    forceTenantLanguages></omfx-multilingual-input>
            </v-card-text>
        </v-card>)
    }
}

