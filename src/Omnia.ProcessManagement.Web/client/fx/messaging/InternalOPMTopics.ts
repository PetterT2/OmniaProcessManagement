import { IMessageBusTopicPublishSubscriber, Topic } from '@omnia/fx-models';
import { MessageBusTopicMediator } from '@omnia/fx';
import { CanvasDefinition, ProcessWorkingStatus, ProcessVersionType } from '../models';

const namespace = "omnia.opm.fx.messaging";

//The internal topics should not be export to npm
export class InternalOPMTopics {
    public static get onPermissionChanged(): IMessageBusTopicPublishSubscriber<void> {
        const messageTopic: Topic<void> = {
            namespace: namespace,
            name: 'permissionChanged'
        };

        return new MessageBusTopicMediator(messageTopic);
    }

    public static get onProcessWorkingStatusChanged(): IMessageBusTopicPublishSubscriber<ProcessVersionType.Draft | ProcessVersionType.Published> {
        const messageTopic: Topic<ProcessVersionType.Draft | ProcessVersionType.Published> = {
            namespace: namespace,
            name: 'processWorkingStatusChanged'
        };

        return new MessageBusTopicMediator(messageTopic);
    }

    public static get onProcessChanged(): IMessageBusTopicPublishSubscriber<ProcessVersionType.Draft | ProcessVersionType.Published> {
        const messageTopic: Topic<ProcessVersionType.Draft | ProcessVersionType.Published> = {
            namespace: namespace,
            name: 'processChanged'
        };

        return new MessageBusTopicMediator(messageTopic);
    }

}