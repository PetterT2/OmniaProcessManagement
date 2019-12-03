import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { JourneyInstance, OmniaTheming, StyleFlow, VueComponentBase, FormValidator, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessType } from '../../../../../../fx/models';
import { ProcessTypeJourneyStore } from '../../../store';
import GeneralTab from '../ItemSettingsTabs/GeneralTab';
import PublishTab from '../ItemSettingsTabs/PublishTab';
import ReviewTab from '../ItemSettingsTabs/ReviewTab';
import ArchiveTab from '../ItemSettingsTabs/ArchiveTab';
import { ProcessTypesItemSettingsJourneyBladeIds } from '../ItemSettingsJourneyConstants';
import { TabNames, ProcessTypeHelper } from '../../../core';
import { setTimeout } from 'timers';


interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    isSaving: boolean = false;
    isDeleting: boolean = false;
    editingProcessType: ProcessType = null;
    title: string = '';
    selectedTab = 0;
    internalValidator: FormValidator = new FormValidator(this);

    created() {
        this.editingProcessType = this.processTypeJourneyStore.getters.editingProcessType();
        this.title = this.processTypeJourneyStore.getters.editingOriginalProcessTypeTitle();
    }

    save() {
        ProcessTypeHelper.ensureValidData();
        var invalidTabName = ProcessTypeHelper.validateProcessTypeItem();

        this.isSaving = true;
        if (invalidTabName != null) {
            this.selectedTab = invalidTabName;
            this.triggerValidatorUtilErrorVisible(20);
        }
        else {
            this.processTypeJourneyStore.actions.addOrUpdate.dispatch(this.editingProcessType)
        }
    }

    triggerValidatorUtilErrorVisible(timeToTry: number) {
        if (timeToTry > 0) {
            setTimeout(() => {
                if (this.internalValidator.validateAll()) {
                    this.triggerValidatorUtilErrorVisible(timeToTry - 1);
                }
                else {
                    this.isSaving = false;
                }
            }, 500)
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

    travelTo(bladeId?: string) {
        this.journey().travelBackToFirstBlade();
        if (bladeId)
            this.journey().travelToNext(bladeId);
    }

    render(h) {
        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}
                    {
                    ...this.transformVSlot({
                        extension: () => {
                            return [
                                <v-tabs
                                    value={this.selectedTab}
                                    dark={this.omniaTheming.promoted.header.dark}
                                    background-color={this.omniaTheming.promoted.header.background.base}
                                    slider-color={this.omniaTheming.promoted.header.text.base}
                                >
                                    <v-tab onClick={() => this.selectedTab = TabNames.general} >
                                        {this.loc.ProcessTypes.Settings.Tabs.General}
                                    </v-tab>
                                    <v-tab onClick={() => this.selectedTab = TabNames.publish}>
                                        {this.loc.ProcessTypes.Settings.Tabs.Publish}
                                    </v-tab>
                                    <v-tab onClick={() => this.selectedTab = TabNames.review}>
                                        {this.loc.ProcessTypes.Settings.Tabs.Review}
                                    </v-tab>
                                    <v-tab onClick={() => this.selectedTab = TabNames.archive}>
                                        {this.loc.ProcessTypes.Settings.Tabs.Archive}
                                    </v-tab>
                                </v-tabs>
                            ]
                        }
                    })}>
                    <v-toolbar-title>{this.editingProcessType.id ? [<v-icon class="mr-2">fal fa-file</v-icon>, this.title] : this.loc.ProcessTypes.CreateProcessType}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    {
                        this.editingProcessType.id &&
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
                    {
                        this.selectedTab == TabNames.general ? <GeneralTab closeAllSettings={() => { this.travelTo() }} openPropertySetSettings={() => { this.travelTo(ProcessTypesItemSettingsJourneyBladeIds.propertysetsettings) }} formValidator={this.internalValidator} processType={this.editingProcessType}></GeneralTab> :
                            this.selectedTab == TabNames.publish ? <PublishTab closeAllSettings={() => { this.travelTo() }} openTermDrivenSettings={() => { this.travelTo(ProcessTypesItemSettingsJourneyBladeIds.termdrivensettings) }} formValidator={this.internalValidator} processType={this.editingProcessType}></PublishTab> :
                                this.selectedTab == TabNames.review ? <ReviewTab formValidator={this.internalValidator} processType={this.editingProcessType}></ReviewTab> :
                                    this.selectedTab == TabNames.archive ? <ArchiveTab formValidator={this.internalValidator} processType={this.editingProcessType}></ArchiveTab> :
                                        null
                    }
                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} loading={this.isSaving} text onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                    </div>
                </v-container>
            </div>
        );
    }
}