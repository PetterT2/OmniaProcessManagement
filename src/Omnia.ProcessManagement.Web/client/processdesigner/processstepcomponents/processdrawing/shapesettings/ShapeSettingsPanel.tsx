import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { CurrentProcessStore, ShapeTemplatesConstants } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { DrawingShape, DrawingShapeDefinition, DrawingShapeTypes, DrawingProcessStepShape, DrawingCustomLinkShape, DrawingImageShapeDefinition } from '../../../../fx/models';
import { DrawingShapeOptions } from '../../../../models/processdesigner';
import { ShapeTypeComponent } from '../../../shapepickercomponents/ShapeType';
import { ShapeSelectionComponent } from '../../../shapepickercomponents/ShapeSelection';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessStepDesignerItem } from '../../../designeritems/ProcessStepDesignerItem';
import { ProcessStepShortcutDesignerItem } from '../../../designeritems/ProcessStepShortcutDesignerItem';

export interface ShapeSettingsProps {

}

const StaticTabNames = {
    shape: 'shapeTab'
}

@Component
export class ShapeSettingsComponent extends VueComponentBase<ShapeSettingsProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private selectedShape: DrawingShape = null;
    private selectedProcessStepId: GuidValue = null;
    private selectedCustomLinkId: GuidValue = null;
    private drawingShapeOptions: DrawingShapeOptions = null;
    private isShowChangeShape: boolean = false;
    private selectedTab = StaticTabNames.shape;
    private previousProcessStepId: GuidValue = null;

    private shortcutDesignerItem: ProcessStepShortcutDesignerItem = null;
    created() {
        this.initSelectedShape();
    }

    initSelectedShape() {
        this.selectedShape = this.processDesignerStore.getters.shapeToEditSettings();
        if (this.selectedShape == null || this.selectedShape == undefined)
            return;
        this.isShowChangeShape = false;

        this.selectedProcessStepId = this.selectedShape.type == DrawingShapeTypes.ProcessStep ? (this.selectedShape as DrawingProcessStepShape).processStepId : null;
        this.selectedCustomLinkId = this.selectedShape.type == DrawingShapeTypes.CustomLink ? (this.selectedShape as DrawingCustomLinkShape).linkId : null;
        this.drawingShapeOptions = {
            id: Guid.newGuid(),
            processStepId: this.selectedProcessStepId,
            customLinkId: this.selectedCustomLinkId,
            shapeDefinition: this.selectedShape.shape.definition,
            shapeType: this.selectedShape.type,
            title: this.selectedShape.title,
            shape: this.selectedShape.shape
        };

        this.previousProcessStepId = this.selectedProcessStepId;

        this.initShortcut();

        this.processDesignerStore.mutations.initFormValidator.commit(this);
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    onClose() {
        this.validateAndSubmitChanges(true);
    }

    initShortcut() {
        return new Promise<any>((resolve, reject) => {
            if (this.drawingShapeOptions.shapeType == DrawingShapeTypes.ProcessStep && this.drawingShapeOptions.processStepId) {
                this.currentProcessStore.actions.ensureShortcut.dispatch(this.drawingShapeOptions.processStepId).then(() => {
                    this.shortcutDesignerItem = new ProcessStepShortcutDesignerItem();
                    resolve();
                }).catch(reject);
            }
            else {
                resolve();
            }
        });
    }

    isGoodToGo(drawingOptions: DrawingShapeOptions) {
        //Need to manually check some rule before saveState
        let result = true;
        if (drawingOptions.shapeType == DrawingShapeTypes.ProcessStep && (!drawingOptions.processStepId || drawingOptions.processStepId == Guid.empty)) {
            result = false;
        }
        if (drawingOptions.shapeType == DrawingShapeTypes.CustomLink && (!drawingOptions.customLinkId || drawingOptions.customLinkId == Guid.empty)) {
            result = false;
        }
        return result;
    }

    onChangedDrawingOptions(drawingOptions: DrawingShapeOptions) {
        this.drawingShapeOptions = drawingOptions;

        //if (Utils.isNullOrEmpty(drawingOptions.shape) && drawingOptions.shapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Freeform.id)
        //    this.drawingShapeOptions.shape = shape;

        if (this.previousProcessStepId != this.drawingShapeOptions.processStepId) {
            this.previousProcessStepId = this.drawingShapeOptions.processStepId;
            this.initShortcut().then(() => {
                this.validateAndSubmitChanges(false);
            });
        }
        else {
            this.validateAndSubmitChanges(false);
        }

    }

    validateAndSubmitChanges(isClosed: boolean) {
        return new Promise<any>((resolve, reject) => {
            if (this.processDesignerStore.formValidator.validateAll() && this.isGoodToGo(this.drawingShapeOptions)) {
                this.processDesignerStore.mutations.updateDrawingShape.commit(this.drawingShapeOptions);
                if (isClosed) {
                    this.processDesignerStore.panels.mutations.toggleEditShapeSettingsPanel.commit(false);
                }
            }
            else {
                if (isClosed) {
                    this.processDesignerStore.panels.mutations.toggleEditShapeSettingsPanel.commit(false);
                }
                resolve();
            }

        });
    }

    onChangeShape() {
        this.isShowChangeShape = true;
    }

    renderDrawingSettings(h) {
        if (!this.isShowChangeShape)
            return this.renderShapeTypeSettings(h);
        return this.renderShapeSelection(h);
    }

    renderShapeTypeSettings(h) {
        return (
            <div>
                <ShapeTypeComponent
                    isHideCreateNew={true}
                    drawingOptions={this.drawingShapeOptions}
                    changeDrawingOptionsCallback={this.onChangedDrawingOptions}
                    formValidator={this.processDesignerStore.formValidator}
                    changeShapeCallback={this.onChangeShape}></ShapeTypeComponent>
                <v-card-actions>
                    <v-btn text
                        color={this.omniaTheming.themes.primary.base}
                        dark={this.omniaTheming.promoted.body.dark}
                        onClick={this.onChangeShape}>{this.pdLoc.ChangeShape}</v-btn>
                </v-card-actions>
            </div>
        )
    }

    renderShapeSelection(h) {
        return <v-card flat>
            <v-card-content>
                <ShapeSelectionComponent shapeSelectedCallback={this.onShapeSelected}></ShapeSelectionComponent>
            </v-card-content>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text
                    onClick={() => { this.isShowChangeShape = false; }}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
            </v-card-actions>
        </v-card>;

    }

    onShapeSelected(selectedShapeDefinition: DrawingShapeDefinition) {
        let id = this.drawingShapeOptions.id;
        this.drawingShapeOptions = {
            id: id,
            processStepId: this.selectedProcessStepId,
            customLinkId: this.selectedCustomLinkId,
            shapeDefinition: selectedShapeDefinition,
            shapeType: this.selectedShape.type,
            title: this.selectedShape.title
        };
        this.isShowChangeShape = false;
    }

    renderShortcutSettings(h) {
        return <v-tabs v-model={this.selectedTab}
            onChange={(selectedTab) => { this.selectedTab = selectedTab; }}>
            <v-tab href={'#' + StaticTabNames.shape}>
                {this.opmCoreLoc.Shape}
            </v-tab>
            {
                this.shortcutDesignerItem && this.shortcutDesignerItem.tabs.map((tabItem) => {
                    return <v-tab href={'#' + tabItem.tabId}>
                        {tabItem.tabName}
                    </v-tab>
                })
            }
            <v-tab-item id={StaticTabNames.shape}>
                {this.selectedTab == StaticTabNames.shape ? this.renderDrawingSettings(h) : null}
            </v-tab-item>
            {
                this.shortcutDesignerItem && this.shortcutDesignerItem.tabs.map((tabItem) => {
                    return <v-tab-item id={tabItem.tabId}>
                        {this.selectedTab == tabItem.tabId ? tabItem.tabRenderer.getElement(h) : null}
                    </v-tab-item>
                })
            }

        </v-tabs>

    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return <div>
            <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                <v-toolbar-title>{this.pdLoc.ShapeSettings}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={this.onClose}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-container>
                {(this.drawingShapeOptions.shapeType == DrawingShapeTypes.ProcessStep && this.drawingShapeOptions.processStepId != null) ? this.renderShortcutSettings(h) : this.renderDrawingSettings(h)}
            </v-container>
        </div>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSettingsComponent);
});

