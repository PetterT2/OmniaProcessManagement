import { Inject, Localize, Utils, SubscriptionHandler, OmniaContext } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming } from '@omnia/fx/ux';
import { style } from 'typestyle';
import { CurrentProcessStore } from '../../fx';
import { ContentNavigationStyles } from './ContentNavigation.css';
import { SharePointContext } from '@omnia/fx-sp';
import { NavigationNodeComponent } from './navigationtree/NavigationNode';


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
    private expandState: { [id: string]: boolean } = {};
    private readyToRender = false;

    created() {
        if (this.spContext.pageContext) {
            this.teamSiteName = this.spContext.pageContext.web.title;
        }
    }

    mounted() {
        //Do not freeze the UI render when open editor. wait for 100ms before rendering the nodes in store
        setTimeout(() => {
            this.readyToRender = true;
        }, 100);
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
                <div class={ContentNavigationStyles.scrollContainer}>
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