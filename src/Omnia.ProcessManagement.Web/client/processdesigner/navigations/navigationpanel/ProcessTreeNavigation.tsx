import { Inject, Utils } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { IMessageBusSubscriptionHandler } from '@omnia/fx/models';
import { NavigationNodeComponent } from '../navigationtree/NavigationNode';
import { Prop } from 'vue-property-decorator';
import { ProcessStepNavigationNode } from '../../../fx/models';


export interface ProcessTreeNavigationProps {
    rootNavigationNode: ProcessStepNavigationNode;
}

@Component
export class ProcessTreeNavigationComponent extends tsx.Component<ProcessTreeNavigationProps>
{
    @Prop() rootNavigationNode: ProcessStepNavigationNode;

    private isLoading: boolean = false;
    messageBusSubscriptionHandler: IMessageBusSubscriptionHandler;

    beforeDestroy() {
        if (this.messageBusSubscriptionHandler) this.messageBusSubscriptionHandler.unsubscribe();
    }

    created() {
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
                    <NavigationNodeComponent level={0} navigationNode={this.rootNavigationNode}></NavigationNodeComponent>
                }

            </v-list>
        )
    }
}