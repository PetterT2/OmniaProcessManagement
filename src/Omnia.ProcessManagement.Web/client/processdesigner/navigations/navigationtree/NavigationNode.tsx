import { Inject, OmniaContext, Localize, SubscriptionHandler } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit, Watch } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { Utils } from "@omnia/fx";
import './NavigationNode.css';
import { StyleFlow, VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import {  NodeState, ProcessStepNavigationNode } from '../../../fx/models';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { MultilingualStore } from '@omnia/fx/store';
import { NavigationNodeStyles } from '../../../fx/models/navigation/NavigationNodeStyles';
import './NavigationNode.css';

export interface NavigationNodeComponentProps {
    level: number;
    navigationNode: ProcessStepNavigationNode;
}

export interface NavigationNodeComponentEvents {
    onResized: number;
}


@Component
export class NavigationNodeComponent extends tsx.Component<NavigationNodeComponentProps, NavigationNodeComponentEvents>
{
    @Prop() private level: number;
    @Prop() private navigationNode: ProcessStepNavigationNode;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;


    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private navigationNodeStyles = StyleFlow.use(NavigationNodeStyles);

    private isExpanded: boolean = false;

    public created() {
        if (this.navigationNode) {
            this.isExpanded = this.navigationNode.nodeState.isExpanded;
        }
    }

    public mounted() {
    }

   
    public beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        //window.removeEventListener('keydown', this.onDialogEscape);
        //window.removeEventListener('keydown', this.onCloseMoveNode);
    }

    /**
     * Evenhandler for header click events on the current node
     * @param e
     * @param navigateToNode
     */
    public onHeaderClick(e: Event, navigateToNode: boolean, handleExpandNode: boolean) {
        e.stopPropagation();
        this.navigationNode.nodeState.isExpanded = !this.navigationNode.nodeState.isExpanded;
        this.isExpanded = this.navigationNode.nodeState.isExpanded;
    }
   

    //todo
    //private onAddPage() {
    //    let context: PageContextInfo = {
    //        parentNavigationNode: this.navigationNode,
    //        publishingAppId: this.wcmContext.publishingAppId.toString()
    //    }
    //    PublishingAppTopics.showCreateLayoutItemPanelTopic.publish({
    //        creationType: CreateDialogType.createPage,
    //        context: context
    //    });
    //}

   
    private onSaveNavigation() {
    }
    
    onDialogEscape(e) {
        if (e.keyCode === 27) {
            //window.removeEventListener('keydown', this.onCloseEditNavigationDialog);
            //this.onCloseEditNavigationDialog();
        }
        
    }

    /**
     * Renders the child nodes
     * @param h
     */
    private renderChildren(h): Array<JSX.Element> {
        let result: Array<JSX.Element> = [];
        this.navigationNode.processSteps.forEach(childProcessStep => {
            let childNavigationNode: ProcessStepNavigationNode = childProcessStep;
            childNavigationNode.nodeState = {
                isExpanded: false
            }
            result.push(
                <NavigationNodeComponent
                    level={this.level + 1}
                    navigationNode={childNavigationNode}
                >
                </NavigationNodeComponent>
            )
        });
        return result;
    }

    private transformVSlot(slot) {
        let vSlot = [];
        Object.keys(slot).forEach(name => {
            let proxy = false;
            let slotName = name;
            if (slotName.indexOf("proxy-") === 0) {
                proxy = true;
                slotName = slotName.replace("proxy-", "");
            }
            vSlot.push(proxy ? {
                'key': slotName,
                'fn': slot[name],
                'proxy': true
            } : {
                    'key': slotName,
                    'fn': slot[name]
                })
        })
        return {
            scopedSlots: (this as any)._u(vSlot)
        };
    }

    /**
     * Render 
     * @param h
     */
    public render(h) {
        let collapsedStyle = "";
        let expandedIconStyle = "";
        if (!this.navigationNode) {
            return <div />
        }
        if (this.isExpanded) {
            expandedIconStyle = this.navigationNodeStyles.leftIconExpanded;
        }
        else {
            collapsedStyle = this.navigationNodeStyles.contentHide;
        }

        //let selectedNode = this.currentNavigationStore.getters.selectedNode();

        //let isSelectedNode = (this.navigationNode && selectedNode && selectedNode.id === this.navigationNode.id);
        //if (this.editorStore.item.state as LinkEditorItem && (this.editorStore.item.state as LinkEditorItem).linkItem) {
        //    isSelectedNode = (this.editorStore.item.state as LinkEditorItem).navigationNode.id === this.navigationNode.id;
        //}

        let hasChildren: boolean = this.navigationNode.processSteps && this.navigationNode.processSteps.length > 0;
        let isSelectedNode: boolean = false; //todo

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
                    <div class={this.navigationNodeStyles.title(isSelectedNode)}>{this.multilingualStore.getters.stringValue(this.navigationNode.title)}</div>
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
                <div class={[this.navigationNodeStyles.content, collapsedStyle]}>
                    {
                        this.isExpanded && this.renderChildren(h)
                    }
                </div>
                {
                    //this.renderEditNavigationDialog(h)
                }
            </div>
        )
    }
}
