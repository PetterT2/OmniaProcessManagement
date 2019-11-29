import { ActionButton } from './ActionButton';
import { DisplayModes } from './ProcessDesignerSettings';


export interface DisplayActionButton extends ActionButton {
    displayMode: DisplayModes;
    requiredRoles: Array<string>;
}