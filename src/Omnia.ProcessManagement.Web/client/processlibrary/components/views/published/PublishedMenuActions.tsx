import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryListViewStyles, DisplayProcess } from '../../../../models';
import { Process } from '../../../../fx/models';

interface PublishedMenuActionsProps {
    closeCallback: (isUpdate: boolean) => void;
    process: DisplayProcess;
}

@Component
export class PublishedMenuActions extends VueComponentBase<PublishedMenuActionsProps> implements IWebComponentInstance {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() closeCallback: (isUpdate: boolean) => void;
    @Prop() process: DisplayProcess;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
 
    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    isLoadingContextMenu: boolean = false;
    disableButtonCreateDraft: boolean = false;
    disableButtonView: boolean = false;
    disableButtonExportProcess: boolean = false;
    disableButtonProcessHistory: boolean = false;
    disableButtonMoveProcess: boolean = false;
    disableButtonDelete: boolean = false;
    openDeleteDialog: boolean = false;
    openPublishDialog: boolean = false
    selectedProcess: Process;

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

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

                                }}><v-icon>more_vert</v-icon></v-button>
                            ]
                        }
                    })}>
                    <v-list>
                        <v-list-item onClick={() => {  }} disabled={this.isLoadingContextMenu || this.disableButtonCreateDraft}>
                            <v-list-item-title>{this.loc.ProcessActions.CreateDraft}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonView}>
                            <v-list-item-title>{this.loc.ProcessActions.ViewProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonExportProcess}>
                            <v-list-item-title>{this.loc.ProcessActions.ExportProcess}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => {
                            this.selectedProcess = this.process;
                            this.openPublishDialog = true;
                        }} disabled={this.isLoadingContextMenu || this.disableButtonProcessHistory}>
                            <v-list-item-title>{this.loc.ProcessActions.ProcessHistory}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonMoveProcess}>
                            <v-list-item-title>{this.loc.ProcessActions.MoveProcess}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonDelete}>
                            <v-list-item-title>{this.loc.ProcessActions.UnpublishProcess}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PublishedMenuActions);
});

