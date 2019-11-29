import { Inject, Localize, Utils, SubscriptionHandler, OmniaContext } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming } from '@omnia/fx/ux';
import { NodeState, ProcessReferenceData } from '../../fx/models';
import { style } from 'typestyle';
import { CurrentProcessStore } from '../../fx';
import { ProcessStepNavigationNode } from '../../fx/models/navigation/ProcessStepNavigationNode';
import { ProcessTreeNavigationComponent } from './navigationpanel/ProcessTreeNavigation';
import { ContentNavigationStyles } from './ContentNavigation.css';
import { navajowhite } from 'csx';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerItemFactory } from '../designeritems';
import { DisplayModes } from '../../models/processdesigner';
import { SharePointContext } from '@omnia/fx-sp';


export interface ContentNavigationProps {
}

export interface ContentNavigationEvents {
    onClose: void;
}

@Component
export class ContentNavigationComponent extends tsx.Component<ContentNavigationProps, ContentNavigationEvents>
{
    @Prop() journey: () => JourneyInstance;

    //@Localize(EditorLocalization.namespace) loc: EditorLocalization.locInterface;

    @Inject(SubscriptionHandler) subscriptionHandler: SubscriptionHandler;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(SharePointContext) spContext: SharePointContext;

    private  teamSiteName: string = "";
    private ensuringNavigationData: boolean = false;//true;
    private currentProcessReference: ProcessReferenceData = null;
    private rootNavigationNode: ProcessStepNavigationNode = null;

    created() {
        if (this.spContext) {
            this.teamSiteName = this.spContext.pageContext.web.title;
        }
        //this.subscriptionHandler.add(this.navigationStore.mutations.addOrUpdateNodes.onCommited((nodes) => {
        //    this.navigationNodes = this.currentNavigationStore.getters.getChildren(null);
        //}));
        this.initRootProcessStepNavigationNode();
    }

    mounted() {
        //Do not freeze the UI render when open editor. wait for 100ms before rendering the nodes in store
        setTimeout(() => {
            this.loadNodes();
        }, 100);
    }

    loadNodes() {
        //this.ensuringNavigationData = true;
        //this.currentNavigationStore.mutations.resetExpandedState.commit();
        //this.navigationStore.actions.ensureChildren.dispatch(null, 0).then(() => {
        //    this.ensuringNavigationData = false;
        //})
    }

    beforeDestroy() {
        this.subscriptionHandler.unsubscribe();
    }


    ///**
    // * Eventhandler for selecting app editor
    // * @param pageType selected
    // */
    //private onAppSettingsSelected() {
    //    this.editorStore.mutations.setActiveItemInEditor.commit(new AppEditorItem());
    //}

    //private onPageReportsSelected() {
    //    this.editorStore.mutations.setActiveItemInEditor.commit(new PageReportsEditorItem());
    //}

    @Emit('close')
    private onClose() {
    }

    private initRootProcessStepNavigationNode() {
        this.currentProcessReference = Utils.clone(this.currentProcessStore.getters.referenceData());
        if (this.currentProcessReference) {
            this.rootNavigationNode = this.currentProcessReference.currentProcessStep;
            this.rootNavigationNode.nodeState = {
                isExpanded: false
            };
        }
    }

    private renderContent(h) {
        return (
            <div class={style({ backgroundColor: this.omniaTheming.chrome.background.base })}>
                <v-list-item dark={this.omniaTheming.chrome.dark}>
                    <v-list-item-title class="mr-4">
                        <h5 class="headline">{this.teamSiteName}</h5>
                    </v-list-item-title>
                    <div class={ContentNavigationStyles.actionHeader.icon}>
                        <v-btn small icon onClick={this.onClose}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </div>
                </v-list-item>
                <div class={ContentNavigationStyles.scrollContainer}>
                    <ProcessTreeNavigationComponent rootNavigationNode={this.rootNavigationNode}></ProcessTreeNavigationComponent>
                </div>
            </div>)
    }


    /**
     * Render 
     * @param h
     */
    public render(h) {
        return (
            <v-skeleton-loader
                loading={this.ensuringNavigationData}
                height="100%"
                type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"
            >
                <div>
                    {this.renderContent(h)}
                </div>
            </v-skeleton-loader>                        
        )
    }
}