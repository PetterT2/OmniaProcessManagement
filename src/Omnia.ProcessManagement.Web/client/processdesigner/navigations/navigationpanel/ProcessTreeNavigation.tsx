import { Inject, Utils } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { IMessageBusSubscriptionHandler } from '@omnia/fx/models';
import { NavigationNodeComponent } from '../navigationtree/NavigationNode';
import { Prop } from 'vue-property-decorator';
import { ProcessNavigationNode, ProcessNavigationData } from '../../../fx/models';


export interface ProcessTreeNavigationProps {
    navigationNodes: Array<ProcessNavigationNode<ProcessNavigationData>>;
}

@Component
export class ProcessTreeNavigationComponent extends tsx.Component<ProcessTreeNavigationProps>
{
    @Prop() navigationNodes: Array<ProcessNavigationNode<ProcessNavigationData>>;

    private isLoading: boolean = false;
    messageBusSubscriptionHandler: IMessageBusSubscriptionHandler;

    beforeDestroy() {
        if (this.messageBusSubscriptionHandler) this.messageBusSubscriptionHandler.unsubscribe();
    }

    created() {
    }

    renderProcessTreeNodes(h) {
        let result: Array<JSX.Element> = [];
        this.navigationNodes.forEach((node) => {
            result.push(<NavigationNodeComponent level={0} navigationNode={node}></NavigationNodeComponent>);
        });
        return result;
    }
    /**
     * Render 
     * @param h
     */
    render(h) {

        return (
            <v-list class="py-0">
                {this.isLoading ?
                    <v-skeleton-loader
                        loading={this.isLoading}
                        height="100%"
                        type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"
                    >
                    </v-skeleton-loader>
                    :                    
                    this.renderProcessTreeNodes(h)
                }
                    
            </v-list>
        )
    }
}