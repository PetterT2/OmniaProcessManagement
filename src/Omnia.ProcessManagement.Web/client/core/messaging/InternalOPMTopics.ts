import { IMessageBusTopicPublishSubscriber, Topic } from '@omnia/fx-models';
import { CanvasDefinition } from '../../fx/models';
import { MessageBusTopicMediator } from '@omnia/fx';

const namespace = "omnia.processmanagement.core.messaging.internal";
export class InternalOPMTopics {
    //This topic used for re-draw the canvas
    public static get onEditingCanvasDefinitionChange(): IMessageBusTopicPublishSubscriber<CanvasDefinition> {
        const EditingCanvasDefinitionTopic: Topic<CanvasDefinition> = {
            namespace: namespace,
            name: 'canvasdefinition'
        };

        return new MessageBusTopicMediator(EditingCanvasDefinitionTopic, {
            caching: {
                size: Number.MAX_SAFE_INTEGER
            }
        })
    }
}