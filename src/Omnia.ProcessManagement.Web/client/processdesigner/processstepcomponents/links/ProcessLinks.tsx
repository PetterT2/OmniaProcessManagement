import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase, DialogPositions, ConfirmDialogResponse } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Enums, Link, ProcessReferenceData } from '../../../fx/models';
import { ProcessDesignerStore } from '../../stores';
import { MultilingualStore } from '@omnia/fx/store';

export class ProcessLinksTabRenderer extends TabRenderer {
    generateElement(h): JSX.Element {
        return (<ProcessLinksComponent key={Guid.newGuid().toString()}></ProcessLinksComponent>);
    }
}

export interface ProcessDrawingProps {
}

@Component
export class ProcessLinksComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>
{
    //@Prop() public callerEditorStore?: EditorStore;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openLinkPicker: boolean = false;
    private selectedLink: Link;
    private orderLinks: Array<Link> = [];
    private isDragging: boolean = false;

    created() {
        this.init();
    }

    init() {
        this.orderLinks = Utils.clone(this.referenceLinksData) || [];
        for (let link of this.orderLinks) {
            link.multilingualTitle = this.multilingualStore.getters.stringValue(link.title);
        }
    }

    mounted() {
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    openAddLinksForm(type: Enums.LinkType) {
        this.selectedLink = { id: null, linkType: type } as Link;
        this.openLinkPicker = true;
    }

    get referenceLinksData(): Link[] {
        return this.currentProcessStore.getters.referenceData().current.processData.links;
    }

    onLinksChanged(link?: Link, isDelete?: boolean) {
        if (Utils.isNullOrEmpty(this.referenceLinksData))
            return;
        if (link) {
            link.multilingualTitle = this.multilingualStore.getters.stringValue(link.title);
            let findLinkIndex = this.orderLinks.findIndex(l => l.id == link.id);
            if (isDelete) {
                this.orderLinks.splice(findLinkIndex, 1);
            }
            else {
                if (findLinkIndex == -1)
                    this.orderLinks.push(link);
                else
                    this.orderLinks[findLinkIndex] = link;
            }
        }
        this.currentProcessStore.getters.referenceData().current.processData.links = this.orderLinks;
        this.processDesignerStore.actions.saveState.dispatch();
    }

    private onLinkClick(link: Link) {

    }

    private deleteLink(link) {
        this.$confirm.open().then((res) => {
            if (res == ConfirmDialogResponse.Ok) {
                this.onLinksChanged(link, true);
            }
        })
    }

    /**
        * Render 
        * @param h
        */

    renderLinkPicker(h) {
        return (
            <omfx-dialog
                hideCloseButton={true}
                model={{ visible: true }}
                maxWidth="800px"
                dark={this.omniaTheming.promoted.header.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                position={DialogPositions.Center}
            >
                <div style={{ height: '100%' }}>
                    <opm-processdesigner-createlink
                        linkId={this.selectedLink.id}
                        onSave={(link: Link) => {
                            this.openLinkPicker = false;
                            this.onLinksChanged(link, false);
                        }}
                        onClose={() => {
                            this.openLinkPicker = false;
                        }}
                        linkType={this.selectedLink.linkType}
                    ></opm-processdesigner-createlink>
                </div>
            </omfx-dialog>
        )
    }

    renderItems() {
        let h = this.$createElement;
        return (
            <draggable
                options={{ handle: ".drag-handle", animation: "100" }}
                onStart={() => { this.isDragging = true; }}
                onEnd={() => { this.isDragging = false; }}
                element="v-list"
                v-model={this.orderLinks}
                onChange={() => { this.onLinksChanged(); }}>
                {
                    this.orderLinks.length == 0 ?
                        <div>{this.pdLoc.MessageNoLinksItem}</div>
                        : this.orderLinks.map((link) => {
                            return (
                                <v-list-item class={!this.isDragging && "notdragging"} >
                                    <v-list-item-content>
                                        <v-list-item-title color={this.omniaTheming.promoted.body.onComponent.base}>{link.multilingualTitle}</v-list-item-title>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                        <v-btn icon class="mr-1 ml-1" onClick={() => {
                                            this.selectedLink = link;
                                            this.openLinkPicker = true;
                                        }}>
                                            <v-icon size='14' color={this.omniaTheming.promoted.body.onComponent.base}>fas fa-pen</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                    <v-list-item-action>
                                        <v-btn icon class="mr-0" onClick={() => { this.deleteLink(link); }}>
                                            <v-icon size='14' color={this.omniaTheming.promoted.body.onComponent.base}>far fa-trash-alt</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                    <v-list-item-action>
                                        <v-btn icon class="mr-0" onClick={() => { }}>
                                            <v-icon class="drag-handle" size='14' color={this.omniaTheming.promoted.body.onComponent.base}>fas fa-grip-lines</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item>
                            )
                        })
                }
            </draggable>
        )
    }

    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <div>
                    <v-btn text onClick={(e: Event) => { e.stopPropagation(); this.openAddLinksForm(Enums.LinkType.CustomLink) }} >
                        <v-icon small>add</v-icon>
                        <span>{this.pdLoc.AddLink}</span>
                    </v-btn>
                    <v-btn text onClick={(e: Event) => { e.stopPropagation(); this.openAddLinksForm(Enums.LinkType.Heading) }} >
                        <v-icon small>add</v-icon>
                        <span>{this.pdLoc.AddHeader}</span>
                    </v-btn>
                </div>
                <div>{this.renderItems()}</div>
            </v-card-text>
            {this.openLinkPicker && this.renderLinkPicker(h)}
        </v-card>)
    }
}

