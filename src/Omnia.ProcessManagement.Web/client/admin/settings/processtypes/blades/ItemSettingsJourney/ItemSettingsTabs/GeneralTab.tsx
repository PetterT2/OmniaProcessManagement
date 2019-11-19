import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { ProcessType, DocumentTypeItemSettings, DocumentTemplateSettingsTypes } from '../../../../../../fx/models';
import { EnterprisePropertySetStore } from '@omnia/fx/store';
import { ProcessTypeHelper } from '../../../core';
import { ProcessTemplateStore } from '../../../../../../stores';

interface GeneralTabProps {
    formValidator: FormValidator;
    documentType: DocumentType;
    openPropertySetSettings: () => void;
    closeAllSettings: () => void;
}

@Component
export default class GeneralTab extends VueComponentBase<GeneralTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() documentType: DocumentType;
    @Prop() openPropertySetSettings: () => void;
    @Prop() closeAllSettings: () => void;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(ProcessTemplateStore) documentTemplateStore: ProcessTemplateStore;

    priviousPropertySetId = null;

    //created() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    this.priviousPropertySetId = settings.enterprisePropertySetId;
    //}

    //documentTemplateIdsChanged(settings: DocumentTypeItemSettings) {
    //    if (settings.defaultDocumentTemplateId && !settings.documentTemplateIds.find(d => d == settings.defaultDocumentTemplateId)) {
    //    } settings.defaultDocumentTemplateId = null;
    //}

    //render(h) {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    let sets = this.enterprisePropertySetStore.getters.enterprisePropertySets();
    //    let documentTemplates = this.documentTemplateStore.getters.documentTemplates()
    //        .filter(d => d.settings.type == DocumentTemplateSettingsTypes.ControlledDocument);

    //    let selectingDocumentTemplates = documentTemplates.filter(d => settings.documentTemplateIds.indexOf(d.id) >= 0);

    //    return (
    //        <div>
    //            <omfx-multilingual-input
    //                requiredWithValidator={this.formValidator}
    //                model={this.documentType.title}
    //                onModelChange={(title) => { this.documentType.title = title }}
    //                forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>

    //            <v-layout align-center>
    //                <v-flex grow>
    //                    <v-select required persistent-hint hint={settings.enterprisePropertySetId ? this.loc.ChangePropertySetHint : ""} onChange={() => { this.closeAllSettings(); DocumentTypeHelper.ensureValidData(); }} label={this.loc.PropertySet} item-value="id" item-text="multilingualTitle" items={sets} v-model={settings.enterprisePropertySetId}></v-select>
    //                </v-flex>
    //                {
    //                    settings.enterprisePropertySetId &&
    //                    <v-btn dark={this.omniaTheming.promoted.body.dark} icon onClick={() => { this.openPropertySetSettings() }}>
    //                        <v-icon size='18'>fas fa-cog</v-icon>
    //                    </v-btn>
    //                }
    //            </v-layout>
    //            <omfx-field-validation
    //                useValidator={this.formValidator}
    //                checkValue={settings.enterprisePropertySetId}
    //                rules={
    //                    new FieldValueValidation().IsRequired().getRules()
    //                }>
    //            </omfx-field-validation>

    //            <v-select class="mt-4" chips deletable-chips multiple item-value="id" item-text="multilingualTitle"
    //                label={this.loc.DocumentTemplates.DocumentTemplates}
    //                items={documentTemplates}
    //                v-model={settings.documentTemplateIds}
    //                onChange={() => { this.documentTemplateIdsChanged(settings) }}></v-select>

    //            <v-select item-value="id" item-text="multilingualTitle"
    //                label={this.loc.DefaultDocumentTemplate}
    //                items={selectingDocumentTemplates}
    //                v-model={settings.defaultDocumentTemplateId}></v-select>

    //            <v-checkbox input-value={settings.allowAppendices} label={this.loc.AllowAppendices} onChange={(val) => { settings.allowAppendices = val; }}></v-checkbox>
    //            <v-checkbox input-value={settings.showCreateDocumentIconInRollup} label={this.loc.ShowCreateDocumentIconInRollup} onChange={(val) => { settings.showCreateDocumentIconInRollup = val }}></v-checkbox>
    //            <v-checkbox input-value={settings.allowConnectToTemplate} label={this.loc.AllowConnectToTemplate} onChange={(val) => { settings.allowConnectToTemplate = val }}></v-checkbox>

    //            {this.documentType.id && <v-text-field disabled label={this.loc.UniqueId} value={this.documentType.id}></v-text-field>}
    //        </div>
    //    );
    //}
}