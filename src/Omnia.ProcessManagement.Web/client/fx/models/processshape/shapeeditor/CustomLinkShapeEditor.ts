import { MultilingualString } from '@omnia/fx-models';
import { IShapeEditor } from './IShapeEditor';

export interface CustomLinkShapeEditor extends IShapeEditor {
    linkTitle: MultilingualString;
    link: string;
}