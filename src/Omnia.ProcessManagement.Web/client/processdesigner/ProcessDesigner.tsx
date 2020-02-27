﻿import { Inject, Localize, Utils, SubscriptionHandler, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { OmniaTheming, VueComponentBase, StyleFlow } from '@omnia/fx/ux';
import { ProcessDesignerStyles } from './ProcessDesigner.css';
import { ContentNavigationComponent } from './navigations/ContentNavigation';
import { CurrentProcessStore, OPMUtils } from '../fx';
import { TabsPanelComponent } from './tabspanel';
import { ProcessDesignerStore } from './stores';
import { ActionToolbarComponent } from './actionstoolbar/ActionToolbar';
import { DisplayModes } from '../models/processdesigner';
import DevicePreviewerComponent from './devicepreviewer/DevicePreviewer';
import { ProcessDesignerItemFactory } from './designeritems';
import { CopyToNewProcessDialog } from './copytonewprocess_dialog/CopyToNewProcess';
import './core/styles/PanelStyles.css';
import { ProcessDesignerStyles as ProcessDesignerStylesModel} from '../fx/models';

export interface ContentNavigationProps {
}

export interface ContentNavigationEvents {
    onClose: void;
}

@Component
export class ProcessDesignerComponent extends VueComponentBase implements IWebComponentInstance
{
    //@Localize(EditorLocalization.namespace) loc: EditorLocalization.locInterface;

    @Inject(SubscriptionHandler) subscriptionHandler: SubscriptionHandler;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    panelStyles = StyleFlow.use(ProcessDesignerStylesModel.PanelStyles);

    private teamSiteName: string = "";
    public editorModel = {
        visible: true
    }


    created() {
        this.processDesignerStore.actions.clearRecentShapeDefinitionSelection.dispatch();

        this.currentProcessStore.actions.deleteProcessStep.onDispatched(() => {
            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            this.processDesignerStore.actions.setProcessToShow.dispatch(currentReferenceData.process, currentReferenceData.current.parentProcessStep).then(() => {
                this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
            })
        });
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    /**
    * Event handler to toggle left drawer
    * */
    public onToggleLeftDrawer() {
        this.processDesignerStore.settings.showContentNavigation.mutate(!this.processDesignerStore.settings.showContentNavigation.state);
    }

    public renderEditorMode(h) {
        let scrollElemClass = '';//this.editorModel.visible ? PublishingAppDefaultScrollElementClass : '';

        let result = new Array<JSX.Element>();
        let actionButtons = new Array<JSX.Element>();
        let compensateDrawerLeftCss = ""
        let compensateDrawerRightCss = ""

        if (this.processDesignerStore.settings.showContentNavigation.state) {
            compensateDrawerLeftCss = ProcessDesignerStyles.compensateDrawerLeft;
        }

        //if (this.processDesignerStore.panels.drawingCanvasSettingsPanel.state.visible) {
        //    compensateDrawerRightCss = ProcessDesignerStyles.compensateDrawerRight;
        //}

        let panelWidth = this.processDesignerStore.tabs.currentTabs.state.length * 100;
        /* Main navigation drawer */
        result.push(
            <v-navigation-drawer
                app
                temporary={false}
                value={this.processDesignerStore.settings.showContentNavigation.state}
                class={[ProcessDesignerStyles.contentnavigation(this.omniaTheming.chrome.background), this.omniaTheming.chrome.class]}
                dark={this.omniaTheming.chrome.dark}
                disable-resize-watcher
                hide-overlay>
                <v-list class={[ProcessDesignerStyles.vList(this.omniaTheming.chrome.background), this.omniaTheming.chrome.class, "py-0"]}>
                    <ContentNavigationComponent onClose={this.onToggleLeftDrawer}></ContentNavigationComponent>
                </v-list>
            </v-navigation-drawer>);

        result.push(
            <div class={[ProcessDesignerStyles.tabs.position, compensateDrawerLeftCss, compensateDrawerRightCss]}>
                <div>
                    <TabsPanelComponent sliderColor={""}></TabsPanelComponent>
                </div>
            </div>)

        result.push(
            <v-app-bar
                app
                fixed
                dense
                clipped-right
                dark={this.omniaTheming.chrome.dark}
                color={this.omniaTheming.chrome.background.base}>
                <v-app-bar-nav-icon onClick={this.onToggleLeftDrawer}>
                    <v-icon>menu</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title class={ProcessDesignerStyles.title(panelWidth)}>{this.processDesignerStore.item.state ? this.processDesignerStore.item.state.title : ""}</v-toolbar-title>
                <v-toolbar-items class={ProcessDesignerStyles.panelToolbar}>
                    <v-layout justify-center>
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                    </v-layout>
                    {actionButtons}
                </v-toolbar-items>
            </v-app-bar>);

        /* Content */
        result.push(
            <v-content id="backgroundplaceholder2" class={ProcessDesignerStyles.canvasBackGround}>
                {(this.processDesignerStore.tabs.selectedTab.state) ?
                    <div class={[ProcessDesignerStyles.canvasContainer, scrollElemClass]}>
                        {this.processDesignerStore.loadingInProgress.state ?
                            null
                            :
                            this.processDesignerStore.tabs.selectedTab.state.tabRenderer.getElement(h)
                        }
                    </div>
                    : <div />
                }
            </v-content>);

        /* Action Toolbar */
        result.push(<ActionToolbarComponent key={1}></ActionToolbarComponent>);

        result.push(
            <v-navigation-drawer
                app
                float
                right
                clipped
                dark={this.omniaTheming.promoted.body.dark}
                width="340"
                temporary={false}
                disable-resize-watcher
                hide-overlay
                class={this.panelStyles.settingsPanel(this.omniaTheming.promoted.body.background.base)}
                v-model={this.processDesignerStore.panels.changeProcessTypePanel.state.show}>
                {this.processDesignerStore.panels.changeProcessTypePanel.state.show ? <opm-process-changeprocesstype></opm-process-changeprocesstype> : null}
            </v-navigation-drawer >
        );

        result.push(<CopyToNewProcessDialog></CopyToNewProcessDialog>);
        ///*Dialog*/
        //result.push(<DeletedPageDialog></DeletedPageDialog>);
        return result;
    }

    /**
    * Renders the preview frame
    * @param h
    */
    public renderPreviewMode(h) {
        let result = new Array<JSX.Element>();
        result.push(<DevicePreviewerComponent></DevicePreviewerComponent>);
        result.push(<ActionToolbarComponent></ActionToolbarComponent>);
        return result;
    }

    /**
     * Render 
     * @param h
     */
    public render(h) {
        return (
            <v-app id="omnia-pm"
                v-show={this.editorModel.visible}>
                {this.processDesignerStore.settings.displayMode.state === DisplayModes.contentPreview
                    ?
                    this.renderPreviewMode(h)
                    :
                    this.renderEditorMode(h)}
            </v-app>)
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessDesignerComponent);
});
