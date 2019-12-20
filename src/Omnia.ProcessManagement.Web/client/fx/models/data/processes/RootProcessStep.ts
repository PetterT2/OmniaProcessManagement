import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessStep } from './ProcessStep';
import { Enums } from '../../Enums';

export interface RootProcessStep extends ProcessStep {
    enterpriseProperties: { [internalName: string]: any };
    processTemplateId: GuidValue;
}