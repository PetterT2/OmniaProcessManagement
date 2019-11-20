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
import RetentionTab from '../ItemSettingsTabs/RetentionTab';
import { ProcessTypesItemSettingsJourneyBladeIds } from '../ItemSettingsJourneyConstants';
import { TabNames, ProcessTypeHelper } from '../../../core';


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
    editingDocumentType: DocumentType = null;
    title: string = '';
    selectedTab = 0;
    internalValidator: FormValidator = new FormValidator(this);

    //created() {
    //    this.editingDocumentType = this.processTypeJourneyStore.getters.editingDocumentType();
    //    this.title = this.processTypeJourneyStore.getters.editingOriginalDocumentTypeTitle();
    //}

    //save() {
    //    DocumentTypeHelper.ensureValidData();
    //    var invalidTabName = DocumentTypeHelper.validateDocumentTypeItem();

    //    this.isSaving = true;
    //    if (invalidTabName != null) {
    //        this.selectedTab = invalidTabName;
    //        this.triggerValidatorUtilErrorVisible(20);
    //    }
    //    else {
    //        this.processTypeJourneyStore.actions.addOrUpdate.dispatch(this.editingDocumentType)
    //    }
    //}

    //triggerValidatorUtilErrorVisible(timeToTry: number) {
    //    if (timeToTry > 0) {
    //        setTimeout(() => {
    //            if (this.internalValidator.validateAll()) {
    //                this.triggerValidatorUtilErrorVisible(timeToTry - 1);
    //            }
    //            else {
    //                this.isSaving = false;
    //            }
    //        }, 500)
    //    }
    //}

    //delete() {
    //    this.$confirm.open().then((res) => {
    //        if (res == ConfirmDialogResponse.Ok) {
    //            this.isDeleting = true;

    //            this.processTypeJourneyStore.actions.remove.dispatch(this.editingDocumentType)
    //        }
    //    })
    //}

    //travelTo(bladeId?: string) {
    //    this.journey().travelBackToFirstBlade();
    //    if (bladeId)
    //        this.journey().travelToNext(bladeId);
    //}


    //render(h) {
    //    return (
    //        <div>
    //            <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
    //                color={this.omniaTheming.promoted.header.background.base}
    //                {
    //                ...this.transformVSlot({
    //                    extension: () => {
    //                        return [
    //                            <v-tabs
    //                                value={this.selectedTab}
    //                                dark={this.omniaTheming.promoted.header.dark}
    //                                background-color={this.omniaTheming.promoted.header.background.base}
    //                                slider-color={this.omniaTheming.promoted.header.text.base}
    //                            >
    //                                <v-tab onClick={() => this.selectedTab = TabNames.general} >
    //                                    {this.loc.General}
    //                                </v-tab>
    //                                <v-tab onClick={() => this.selectedTab = TabNames.publish}>
    //                                    {this.loc.Publish}
    //                                </v-tab>
    //                                <v-tab onClick={() => this.selectedTab = TabNames.review}>
    //                                    {this.loc.Review}
    //                                </v-tab>
    //                                <v-tab onClick={() => this.selectedTab = TabNames.archive}>
    //                                    {this.loc.Archive}
    //                                </v-tab>
    //                                <v-tab onClick={() => this.selectedTab = TabNames.retention}>
    //                                    {this.loc.Retention}
    //                                </v-tab>
    //                            </v-tabs>
    //                        ]
    //                    }
    //                })}>
    //                <v-toolbar-title>{this.editingDocumentType.id ? [<v-icon class="mr-2">fal fa-file</v-icon>, this.title] : this.loc.CreateDocumentType}</v-toolbar-title>
    //                <v-spacer></v-spacer>
    //                {
    //                    this.editingDocumentType.id &&
    //                    <v-btn loading={this.isDeleting} icon onClick={() => { this.delete() }}>
    //                        <v-icon>delete</v-icon>
    //                    </v-btn>
    //                }
    //                <v-btn icon onClick={() => { this.processTypeJourneyStore.mutations.setEditingDocumentType.commit(null) }}>
    //                    <v-icon>close</v-icon>
    //                </v-btn>

    //            </v-toolbar>
    //            <v-divider></v-divider>
    //            <v-container>
    //                {
    //                    this.selectedTab == TabNames.general ? <GeneralTab closeAllSettings={() => { this.travelTo() }} openPropertySetSettings={() => { this.travelTo(ProcessTypesItemSettingsJourneyBladeIds.propertysetsettings) }} formValidator={this.internalValidator} documentType={this.editingDocumentType}></GeneralTab> :
    //                        this.selectedTab == TabNames.publish ? <PublishTab closeAllSettings={() => { this.travelTo() }} openTermDrivenSettings={() => { this.travelTo(ProcessTypesItemSettingsJourneyBladeIds.termdrivensettings) }} formValidator={this.internalValidator} documentType={this.editingDocumentType}></PublishTab> :
    //                            this.selectedTab == TabNames.review ? <ReviewTab formValidator={this.internalValidator} documentType={this.editingDocumentType}></ReviewTab> :
    //                                this.selectedTab == TabNames.archive ? <ArchiveTab formValidator={this.internalValidator} documentType={this.editingDocumentType}></ArchiveTab> :
    //                                    this.selectedTab == TabNames.retention ? <RetentionTab formValidator={this.internalValidator} documentType={this.editingDocumentType}></RetentionTab> :
    //                                        null
    //                }
    //                <div class='text-right'>
    //                    <v-btn dark={this.omniaTheming.promoted.body.dark} loading={this.isSaving} text onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
    //                </div>
    //            </v-container>
    //        </div>
    //    );
    //}
}