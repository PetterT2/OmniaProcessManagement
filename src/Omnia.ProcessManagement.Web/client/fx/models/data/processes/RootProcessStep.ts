import { GuidValue, LanguageTag } from '@omnia/fx-models';
import { ProcessStep } from './ProcessStep';
import { Enums } from '../../Enums';

export interface RootProcessStep extends ProcessStep {
    enterpriseProperties: { [internalName: string]: any };
    processTypeId: GuidValue;
    processTemplateId: GuidValue;
    edition: number;
    revision: number;
    processWorkingStatus: Enums.WorkflowEnums.ProcessWorkingStatus;
}