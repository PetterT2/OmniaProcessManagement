import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';

import { Inject, Utils, Localize } from '@omnia/fx';
import { OmniaTheming, Router } from "@omnia/fx/ux"
import { VueComponentBase, ConfirmDialogOptions, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessDesignerStore } from '../stores';
import { CurrentProcessStore, ProcessStore } from '../../fx';
import { ProcessVersionType } from '../../fx/models';
import { ActionItem, ActionItemType, ActionCustomButton, ActionButton, DisplayModes } from '../../models/processdesigner';
import { ProcessDesignerStyles } from '../ProcessDesigner.css';
import { ActionToolbarStyles } from './ActionToolbar.css';
import { DisplaySettingsToolbarComponent } from './DisplaySettingsToolbar';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessStepDesignerItem } from '../designeritems/ProcessStepDesignerItem';

export interface ActionToolbarProps {
}

@Component
export class ActionToolbarComponent extends VueComponentBase<ActionToolbarProps>
{
    @Inject(ProcessStore) processStore: ProcessStore;
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

    private createActionButtons(h, defaultActionButtons: ActionItem[], extendedActionButtons?: ActionItem[]) {
        let actionButtons = new Array<JSX.Element>();

        defaultActionButtons.forEach((button) => {
            actionButtons.push(this.createButton(h, button));
        });

        if (extendedActionButtons && extendedActionButtons.length > 0) {
            let extendedButtons = new Array<JSX.Element>();
            extendedActionButtons.forEach((button) => {
                let tempbutton: ActionButton = button as ActionButton;
                let showButton = true;
                if (tempbutton.visibilityCallBack) {
                    showButton = tempbutton.visibilityCallBack();
                }
                if (showButton) {
                    extendedButtons.push(
                        <v-list-item onClick={() => this.onActionButtonClick(tempbutton.actionCallback, tempbutton.confirmationOptions)}>
                            <v-list-item-avatar>
                                <v-icon>{tempbutton.icon}</v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title class={[ActionToolbarStyles.extendedButtonText]}>
                                    {tempbutton.title}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>)
                }
            });

            if (extendedButtons.length > 0)
                actionButtons.push(
                    <v-menu offset-y
                        {
                        ...this.transformVSlot({
                            activator: (ref) => {
                                const toSpread = {
                                    on: ref.on
                                }
                                return [
                                    <v-btn
                                        class="ml-2"
                                        {...toSpread}
                                        icon
                                        dark={this.omniaTheming.chrome.background.dark}>
                                        <v-icon >more_vert</v-icon>
                                    </v-btn>
                                ]
                            }
                        })}>
                        <v-list dark={this.omniaTheming.chrome.background.dark} min-width={250}>
                            {extendedButtons}
                        </v-list>
                    </v-menu>
                );
        }

        return actionButtons;
    }

    private renderToolbarWithButtons(h) {
        let actionButtons = new Array<JSX.Element>();
        let result = new Array<JSX.Element>();
        let currentProcessReferenceData = this.currentProcessStore.getters.referenceData();
        let hasDataChanged = this.processDesignerStore.getters.hasDataChanged();
        let processCheckoutStatus = this.processStore.getters.processCheckoutInfo(currentProcessReferenceData.process.opmProcessId);
        /* Action buttons in toolbar */
        if (this.processDesignerStore.tabs.selectedTab.state && currentProcessReferenceData && currentProcessReferenceData.process) {
            if (currentProcessReferenceData.process.versionType == ProcessVersionType.CheckedOut) {
                actionButtons = this.createActionButtons(h,
                    this.processDesignerStore.tabs.selectedTab.state.actionToolbar.checkedOutButtons,
                    this.processDesignerStore.tabs.selectedTab.state.actionToolbar.checkedOutExtendedActionButtons)
            }
            else {
                actionButtons = this.createActionButtons(h,
                    this.processDesignerStore.tabs.selectedTab.state.actionToolbar.notCheckedOutActionButtons)
            }
        }
        result.push(<v-spacer></v-spacer>);
        if (hasDataChanged === true) {
            result.push(<div class={[ActionToolbarStyles.statusButton]}>
                <v-btn small text><v-icon>fal fa-pencil-alt</v-icon>{this.pdLoc.NewDataNotSaved}</v-btn></div>);
        }
        if (hasDataChanged === false) {
            result.push(<div class={[ActionToolbarStyles.statusButton]}>
                <v-btn small text color="success"><v-icon>fal fa-check</v-icon>{this.pdLoc.NewDataHasBeenSaved}</v-btn></div>);
        }

        if (processCheckoutStatus && !processCheckoutStatus.canCheckout && processCheckoutStatus.checkedOutBy) {
            result.push(<div class={[ActionToolbarStyles.statusButton]}>
                <v-btn small text>{`${this.pdLoc.CheckedOutTo} ${processCheckoutStatus.checkedOutBy}`}</v-btn></div>);
        }

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

