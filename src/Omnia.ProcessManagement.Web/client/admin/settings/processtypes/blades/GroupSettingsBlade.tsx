import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, FormValidator, VueComponentBase, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessType } from '../../../../fx/models';

interface GroupSettingsBladeProps {

}

@Component
export default class GroupSettingsBlade extends VueComponentBase<GroupSettingsBladeProps> {
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isSaving: boolean = false;
    isDeleting: boolean = false;

    title: string = '';
    editingProcessType: ProcessType = null;
    internalValidator: FormValidator = new FormValidator(this);

    created() {
        this.editingProcessType = this.processTypeJourneyStore.getters.editingProcessType();
        this.title = this.processTypeJourneyStore.getters.editingOriginalProcessTypeTitle();
    }

    save() {
        if (this.internalValidator.validateAll()) {
            this.isSaving = true;

            this.processTypeJourneyStore.actions.addOrUpdate.dispatch(this.editingProcessType)
        }
    }

    delete() {
        this.$confirm.open().then((res) => {
            if (res == ConfirmDialogResponse.Ok) {
                this.isDeleting = true;

                this.processTypeJourneyStore.actions.remove.dispatch(this.editingProcessType)
            }
        })
    }

    renderRootGroup(h) {
        return (
            <div>
                <v-text-field label={this.loc.ProcessTypes.UniqueId} disabled value={this.editingProcessType.id}></v-text-field>
            </div>
        )
    }

    render(h) {

        return (
            <div>
                <v-toolbar prominent dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.editingProcessType.id ? [<v-icon class="mr-2">fas fa-folder</v-icon>, this.title] : ""}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    {
                        this.editingProcessType.id && this.editingProcessType.parentId && !this.editingProcessType.childCount &&
                        <v-btn loading={this.isDeleting} icon onClick={() => { this.delete() }}>
                            <v-icon>delete</v-icon>
                        </v-btn>
                    }
                    <v-btn icon onClick={() => { this.processTypeJourneyStore.mutations.setEditingProcessType.commit(null) }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {this.renderRootGroup(h)}
                </v-container>
            </div>
        );
    }
}