import { ProcessRollupViewRegistration } from '../models';
import { IMessageBusTopicPublishSubscriber, Topic } from '@omnia/fx-models';
import { MessageBusTopicMediator } from '@omnia/fx';

export class OPMPublicTopics {
    public static get registerProcessRollupView(): IMessageBusTopicPublishSubscriber<ProcessRollupViewRegistration> {
        const topic: Topic<ProcessRollupViewRegistration> = {
            namespace: "ProcessRollup",
            name: 'RegistrationView'
        };

        return new MessageBusTopicMediator<ProcessRollupViewRegistration>(topic, {
            caching: {
                size: Number.MAX_SAFE_INTEGER
            }
        });
    }
}