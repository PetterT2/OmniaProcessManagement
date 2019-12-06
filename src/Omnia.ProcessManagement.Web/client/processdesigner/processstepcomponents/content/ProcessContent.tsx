import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase, RichTextEditorExtension, HeadingEditorExtension, TextColorEditorExtension, HistoryEditorExtension, HtmlEditorExtension, TableEditorExtension, ExtendedElementsEditorExtension, HorizontalRuleEditorExtension, ListItemEditorExtension, CodeBlockEditorExtension, OrderedListEditorExtension, BulletListEditorExtension, BlockquoteEditorExtension, StrikeEditorExtension, UnderlineEditorExtension, ItalicEditorExtension, BoldEditorExtension } from '@omnia/fx/ux';
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
    private extensions: Array<RichTextEditorExtension> = [];
    private isEditMode: boolean = false;
    private content: string = "";

    created() {
        this.init();
    }

    init() {
        this.setupEditorExtension();
        var data = this.currentProcessStore.getters.referenceData();
        data.currentProcessData.content
        this.currentProcessStore.actions.saveState.dispatch();
    }

    private setupEditorExtension() {
        this.extensions.push(new HeadingEditorExtension({ levels: [1, 2, 3, 4, 5, 0] }));
        this.extensions.push(new TextColorEditorExtension());
        this.extensions.push(new HistoryEditorExtension());
        this.extensions.push(new BoldEditorExtension());
        this.extensions.push(new ItalicEditorExtension());
        this.extensions.push(new UnderlineEditorExtension());
        this.extensions.push(new StrikeEditorExtension());
        this.extensions.push(new BlockquoteEditorExtension());
        this.extensions.push(new BulletListEditorExtension());
        this.extensions.push(new OrderedListEditorExtension());
        this.extensions.push(new CodeBlockEditorExtension());
        this.extensions.push(new ListItemEditorExtension());
        this.extensions.push(new HorizontalRuleEditorExtension());
        this.extensions.push(new ExtendedElementsEditorExtension());
        this.extensions.push(new TableEditorExtension());
        this.extensions.push(new HtmlEditorExtension());
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <omfx-rich-text-editor onContentChange={(content) => { this.content = content; }}
                    placeholder={
                        {
                            emptyClass: 'is-empty',
                            emptyNodeText: "",
                            showOnlyWhenEditable: true
                        }
                    }
                    initialContent={""}
                    extensions={this.extensions}>
                </omfx-rich-text-editor>
            </v-card-text>
        </v-card>)
    }
}

