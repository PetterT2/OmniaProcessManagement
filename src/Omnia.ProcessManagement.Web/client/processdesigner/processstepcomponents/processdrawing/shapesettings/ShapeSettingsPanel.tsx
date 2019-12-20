import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { CurrentProcessStore } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { DrawingShape, DrawingShapeDefinition, DrawingShapeTypes, DrawingProcessStepShape, DrawingCustomLinkShape } from '../../../../fx/models';
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
    private lockedSubmitShapeSettings = true;

    private shortcutDesignerItem: ProcessStepShortcutDesignerItem = null;
    created() {
        this.init();
    }

    init() {
        this.initSelectedShape();

        this.processDesignerStore.mutations.setSelectedShapeToEdit.onCommited((selectedShape: DrawingShape) => {
            this.initSelectedShape();
        });
    }

    initSelectedShape() {
        this.selectedShape = this.processDesignerStore.getters.shapeToEditSettings();
        this.isShowChangeShape = false;
        this.lockedSubmitShapeSettings = true;

        this.selectedProcessStepId = this.selectedShape.type == DrawingShapeTypes.ProcessStep ? (this.selectedShape as DrawingProcessStepShape).processStepId : null;
        this.selectedCustomLinkId = this.selectedShape.type == DrawingShapeTypes.CustomLink ? (this.selectedShape as DrawingCustomLinkShape).linkId : null;
        this.drawingShapeOptions = {
            id: Guid.newGuid(),
            processStepId: this.selectedProcessStepId,
            customLinkId: this.selectedCustomLinkId,
            shapeDefinition: this.selectedShape.shape.definition,
            shapeType: this.selectedShape.type,
            title: this.selectedShape.title
        };

        if (this.selectedShape.type = DrawingShapeTypes.ProcessStep) {
            this.currentProcessStore.actions.ensureShortcut.dispatch(this.selectedProcessStepId).then(() => {
                this.shortcutDesignerItem = new ProcessStepShortcutDesignerItem();
            });
        }

        this.processDesignerStore.mutations.initFormValidator.commit(this);
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    private onClose() {
        if (this.processDesignerStore.formValidator.validateAll()) {
            this.processDesignerStore.panels.mutations.toggleEditShapeSettingsPanel.commit(false);
            this.processDesignerStore.mutations.updateDrawingShape.commit(this.drawingShapeOptions);
        }
    }
        
    onChangedDrawingOptions(drawingOptions: DrawingShapeOptions) {
        this.drawingShapeOptions = drawingOptions;

        if (this.lockedSubmitShapeSettings) {
            this.lockedSubmitShapeSettings = false;
            return;
        }
        if (this.processDesignerStore.formValidator.validateAll()) {
            this.processDesignerStore.mutations.updateDrawingShape.commit(this.drawingShapeOptions);
        }
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
        return <div>
            <ShapeTypeComponent
                isHideCreateNew={true}
                drawingOptions={this.drawingShapeOptions}
                changeDrawingOptionsCallback={this.onChangedDrawingOptions}
                formValidator={this.processDesignerStore.formValidator}
                changeShapeCallback={this.onChangeShape}></ShapeTypeComponent>
        </div>;
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
            title: null
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
                {this.selectedShape.type != DrawingShapeTypes.ProcessStep ? this.renderDrawingSettings(h) : this.renderShortcutSettings(h)}
            </v-container>
        </div>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSettingsComponent);
});

