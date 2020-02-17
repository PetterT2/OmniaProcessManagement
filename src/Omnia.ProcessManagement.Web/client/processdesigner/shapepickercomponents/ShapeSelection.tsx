import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessTemplateStore, DrawingCanvas, ShapeTemplatesConstants, CurrentProcessStore, OPMUtils, ShapeTemplateStore } from '../../fx';
import { ShapeDefinition, DrawingShapeDefinition, DrawingShapeTypes, ShapeDefinitionTypes, TextPosition, ShapeSelectionStyles, DrawingFreeformShapeDefinition, ShapeTemplateType } from '../../fx/models';
import { ShapeDefinitionSelection } from '../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import './ShapeSelection.css';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerLocalization } from '../loc/localize';

export interface ShapeSelectionProps {
    shapeSelectedCallback: (selectedShape: ShapeDefinition) => void;
}

@Component
export class ShapeSelectionComponent extends VueComponentBase<ShapeSelectionProps> implements IWebComponentInstance{
    @Prop() shapeSelectedCallback: (selectedShape: ShapeDefinition) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(ShapeTemplateStore) shapeTemplateStore: ShapeTemplateStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private availableShapeDefinitions: Array<ShapeDefinitionSelection> = null;
    private recentShapeDefinitions: Array<ShapeDefinitionSelection> = [];
    private shapeDefinitionGroups: Array<{ heading: ShapeDefinition, items: Array<ShapeDefinition> }> = [];
    private recentDrawingCanvas: { [id: string]: DrawingCanvas } = {};
    private drawingCanvas: { [id: string]: DrawingCanvas } = {};
    private shapeFilterKeyword: string = '';
    private selectedShapeDefinition: ShapeDefinition = null;
    private selectedElementId: string = '';
    private shapeSelectionStepStyles = StyleFlow.use(ShapeSelectionStyles);    
    private expandedPanels: Array<number> = [];
    private isLoading: boolean = true;

    created() {
        
    }

    init() {
        let processTemplateId = this.currentProcessStore.getters.referenceData().process.rootProcessStep.processTemplateId;
        Promise.all([
            this.processTemplateStore.actions.ensureLoadProcessTemplate.dispatch(processTemplateId),
            this.shapeTemplateStore.actions.ensureLoadShapeTemplates.dispatch()]
        ).then((result) => {
            this.isLoading = false;
            this.availableShapeDefinitions = result[0].settings.shapeDefinitions;
            if (this.availableShapeDefinitions) {
                this.availableShapeDefinitions.forEach((item) => {
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
                this.shapeDefinitionGroups = this.groupDefinitionsByHeading();
                this.startToDrawShape();
            }
        })
    }

    mounted() {
        this.init();
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
    
    private onFilterShapeDefinition() {
        var filterSearchKeywordTimeout = 300;
        Utils.timewatch('ShapeSelection_FilterShapeDefinition', () => {
            var kw = this.shapeFilterKeyword ? this.shapeFilterKeyword.toLowerCase() : '';

            this.availableShapeDefinitions.forEach((item) => {
                if (item.type == ShapeDefinitionTypes.Heading)
                    return;

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

            this.destroyDrawedShape();
            this.shapeDefinitionGroups = this.groupDefinitionsByHeading();

            if (this.shapeDefinitionGroups && this.shapeDefinitionGroups.length > 0) {
                this.$nextTick(() => {
                    this.drawAvailableShapes();
                });
            }

        }, filterSearchKeywordTimeout);
    }
    private selectShape(shapeDefinition: ShapeDefinitionSelection, idPrefix: string) {
        this.selectedShapeDefinition = shapeDefinition;
        this.selectedElementId = idPrefix + shapeDefinition.id;

        if (this.shapeSelectedCallback) {
            this.shapeSelectedCallback(this.selectedShapeDefinition);
        }
    }

    private renderRecentShapeSelections(h) {
        if (!this.recentShapeDefinitions || this.recentShapeDefinitions.length == 0)
            return null;

        return <v-container class="pa-0">
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

       return <v-container class="pa-0">
           <div>{this.pdLoc.AllShapes}</div>
           <v-text-field filled type="text" label={this.pdLoc.Search} v-model={this.shapeFilterKeyword} onKeyup={this.onFilterShapeDefinition}></v-text-field>
           {this.renderAllShapes(h)}
       </v-container>;
    }

    private renderAllShapes(h) {
        if (this.shapeDefinitionGroups.length == 0) {
            if (this.shapeFilterKeyword && this.shapeFilterKeyword.length > 0)
                return <div>{this.pdLoc.FilterShapeDefinitionNoResult}</div>;

            return <div></div>;
        }

        let freeSectionElement: JSX.Element = null;
        if (this.shapeDefinitionGroups[0].heading == null) {
            freeSectionElement = <div class={this.shapeSelectionStepStyles.shapesWrapper}>
                {
                    this.shapeDefinitionGroups[0].items.map((item) => {
                        return this.renderShapeDefinitionIcon(h, item, false)
                    })
                }
            </div>;
        }
        let headingGroups = this.shapeDefinitionGroups.filter((item) => { return item.heading != null; });

        let groupSectionElement: JSX.Element = null;
        if (headingGroups && headingGroups.length > 0) {
            groupSectionElement = <v-expansion-panels v-model={this.expandedPanels} multiple>
                {
                    headingGroups.map((item, idx) => {
                        return this.renderHeadingGroup(h, item, idx)
                    })
                }
            </v-expansion-panels>;
        }

        return <div>
            {
                [freeSectionElement,
                groupSectionElement]
            }
        </div>;
    }

    private startToDrawShape() {
        if (this.availableShapeDefinitions) {
            setTimeout(() => {
                this.drawAvailableShapes();
               
                this.recentShapeDefinitions.forEach((df) => {
                    this.drawShapeAsIcon(df, true);
                });
            }, 200);
        }
    }

    private drawAvailableShapes() {
        this.shapeDefinitionGroups.forEach((item) => {
            item.items.forEach((df) => {
                this.drawShapeAsIcon(df, false);
            });
        });
    }

    private destroyDrawedShape() {
        for (var key in this.drawingCanvas) {
            this.drawingCanvas[key].destroy();
        }
        this.drawingCanvas = {};
    }

    private drawShapeAsIcon(shapeDefinition: ShapeDefinition, isRecent: boolean) {
        if (shapeDefinition.type == ShapeDefinitionTypes.Heading)
            return;
        let drawingShapeDefinition = shapeDefinition as DrawingShapeDefinition;
        let foundShapeTemplate = this.shapeTemplateStore.getters.shapeTemplates().find(t => t.id.toString() == drawingShapeDefinition.shapeTemplateId.toString());
        if (foundShapeTemplate.builtIn && (drawingShapeDefinition.shapeTemplateType == ShapeTemplatesConstants.Freeform.settings.type ||
            drawingShapeDefinition.shapeTemplateType == ShapeTemplatesConstants.Media.settings.type)) {            
            return;
        }

        let idPrefix = isRecent ? 'recent_' : '';
        let canvasId = idPrefix + shapeDefinition.id.toString();
        let srcDrawingCanvasListing = !isRecent ? this.drawingCanvas : this.recentDrawingCanvas;

        if (!srcDrawingCanvasListing[canvasId]) {
            let canvasSize = 100;
            let iconSize = drawingShapeDefinition.textPosition == TextPosition.On ? canvasSize : 80;

            let shapeIconWidth = this.getNumber(drawingShapeDefinition.width);
            let shapeIconHeight = this.getNumber(drawingShapeDefinition.height);

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
            let fontSize = 10;
            srcDrawingCanvasListing[canvasId] = new DrawingCanvas(canvasId, {},
                {
                    drawingShapes: [],
                    width: canvasSize,
                    height: canvasSize
                });

            let definitionToDraw: DrawingShapeDefinition = Utils.clone(drawingShapeDefinition);
            definitionToDraw.width = shapeIconWidth;
            definitionToDraw.height = shapeIconHeight;
            definitionToDraw.fontSize = fontSize;

            if (foundShapeTemplate.settings.type == ShapeTemplateType.FreeformShape && (definitionToDraw as DrawingFreeformShapeDefinition).nodes &&
                (definitionToDraw as DrawingFreeformShapeDefinition).nodes.length > 0 &&
                ((definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['width'] > canvasSize ||
                    (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['height'] > canvasSize)) {
                let sideToScale = (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['width'] >= (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['height'] ?
                    (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['width'] : (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['height'];
                let scaleDownRate = canvasSize / sideToScale;
                (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['scaleX'] = scaleDownRate;
                (definitionToDraw as DrawingFreeformShapeDefinition).nodes[0].properties['scaleY'] = scaleDownRate;
            }

            srcDrawingCanvasListing[canvasId].addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, definitionToDraw, shapeDefinition.title, 0, 0, null, null,
                (definitionToDraw as DrawingFreeformShapeDefinition).nodes ? (definitionToDraw as DrawingFreeformShapeDefinition).nodes : null);
        }
    }

    private getNumber(value: any) {
        if (typeof (value) == 'string')
            return parseInt(value);
        return value;
    }

    private groupDefinitionsByHeading() {
        let definitionGroups: Array<{ heading: ShapeDefinition, items: Array<ShapeDefinition> }> = [];
        let currentGroupItems = null;

        this.availableShapeDefinitions.forEach((item) => {
            if (item.type == ShapeDefinitionTypes.Heading) {
                currentGroupItems = [];
                definitionGroups.push({
                    heading: item,
                    items: currentGroupItems
                });
            }
            else if (item.visible) {
                if (!currentGroupItems) {
                    currentGroupItems = [];
                    definitionGroups.push({
                        heading: null,
                        items: currentGroupItems
                    });
                }
                currentGroupItems.push(item);
            }
        });
        definitionGroups = definitionGroups.filter((grp) => {
            return grp.items.length > 0
        });

        this.expandedPanels = [];
        let headingGroups = definitionGroups.filter((grp) => {
            return grp.heading != null
        });
        if (headingGroups && headingGroups.length > 0) {
            this.expandedPanels = headingGroups.map((item, idx) => { return idx; });
        }
        return definitionGroups;
    }

    private renderHeadingGroup(h, groupItem: { heading: ShapeDefinition, items: Array<ShapeDefinition> }, idx: number) {
        return <v-expansion-panel key={idx}>
            <v-expansion-panel-header>{groupItem.heading ? groupItem.heading.multilingualTitle : ''}</v-expansion-panel-header>
            <v-expansion-panel-content>
                <div class={this.shapeSelectionStepStyles.shapesWrapper}>
                    {
                        groupItem.items.map((shapeDefinition) => {
                            return this.renderShapeDefinitionIcon(h, shapeDefinition, false)
                        })
                    }
                </div>
            </v-expansion-panel-content>
        </v-expansion-panel>;
    }

    private renderShapeDefinitionIcon(h, shapeDefinition: ShapeDefinitionSelection, isRecent: boolean = false) {
        let foundShapeTemplate = this.shapeTemplateStore.getters.shapeTemplates().find(t => t.id.toString() == (shapeDefinition as DrawingShapeDefinition).shapeTemplateId.toString());
        let shapeDefinitionElement: JSX.Element = null;
        let idPrefix = isRecent ? 'recent_' : '';
        let shapeId = idPrefix + shapeDefinition.id.toString();
        let isIcon: boolean = false;

        if (shapeDefinition.type == ShapeDefinitionTypes.Heading) {
            shapeDefinitionElement = <div>{this.multilingualStore.getters.stringValue(shapeDefinition.title)}</div>;
        }
        else {

            let drawingShapeDefinition = shapeDefinition as DrawingShapeDefinition;
            if (drawingShapeDefinition.shapeTemplateType == ShapeTemplatesConstants.Freeform.settings.type && foundShapeTemplate && foundShapeTemplate.builtIn) {
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
                if (drawingShapeDefinition.shapeTemplateType == ShapeTemplatesConstants.Media.settings.type && foundShapeTemplate && foundShapeTemplate.builtIn) {
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
        let retElement: JSX.Element = foundShapeTemplate ? <div id={'shape_' + shapeId}
            class={[this.shapeSelectionStepStyles.shapeDefinitionItem(100), isIcon ? '' : this.shapeSelectionStepStyles.canvasWrapper(this.omniaTheming), (this.selectedElementId == shapeId) ? 'selected' : '']}
            style={{ display: shapeDefinition.visible ? 'block' : 'none' }}
            onClick={() => { this.selectShape(shapeDefinition, idPrefix) }}>
            {shapeDefinitionElement}
        </div> : null;
        return retElement;

    }

    private renderContent(h) {
        return <div>
            {
                (!this.recentShapeDefinitions || this.recentShapeDefinitions.length == 0) && !this.availableShapeDefinitions &&
                <v-container><span>{this.pdLoc.ProcessTemplateDoesNotHaveShapeDefinitions}</span></v-container>
            }
            {this.renderRecentShapeSelections(h)}
            {this.renderShapeSelections(h)}
        </div>;
    }

    render(h) {
        return <v-skeleton-loader
            loading={this.isLoading}
            height="100%"
            type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"
        >
            <div>
                {!this.isLoading && this.renderContent(h)}
            </div>
        </v-skeleton-loader>; 
    }
}
