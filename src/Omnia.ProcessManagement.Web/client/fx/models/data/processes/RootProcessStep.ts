import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { InternalProcessStep } from './InternalProcessStep';

export interface RootProcessStep extends InternalProcessStep {
    enterpriseProperties: { [internalName: string]: any };
    processTemplateId: GuidValue;
    comment: string;
}