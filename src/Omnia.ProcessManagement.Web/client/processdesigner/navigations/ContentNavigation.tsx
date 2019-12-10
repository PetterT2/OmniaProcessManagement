import { Inject, Localize, SubscriptionHandler, OmniaContext, Utils } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming } from '@omnia/fx/ux';
import { style } from 'typestyle';
import { CurrentProcessStore, OPMUtils } from '../../fx';
import { ContentNavigationStyles } from './ContentNavigation.css';
import { SharePointContext } from '@omnia/fx-sp';
import { NavigationNodeComponent } from './navigationtree/NavigationNode';
import { RootProcessStep, ProcessStep } from '../../fx/models';


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

    private teamSiteName: string = "";
    private expandState: { [id: string]: true } = {};
    private readyToRender = false;
    private renderKey = Utils.generateGuid();

    created() {
        if (this.spContext.pageContext) {
            this.teamSiteName = this.spContext.pageContext.web.title;
        }
        this.subscribeEvents();
    }

    mounted() {
        //Do not freeze the UI render when open editor. wait for 100ms before rendering the nodes in store
        setTimeout(() => {
            this.readyToRender = true;
        }, 100);
    }

    subscribeEvents() {
        this.subscriptionHandler.add(
            this.currentProcessStore.actions.addProcessStep.onDispatched((result) => {
                this.refreshExpandState(result.process.rootProcessStep, result.processStep);
            })
        )
        this.subscriptionHandler.add(
            this.currentProcessStore.actions.moveProcessStep.onDispatched((result) => {
                this.refreshExpandState(result.process.rootProcessStep, result.processStep);
            })
        )
    }

    refreshExpandState(rootProcessStep: RootProcessStep, processStep: ProcessStep) {
        let newExpandState = OPMUtils.generateProcessStepExpandState(rootProcessStep, processStep.id);
        this.expandState = Object.assign({}, this.expandState, newExpandState);
        this.renderKey = Utils.generateGuid();
    }

    @Emit('close')
    private onClose() {
    }

    private renderContent(h) {
        let rootNavigationNode = this.currentProcessStore.getters.referenceData().process.rootProcessStep;
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
                <div class={ContentNavigationStyles.scrollContainer} key={this.renderKey}>
                    <NavigationNodeComponent firstNode={true} lastNode={true} expandState={this.expandState} level={0} processStep={rootNavigationNode}></NavigationNodeComponent>
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
                loading={!this.readyToRender}
                height="100%"
                type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"
            >
                <div>
                    {this.readyToRender && this.renderContent(h)}
                </div>
            </v-skeleton-loader>
        )
    }
}