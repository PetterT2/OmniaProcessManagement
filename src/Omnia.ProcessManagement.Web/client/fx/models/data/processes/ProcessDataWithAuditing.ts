import { CanvasDefinition } from '../drawingdefinitions';
import { MultilingualString } from '@omnia/fx-models';
import { ProcessData } from '.';

export interface ProcessDataWithAuditing extends ProcessData {
    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
}