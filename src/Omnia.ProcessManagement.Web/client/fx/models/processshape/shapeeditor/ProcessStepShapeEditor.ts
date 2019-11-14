import { MultilingualString } from '@omnia/fx-models';
import { IShapeEditor } from './IShapeEditor';
import { ShapeSettings } from '../ShapeSettings';

export interface ProcessStepShapeEditor extends IShapeEditor { 
    processStep: any;//TO DO: wait for Process
}