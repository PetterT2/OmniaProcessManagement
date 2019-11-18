import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { InternalProcessItem } from './InternalProcessItem';

export interface RootProcessItem extends InternalProcessItem {
    enterpriseProperties: { [internalName: string]: any };
}