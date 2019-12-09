import { GuidValue, PropertyIndexedType, UserIdentity } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessPersonPropertyInfo extends ProcessPropertyInfo {
    type: PropertyIndexedType.Person;
    multiple: boolean;
    identities: Array<UserIdentity>;
}