import { CanvasDefinition } from '../drawingdefinitions';
import { MultilingualString } from '@omnia/fx-models';
import { Link } from './Link';

export interface ProcessData {
    canvasDefinition: CanvasDefinition;
    content: MultilingualString;

    documents: any; //TODO
    links: Array<Link>; //TODO
    tasks: any; //TODO

    canvasDefinitionJSON?: string;
}