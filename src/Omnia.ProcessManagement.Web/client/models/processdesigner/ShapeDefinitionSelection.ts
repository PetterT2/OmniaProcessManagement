import { ShapeDefinition } from '../../fx/models';
import { GuidValue } from '@omnia/fx-models';

export interface ShapeDefinitionSelection extends ShapeDefinition {
    //id?: GuidValue;
    visible?: boolean;
    //isSelected?: boolean;
}