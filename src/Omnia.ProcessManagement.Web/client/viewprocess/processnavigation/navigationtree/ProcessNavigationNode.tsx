import Vue from 'vue';
import * as tsx from 'vue-tsx-support';
import { Component, Prop } from 'vue-property-decorator';
import { Inject, OmniaContext } from "@omnia/fx";
import { IMessageBusSubscriptionHandler, SpacingSettings } from '@omnia/fx/models';
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessNavigationBlockStyles } from '../../../models';
import { classes } from 'typestyle';
import { CurrentProcessStore, OPMRouter } from '../../../fx';
import { ProcessStep, ProcessStepType, InternalProcessStep } from '../../../fx/models';


export interface ProcessNavigationNodeComponentProps {
    indentation: number;
    level: number;
    processStep: ProcessStep;
    SpacingSettings: SpacingSettings;
    expandState: { [id: string]: boolean };
}

@Component
export class ProcessNavigationNodeComponent extends tsx.Component<
ProcessNavigationNodeComponentProps>
{
    @Prop() private level: number;
    @Prop() private indentation: number;
    @Prop() private processStep: ProcessStep;
    @Prop() private expandState: { [id: string]: boolean };
    @Prop() private SpacingSettings: SpacingSettings;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private messageBusSubscriptionHandlerObj: { handler?: IMessageBusSubscriptionHandler } = {};
    styles = StyleFlow.use(ProcessNavigationBlockStyles);

    isExpanded: boolean = false;

    beforeDestroy() {
        if (this.messageBusSubscriptionHandlerObj.handler) {
            this.messageBusSubscriptionHandlerObj.handler.unsubscribe();
        }
        this.messageBusSubscriptionHandlerObj = null;
    }

    created() {
        this.ensureData();
    }

    ensureData() {
        this.isExpanded = this.expandState[this.processStep.id.toString().toLowerCase()] || false;
    }

    onHeaderClick(e: Event, navigateToNode: boolean, handleExpandNode: boolean) {
        e.stopPropagation();
        e.preventDefault();
        if (handleExpandNode) {
            this.isExpanded = !this.isExpanded;
            this.expandState[this.processStep.id.toString().toLowerCase()] = this.isExpanded ? true : false; //remove the component property references
        }
        if (navigateToNode) {
            this.isExpanded = true;
            this.expandState[this.processStep.id.toString().toLowerCase()] = true;

            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            OPMRouter.navigate(currentReferenceData.process, this.processStep).then(() => {
            });
        }
    }

    renderChildren(h): Array<JSX.Element> {
        let result: Array<JSX.Element> = [];
        (this.processStep as InternalProcessStep).processSteps.forEach((childProcessStep, index) => {
            result.push(
                <ProcessNavigationNodeComponent
                    indentation={this.indentation}
                    SpacingSettings={this.SpacingSettings}
                    level={this.level + 1}
                    processStep={childProcessStep}
                    expandState={this.expandState}
                >
                </ProcessNavigationNodeComponent>
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
        let arrowBtnExpanded = "";
        let currentProcessStep = this.currentProcessStore.getters.referenceData().current.processStep;

        let isSelectedNode = (currentProcessStep == this.processStep);
        if (!this.processStep) {
            return <div />
        }
        if (this.isExpanded) {
            arrowBtnExpanded = this.styles.arrowBtnExpanded;
        }
        else {
            collapsedStyle = this.styles.contentHide;
        }
        let hasChildren: boolean = this.processStep.type == ProcessStepType.Internal &&
            (this.processStep as InternalProcessStep).processSteps &&
            (this.processStep as InternalProcessStep).processSteps.length > 0;

        return (
            <div class={classes(this.styles.wrapper)}>
                <a tabindex={0}
                    class={[this.styles.headerWrapper(this.level, this.indentation, isSelectedNode, this.omniaContext.theming, this.SpacingSettings)]}
                    onClick={(e) => this.onHeaderClick(e, true, false)}
                >
                    <div class={[this.styles.title]}>
                        <div class={[this.styles.textOverflow]}>
                            {this.processStep.multilingualTitle}
                        </div>
                    </div>
                    <div class={this.styles.rightIcon}>
                        <v-btn
                            icon
                            dark={isSelectedNode}
                            small
                            class={["ml-0", "mr-0", this.styles.arrowBtnCollapsedDefault, arrowBtnExpanded]}
                            v-show={hasChildren}
                            onClick={(e) => this.onHeaderClick(e, false, true)}>
                            <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                    </div>
                </a>
                {
                    hasChildren &&
                    <div class={[this.styles.content, collapsedStyle]}>
                        {
                            this.isExpanded && this.renderChildren(h)
                        }
                    </div>
                }
            </div>
        )
    }
}
