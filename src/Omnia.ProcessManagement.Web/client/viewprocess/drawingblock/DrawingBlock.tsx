﻿import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './DrawingBlock.css';
import { DrawingBlockStyles } from '../../models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import { DrawingBlockData, CanvasDefinition, DrawingShape, DrawingShapeTypes, DrawingProcessStepShape, DrawingCustomLinkShape, ProcessData, ProcessStep } from '../../fx/models';
import { CurrentProcessStore, DrawingCanvas, OPMRouter, OPMUtils, ProcessStore, Shape } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class DrawingBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof DrawingBlockStyles | any;

    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<DrawingBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(ProcessStore) private processStore: ProcessStore;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: DrawingBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    canvasDefinition: CanvasDefinition = null;
    drawingClasses = StyleFlow.use(DrawingBlockStyles, this.styles);
    canvasId = 'viewcanvas_' + Utils.generateGuid().toString();
    drawingCanvas: DrawingCanvas = null;
    currentDrawingProcessData: ProcessData;
    previousParentProcessStep: ProcessStep = null;

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    get parentProcessData() {
        return this.currentProcessStore.getters.referenceData().current.parentProcessData;
    }

    get parentProcessStep() {
        return this.currentProcessStore.getters.referenceData().current.parentProcessStep;
    }

    init() {
        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData);

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-drawing-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: { title: { isMultilingualString: true } }
            });
        });

        this.initCanvas();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initCanvas();
        }));
    }

    private drawShapes() {
        var needToDestroyCanvas = true;
        var selectedShape: DrawingProcessStepShape = null;
        if (!this.canvasDefinition && this.parentProcessData && this.parentProcessData.canvasDefinition) {
            this.canvasDefinition = JSON.parse(JSON.stringify(this.parentProcessData.canvasDefinition));
            selectedShape = this.canvasDefinition.drawingShapes && this.canvasDefinition.drawingShapes.length > 0 ?
                this.canvasDefinition.drawingShapes.find(s => s.type == DrawingShapeTypes.ProcessStep &&
                    (s as DrawingProcessStepShape).processStepId &&
                    (s as DrawingProcessStepShape).processStepId.toString() == this.currentProcessStore.getters.referenceData().current.processStep.id) as DrawingProcessStepShape : null;
            if (selectedShape && this.previousParentProcessStep && this.previousParentProcessStep.id.toString() == this.parentProcessStep.id.toString()) {
                needToDestroyCanvas = false;
            }
            this.previousParentProcessStep = this.parentProcessStep;
        }
        else {
            this.previousParentProcessStep = null;
            if (!this.canvasDefinition) return;
        }

        if (needToDestroyCanvas) this.destroyCanvas();

        this.canvasDefinition.gridX = 0;
        this.canvasDefinition.gridY = 0;

        setTimeout(() => {
            if (needToDestroyCanvas) {
                this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, this.canvasDefinition, true);
                this.drawingCanvas.setSelectShapeEventWithCallback(this.onSelectShape);
            }
            if (selectedShape) {
                setTimeout(() => {
                    this.drawingCanvas.setSelectedShapeItemId(selectedShape.processStepId);
                }, 20)
            }
        }, 20);
    }

    private initCanvas() {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();

        if (!currentReferenceData) {
            this.destroyCanvas();
            return;
        }

        this.currentDrawingProcessData = Utils.clone(currentReferenceData.current.processData);
        this.canvasDefinition = Utils.clone(currentReferenceData.current.processData.canvasDefinition);
        this.drawShapes();
    }

    private destroyCanvas() {
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();
    }

    private onSelectShape(shape: DrawingShape) {
        if (shape) {
            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            if (shape.type == DrawingShapeTypes.ProcessStep) {
                let currentProcessStep = OPMUtils.getProcessStepInProcess(currentReferenceData.process.rootProcessStep, (shape as DrawingProcessStepShape).processStepId);
                if (currentProcessStep && currentProcessStep.desiredProcessStep) {
                    OPMRouter.navigate(currentReferenceData.process, currentProcessStep.desiredProcessStep).then(() => {

                    });
                }
                this.drawingCanvas.setSelectedShapeItemId(OPMRouter.routeContext.route.processStepId);
            } else if (shape.type == DrawingShapeTypes.CustomLink) {
                let links = (this.currentDrawingProcessData.links || []).concat(this.parentProcessData.links || []);
                let link = links.find(l => l.id == (shape as DrawingCustomLinkShape).linkId);
                if (link) {
                    let target = "";
                    if (OPMRouter.routeContext && OPMRouter.routeContext.route) {
                        let preview = OPMRouter.routeContext.route.version === null ? true : false;
                        target = preview ? '_parent' : '';
                    }
                    window.open(link.url, link.openNewWindow ? '_blank' : target);
                }
            }
        }
    }

    setBlockData(blockData: DrawingBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    renderDrawing(h) {
        return (
            <div class={this.drawingClasses.canvasWrapper(this.omniaTheming)} style={{ width: this.canvasDefinition && this.canvasDefinition.width ? this.canvasDefinition.width + 'px' : 'auto' }}>
                <div class={this.drawingClasses.canvasOverflowWrapper}>
                    <canvas id={this.canvasId}></canvas>
                </div>
            </div>
        )
    }

    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        if (Utils.isNullOrEmpty(this.canvasDefinition)) {
            return (
                <aside>
                    <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                    <wcm-empty-block-view dark={false} icon={"fa fa-image"} text={this.corLoc.BlockDefinitions.Drawing.Title}></wcm-empty-block-view>
                </aside>
            )
        }
        return (
            <aside>
                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                <div class={this.drawingClasses.blockPadding(this.blockData.settings.spacing)}>
                    <div key={this.componentUniqueKey}>{this.renderDrawing(h)}</div>
                </div>
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DrawingBlockComponent);
});

