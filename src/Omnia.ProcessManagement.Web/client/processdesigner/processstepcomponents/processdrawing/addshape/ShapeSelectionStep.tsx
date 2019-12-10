import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessTemplateStore, DrawingCanvas } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { ShapeDefinition, DrawingShapeDefinition, DrawingShapeTypes, ShapeDefinitionTypes } from '../../../../fx/models';
import { ShapeDefinitionSelection } from '../../../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { ShapeSelectionStepStyles } from '../../../../fx/models/styles';
import './ShapeSelectionStep.css';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeSelectionStepComponent extends VueComponentBase<ShapeSelectionStepProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private availableShapeDefinitions: Array<ShapeDefinitionSelection> = null;
    private recentShapeDefinitions: Array<ShapeDefinitionSelection> = [];
    private drawingCanvas: { [id: string]: DrawingCanvas } = {};
    private shapeFilterKeyword: string = '';
    private toggleVisibleItemFlag: boolean = false;
    private filterShapeTimeout = null;//use this to avoid forceUpdate
    private selectedShapeDefinition: ShapeDefinition = null;
    shapeSelectionStepStyles = StyleFlow.use(ShapeSelectionStepStyles);

    created() {
        this.init();
    }

    init() {
        let processTemplateId = this.processDesignerStore.rootProcessReferenceData.process.rootProcessStep.processTemplateId;
        this.processTemplateStore.actions.ensureLoadProcessTemplate.dispatch(processTemplateId).then((loadedProcessTemplate) => {
            this.availableShapeDefinitions = loadedProcessTemplate.settings.shapeDefinitions;
            if (this.availableShapeDefinitions) {
                this.availableShapeDefinitions.forEach((item) => {
                    //item.id = Guid.newGuid();
                    item.visible = true;
                    item.multilingualTitle = this.multilingualStore.getters.stringValue(item.title);
                });
                let recentShapeDefinitions = this.processDesignerStore.recentShapeSelections.state;
                if (recentShapeDefinitions) {
                    recentShapeDefinitions.forEach((item) => {
                        var sourceShapeDefinition = this.availableShapeDefinitions.find((sourceShapeDefinition) => {
                            return sourceShapeDefinition.id == item.id;
                        });
                        if (sourceShapeDefinition) {
                            this.recentShapeDefinitions.push(sourceShapeDefinition);
                        }
                    });
                }
                //test
                this.recentShapeDefinitions = this.availableShapeDefinitions.map((item) => { return Utils.clone(item); });
                console.log(this.availableShapeDefinitions);
                this.startToDrawShape();
            }
        });
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            for (var key in this.drawingCanvas) {
                if (this.drawingCanvas[key])
                    this.drawingCanvas[key].destroy();
            }
        }
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private goToNext() {
        this.addShapeWizardStore.mutations.setSelectedShape.commit(this.selectedShapeDefinition);
        this.addShapeWizardStore.actions.goToNextStep.dispatch();
    }
    
    private onFilterShapeDefinition() {
        if (this.filterShapeTimeout)
            clearTimeout(this.filterShapeTimeout);

        this.filterShapeTimeout = setTimeout(() => {
            var kw = this.shapeFilterKeyword ? this.shapeFilterKeyword.toLowerCase() : '';

            this.availableShapeDefinitions.forEach((item) => {
                if (kw.length == 0) {
                    item.visible = true;
                }
                else {
                    if (item.multilingualTitle.toLowerCase().indexOf(kw) >= 0) {
                        item.visible = true;
                    }
                    else {
                        item.visible = false;
                    }
                }
            });
            this.toggleVisibleItemFlag = !this.toggleVisibleItemFlag;
        }, 200);
    }
    private selectShape(shapeDefinition: ShapeDefinitionSelection) {
        this.availableShapeDefinitions.forEach((item) => {
            item.isSelected = false;
        });
        shapeDefinition.isSelected = true;
        this.selectedShapeDefinition = shapeDefinition;
    }

    private renderRecentShapeSelections(h) {
        if (!this.recentShapeDefinitions || this.recentShapeDefinitions.length == 0)
            return null;

        return <v-container>
            <div>{this.pdLoc.RecentShapes}</div>
            <div class={this.shapeSelectionStepStyles.shapesWrapper}>
                {this.recentShapeDefinitions.map((df) => {
                    return <div id={'recent_canvaswrapper_' + df.id.toString()} class={[df.isSelected ? 'selected' : '']} onClick={() => { this.selectShape(df) }}> <canvas id={"recent_" + df.id.toString()}></canvas></div>
                })}
            </div>
        </v-container>;
    }

   private renderShapeSelections(h) {
        if (!this.availableShapeDefinitions)
            return null;

       return <v-container>
           <div>{this.pdLoc.AllShapes}</div>
           <v-text-field filled type="text" label={this.pdLoc.Search} v-model={this.shapeFilterKeyword} onKeyup={this.onFilterShapeDefinition}></v-text-field>
           {this.renderShapeCanvasElements(h)}
       </v-container>;
    }

    private renderShapeCanvasElements(h) {
        return <div class={this.shapeSelectionStepStyles.shapesWrapper}>
            {
                [this.availableShapeDefinitions.map((df) => {
                    return <div id = { 'canvaswrapper_' + df.id.toString() } class= { [df.isSelected ? 'selected' : '']} style = {{ display: df.visible ? 'block' : 'none' }} onClick={() => { this.selectShape(df) }}> <canvas id={df.id.toString()}></canvas></div>
                }),
                    <div style={{display: 'none'}}>{this.toggleVisibleItemFlag}</div>
                ]
            }
        </div>;
    }

    private startToDrawShape() {
        if (this.availableShapeDefinitions) {
            setTimeout(() => {
                this.availableShapeDefinitions.forEach((df) => {
                    if (!this.drawingCanvas[df.id.toString()]) {
                        this.drawingCanvas[df.id.toString()] = new DrawingCanvas(df.id.toString(), {},
                            {
                                drawingShapes: [],
                                width: 200,
                                height: 200
                            });
                        this.drawingCanvas[df.id.toString()].addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (df as DrawingShapeDefinition), null, false, 0, 0);
                    }
                });
                this.recentShapeDefinitions.forEach((df) => {
                    var canvasId = "recent_" + df.id.toString();
                    if (!this.drawingCanvas[canvasId]) {
                        this.drawingCanvas[canvasId] = new DrawingCanvas(canvasId, {},
                            {
                                drawingShapes: [],
                                width: 200,
                                height: 200
                            });
                        this.drawingCanvas[canvasId].addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (df as DrawingShapeDefinition), null, false, 0, 0);
                    }
                });
            }, 200);
        }
    }

    private renderActionButtons(h) {
        return <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color={this.omniaTheming.themes.primary.base}
                dark={true}
                onClick={this.goToNext}>{this.omniaLoc.Common.Buttons.Next}</v-btn>
            <v-btn 
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
                {this.renderRecentShapeSelections(h)}
                {this.renderShapeSelections(h)}
            </v-card-content>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSelectionStepComponent);
});
