import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { VueComponentBase, OmniaTheming, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, FormValidator } from '@omnia/fx/ux';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { CurrentProcessStore, OPMRouter, ProcessService, OPMUtils } from '../../../fx';
import { MultilingualString, Guid, GuidValue, BuiltInEnterprisePropertyInternalNames } from '@omnia/fx-models';
import { RootProcessStep, ProcessStep, IdDict, ProcessStepType, InternalProcessStep, Process } from '../../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessDesignerStore } from '../../stores';
import { ProcessDesignerItemFactory } from '../../designeritems';
import { DisplayModes } from '../../../models/processdesigner';

@Component
export class ActionsMenuComponent extends VueComponentBase<{}>
{
    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(ProcessService) processService: ProcessService;

    internalValidator: FormValidator = new FormValidator(this);
    title: MultilingualString = {} as MultilingualString;

    showEditTitleDialog = false;
    showAddLinkedProcessStepDialog = false;
    showCreateProcessStepDialog = false;
    showMoveProcessStepDialog = false;
    showDeleteProcessStepDialog = false;
    externalOPMProcessId: GuidValue = null;

    loading: boolean = false;
    checkingDeletingProcessSteps: boolean = false;
    deletingProcessStepBeingUsed: boolean = false;
    deletingMultipleProcessSteps: boolean = false;

    errorMessage: string = "";

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
            dialogTitle: this.loc.MoveProcessStep + ": " + currentReferenceData.current.processStep.multilingualTitle,
            hiddenProcessStepIdsDict: { [currentReferenceData.current.processStep.id.toString().toLowerCase()]: true },
            disabledProcessStepIdsDict: currentReferenceData.current.parentProcessStep ?
                { [currentReferenceData.current.parentProcessStep.id.toString().toLowerCase()]: true } : {},
            rootProcessStep: currentReferenceData.process.rootProcessStep
        }

        this.showMoveProcessStepDialog = true;
    }

    onClickCreateProcessStep(e: Event): any {
        this.initValidatorForm();
        e.stopPropagation();
        this.menuModel.showMenu = false;
        this.errorMessage = "";
        this.title = {} as MultilingualString;
        this.showCreateProcessStepDialog = true;

    }

    onClickAddLinkedProcess(e: Event): any {
        this.initValidatorForm();
        e.stopPropagation();
        this.menuModel.showMenu = false;
        this.errorMessage = "";
        this.title = {} as MultilingualString;
        this.showAddLinkedProcessStepDialog = true;
    }

    onClickEditTitle(e: Event): any {
        this.initValidatorForm();
        e.stopPropagation();
        this.menuModel.showMenu = false;
        this.errorMessage = "";
        this.title = Utils.clone(this.currentProcessStore.getters.referenceData().current.processStep.title);
        this.showEditTitleDialog = true;

    }

    onClickDeleteProcessStep(e: Event): any {
        e.stopPropagation();
        this.menuModel.showMenu = false;
        this.deletingProcessStepBeingUsed = false;

        this.showDeleteProcessStepDialog = true;

        let referenceData = this.currentProcessStore.getters.referenceData();
        this.deletingMultipleProcessSteps = referenceData.current.processStep.type == ProcessStepType.Internal &&
            (referenceData.current.processStep as InternalProcessStep).processSteps &&
            (referenceData.current.processStep as InternalProcessStep).processSteps.length > 0;

        this.checkingDeletingProcessSteps = true;
        this.processService.checkIfDeletingProcessStepsAreBeingUsed(referenceData.process.id, OPMUtils.getAllProcessStepIds(referenceData.current.processStep))
            .then((beingUsed) => {
                this.checkingDeletingProcessSteps = false;
                this.deletingProcessStepBeingUsed = beingUsed;
            })
    }

    closeDeleteProcessStepDialog() {
        this.showDeleteProcessStepDialog = false;
    }

    closeCreateProcessStepDialog() {
        this.showCreateProcessStepDialog = false;
        this.showEditTitleDialog = false;
        this.showAddLinkedProcessStepDialog = false;
    }

    closeMoveProcessStepDialog() {
        this.showMoveProcessStepDialog = false;
    }

    addProcessStep() {
        this.errorMessage = "";
        if (this.internalValidator.validateAll()) {
            this.loading = true;
            let promise: Promise<{ process: Process, processStep: ProcessStep }> = null;
            let isExternalProcessStep = this.showAddLinkedProcessStepDialog;
            if (isExternalProcessStep) {
                promise = this.currentProcessStore.actions.addExtenalProcessStep.dispatch(this.title, this.externalOPMProcessId)
            }
            else {
                promise = this.currentProcessStore.actions.addProcessStep.dispatch(this.title);
            }

            promise.then((result) => {
                let processRefrerence = OPMUtils.generateProcessReference(result.process, result.processStep.id);
                this.currentProcessStore.actions.setProcessToShow.dispatch(processRefrerence).then(() => {
                    this.loading = false;
                    this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(isExternalProcessStep), DisplayModes.contentEditing);
                });
            }).catch((err) => {
                this.errorMessage = err;
                this.loading = false;
            })
        }
    }

    deleteProcessStep() {
        this.loading = true;
        this.currentProcessStore.actions.deleteProcessStep.dispatch().then(() => {
            this.loading = false;
        })
    }

    initValidatorForm() {
        this.internalValidator.clearValidation();
        this.internalValidator = new FormValidator(this);
    }

    editTitle() {
        this.errorMessage = "";
        if (this.internalValidator.validateAll()) {
            let currentReferenceData = this.currentProcessStore.getters.referenceData();
            currentReferenceData.current.processStep.title = this.title;
            currentReferenceData.current.processStep.multilingualTitle = this.multilingualStore.getters.stringValue(this.title);
            if ((currentReferenceData.current.processStep as RootProcessStep).enterpriseProperties) {
                (currentReferenceData.current.processStep as RootProcessStep).enterpriseProperties[BuiltInEnterprisePropertyInternalNames.Title] = JSON.stringify(this.title);
            }
            this.loading = true;
            this.processDesignerStore.actions.saveState.dispatch().then(() => {
                this.showEditTitleDialog = false;
                this.loading = false;
            }).catch((err) => {
                this.errorMessage = err;
                this.loading = false;
            })
        }
    }

    moveToProcessStep(newParentProcessStep: InternalProcessStep): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let currentProcessReferenceData = this.currentProcessStore.getters.referenceData();
            let parentProcessStep = currentProcessReferenceData.current.parentProcessStep;
            let currentProcessStep = currentProcessReferenceData.current.processStep;

            parentProcessStep.processSteps.splice(parentProcessStep.processSteps.indexOf(currentProcessStep), 1);

            if (!newParentProcessStep.processSteps)
                newParentProcessStep.processSteps = [];
            newParentProcessStep.processSteps.push(currentProcessStep);

            this.processDesignerStore.actions.saveState.dispatch(true, true).then(resolve).catch(reject);
        })
    }

    renderMoveProcessStepDialog(h) {
        return (
            <opm-process-step-picker
                header={this.moveProcessStepDialogData.dialogTitle}
                hiddenProcessStepIdsDict={this.moveProcessStepDialogData.hiddenProcessStepIdsDict}
                disabledProcessStepIdsDict={this.moveProcessStepDialogData.disabledProcessStepIdsDict}
                rootProcessStep={this.moveProcessStepDialogData.rootProcessStep}
                onSelected={this.moveToProcessStep}
                onClose={this.closeMoveProcessStepDialog}>
            </opm-process-step-picker>
        )
    }

    renderDeleteProcessDialog(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.closeDeleteProcessStepDialog(); }}
                model={{ visible: true }}
                hideCloseButton
                width="800px"
                position={DialogPositions.Center}>
                <div>
                    <v-card>
                        <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                            <v-toolbar-title>{this.loc.DeleteProcessStep.Label}</v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn icon onClick={() => { this.closeDeleteProcessStepDialog(); }}>
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-toolbar>
                        <v-divider></v-divider>
                        <v-card-text class={this.omniaTheming.promoted.body.class}>
                            {
                                this.checkingDeletingProcessSteps ?
                                    <v-progress-circular size="16" width="2" indeterminate></v-progress-circular> :
                                    <div>
                                        {this.loc.DeleteProcessStep.ConfirmationMessage}
                                        <ul>
                                            {this.deletingMultipleProcessSteps && <li>{this.loc.DeleteProcessStep.WarningMultipleDeletingProcessStepMessage}</li>}
                                            {this.deletingProcessStepBeingUsed && <li>{this.loc.DeleteProcessStep.WarningReferenceProcessStepMessage}</li>}
                                        </ul>
                                    </div>
                            }
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    disabled={this.checkingDeletingProcessSteps}
                                    loading={this.loading}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    color={this.omniaTheming.themes.primary.base}
                                    onClick={() => { this.deleteProcessStep() }}>
                                    {this.omniaLoc.Common.Buttons.Delete}
                                </v-btn>
                                <v-btn
                                    text
                                    light={!this.omniaTheming.promoted.body.dark}
                                    onClick={() => { this.closeDeleteProcessStepDialog(); }}>
                                    {this.omniaLoc.Common.Buttons.Cancel}
                                </v-btn>
                            </v-card-actions>
                        </v-card-text>
                    </v-card>
                </div>
            </omfx-dialog>
        )
    }

    renderProcessStepDialog(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.closeCreateProcessStepDialog(); }}
                model={{ visible: true }}
                hideCloseButton
                width="800px"
                position={DialogPositions.Center}>
                <div>
                    <v-card>
                        <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                            <v-toolbar-title>{this.showEditTitleDialog ? this.loc.EditTitle : this.showCreateProcessStepDialog ? this.loc.CreateProcessStep : this.loc.AddLinkedProcess.AddTitle}</v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn icon onClick={() => { this.closeCreateProcessStepDialog(); }}>
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-toolbar>
                        <v-divider></v-divider>
                        <v-card-text class={this.omniaTheming.promoted.body.class}>
                            {
                                this.showAddLinkedProcessStepDialog ?
                                    <opm-processdesigner-addlinkedprocess
                                        onChange={(title, opmProcessId) => { this.title = title; this.externalOPMProcessId = opmProcessId }}>
                                    </opm-processdesigner-addlinkedprocess> :
                                    null
                            }
                            <omfx-multilingual-input
                                requiredWithValidator={this.internalValidator}
                                model={this.title}
                                onModelChange={(title) => { this.title = title }}
                                forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                            <span style={{ color: 'red' }}>{this.errorMessage}</span>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    loading={this.loading}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    color={this.omniaTheming.themes.primary.base}
                                    onClick={() => { this.showEditTitleDialog ? this.editTitle() : this.addProcessStep() }}>
                                    {this.showEditTitleDialog ? this.omniaLoc.Common.Buttons.Save : this.showCreateProcessStepDialog ? this.omniaLoc.Common.Buttons.Create : this.omniaLoc.Common.Buttons.Ok}
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
        if (this.showCreateProcessStepDialog || this.showEditTitleDialog || this.showAddLinkedProcessStepDialog)
            return this.renderProcessStepDialog(h)
        if (this.showMoveProcessStepDialog)
            return this.renderMoveProcessStepDialog(h)
        if (this.showDeleteProcessStepDialog)
            return this.renderDeleteProcessDialog(h)
        return null;
    }


    render(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        let isInternal = currentReferenceData.current.processStep.type == ProcessStepType.Internal;
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
                        {
                            isInternal ?
                                [<v-list-item dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickCreateProcessStep(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>add</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.CreateProcessStep}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>,
                                <v-list-item dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickAddLinkedProcess(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>add</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.AddLinkedProcess.AddTitle}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>,
                                <v-list-item dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickEditTitle(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>edit</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.EditTitle}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>]
                                : null
                        }
                        {
                            currentReferenceData.current.parentProcessStep ?
                                <v-list-item dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickMoveProcessStep(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>far fa-arrows-alt</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.MoveProcessStep}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item> : null
                        }
                        {
                            currentReferenceData.current.parentProcessStep ?
                                <v-list-item dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickDeleteProcessStep(e)}>
                                    <v-list-item-avatar>
                                        <v-icon medium color={this.omniaTheming.promoted.header.text.base}>delete</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content class={"mr-2"}>
                                        <v-list-item-title>{this.loc.DeleteProcessStep.Label}</v-list-item-title>
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




