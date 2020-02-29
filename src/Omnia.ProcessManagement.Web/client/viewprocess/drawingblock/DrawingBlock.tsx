import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './DrawingBlock.css';
import { DrawingBlockStyles } from '../../models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase, OmniaTheming, isEmpty } from '@omnia/fx/ux';
import { DrawingBlockData, CanvasDefinition, DrawingShape, DrawingShapeTypes, ProcessStepDrawingShape, CustomLinkDrawingShape, ProcessData, ProcessStep, ExternalProcessStepDrawingShape, ExternalProcessStep, ProcessStepType } from '../../fx/models';
import { CurrentProcessStore, DrawingCanvas, OPMRouter, OPMUtils, ProcessStore, Shape, ShapeExtension } from '../../fx';
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
    setSelectedShapeItemIdTimeOut: NodeJS.Timeout = null;
    currentDrawingCanvasProcessId: GuidValue;

    numberOfSlides: number = 0;
    buttonTop: number = 0;
    containerWidth: number = 0;
    isShowSlideRightBtn: boolean = false;
    isShowSlideLeftBtn: boolean = false;
    currentSlide: number = 1;

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.init();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    get referenceData() {
        return this.currentProcessStore.getters.referenceData();
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
        var selectedShape: ProcessStepDrawingShape = null;
        var currentDrawingCanvasProcessId: GuidValue = null;
        let isEmptyShapes = this.canvasDefinition == null || !this.canvasDefinition.drawingShapes || this.canvasDefinition.drawingShapes.length == 0;
        if (isEmptyShapes && this.referenceData.current.parentProcessData && this.referenceData.current.parentProcessData.canvasDefinition) {
            this.canvasDefinition = JSON.parse(JSON.stringify(this.referenceData.current.parentProcessData.canvasDefinition));
            selectedShape = this.canvasDefinition.drawingShapes && this.canvasDefinition.drawingShapes.length > 0 ?
                this.canvasDefinition.drawingShapes.find(s => (s.type == DrawingShapeTypes.ProcessStep &&
                    (s as ProcessStepDrawingShape).processStepId &&
                    (s as ProcessStepDrawingShape).processStepId.toString() == this.referenceData.current.processStep.id)
                    || (s.type == DrawingShapeTypes.ExternalProcessStep &&
                        (s as ExternalProcessStepDrawingShape).processStepId &&
                        (s as ExternalProcessStepDrawingShape).processStepId.toString() == this.referenceData.current.processStep.id)) as ProcessStepDrawingShape : null;
            currentDrawingCanvasProcessId = this.referenceData.current.parentProcessStep.id;
        }
        else {
            currentDrawingCanvasProcessId = this.referenceData.current.processStep.id;
            if (!this.canvasDefinition) return;
        }
        if (selectedShape && currentDrawingCanvasProcessId == this.currentDrawingCanvasProcessId) {
            needToDestroyCanvas = false;
        }
        else {
            needToDestroyCanvas = true;
            this.destroyCanvas();
        }
        this.currentDrawingCanvasProcessId = currentDrawingCanvasProcessId;
        this.canvasDefinition.gridX = 0;
        this.canvasDefinition.gridY = 0;
        this.buttonTop = this.canvasDefinition.height / 2 - 26;

        OPMUtils.waitForElementAvailable(this.$el, this.canvasId, () => {
            if (needToDestroyCanvas) {
                this.drawingCanvas = new DrawingCanvas(this.canvasId, {}, this.canvasDefinition, true);
                this.drawingCanvas.renderReady().then(() => {
                    this.centralizeCanvas(selectedShape);
                });
                this.drawingCanvas.setSelectShapeEventWithCallback(this.onSelectShape);
            }
            else
                this.centralizeCanvas(selectedShape);
            if (selectedShape) {
                this.setSelectedShapeItemIdTimeOut = setTimeout(() => {
                    this.drawingCanvas.setSelectedShapeItemId(selectedShape.processStepId);
                }, 200)
            }
        })

    }

    private initCanvas() {
        clearTimeout(this.setSelectedShapeItemIdTimeOut);
        if (!this.referenceData) {
            this.destroyCanvas();
            return;
        }

        this.canvasDefinition = Utils.clone(this.referenceData.current.processData.canvasDefinition);
        this.drawShapes();
    }

    private destroyCanvas() {
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();
    }

    private getProcessGraphWidth() {
        let maxWidth = 0;
        if (Utils.isNullOrEmpty(this.canvasDefinition.backgroundImageUrl)) {
            this.drawingCanvas.drawingShapes.forEach((s) => {
                (s.shape as ShapeExtension).shapeObject.forEach((s) => {
                    let bound = s.getBoundingRect();
                    maxWidth = Math.max(bound.width + bound.left, maxWidth);
                })
            })
        }
        else
            maxWidth = this.canvasDefinition.width;
        return maxWidth;
    }

    private centralizeCanvas(selectedShape?: DrawingShape) {
        var opmDiagramEl: any = this.$refs.opmprocessgraph;
        this.containerWidth = opmDiagramEl.clientWidth;
        let processGraphWidth = this.getProcessGraphWidth();
        this.numberOfSlides = Math.ceil(processGraphWidth / this.containerWidth);
        if (selectedShape != null && this.numberOfSlides > 1 && selectedShape.shape.left > (this.containerWidth / 2)) {
            var selectedPage = Math.ceil(selectedShape.shape.left / this.containerWidth);
            this.currentSlide = selectedShape.shape.left > ((selectedPage - 1) * this.containerWidth + this.containerWidth / 2) ? selectedPage + 1 : selectedPage;
            var marginLeft = (selectedShape.shape.left - Math.floor(this.containerWidth / 2) + Math.floor(selectedShape.shape.nodes[0].properties.width / 2));
            this.drawingCanvas.setCanvasMarginLeft(-marginLeft);
            this.isShowSlideLeftBtn = true;
            this.isShowSlideRightBtn = this.numberOfSlides > this.currentSlide;
        } else {
            this.setDefaultViewer();
        }
    }

    private setDefaultViewer() {
        this.currentSlide = 1;
        this.drawingCanvas.setCanvasMarginLeft();
        this.isShowSlideLeftBtn = false;
        this.isShowSlideRightBtn = this.numberOfSlides > this.currentSlide;
    }

    private onSelectShape(shape: DrawingShape) {
        if (shape) {
            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            if (shape.type == DrawingShapeTypes.ProcessStep || shape.type == DrawingShapeTypes.ExternalProcessStep) {
                let processStepId = shape.type == DrawingShapeTypes.ProcessStep ? (shape as ProcessStepDrawingShape).processStepId :
                    (shape as ExternalProcessStepDrawingShape).processStepId
                let currentProcessStep = OPMUtils.getProcessStepInProcess(currentReferenceData.process.rootProcessStep, processStepId);
                if (currentProcessStep && currentProcessStep.desiredProcessStep) {
                    OPMRouter.navigate(currentReferenceData.process, currentProcessStep.desiredProcessStep).then(() => {

                    });
                }
                this.drawingCanvas.setSelectedShapeItemId(OPMRouter.routeContext.route.processStepId);
            } else if (shape.type == DrawingShapeTypes.CustomLink) {
                let links = (this.referenceData.current.processData.links || []).concat(this.referenceData.current.parentProcessData && this.referenceData.current.parentProcessData.links || []);
                let link = links.find(l => l.id == (shape as CustomLinkDrawingShape).linkId);
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

    private getShowSlideButton(slide: number) {
        this.currentSlide = slide >= 1 && slide <= this.numberOfSlides ? slide : this.currentSlide;
        this.isShowSlideLeftBtn = slide > 1;
        this.isShowSlideRightBtn = slide < this.numberOfSlides;
    }

    private slideLeft() {
        let newSlide = this.currentSlide - 1;
        if (newSlide == 1) {
            this.drawingCanvas.setCanvasMarginLeft();
        }
        else {
            this.drawingCanvas.setCanvasMarginLeft(-((newSlide - 1) * this.containerWidth));
        }
        this.getShowSlideButton(newSlide);
    }

    private slideRight() {
        let newSlide = this.currentSlide + 1;
        if (newSlide <= this.numberOfSlides) {
            let marginLeft = (this.currentSlide) * this.containerWidth;
            if (newSlide == this.numberOfSlides)
                marginLeft = this.getProcessGraphWidth() - this.containerWidth;
            this.drawingCanvas.setCanvasMarginLeft(-marginLeft);
        }
        this.getShowSlideButton(this.currentSlide + 1);
    }

    renderDrawing(h) {
        return (
            [<div class={this.drawingClasses.slideButtonWrapper}>
                <v-btn style={{
                    zIndex: 2,
                    top: this.buttonTop + 'px',
                    left: (this.containerWidth - 20) + 'px'
                }} fab small v-show={this.isShowSlideRightBtn} class={[this.drawingClasses.slideButton, this.drawingClasses.slideRightButton]} onClick={this.slideRight}>
                    <v-icon dark>fa-chevron-right</v-icon>
                </v-btn>
                <v-btn style={{
                    zIndex: 2,
                    top: this.buttonTop + 'px',
                    left: '-20px'
                }} fab small v-show={this.isShowSlideLeftBtn} class={[this.drawingClasses.slideButton, this.drawingClasses.slideLeftButton]} onClick={this.slideLeft}>
                    <v-icon dark>fa-chevron-left</v-icon>
                </v-btn>
            </div>,
            <div class={[this.drawingClasses.canvasWrapper(this.omniaTheming)]} ref="opmprocessgraph">
                <canvas id={this.canvasId} class={this.drawingClasses.slide}></canvas>
            </div>]
        )
    }

    render(h) {
        return (
            <div>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        !this.canvasDefinition ?
                            <aside>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <wcm-empty-block-view dark={false} icon={"fa fa-image"} text={this.corLoc.BlockDefinitions.Drawing.Title}></wcm-empty-block-view>
                            </aside> :
                            <aside>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div class={this.drawingClasses.blockPadding(this.blockData.settings.spacing)}>
                                    <div key={this.componentUniqueKey}>{this.renderDrawing(h)}</div>
                                </div>
                            </aside>
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DrawingBlockComponent);
});

