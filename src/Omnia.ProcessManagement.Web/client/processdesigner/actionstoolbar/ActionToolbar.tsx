import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';

import { Inject, Utils, Localize } from '@omnia/fx';
import { OmniaTheming, Router } from "@omnia/fx/ux"
import { VueComponentBase, ConfirmDialogOptions, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessDesignerStore } from '../stores';
import { CurrentProcessStore } from '../../fx';
import { ActionItem, ActionItemType, ActionCustomButton, ActionButton } from '../../models/processdesigner';
import { ProcessDesignerStyles } from '../ProcessDesigner.css';
import { ActionToolbarStyles } from './ActionToolbar.css';
import { DisplaySettingsToolbarComponent } from './DisplaySettingsToolbar';
import { Localization } from '@omnia/tooling-composers';
import { ProcessDesignerLocalization } from '../loc/localize';

export interface ActionToolbarProps {
}

@Component
export class ActionToolbarComponent extends VueComponentBase<ActionToolbarProps>
{
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(OmniaTheming) private omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    public mounted() {
    }

    private onActionButtonClick(callback: Function, confirmationOptions: ConfirmDialogOptions) {

        if (confirmationOptions) {
            this.$confirm.open(confirmationOptions).then((response) => {
                if (response === ConfirmDialogResponse.Ok) {
                    var result = callback();
                    if (result instanceof Promise) result.catch(() => { });
                }
            });
        }
        else {
            var result = callback();
            if (result instanceof Promise) result.catch(() => { });
        }
    }

    private createButton(h, button: ActionItem, classStr?: string) {
        let showButton = true;
        if (button.visibilityCallBack) showButton = button.visibilityCallBack();
        if (!showButton) return null;

        switch (button.type) {
            case ActionItemType.Button:
                return this.createDefaultButton(h, button as ActionButton, classStr);

            case ActionItemType.CustomButton:
                return (button as ActionCustomButton).render(this);

            default:
                return null;
        }
    }

    private createDefaultButton(h, button: ActionButton, classStr?: string) {
        let highlightButtonColor = this.omniaTheming.chrome.primary.base;
        let titleRight = button.iconRight ? button.title : "";
        let titleLeft = button.iconRight ? "" : button.title;
        let disabled = button.disableCallBack ? button.disabled || button.disableCallBack() : button.disabled;

        return (
            <v-btn
                class={classStr}
                disabled={disabled}
                color={button.highLighted ? highlightButtonColor : ""}
                text={!button.highLighted}
                depressed={!button.highLighted}
                loading={button.loading}
                dark={this.omniaTheming.chrome.dark || button.highLighted}
                onClick={() => { this.onActionButtonClick(button.actionCallback, button.confirmationOptions); }}>
                {titleRight}
                <v-icon class="mr-2" >{button.icon}</v-icon>
                {titleLeft}
            </v-btn>);
    }

    private createActionButtons(h, defaultActionButtons: ActionItem[]) {
        let actionButtons = new Array<JSX.Element>();

        defaultActionButtons.forEach((button) => {
            actionButtons.push(this.createButton(h, button));
        });
        return actionButtons;
    }

    private renderToolbarWithButtons(h) {
        let actionButtons = new Array<JSX.Element>();
        let result = new Array<JSX.Element>();

        /* Action buttons in toolbar */
        if (this.processDesignerStore.tabs.selectedTab.state) {
            if (this.processDesignerStore.settings.itemIsCheckOut.state) {
                actionButtons = this.createActionButtons(h,
                    this.processDesignerStore.tabs.selectedTab.state.actionToolbar.checkedOutButtons)
            }            
            else {
                actionButtons = this.createActionButtons(h,
                    this.processDesignerStore.tabs.selectedTab.state.actionToolbar.notCheckedOutActionButtons)
            }
        }

        result.push(<v-btn onClick={() => {
            this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(true);
        }}>{this.pdLoc.AddShape}</v-btn>);
        result.push(<v-spacer></v-spacer>);
        result.push(
            <div class={[ActionToolbarStyles.actionButtons]}>
                <div>{actionButtons}</div>
            </div>
        );

        return result;
    }
    private renderToolbarWithLoadingIndicator(h) {
        return (
            <div class={ActionToolbarStyles.loadingIndicator.wrapper}>
                <div class={ActionToolbarStyles.loadingIndicator.positioning}>
                    <v-progress-circular
                        indeterminate
                        width="3"
                        dark={this.omniaTheming.chrome.dark}
                        color={this.omniaTheming.chrome.dark ? "#ffffff" : "000000"}>
                    </v-progress-circular>
                </div>
            </div>
        );
    }

    public render(h) {
        let compensateDrawerLeftCss = ""
        if (this.processDesignerStore.settings.showContentNavigation.state) {
            compensateDrawerLeftCss = ProcessDesignerStyles.compensateDrawerLeft
        }
        return (
            <div>
                <DisplaySettingsToolbarComponent key={1}></DisplaySettingsToolbarComponent>
                <div class={[ActionToolbarStyles.positioning(this.omniaTheming.chrome.background), compensateDrawerLeftCss]}>
                    {
                        //this.editorStore.loadingInProgress.state
                        //    ?
                        //    this.renderToolbarWithLoadingIndicator(h)
                        //    :
                        //    this.renderToolbarWithButtons(h)
                        this.renderToolbarWithButtons(h)
                    }
                </div>
            </div>)
    }
}

