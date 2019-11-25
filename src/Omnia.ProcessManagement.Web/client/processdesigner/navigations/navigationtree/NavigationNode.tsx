import { Inject, OmniaContext, Localize, SubscriptionHandler } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit, Watch } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { Utils } from "@omnia/fx";
import './NavigationNode.css';
import { StyleFlow, VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import { NavigationNode, NavigationData, NavigationNodeType, NodeState } from '../../../fx/models';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';

export interface NavigationNodeComponentProps {
    level: number;
    navigationNode: NavigationNode<NavigationData>;
}

export interface NavigationNodeComponentEvents {
    onResized: number;
}


@Component
export class NavigationNodeComponent extends tsx.Component<NavigationNodeComponentProps, NavigationNodeComponentEvents>
{
    @Prop() private level: number;
    @Prop() private navigationNode: NavigationNode<NavigationData>;
    @Prop() private currentRootProcess?: NavigationNode<NavigationData>;//todo

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;


    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    //private navigationNodeStyles = StyleFlow.use(NavigationNodeStyles);
    private navigationNodeStyles: any = {};

    private internalNavigationNode: {
        children: Array<NavigationNode<NavigationData>>,
        showEditNavigation: boolean,
        nodeState: NodeState
    } = {
            children: [],
            showEditNavigation: false,
            nodeState: null
        }

    private currentPageId: number = null;
    private contentElementId: string = Utils.generateGuid();

    private contentElement: HTMLElement = null;

    public created() {
        //let node = this.navigationNode as PageCollectionNavigationNode<PageNavigationData>;
        //if (node && node.navigationNodeType != NavigationNodeType.Generic)
        //    this.currentPageId = node.page.id;

        //this.model.children = this.currentNavigationStore.getters.getChildren(this.navigationNode);
        //this.model.nodeState = this.currentNavigationStore.getters.getNodeState(this.navigationNode);
        //if (this.navigationNode.navigationNodeType == NavigationNodeType.PageCollection ||
        //    this.currentNavigationStore.getters.isSelected(this.navigationNode)) {
        //    this.checkPermissions();
        //}

        //if (this.currentNavigationStore.getters.isActive(this.navigationNode) && this.currentNavigationStore.getters.selectedNode()) {
        //    if (this.navigationNode.id != this.currentNavigationStore.getters.selectedNode().id) {
        //        this.currentNavigationStore.actions.expand.dispatch(this.navigationNode);
        //    }
        //}

        //this.subscriptionHandler = this.navigationStore.mutations.addOrUpdateNodes.onCommited((nodes) => {
        //    this.model.children = this.currentNavigationStore.getters.getChildren(this.navigationNode);
        //    this.model.nodeState = this.currentNavigationStore.getters.getNodeState(this.navigationNode);
        //});
    }

    public mounted() {
    }

   
    public beforeDestroy() {
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
        //if (handleExpandNode) {
        //    if (this.model.nodeState.isExpanded) {
        //        this.currentNavigationStore.mutations.expanded.commit(this.navigationNode, false);
        //    }
        //    else {
        //        this.currentNavigationStore.actions.expand.dispatch(this.navigationNode).then(() => {
        //            this.model.children = this.currentNavigationStore.getters.getChildren(this.navigationNode);
        //        });
        //    }
        //}
        //if (navigateToNode) {
        //    this.checkPermissions();
        //    if (this.navigationNode.navigationData.type === WCMNavigationDataTypes.link) {
        //        this.editorStore.mutations.setActiveItemInEditor.commit(new LinkEditorItem(this.navigationNode));
        //    }
        //    else {
        //        this.wcmRouter.navigate(this.navigationNode).then(() => {
        //            //reset variation picker
        //            this.variationSelectorStore.mutations.setSelectedVariation.commit(null);
        //            let currentVariation = this.variationStore.getters.getCurrentVariation();
        //            if (currentVariation) {
        //                //if dont have page variation
        //                let currentNavigationId = this.currentVariationIdOfMapPageNode();
        //                if (currentNavigationId !== this.wcmContext.variationId) {
        //                    this.editorStore.actions.showEditor.dispatch(true).then(() => {
        //                        this.editorStore.mutations.setActiveItemInEditor.commit(new VariationCreationEditorItem(currentVariation));
        //                    });
        //                }
        //                // else show page editor
        //                else {
        //                    this.editorStore.actions.editCurrentPage.dispatch(new EditorItemFactory());
        //                }
        //            }
        //            else
        //                this.editorStore.actions.editCurrentPage.dispatch(new EditorItemFactory());
        //        });
        //    }
        //}
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
        this.internalNavigationNode.children.forEach(node => {
            result.push(
                <NavigationNodeComponent
                    level={this.level + 1}
                    navigationNode={node}
                >
                </NavigationNodeComponent>
            )
        });
        return result;
    }

    //public renderEditNavigationDialog(h) {
    //    if (!this.model.showEditNavigation) {
    //        return null
    //    }

    //    let disableSaveButton = this.shouldSaveButtonBeDisabled();

    //    return (
    //        <v-dialog
    //            v-model={this.model.showEditNavigation}
    //            max-width="800px"
    //            scrollable
    //            persistent
    //            onKeydown={this.onDialogEscape}
    //            dark={this.omniaTheming.promoted.body.dark}>
    //            <v-card class={this.omniaTheming.promoted.body.class}>
    //                <v-card-title
    //                    class={[this.navigationNodeStyles.dialogHeaderWrap(this.omniaTheming.promoted.header.background, this.omniaTheming.promoted.header.text), this.omniaTheming.promoted.header.class]}
    //                    dark={this.omniaTheming.promoted.header.dark}>
    //                    <div class={["headline mb-0 ml-1"]}>{this.editorLoc.Editor.Dialogs.EditNavigation.Title}</div>
    //                </v-card-title>
    //                {
    //                    this.renderEditNavigationDialogBody(h)
    //                }
    //                <v-card-actions class="mb-3 mr-3 ml-3">
    //                    <v-spacer></v-spacer>
    //                    <v-btn
    //                        light={!this.omniaTheming.promoted.body.dark}
    //                        dark={!disableSaveButton}
    //                        disabled={disableSaveButton}
    //                        color={this.omniaTheming.promoted.body.primary.base}
    //                        onClick={() => { this.onSaveNavigation() }}>{this.editorLoc.Editor.Dialogs.EditNavigation.Save}
    //                    </v-btn>
    //                    <v-btn
    //                        light={!this.omniaTheming.promoted.body.dark}
    //                        text
    //                        onClick={() => this.onCloseEditNavigationDialog()}>{this.editorLoc.Editor.Dialogs.EditNavigation.Cancel}
    //                    </v-btn>
    //                </v-card-actions>
    //            </v-card>
    //        </v-dialog>
    //    );
    //}

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
        //if (this.model.nodeState.isExpanded) {
        //    expandedIconStyle = this.navigationNodeStyles.leftIconExpanded;
        //}
        //else {
        //    collapsedStyle = this.navigationNodeStyles.contentHide;
        //}

        //let selectedNode = this.currentNavigationStore.getters.selectedNode();

        //let isSelectedNode = (this.navigationNode && selectedNode && selectedNode.id === this.navigationNode.id);
        //if (this.editorStore.item.state as LinkEditorItem && (this.editorStore.item.state as LinkEditorItem).linkItem) {
        //    isSelectedNode = (this.editorStore.item.state as LinkEditorItem).navigationNode.id === this.navigationNode.id;
        //}

        let hasChildren: boolean = true; //todo
        let isRootProcessStep: boolean = true; //todo

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
                    <div class={this.navigationNodeStyles.leftIconWithoutButton}>
                        <v-tooltip top
                            {
                            ...this.transformVSlot({
                                activator: (ref) => {
                                    const toSpread = {
                                        on: ref.on
                                    }
                                    return [
                                        <v-icon {...toSpread} class={"ml-0 mr-0 mt-1"} dark={isSelectedNode || this.omniaTheming.promoted.body.dark}>{IconRules.getPageIcon(this.navigationNode).icon}</v-icon>
                                    ]
                                }
                            })}>
                            <span>{IconRules.getPageIcon(this.navigationNode).tooltip}</span>
                        </v-tooltip>
                    </div>
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
                <div id={this.contentElementId} class={[this.navigationNodeStyles.content, collapsedStyle]}>
                    {this.model.nodeState.isExpanded && this.renderChildren(h)}
                </div>
                {
                    //this.renderEditNavigationDialog(h)
                }
            </div>
        )
    }
}
