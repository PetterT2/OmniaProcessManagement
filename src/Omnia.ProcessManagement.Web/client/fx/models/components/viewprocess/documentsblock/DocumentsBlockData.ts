import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { DocumentsBlockDataData } from './DocumentsBlockDataData';
import { DocumentsBlockSettings } from './DocumentsBlockSettings';

export interface DocumentsBlockData extends BlockDataWithSettingsAndData<DocumentsBlockDataData, DocumentsBlockSettings> {
}