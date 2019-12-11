import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { VueComponentBase, OmniaTheming, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, FormValidator } from '@omnia/fx/ux';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { CurrentProcessStore, OPMRouter } from '../../../fx';
import { MultilingualString, Guid, GuidValue } from '@omnia/fx-models';
import { RootProcessStep, ProcessStep, IdDict } from '../../../fx/models';


@Component
export class ActionsMenuComponent extends VueComponentBase<{}>
{
    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    internalValidator: FormValidator = new FormValidator(this);
    title: MultilingualString = {} as MultilingualString;

    showCreateProcessStepDialog = false;
    showMoveProcessStepDialog = false;

    moveProcessStepDialogData: {
        dialogTitle: string,
        hiddenProcessStepIdsDict: IdDict<boolean>,
        disabledProcessStepIdsDict: IdDict<boolean>,
        rootProcessStep: RootProcessStep
    } = null

    menuModel = {
        showMenu: false
    }


    onClickMoveProcessStep(e: Event): any {
        e.stopPropagation();
        this.menuModel.showMenu = false;

        let currentReferenceData = this.currentProcessStore.getters.referenceData();

        this.moveProcessStepDialogData = {
            dialogTitle: this.loc.MoveProcessStep + ": " + currentReferenceData.currentProcessStep.multilingualTitle,
            hiddenProcessStepIdsDict: { [currentReferenceData.currentProcessStep.id.toString().toLowerCase()]: true },
            disabledProcessStepIdsDict: { [currentReferenceData.parentProcessStep.id.toString().toLowerCase()]: true },
            rootProcessStep: currentReferenceData.process.rootProcessStep
        }

        this.showMoveProcessStepDialog = true;
    }

    onClickCreateProcessStep(e: Event): any {
        e.stopPropagation();
        this.menuModel.showMenu = false;

        this.showCreateProcessStepDialog = true;

    }

    closeCreateProcessStepDialog() {
        this.showCreateProcessStepDialog = false;
    }

    closeMoveProcessStepDialog() {
        this.showMoveProcessStepDialog = false;
    }

    addProcessStep() {
        this.currentProcessStore.actions.addProcessStep.dispatch(this.title).then((result) => {
            OPMRouter.navigate(result.process, result.processStep)
        })
    }

    moveToProcessStep(processStep: ProcessStep): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        })
    }

    renderMoveProcessStepDialog(h) {
        return (
            <opm-process-step-picker
                hiddenProcessStepIdsDict={this.moveProcessStepDialogData.hiddenProcessStepIdsDict}
                disabledProcessStepIdsDict={this.moveProcessStepDialogData.disabledProcessStepIdsDict}
                rootProcessStep={this.moveProcessStepDialogData.rootProcessStep}
                onSelected={this.moveToProcessStep}
                onClose={this.closeMoveProcessStepDialog}>
            </opm-process-step-picker>
        )
    }

    renderCreateProcessStepDialog(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.closeCreateProcessStepDialog(); }}
                model={{ visible: this.showCreateProcessStepDialog }}
                hideCloseButton
                width="800px"
                position={DialogPositions.Center}>
                <div>
                    <v-card>
                        <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                            <v-toolbar-title>{this.loc.CreateProcessStep}</v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn icon onClick={() => { this.closeCreateProcessStepDialog(); }}>
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-toolbar>
                        <v-divider></v-divider>
                        <v-card-text class={this.omniaTheming.promoted.body.class}>
                            <omfx-multilingual-input
                                model={this.title}
                                onModelChange={(title) => { this.title = title }}
                                forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    dark={this.omniaTheming.promoted.body.dark}
                                    color={this.omniaTheming.themes.primary.base}
                                    onClick={() => { this.addProcessStep() }}>
                                    {this.omniaLoc.Common.Buttons.Create}
                                </v-btn>
                                <v-btn
                                    text
                                    light={!this.omniaTheming.promoted.body.dark}
                                    onClick={() => { this.closeCreateProcessStepDialog(); }}>
                                    {this.omniaLoc.Common.Buttons.Cancel}
                                </v-btn>
                            </v-card-actions>
                        </v-card-text>
                    </v-card>
                </div>
            </omfx-dialog>
        )
    }

    renderDialogs(h) {
        if (this.showCreateProcessStepDialog)
            return this.renderCreateProcessStepDialog(h)
        if (this.showMoveProcessStepDialog)
            return this.renderMoveProcessStepDialog(h)

        return null;
    }


    render(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();

        return (
            <div>
                <v-menu
                    dark={this.omniaTheming.promoted.header.dark}
                    light={!this.omniaTheming.promoted.header.dark}
                    bottom right
                    v-model={this.menuModel.showMenu}
                    {
                    ...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <v-btn
                                    {...toSpread}
                                    icon small dark
                                    onClick={(e: Event) => { e.stopPropagation(); this.menuModel.showMenu = true; }}
                                    class={["ml-0", "mr-2"]}>
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                            ]
                        }
                    })}>
                    <v-list
                        color={this.omniaTheming.promoted.body.onComponent.lighten1}
                        dark={this.omniaTheming.promoted.header.dark}
                        class={this.omniaTheming.promoted.header.class}>


                        <v-list-item
                            dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickCreateProcessStep(e)}>
                            <v-list-item-avatar>
                                <v-icon medium color={this.omniaTheming.promoted.header.text.base}>add</v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.loc.CreateProcessStep}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        {
                            currentReferenceData.parentProcessStep ?
                                <v-list-item
                                    dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickMoveProcessStep(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>far fa-arrows-alt</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.MoveProcessStep}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item> : null
                        }
                    </v-list>
                </v-menu>
                {
                    this.renderDialogs(h)
                }
            </div>
        )
    }
}




