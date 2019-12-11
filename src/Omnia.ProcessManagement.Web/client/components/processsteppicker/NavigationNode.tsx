import { Inject, OmniaContext, Localize, SubscriptionHandler } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit, Watch } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { ProcessStep, NavigationNodeStyles, ProcessStepPickerStyles, IdDict } from '../../fx/models';
import { GuidValue } from '@omnia/fx-models';

export interface NavigationNodeComponentProps {
    level: number;
    processStep: ProcessStep;
    expandState: { [id: string]: boolean }
    selectingProcessStep: ProcessStep;
    hiddenProcessStepIdsDict: IdDict<boolean>;
    disabledProcessStepIdsDict: IdDict<boolean>;
    selectProcessStep: (processStep: ProcessStep) => void;
    pickerStyles: { [P in keyof typeof ProcessStepPickerStyles]?: any; }
}

@Component
export class NavigationNodeComponent extends tsx.Component<NavigationNodeComponentProps>
{
    @Prop() private level: number;
    @Prop() private processStep: ProcessStep;
    @Prop() private expandState: { [id: string]: boolean };
    @Prop() private selectingProcessStep: ProcessStep;
    @Prop() private hiddenProcessStepIdsDict: IdDict<boolean>;
    @Prop() private disabledProcessStepIdsDict: IdDict<boolean>;

    @Prop() private selectProcessStep: (processStep: ProcessStep) => void;
    @Prop() private pickerStyles: { [P in keyof typeof ProcessStepPickerStyles]?: any; }

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    private isExpanded: boolean = false;

    created() {
        this.isExpanded = this.expandState[this.processStep.id.toString().toLowerCase()] || false;
    }

    onHeaderClick(e: Event, navigateToNode: boolean, handleExpandNode: boolean) {
        e.stopPropagation();
        if (handleExpandNode) {
            this.isExpanded = !this.isExpanded;
            this.expandState[this.processStep.id.toString().toLowerCase()] = this.isExpanded;
        }

        if (navigateToNode) {
            this.selectProcessStep(this.processStep);
        }
    }


    renderChildren(h): Array<JSX.Element> {
        let result: Array<JSX.Element> = [];
        this.processStep.processSteps.forEach((childProcessStep) => {
            result.push(
                <NavigationNodeComponent
                    expandState={this.expandState}
                    level={this.level + 1}
                    processStep={childProcessStep}
                    selectProcessStep={this.selectProcessStep}
                    pickerStyles={this.pickerStyles}
                    hiddenProcessStepIdsDict={this.hiddenProcessStepIdsDict}
                    disabledProcessStepIdsDict={this.disabledProcessStepIdsDict}
                    selectingProcessStep={this.selectingProcessStep}
                >
                </NavigationNodeComponent>
            )
        });
        return result;
    }


    render(h) {
        let collapsedStyle = "";
        let expandedIconStyle = "";

        if (this.isExpanded) {
            expandedIconStyle = this.pickerStyles.leftIconExpanded;
        }
        else {
            collapsedStyle = this.pickerStyles.contentHide;
        }

        let isSelectedNode = this.selectingProcessStep == this.processStep;
        let hasChildren: boolean = this.processStep.processSteps && this.processStep.processSteps.filter(child => !this.hiddenProcessStepIdsDict[child.id.toString().toLowerCase()]).length > 0;
        let id = this.processStep.id.toString().toLowerCase();
        let isHidden = this.hiddenProcessStepIdsDict[id];
        let disabled = this.disabledProcessStepIdsDict[id];

        if (isHidden)
            return null;

        return (
            <div class={this.pickerStyles.wrapper}>
                <div
                    class={[this.pickerStyles.headerWrapper(this.level, isSelectedNode, this.omniaTheming, disabled)]}
                    onClick={(e) => !disabled && this.onHeaderClick(e, true, false)}>
                    <div class={this.pickerStyles.leftIcon}>
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
                    <div class={this.pickerStyles.title(isSelectedNode)}>{this.processStep.multilingualTitle}</div>
                </div>
                {
                    hasChildren &&
                    <div class={[this.pickerStyles.content, collapsedStyle]}>
                        {
                            this.isExpanded && this.renderChildren(h)
                        }
                    </div>
                }
            </div>
        )
    }
}
