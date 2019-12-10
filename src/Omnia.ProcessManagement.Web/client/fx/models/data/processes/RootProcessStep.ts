import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessStep } from './ProcessStep';

export interface RootProcessStep extends ProcessStep {
    enterpriseProperties: { [internalName: string]: any };
    processTypeId: GuidValue;
    processTemplateId: GuidValue;
}