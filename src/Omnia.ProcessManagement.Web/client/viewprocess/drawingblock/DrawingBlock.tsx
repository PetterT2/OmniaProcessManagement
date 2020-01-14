import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './DrawingBlock.css';
import { DrawingBlockStyles } from '../../models';
import { DrawingBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import { DrawingBlockData, CanvasDefinition, DrawingShape, DrawingShapeTypes, DrawingProcessStepShape, DrawingCustomLinkShape, ProcessVersionType, RouteOptions, ProcessReferenceData, ProcessData } from '../../fx/models';
import { CurrentProcessStore, DrawingCanvas, OPMRouter, OPMUtils, ProcessStore, Shape } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class DrawingBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof DrawingBlockStyles | any;

    @Localize(DrawingBlockLocalization.namespace) loc: DrawingBlockLocalization.locInterface;
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
        this.canvasDefinition.gridX = 0;
        this.canvasDefinition.gridY = 0;
        setTimeout(() => {
            this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, this.canvasDefinition, true);
            this.drawingCanvas.setSelectingShapeCallback(this.onSelectingShape);
            if (OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId) {
                this.drawingCanvas.setSelectedShapeItemId(OPMRouter.routeContext.route.processStepId, DrawingShapeTypes.ProcessStep);
            }
        }, 300);
    }

    private initCanvas() {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();
        if (!currentReferenceData) return;
        if (currentReferenceData.current.processData.canvasDefinition) {
            this.currentDrawingProcessData = Utils.clone(currentReferenceData.current.processData);
            this.canvasDefinition = Utils.clone(currentReferenceData.current.processData.canvasDefinition);
            this.drawShapes();
        }
        else if (currentReferenceData.current.parentProcessStep) {
            let processRefrerence = OPMUtils.generateProcessReference(currentReferenceData.process, currentReferenceData.current.parentProcessStep.id);
            this.processStore.actions.ensureProcessReferenceData.dispatch([processRefrerence]).then(() => {
                let processReferenceData = this.processStore.getters.getProcessReferenceData(processRefrerence);
                this.currentDrawingProcessData = Utils.clone(processReferenceData.current.processData);
                this.canvasDefinition = Utils.clone(processReferenceData.current.processData.canvasDefinition);
                this.drawShapes();
            })
        }
    }

    private onSelectingShape(shape: DrawingShape) {
        if (shape) {
            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            if (shape.type == DrawingShapeTypes.ProcessStep) {
                let currentProcessStep = OPMUtils.getProcessStepInProcess(currentReferenceData.process.rootProcessStep, (shape as DrawingProcessStepShape).processStepId);
                if (currentProcessStep && currentProcessStep.desiredProcessStep) {
                    OPMRouter.navigate(currentReferenceData.process, currentProcessStep.desiredProcessStep).then(() => {

                    });
                }
                this.drawingCanvas.setSelectedShapeItemId(OPMRouter.routeContext.route.processStepId, DrawingShapeTypes.ProcessStep);
            } else if (shape.type == DrawingShapeTypes.CustomLink && this.currentDrawingProcessData.links) {
                let link = this.currentDrawingProcessData.links.find(l => l.id == (shape as DrawingCustomLinkShape).linkId);
                if (link) {
                    window.open(link.url, link.openNewWindow ? '_blank' : '');
                    this.drawingCanvas.setSelectedShapeItemId(shape.id, DrawingShapeTypes.CustomLink);
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
        return (
            <aside>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        Utils.isNullOrEmpty(this.canvasDefinition) ?
                            <wcm-empty-block-view dark={false} icon={"fa fa-image"} text={this.corLoc.Blocks.Drawing.Title}></wcm-empty-block-view>
                            :
                            <div class={this.drawingClasses.blockPadding(this.blockData.settings.spacing)}>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div key={this.componentUniqueKey}>{this.renderDrawing(h)}</div>
                            </div>
                }
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DrawingBlockComponent);
});

