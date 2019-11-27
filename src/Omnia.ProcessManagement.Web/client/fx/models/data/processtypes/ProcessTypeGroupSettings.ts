import { ProcessTypeSettings, ProcessTypeSettingsTypes } from '.';
import { GuidValue } from '@omnia/fx-models';

export interface ProcessTypeGroupSettings extends ProcessTypeSettings {
    type: ProcessTypeSettingsTypes.Group,
    childrenOrders: Array<GuidValue>
}