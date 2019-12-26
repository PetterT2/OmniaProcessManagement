﻿import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { Process, Enums, ProcessWorkingStatus } from '../../../../fx/models';
import { UnpublishDialog } from './UnpublishDialog';

interface PublishedMenuActionsProps {
    closeCallback: (isUpdate: boolean) => void;
    process: DisplayProcess;
    isAuthor: boolean;
}

@Component
export class PublishedMenuActions extends VueComponentBase<PublishedMenuActionsProps> implements IWebComponentInstance {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: (isUpdate: boolean) => void;
    @Prop() process: DisplayProcess;
    @Prop() isAuthor: boolean;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
 
    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    disableButtonUpdateAction: boolean = false;
    openUnpublishDialog: boolean = false;
   
    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    private refreshContextMenu() {
        this.disableButtonUpdateAction = !this.isAuthor;
    }

    private renderUnpublishDialog(h) {
        return (
            <UnpublishDialog closeCallback={() => { this.openUnpublishDialog = false; }} process={this.process}></UnpublishDialog>
        )
    }

    render(h) {
        return (
            <div>
                <v-menu close-delay="50"
                    {
                    ...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <v-button {...toSpread} icon class={this.listViewClasses.menuHeader} v-show={this.process.isMouseOver} onClick={() => {
                                    this.refreshContextMenu();
                                }}><v-icon>more_vert</v-icon></v-button>
                            ]
                        }
                    })}>
                    <v-list>
                        <v-list-item onClick={() => { }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.CreateDraft}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }}>
                            <v-list-item-title>{this.loc.ProcessActions.ViewProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { }}>
                            <v-list-item-title>{this.loc.ProcessActions.ExportProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => {
                            
                        }}>
                            <v-list-item-title>{this.loc.ProcessActions.ProcessHistory}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.MoveProcess}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { this.openUnpublishDialog = true; }} disabled={this.disableButtonUpdateAction}>
                            <v-list-item-title>{this.loc.ProcessActions.UnpublishProcess}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                {this.openUnpublishDialog && this.renderUnpublishDialog(h)}
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PublishedMenuActions);
});

