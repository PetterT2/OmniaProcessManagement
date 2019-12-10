import { Inject, OmniaContext, Localize, SubscriptionHandler } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit, Watch } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { Utils } from "@omnia/fx";
import './NavigationNode.css';
import { StyleFlow, VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import { ProcessStep } from '../../../fx/models';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { MultilingualStore } from '@omnia/fx/store';
import { NavigationNodeStyles } from '../../../fx/models/styles';
import './NavigationNode.css';
import { OPMRouter } from '../../../fx/routing';
import { CurrentProcessStore } from '../../../fx';
import { ProcessDesignerStore } from '../../stores';
import { ProcessDesignerItemFactory } from '../../designeritems';
import { DisplayModes } from '../../../models/processdesigner';

export interface NavigationNodeComponentProps {
    level: number;
    processStep: ProcessStep;
    firstNode: boolean;
    lastNode: boolean;
    expandState: { [id: string]: boolean }
}

export interface NavigationNodeComponentEvents {
    onResized: number;
}


@Component
export class NavigationNodeComponent extends tsx.Component<NavigationNodeComponentProps, NavigationNodeComponentEvents>
{
    @Prop() private level: number;
    @Prop() private processStep: ProcessStep;
    @Prop() private expandState: { [id: string]: boolean };
    @Prop() private firstNode: boolean;
    @Prop() private lastNode: boolean;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    private navigationNodeStyles = StyleFlow.use(NavigationNodeStyles);

    private isExpanded: boolean = false;

    created() {
        this.isExpanded = this.expandState[this.processStep.id.toString().toLowerCase()] || false;
    }

    onMoveNavigation(e: Event, moveUp: boolean) {
        e.stopPropagation();
        let parentProcessStep = this.currentProcessStore.getters.referenceData().parentProcessStep
        let currentProcessStep = this.currentProcessStore.getters.referenceData().currentProcessStep
        let currentProcessStepIndex = parentProcessStep.processSteps.indexOf(currentProcessStep);

        if (moveUp && !this.firstNode) {
            let temp = parentProcessStep.processSteps[currentProcessStepIndex - 1];
            parentProcessStep.processSteps[currentProcessStepIndex - 1] = currentProcessStep;
            parentProcessStep.processSteps[currentProcessStepIndex] = temp;
        }
        else if (!moveUp && !this.lastNode) {
            let temp = parentProcessStep.processSteps[currentProcessStepIndex + 1];
            parentProcessStep.processSteps[currentProcessStepIndex + 1] = currentProcessStep;
            parentProcessStep.processSteps[currentProcessStepIndex] = temp;
        }

        this.currentProcessStore.actions.saveState.dispatch(true);
    }


    onHeaderClick(e: Event, navigateToNode: boolean, handleExpandNode: boolean) {
        e.stopPropagation();
        if (handleExpandNode) {
            this.isExpanded = !this.isExpanded;
            this.expandState[this.processStep.id.toString().toLowerCase()] = this.isExpanded;
        }

        if (navigateToNode) {
            if (this.currentProcessStore.getters.referenceData().process.isCheckedOutByCurrentUser) {
                //Ensure savestate before navigating to another process step
                this.currentProcessStore.actions.saveState.dispatch().then(() => {
                    OPMRouter.navigate(this.currentProcessStore.getters.referenceData().process, this.processStep).then(() => {
                        this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
                    });
                })
            }
            else {
                OPMRouter.navigate(this.currentProcessStore.getters.referenceData().process, this.processStep).then(() => {
                    this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
                });
            }
        }
    }


    renderChildren(h): Array<JSX.Element> {
        let result: Array<JSX.Element> = [];
        this.processStep.processSteps.forEach((childProcessStep, index) => {
            let firstNode = index == 0;
            let lastNode = index == this.processStep.processSteps.length - 1;
            result.push(
                <NavigationNodeComponent
                    expandState={this.expandState}
                    level={this.level + 1}
                    processStep={childProcessStep}
                    firstNode={firstNode}
                    lastNode={lastNode}
                >
                </NavigationNodeComponent>
            )
        });
        return result;
    }

    /**
     * Render 
     * @param h
     */
    render(h) {
        let collapsedStyle = "";
        let expandedIconStyle = "";

        if (this.isExpanded) {
            expandedIconStyle = this.navigationNodeStyles.leftIconExpanded;
        }
        else {
            collapsedStyle = this.navigationNodeStyles.contentHide;
        }

        let currentProcessStep = this.currentProcessStore.getters.referenceData().currentProcessStep;

        let isSelectedNode = (currentProcessStep == this.processStep);
        let hasChildren: boolean = this.processStep.processSteps && this.processStep.processSteps.length > 0;

        return (
            <div class={this.navigationNodeStyles.wrapper}>
                <div
                    class={[this.navigationNodeStyles.headerWrapper(this.level, isSelectedNode, this.omniaTheming)]}
                    onClick={(e) => this.onHeaderClick(e, true, false)}>
                    <div class={this.navigationNodeStyles.leftIcon}>
                        <v-btn
                            icon
                            dark={isSelectedNode || this.omniaTheming.chrome.dark}
                            small
                            class={["ml-0", "mr-0", expandedIconStyle]}
                            v-show={hasChildren}
                            onClick={(e) => this.onHeaderClick(e, false, true)}>
                            <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                    </div>
                    <div class={this.navigationNodeStyles.title(isSelectedNode)}>{this.processStep.multilingualTitle}</div>
                    <div class={[this.navigationNodeStyles.actionBar]} v-show={isSelectedNode}>
                        {
                            !this.firstNode || !this.lastNode ? [
                                <v-btn
                                    icon
                                    dark
                                    small
                                    class={["ml-0", "mr-0"]}
                                    onClick={(e: Event) => { this.onMoveNavigation(e, true) }}
                                    disabled={this.firstNode}>
                                    <v-icon>arrow_drop_up</v-icon>
                                </v-btn>,
                                <v-btn
                                    icon
                                    dark
                                    small
                                    onClick={(e: Event) => { this.onMoveNavigation(e, false) }}
                                    disabled={this.lastNode}
                                    class={["ml-0", "mr-0"]}>
                                    <v-icon>arrow_drop_down</v-icon>
                                </v-btn>
                            ] : null
                        }

                    </div>
                </div>
                {
                    hasChildren &&
                    <div class={[this.navigationNodeStyles.content, collapsedStyle]}>
                        {
                            this.isExpanded && this.renderChildren(h)
                        }
                    </div>
                }
            </div>
        )
    }
}
