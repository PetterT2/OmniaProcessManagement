import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, MultilingualString } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { ProcessReferenceData } from '../../../fx/models';
import {
    OmniaTheming, VueComponentBase, RichTextEditorExtension, RichTextEditorUtils, ExtendedElementsEditorExtension
} from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { ProcessDesignerStore } from '../../stores';
import { Prop } from 'vue-property-decorator';
import { MediaPickerEditorExtension, MediaPickerConfiguration } from '../../../components/richtexteditorextensions/MediaPicker';
import { MultilingualStore } from '@omnia/fx/store';

export class ProcessContentTabRenderer extends TabRenderer {
    private isProcessStepShortcut: boolean = false;
    constructor(isProcessStepShortcut: boolean = false) {
        super();
        this.isProcessStepShortcut = isProcessStepShortcut;
    }

    generateElement(h): JSX.Element {
        return (<ProcessContentComponent key={Guid.newGuid().toString()} isProcessStepShortcut={this.isProcessStepShortcut}></ProcessContentComponent>);
    }
}

export interface ProcessContentProps {
    isProcessStepShortcut: boolean;
}

@Component
export class ProcessContentComponent extends VueComponentBase<ProcessContentProps, {}, {}>
{
    @Prop() isProcessStepShortcut: boolean;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private isLoading = false;
    extensions: Array<RichTextEditorExtension> = [];


    created() {
        this.isLoading = true
        setTimeout(() => {
            this.setupEditorExtension();
            this.isLoading = false;
        }, 100)
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    setupEditorExtension() {
        this.extensions = RichTextEditorUtils.getDefaultRTFExtensions()
            .filter(e => !(e instanceof ExtendedElementsEditorExtension));
        this.extensions.push(new ExtendedElementsEditorExtension({ allowDivision: false }));
        this.extensions.push(new MediaPickerEditorExtension(new MediaPickerConfiguration().getConfig()));
    }

    onContentChanged(content: MultilingualString) {
        let referenceData = this.currentProcessStepReferenceData;
        //remove empty html
        Object.keys(content).forEach(key => {
            if (content[key] == '<p></p>')
                delete content[key];
        })
        referenceData.processData.content = content;
        this.processDesignerStore.actions.saveState.dispatch();
    }

    get currentProcessStepReferenceData() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (!this.isProcessStepShortcut) {
            return referenceData.current;
        }
        return referenceData.shortcut;
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        let processStepData = this.currentProcessStepReferenceData.processData;
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                {
                    this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                        <omfx-multilingual-input
                            domProps-forceExtensions={this.extensions}
                            multipleLines={true}
                            richText={true}
                            model={processStepData.content}
                            onModelChange={(content) => { this.onContentChanged(content); }}
                            forceTenantLanguages></omfx-multilingual-input>
                }
            </v-card-text>
        </v-card>)
    }
}

