import { IMessageBusTopicPublishSubscriber, Topic } from '@omnia/fx-models';
import { MessageBusTopicMediator } from '@omnia/fx';
import { CanvasDefinition, ProcessWorkingStatus, ProcessVersionType } from '../models';

const namespace = "omnia.opm.fx.messaging";

//The internal topics should not be export to npm
export class InternalOPMTopics {
    public static get onProcessWorkingStatusChanged(): IMessageBusTopicPublishSubscriber<ProcessVersionType.Draft | ProcessVersionType.LatestPublished> {
        const messageTopic: Topic<ProcessVersionType.Draft | ProcessVersionType.LatestPublished> = {
            namespace: namespace,
            name: 'processWorkingStatusChanged'
        };

        return new MessageBusTopicMediator(messageTopic);
    }

    public static get onProcessChanged(): IMessageBusTopicPublishSubscriber<ProcessVersionType.Draft | ProcessVersionType.LatestPublished> {
        const messageTopic: Topic<ProcessVersionType.Draft | ProcessVersionType.LatestPublished> = {
            namespace: namespace,
            name: 'processChanged'
        };

        return new MessageBusTopicMediator(messageTopic);
    }



    //This topic used for re-draw the canvas
    public static get onEditingCanvasDefinitionChanged(): IMessageBusTopicPublishSubscriber<CanvasDefinition> {
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