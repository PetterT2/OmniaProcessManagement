import { ConfirmDialogOptions } from '@omnia/fx/ux';
import Vue from 'vue'

export enum ActionItemType
{
    Button,
    GroupButtons, // Group button wapper
    ButtonGroup, // Button inside group
    CustomButton
}


export interface ActionItem
{
    id?: string;
    type: ActionItemType;
    highLighted: boolean;
    visibilityCallBack?: Function;
}

export interface ActionCustomButton extends ActionItem
{
    render: (vue: Vue) => JSX.Element;
    loading?: boolean;
}

export interface ActionButton extends ActionItem
{
    title: string;
    actionCallback: Function;
    icon: string;
    iconRight?: boolean;
    disableCallBack?: Function;
    confirmationOptions?: ConfirmDialogOptions;
    loading?: boolean;
    disabled?: boolean;
}

export interface ActionButtonGroup extends ActionButton
{
    tooltip?: string;
    color?: string;
}

export interface ActionGroupButtons extends ActionItem
{
    buttons?: Array<ActionButton>;
}