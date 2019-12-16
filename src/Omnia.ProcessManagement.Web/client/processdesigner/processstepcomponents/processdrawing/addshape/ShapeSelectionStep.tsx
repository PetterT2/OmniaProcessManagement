import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, IconSize } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessTemplateStore, DrawingCanvas, ShapeTemplatesConstants, CurrentProcessStore } from '../../../../fx';
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
export class ShapeSelectionStepComponent extends VueComponentBase<ShapeSelectionStepProps> implements IWebComponentInstance{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
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
    private selectedElementId: string = '';
    shapeSelectionStepStyles = StyleFlow.use(ShapeSelectionStepStyles);

    created() {
        this.init();
    }

    init() {
        let processTemplateId = this.currentProcessStore.getters.referenceData().process.rootProcessStep.processTemplateId;
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
    private selectShape(shapeDefinition: ShapeDefinitionSelection, idPrefix: string) {
        this.selectedShapeDefinition = shapeDefinition;
        this.selectedElementId = idPrefix + shapeDefinition.id;
    }

    private renderRecentShapeSelections(h) {
        if (!this.recentShapeDefinitions || this.recentShapeDefinitions.length == 0)
            return null;

        return <v-container>
            <div>{this.pdLoc.RecentShapes}</div>
            <div class={this.shapeSelectionStepStyles.shapesWrapper}>
                {this.recentShapeDefinitions.map((df) => {
                    return this.renderShapeDefinitionIcon(h, df, true)
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
           {this.renderAllShapes(h)}
       </v-container>;
    }

    private renderAllShapes(h) {
        return <div class={this.shapeSelectionStepStyles.shapesWrapper}>
            {
                [this.availableShapeDefinitions.map((df) => {
                    return this.renderShapeDefinitionIcon(h, df, false)
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
                    this.drawShapeAsIcon(df, false);
                });
                this.recentShapeDefinitions.forEach((df) => {
                    this.drawShapeAsIcon(df, true);
                });
            }, 200);
        }
    }

    private drawShapeAsIcon(shapeDefinition: ShapeDefinition, isRecent: boolean) {
        if (shapeDefinition.type == ShapeDefinitionTypes.Heading)
            return;
        let drawingShapeDefinition = shapeDefinition as DrawingShapeDefinition;
        if (drawingShapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Freeform.id || drawingShapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Media.id) {            
            return;
        }
        let idPrefix = isRecent ? 'recent_' : '';
        let canvasId = idPrefix + shapeDefinition.id.toString();
        if (!this.drawingCanvas[canvasId]) {
            let iconSize = 100;
            let shapeIconWidth = drawingShapeDefinition.width;
            let shapeIconHeight = drawingShapeDefinition.height;
            if (shapeIconWidth > shapeIconHeight) {
                if (shapeIconWidth > iconSize) {
                    shapeIconHeight = (shapeIconHeight / shapeIconWidth) * iconSize;
                    shapeIconWidth = iconSize;
                }                
            }
            else {
                if (shapeIconHeight > iconSize) {
                    shapeIconWidth = (shapeIconWidth / shapeIconHeight) * iconSize;
                    shapeIconHeight = iconSize;
                }  
            }
            let canvasPadding = 0;
            let fontSize = 10;
            this.drawingCanvas[canvasId] = new DrawingCanvas(canvasId, {},
                {
                    drawingShapes: [],
                    width: iconSize + canvasPadding,
                    height: iconSize + canvasPadding
                });
            let definitionToDraw: DrawingShapeDefinition = Utils.clone(drawingShapeDefinition);
            definitionToDraw.width = shapeIconWidth;
            definitionToDraw.height = shapeIconHeight;
            definitionToDraw.fontSize = fontSize;

            this.drawingCanvas[canvasId].addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, definitionToDraw, shapeDefinition.title, false, 0, 0);
        }
    }

    private renderShapeDefinitionIcon(h, shapeDefinition: ShapeDefinitionSelection, isRecent: boolean = false) {
        let shapeDefinitionElement: JSX.Element = null;
        let idPrefix = isRecent ? 'recent_' : '';
        let shapeId = idPrefix + shapeDefinition.id.toString();
        let isIcon: boolean = false;

        if (shapeDefinition.type == ShapeDefinitionTypes.Heading) {
            shapeDefinitionElement = <div>{this.multilingualStore.getters.stringValue(shapeDefinition.title)}</div>;
        }
        else {

            let drawingShapeDefinition = shapeDefinition as DrawingShapeDefinition;
            if (drawingShapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Freeform.id) {
                isIcon = true;

                shapeDefinitionElement = <div class={this.shapeSelectionStepStyles.iconWrapper}>
                    <v-tooltip bottom {
                        ...this.transformVSlot({
                            activator: (ref) => {
                                const toSpread = {
                                    on: ref.on
                                }
                                return [
                                    <v-btn {...toSpread} class={["mx-2"]} fab large>
                                        <v-icon>fa fa-draw-polygon</v-icon>
                                    </v-btn>
                                ]
                            }
                        })}>
                        <span>{this.pdLoc.FreeForm}</span>
                    </v-tooltip>
                </div>;
            }
            else
                if (drawingShapeDefinition.shapeTemplate.id == ShapeTemplatesConstants.Media.id) {
                    isIcon = true;

                    shapeDefinitionElement = <div class={this.shapeSelectionStepStyles.iconWrapper}>
                        <v-tooltip bottom {
                            ...this.transformVSlot({
                                activator: (ref) => {
                                    const toSpread = {
                                        on: ref.on
                                    }
                                    return [
                                        <v-btn {...toSpread} class={["mx-2"]} fab large>
                                            <v-icon>fa fa-photo-video</v-icon>
                                        </v-btn>
                                    ]
                                }
                            })}>
                            <span>{this.pdLoc.Media}</span>
                        </v-tooltip>
                    </div>;
                }
                else {
                    shapeDefinitionElement = <canvas id={shapeId}></canvas>;                    
                }
        }
        let retElement: JSX.Element = <div id={'shape_' + shapeId}
            class={[this.shapeSelectionStepStyles.shapeDefinitionItem(100), isIcon ? '' : this.shapeSelectionStepStyles.canvasWrapper(this.omniaTheming), (this.selectedElementId == shapeId) ? 'selected' : '']}
            style={{ display: shapeDefinition.visible ? 'block' : 'none' }}
            onClick={() => { this.selectShape(shapeDefinition, idPrefix) }}>
            {shapeDefinitionElement}
        </div>;
        return retElement;

    }

    private renderActionButtons(h) {
        return <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                disabled={!this.selectedShapeDefinition}
                onClick={this.goToNext}>{this.omniaLoc.Common.Buttons.Next}</v-btn>
            <v-btn text
                onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
        </v-card-actions>;
    }

    render(h) {
        return <v-card flat>
            <v-card-content>
                {
                    (!this.recentShapeDefinitions || this.recentShapeDefinitions.length == 0) && !this.availableShapeDefinitions &&
                    <v-container><span>{this.pdLoc.ProcessTemplateDoesNotHaveShapeDefinitions}</span></v-container>
                }
                {this.renderRecentShapeSelections(h)}
                {this.renderShapeSelections(h)}
            </v-card-content>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSelectionStepComponent, { destroyTimeout: 1500 });
});
