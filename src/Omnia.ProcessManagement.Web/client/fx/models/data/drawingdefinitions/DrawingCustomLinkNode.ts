import { MultilingualString } from '@omnia/fx-models';
import { IDrawingShapeNode } from './IDrawingShapeNode';

export interface CustomLinkShapeEditor extends IDrawingShapeNode {
    linkTitle: MultilingualString;
    link: string;
}