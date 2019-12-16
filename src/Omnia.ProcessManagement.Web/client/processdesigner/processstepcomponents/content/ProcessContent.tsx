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
    private isLoading = false;

    created() {
        this.isLoading = true
        setTimeout(() => { this.isLoading = false; }, 100)
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    onContentChanged(content) {
        let referenceData = this.currentProcessStore.getters.referenceData();
        var currentContent = JSON.stringify(referenceData.current.processData.content);
        var newContent = JSON.stringify(content);
        if (currentContent != newContent) {
            referenceData.current.processData.content = JSON.parse(JSON.stringify(content));
            this.processDesignerStore.actions.saveState.dispatch();
        }
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        let referenceData = this.currentProcessStore.getters.referenceData();
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                {
                    this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                        <omfx-multilingual-input
                            multipleLines={true}
                            richText={true}
                            model={referenceData.current.processData.content}
                            onModelChange={(content) => { this.onContentChanged(content); }}
                            forceTenantLanguages></omfx-multilingual-input>
                }
            </v-card-text>
        </v-card>)
    }
}

