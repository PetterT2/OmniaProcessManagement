import { CanvasDefinition } from '../drawingdefinitions';
import { MultilingualString } from '@omnia/fx-models';
import { Link } from './Link';
import { Task } from './Task';

export interface ProcessData {
    canvasDefinition: CanvasDefinition;
    content: MultilingualString;

    documents: any; //TODO
    links: Array<Link>; //TODO
    tasks: Array<Task>; //TODO


    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
}