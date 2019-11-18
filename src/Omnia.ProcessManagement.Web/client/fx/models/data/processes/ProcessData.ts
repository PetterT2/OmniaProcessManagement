import { CanvasDefinition } from '../drawingdefinitions';
import { MultilingualString } from '@omnia/fx-models';

export interface ProcessData {
    canvasDefinition: CanvasDefinition;
    content: MultilingualString;

    documents: any; //TODO
    links: any; //TODO
    tasks: any; //TODO
}