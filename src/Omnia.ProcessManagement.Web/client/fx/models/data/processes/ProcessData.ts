import { CanvasDefinition } from '../drawingdefinitions';
import { MultilingualString } from '@omnia/fx-models';
import { Link } from './Link';
import { Task } from './Task';
import { DocumentRollupBlockData } from '@omnia/dm/models';

export interface ProcessData {
    canvasDefinition: CanvasDefinition;
    content: MultilingualString;

    documentBlockData?: DocumentRollupBlockData;
    links: Array<Link>; //TODO
    tasks: Array<Task>; //TODO


    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
}