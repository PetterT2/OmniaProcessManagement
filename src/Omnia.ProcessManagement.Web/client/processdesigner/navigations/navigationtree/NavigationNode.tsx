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

    /**
     * Evenhandler for header click events on the current node
     * @param e
     * @param navigateToNode
     */
    onHeaderClick(e: Event, navigateToNode: boolean, handleExpandNode: boolean) {
        e.stopPropagation();
        if (handleExpandNode) {
            this.isExpanded = !this.isExpanded;
            this.expandState[this.processStep.id.toString().toLowerCase()] = this.isExpanded;
        }

        if (navigateToNode) {
            OPMRouter.navigate(this.currentProcessStore.getters.referenceData().process, this.processStep).then(() => {
                this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
            });
        }
    }

    /**
     * Renders the child nodes
     * @param h
     */
    renderChildren(h): Array<JSX.Element> {
        let result: Array<JSX.Element> = [];
        this.processStep.processSteps.forEach(childProcessStep => {
            result.push(
                <NavigationNodeComponent
                    expandState={this.expandState}
                    level={this.level + 1}
                    processStep={childProcessStep}>
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
                    <div class={this.navigationNodeStyles.title(isSelectedNode)}>{this.multilingualStore.getters.stringValue(this.processStep.title)}</div>
                    <div class={[this.navigationNodeStyles.actionBar]} v-show={isSelectedNode}>
                        {
                            //<ActionsMenuComponent
                            //    v-show={!hideCreatePage || !hideCreateLink || !hideSetPermission || !hideEditNavigation}
                            //    handleSetPermissions={hideSetPermission ? null : this.onSetPermissions}
                            //    handleAddPageNode={hideCreatePage ? null : this.onAddPage}
                            //    handleAddLinkNode={hideCreateLink ? null : this.onAddLinkNode}
                            //    handleEditNavigation={hideEditNavigation ? null : this.onEditNavigation}
                            //    handleMoveNode={hideMoveNode ? null : this.onMoveNode}>
                            //</ActionsMenuComponent>
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
