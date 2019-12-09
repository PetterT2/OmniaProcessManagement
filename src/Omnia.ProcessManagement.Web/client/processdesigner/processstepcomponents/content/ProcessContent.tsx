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

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private editContentTimeout = null;
    private extensions: Array<RichTextEditorExtension> = [];
    private isEditMode: boolean = false;
    private content: string = "";
    private currentProcessReferenceData: ProcessReferenceData = null;

    created() {
        this.init();
    }

    init() {
        this.currentProcessReferenceData = this.currentProcessStore.getters.referenceData();
        debugger;
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    onContentChanged(content) {
        this.currentProcessReferenceData.currentProcessData.content = content;
        if (this.editContentTimeout) {
            window.clearTimeout(this.editContentTimeout);
        }
        this.editContentTimeout = window.setTimeout(() => {
            this.currentProcessStore.actions.saveState.dispatch();
        }, 1000);
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
                    model={this.currentProcessReferenceData.currentProcessData.content}
                    onModelChange={(content) => { this.onContentChanged(content); }}
                    forceTenantLanguages></omfx-multilingual-input>
            </v-card-text>
        </v-card>)
    }
}

