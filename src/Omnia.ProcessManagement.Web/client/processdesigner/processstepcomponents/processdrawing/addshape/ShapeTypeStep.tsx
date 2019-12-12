import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, FormValidator, FieldValueValidation, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, DialogPositions, HeadingStyles, DialogStyles } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { CurrentProcessStore,  ProcessTemplateStore, DrawingCanvas } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import './ShapeTypeStep.css';
import { DrawingShapeDefinition, DrawingShapeTypes, TextPosition, Enums, ProcessStep, DrawingShape, Link } from '../../../../fx/models';
import { ShapeDefinitionSelection, AddShapeOptions } from '../../../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ShapeTypeStepStyles } from '../../../../fx/models/styles';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeTypeStepComponent extends VueComponentBase<ShapeSelectionStepProps> implements IWebComponentInstance{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    //@Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    shapeTypeStepStyles = StyleFlow.use(ShapeTypeStepStyles);
    private availableShapeDefinitions: Array<ShapeDefinitionSelection> = null;
    private drawingCanvas: DrawingCanvas = null;
    private filterShapeTimeout = null;//use this to avoid forceUpdate
    private selectedShapeDefinition: DrawingShapeDefinition = null;//ToDo check other type?
    private selectedShapeType: Enums.ShapeTypes = Enums.ShapeTypes.ProcessStep;
    private previewCanvasId: GuidValue = Guid.newGuid();
    private internalValidator: FormValidator = new FormValidator(this);
    private childProcessSteps: Array<ProcessStep> = []; //todo
    private selectedProcessStepId: GuidValue = Guid.empty;
    private selectedCustomLinkId: GuidValue = Guid.empty;
    private shapeTitle: MultilingualString = null;
    private textPositions = [
        {
            value: TextPosition.Above,
            title: this.opmCoreloc.DrawingShapeSettings.Above
        },
        {
            value: TextPosition.Center,
            title: this.opmCoreloc.DrawingShapeSettings.Center
        },
        {
            value: TextPosition.Bottom,
            title: this.opmCoreloc.DrawingShapeSettings.Below
        }
    ];
    private shapeTypes = [
        {
            value: Enums.ShapeTypes.None,
            title: this.pdLoc.ShapeTypes.None
        },
        {
            value: Enums.ShapeTypes.ProcessStep,
            title: this.pdLoc.ShapeTypes.ProcessStep
        },
        {
            value: Enums.ShapeTypes.Link,
            title: this.pdLoc.ShapeTypes.Link
        }
    ];
    private isShowAddLinkDialog: boolean = false;
    private headingStyle: typeof HeadingStyles = { //todo: refactor dialog
        wrapper: DialogStyles.heading
    };

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.startToDrawShape();
    }
       
    init() {
        this.selectedShapeDefinition = Utils.clone(this.addShapeWizardStore.selectedShape.state);
        this.shapeTitle = Utils.clone(this.selectedShapeDefinition.title);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
    }

    private changeShape() {
        this.addShapeWizardStore.actions.goToPreviousStep.dispatch();
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private createShape() {
        if (this.internalValidator.validateAll()) {
            let drawingShapeType: DrawingShapeTypes = DrawingShapeTypes.Undefined;

            let newShape: DrawingShape = null;
            let newProcessStepId: GuidValue = null;
            let customLinkUrl: string = null;
            if (this.selectedShapeType == Enums.ShapeTypes.None) {
            }
            else
                if (this.selectedShapeType == Enums.ShapeTypes.ProcessStep) {
                    drawingShapeType = DrawingShapeTypes.ProcessStep;
                    if (this.selectedProcessStepId == Guid.empty) {
                        this.currentProcessStore.actions.addProcessStep.dispatch(this.shapeTitle).then((result) => {

                        })
                        //this.processDesignerStore.actions.addProcessStep.dispatch(this.displayShapeTitle).then((addedProcessStep) => {
                        //    newProcessStepId = addedProcessStep.id;
                        //});
                    }
                    else {
                        newProcessStepId = this.selectedProcessStepId;
                    }
                }
                else if (this.selectedShapeType == Enums.ShapeTypes.Link) {
                    drawingShapeType = DrawingShapeTypes.CustomLink;
                    let customLinks = this.currentProcessStore.getters.referenceData().current.processData.links;
                    if (customLinks) {
                        let link = customLinks.find((item) => item.id == this.selectedCustomLinkId);
                        if (link) {
                            customLinkUrl = link.url;
                        }
                    }
                }
            let addShapeOptions: AddShapeOptions = {
                shapeDefinition: this.selectedShapeDefinition,
                shapeType: drawingShapeType,
                title: this.shapeTitle,
                processStepId: newProcessStepId,
                customLink: customLinkUrl
            };
            this.processDesignerStore.mutations.addShapeToDrawing.commit(addShapeOptions);
            this.processDesignerStore.actions.addRecentShapeDefinitionSelection.dispatch(this.addShapeWizardStore.selectedShape.state);
            this.onClose();
        }
    }

    private completedAddShape() {

    }

    private onSelectedShapeType() {
        this.selectedProcessStepId = Guid.empty;
        this.selectedCustomLinkId = Guid.empty;
        this.shapeTitle = null;
    }
    private onSelectedProcessChanged() {
        let childSteps = this.currentProcessStore.getters.referenceData().current.processStep.processSteps;
        let selectedStep = childSteps.find(item => item.id == this.selectedProcessStepId);
        if (selectedStep) {
            this.shapeTitle = Utils.clone(selectedStep.title);
        }
        else
            this.shapeTitle = null;
    }
    private onSelectedLinkChanged() {
        let links = this.currentProcessStore.getters.referenceData().current.processData.links;
        if (links) {
            let selectedLink = links.find(item => item.id == this.selectedCustomLinkId);
            if (selectedLink) {
                this.shapeTitle = Utils.clone(selectedLink.title);
            }
            else
                this.shapeTitle = null;
        }        
    }

    renderShapePreview(h) {
        return <div onMouseover={this.previewActivedShape} onMouseleave={this.updateDrawedShape} class={this.shapeTypeStepStyles.canvasPreviewWrapper}><canvas id={this.previewCanvasId.toString()}></canvas></div>;
    }
    private initShapeTitle() {
        let result = this.shapeTitle;
        let shapeTitleStringValue = this.multilingualStore.getters.stringValue(result);
        if (!shapeTitleStringValue || shapeTitleStringValue.length == 0) {
            result = this.selectedShapeDefinition.title;
        }
        return result;
    }
    startToDrawShape() {
        if (this.selectedShapeDefinition) {
            if (this.drawingCanvas)
                this.drawingCanvas.destroy();

            setTimeout(() => {
                var canvasPadding = 20;
                this.drawingCanvas = new DrawingCanvas(this.previewCanvasId.toString(), {},
                    {
                        drawingShapes: [],
                        width: 200,//ToDo
                        height: 200
                    });
                this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (this.selectedShapeDefinition as DrawingShapeDefinition), this.shapeTitle, false);
            }, 200);
        }
    }
    updateCanvasSize() {
        //redraw the canvas
        this.updateDrawedShape();
    }
    updateDrawedShape() {
        if (this.drawingCanvas) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0], (this.selectedShapeDefinition as DrawingShapeDefinition), this.shapeTitle, false);
        }
    }

    previewActivedShape() {
        if (this.drawingCanvas) {
            this.drawingCanvas.updateShapeDefinition(this.drawingCanvas.drawingShapes[0], (this.selectedShapeDefinition as DrawingShapeDefinition), this.shapeTitle, true);
        }
    }
    private renderShapeTypeOptions(h) {
        return <v-container>
            <v-row>
                <v-col cols="6">
                    <v-select item-value="value" item-text="title" items={this.shapeTypes} label={this.pdLoc.ShapeType}
                        onChange={this.onSelectedShapeType} v-model={this.selectedShapeType}></v-select>
                    {this.selectedShapeType == Enums.ShapeTypes.ProcessStep ?
                        this.renderChildProcessSteps(h)
                        : null
                    }
                    {this.selectedShapeType == Enums.ShapeTypes.Link ?
                        this.renderCustomLinkOptions(h)
                        : null
                    }
                    <omfx-field-validation
                        useValidator={this.internalValidator}
                        checkValue={(this.selectedShapeDefinition as DrawingShapeDefinition).textPosition}
                        rules={new FieldValueValidation().IsRequired().getRules()}>
                    </omfx-field-validation>
                    <omfx-multilingual-input
                        requiredWithValidator={this.internalValidator}
                        model={this.shapeTitle}
                        onModelChange={(title) => { this.shapeTitle = title; this.updateDrawedShape(); }}
                        forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                </v-col>
                <v-col cols="6">
                    {this.renderShapePreview(h)}
                </v-col>
            </v-row>
        </v-container>;
    }
    private renderChildProcessSteps(h) {
        let processStepOptions = [{
            id: Guid.empty,
            title: '[' + this.pdLoc.New + ']'
        }];
        let childSteps = this.currentProcessStore.getters.referenceData().current.processStep.processSteps;
        processStepOptions = processStepOptions.concat(childSteps.map(item => {
            return {
                id: item.id,
                title: this.multilingualStore.getters.stringValue(item.title)
            }
        }));

        return <div>
            <v-select item-value="id" item-text="title" items={processStepOptions} v-model={this.selectedProcessStepId} onChange={this.onSelectedProcessChanged}></v-select>
            <omfx-field-validation
                useValidator={this.internalValidator}
                checkValue={this.selectedProcessStepId}
                rules={new FieldValueValidation().IsRequired().getRules()}>
            </omfx-field-validation>
        </div>;
    }
    private renderCustomLinkOptions(h) {
        let customLinkOptions = [{
            id: Guid.empty,
            title: '[' + this.pdLoc.New + ']'
        }];
        let customLinks = this.currentProcessStore.getters.referenceData().current.processData.links;
        if (customLinks) {
            customLinkOptions = customLinkOptions.concat(customLinks.map(item => {
                return {
                    id: item.id,
                    title: this.multilingualStore.getters.stringValue(item.title)
                }
            }));
        }
        return <div>
            <v-select item-value="id" item-text="title" items={customLinkOptions} v-model={this.selectedCustomLinkId} onChange={this.onSelectedLinkChanged}></v-select>
            <omfx-field-validation
                useValidator={this.internalValidator}
                checkValue={this.selectedCustomLinkId}
                rules={new FieldValueValidation().IsRequired().getRules()}>
            </omfx-field-validation>
            {this.selectedCustomLinkId == Guid.empty ? <a onClick={this.openCreateLinkDialog} href="javascript:void(0)">{this.pdLoc.AddLink}</a> : null}
            {this.renderCreateLinkDialog(h)}
        </div>;
    }
    private openCreateLinkDialog() {
        this.isShowAddLinkDialog = true;
    }
    private closeCreateLinkDialog() {
        this.isShowAddLinkDialog = false;
    }
    private renderCreateLinkDialog(h) {
        if (!this.isShowAddLinkDialog)
            return null;

        return <omfx-dialog
            hideCloseButton={true}
            model={{ visible: true }}
            maxWidth="800px"
            dark={this.omniaTheming.promoted.header.dark}
            contentClass={this.omniaTheming.promoted.body.class}
            position={DialogPositions.Center}
        >
            <div style={{ height: '100%' }}>
                <opm-processdesigner-createlink onClose={this.closeCreateLinkDialog} onSave={this.createLinkCallback}></opm-processdesigner-createlink>
            </div>
        </omfx-dialog>;

    }
    private createLinkCallback(createdLink: Link) {
        this.isShowAddLinkDialog = false;
        this.selectedCustomLinkId = createdLink.id;
    }

    private renderShapeSettings(h) {
        return <v-container>           
            <v-row>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field filled v-model={(this.selectedShapeDefinition as DrawingShapeDefinition).width} label={this.opmCoreloc.DrawingShapeSettings.Width}
                                onChange={this.updateCanvasSize} type="number" suffix="px"></v-text-field>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.selectedShapeDefinition as DrawingShapeDefinition).width}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field filled v-model={(this.selectedShapeDefinition as DrawingShapeDefinition).height} label={this.opmCoreloc.DrawingShapeSettings.Height}
                                onChange={this.updateCanvasSize} type="number" suffix="px"></v-text-field>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.selectedShapeDefinition as DrawingShapeDefinition).height}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <v-select item-value="value" item-text="title" items={this.textPositions} label={this.opmCoreloc.DrawingShapeSettings.TextPosition}
                                onChange={this.updateDrawedShape} v-model={(this.selectedShapeDefinition as DrawingShapeDefinition).textPosition}></v-select>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.selectedShapeDefinition as DrawingShapeDefinition).textPosition}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model={(this.selectedShapeDefinition as DrawingShapeDefinition).fontSize} label={this.opmCoreloc.DrawingShapeSettings.FontSize}
                                onChange={this.updateDrawedShape} type="number" suffix="px"></v-text-field>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={(this.selectedShapeDefinition as DrawingShapeDefinition).fontSize}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaLoc.Common.BackgroundColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).backgroundColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).backgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.omniaLoc.Common.BorderColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).borderColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).borderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                required={true}
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.TextColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).textColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).textColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBackgroundColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).activeBackgroundColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).activeBackgroundColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveBorderColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).activeBorderColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).activeBorderColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                        <v-col cols="12">
                            <omfx-color-picker
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.opmCoreloc.DrawingShapeSettings.ActiveTextColor}
                                model={{ color: (this.selectedShapeDefinition as DrawingShapeDefinition).activeTextColor }}
                                disableRgba={true}
                                onChange={(p) => { (this.selectedShapeDefinition as DrawingShapeDefinition).activeTextColor = p.color; this.updateDrawedShape(); }}>
                            </omfx-color-picker>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>;
    }

    private renderActionButtons(h) {
        return <v-card-actions>
            <v-btn text
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                onClick={this.changeShape}>{this.pdLoc.ChangeShape}</v-btn>
            <v-spacer></v-spacer>
            <v-btn text
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                onClick={this.createShape}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
            <v-btn text
                onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
        </v-card-actions>;
    }
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <v-card flat>
            <v-card-content>
                {this.renderShapeTypeOptions(h)}
                {this.renderShapeSettings(h)}
            </v-card-content>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeTypeStepComponent, { destroyTimeout: 1500 });
});
