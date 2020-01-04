import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { TasksBlockDataData } from './TasksBlockDataData';
import { TasksBlockSettings } from './TasksBlockSettings';

export interface TasksBlockData extends BlockDataWithSettingsAndData<TasksBlockDataData, TasksBlockSettings> {
}