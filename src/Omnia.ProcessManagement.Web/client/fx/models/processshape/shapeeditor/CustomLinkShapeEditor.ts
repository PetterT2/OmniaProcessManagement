import { MultilingualString } from '@omnia/fx-models';
import { IShapeEditor } from './IShapeEditor';
import { IShapeSettings } from '../IShapeSettings';

export interface CustomLinkShapeEditor extends IShapeEditor, IShapeSettings { 
    linkTitle: MultilingualString;
    link: string;
}