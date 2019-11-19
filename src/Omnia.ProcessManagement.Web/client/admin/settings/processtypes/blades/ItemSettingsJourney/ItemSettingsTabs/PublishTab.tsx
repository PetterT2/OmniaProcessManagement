import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { ProcessType, DocumentTypeItemSettings, PublishingApprovalSettingsTypes, LimitedUsersPublishingApprovalSettings, PublishingApprovalSettingsFactory, TermDrivenPublishingApprovalSettings, PersonPropertyPublishingApprovalSettings, GroupPublishingApprovalSettings, DocumentConversions } from '../../../../../../fx/models';
import { UserPrincipalType, EnterprisePropertyDefinition, PropertyIndexedType } from '@omnia/fx-models';
import { EnterprisePropertySetStore, EnterprisePropertyStore } from '@omnia/fx/store';
import {  } from '../../../core';

interface PublishTabProps {
    formValidator: FormValidator;
    documentType: DocumentType;
    openTermDrivenSettings: () => void;
    closeAllSettings: () => void;
}

@Component
export default class PublishTab extends VueComponentBase<PublishTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() documentType: DocumentType;
    @Prop() openTermDrivenSettings: () => void;
    @Prop() closeAllSettings: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    //selectingPublishingApprovalSettingsType: PublishingApprovalSettingsTypes = null;
    //enablePublishingApproval = false;
    //enableConversion = false;
    //isLoading = true;

    //created() {
    //    this.init();
    //}

    //init() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (settings.publishingApprovalSettings) {
    //        this.enablePublishingApproval = true;
    //        this.selectingPublishingApprovalSettingsType = settings.publishingApprovalSettings.type;

    //    }

    //    this.enableConversion = settings.conversions != DocumentConversions.NoConversion
    //}

    //onPublishingApprovalTypeChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    settings.publishingApprovalSettings = PublishingApprovalSettingsFactory.createDefault(this.selectingPublishingApprovalSettingsType);

    //    this.closeAllSettings();
    //}

    //onEnablePublishingApprovalChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (this.enablePublishingApproval) {
    //        this.selectingPublishingApprovalSettingsType = PublishingApprovalSettingsTypes.Anyone;
    //        this.onPublishingApprovalTypeChanged();
    //    }
    //    else {
    //        this.selectingPublishingApprovalSettingsType = null;
    //        settings.publishingApprovalSettings = null;

    //        this.closeAllSettings();
    //    }
    //}

    //renderTermDrivenPublishingApproval(h, settings: TermDrivenPublishingApprovalSettings) {
    //    let availableTaxonomyProperties = DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.Taxonomy);
    //    return [
    //        <v-layout class="ml-4" align-center>
    //            <v-flex grow>
    //                <v-select onChange={() => { this.closeAllSettings() }} item-value="id" item-text="multilingualTitle" items={availableTaxonomyProperties} v-model={settings.taxonomyEnterprisePropertyDefinitionId}></v-select>
    //            </v-flex>
    //            {
    //                settings.taxonomyEnterprisePropertyDefinitionId &&
    //                <v-btn dark={this.omniaTheming.promoted.body.dark} icon onClick={() => { this.openTermDrivenSettings() }}>
    //                    <v-icon size='18'>fas fa-cog</v-icon>
    //                </v-btn>
    //            }
    //        </v-layout>,
    //        <omfx-field-validation
    //            useValidator={this.formValidator}
    //            checkValue={settings.taxonomyEnterprisePropertyDefinitionId}
    //            rules={
    //                new FieldValueValidation().IsRequired().getRules()
    //            }>
    //        </omfx-field-validation>
    //    ]
    //}

    //renderPersonPropertyPublishingApproval(h, settings: PersonPropertyPublishingApprovalSettings) {
    //    let availablePersonProperties = DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.Person);
    //    return [
    //        <v-select class="ml-4" item-value="id" item-text="multilingualTitle"
    //            items={availablePersonProperties}
    //            v-model={settings.personEnterprisePropertyDefinitionId}></v-select>,
    //        <omfx-field-validation
    //            useValidator={this.formValidator}
    //            checkValue={settings.personEnterprisePropertyDefinitionId}
    //            rules={
    //                new FieldValueValidation().IsRequired().getRules()
    //            }>
    //        </omfx-field-validation>
    //    ]
    //}

    //renderLimitedUsersPublishingApproval(h, settings: LimitedUsersPublishingApprovalSettings) {
    //    return (
    //        <div class="ml-4">
    //            <omfx-people-picker
    //                multiple
    //                dark={this.omniaTheming.promoted.body.dark}
    //                label=" "
    //                principalType={UserPrincipalType.Member}
    //                model={settings.users}
    //                onModelChange={(model) => { settings.users = model }}></omfx-people-picker>
    //            <omfx-field-validation
    //                useValidator={this.formValidator}
    //                checkValue={settings.users}
    //                rules={
    //                    new FieldValueValidation().IsArrayRequired().getRules()
    //                }>
    //            </omfx-field-validation>
    //        </div>
    //    )
    //}

    //renderPublishingApprovalRadio(h, type: PublishingApprovalSettingsTypes, label: string) {
    //    return (
    //        <v-radio-group hide-details class="mt-1" name="documentTypePublishingApprovalTypes" v-model={this.selectingPublishingApprovalSettingsType}>
    //            <v-radio label={label}
    //                value={type}
    //                onChange={() => {
    //                    this.selectingPublishingApprovalSettingsType = type;
    //                    this.onPublishingApprovalTypeChanged();
    //                }}></v-radio>
    //        </v-radio-group>
    //    )
    //}

    //renderPublishingApproval(h, settings: DocumentTypeItemSettings) {

    //    return (
    //        <v-card>
    //            <v-card-text>
    //                {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.Anyone, this.loc.PublishingApprovalTypes.Anyone)}
    //                {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.LimitedUsers, this.loc.PublishingApprovalTypes.LimitedUsers)}
    //                {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.LimitedUsers &&
    //                    this.renderLimitedUsersPublishingApproval(h, settings.publishingApprovalSettings as LimitedUsersPublishingApprovalSettings)}

    //                {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.TermDriven, this.loc.PublishingApprovalTypes.TermDriven)}
    //                {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.TermDriven &&
    //                    this.renderTermDrivenPublishingApproval(h, settings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings)}

    //                {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.PersonProperty, this.loc.PublishingApprovalTypes.PersonProperty)}
    //                {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.PersonProperty &&
    //                    this.renderPersonPropertyPublishingApproval(h, settings.publishingApprovalSettings as PersonPropertyPublishingApprovalSettings)}

    //                {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.Group, this.loc.PublishingApprovalTypes.Group)}

    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //renderConversions(h, settings: DocumentTypeItemSettings) {
    //    return (
    //        <v-card>
    //            <v-card-text>
    //                <v-radio-group hide-details class="ma-0" name="documentTypeConversions" v-model={settings.conversions}>
    //                    <v-radio onChange={() => { settings.conversions = DocumentConversions.AllowConvertToPDF }}
    //                        label={this.loc.ConversionTypes.AllowConvertDOCXToPDF} value={DocumentConversions.AllowConvertToPDF}></v-radio>
    //                    <v-radio onChange={() => { settings.conversions = DocumentConversions.AllowAndDefaultConvertToPDF }}
    //                        label={this.loc.ConversionTypes.AllowAndDefaultConvertDOCXToPDF} value={DocumentConversions.AllowAndDefaultConvertToPDF}></v-radio>
    //                    <v-radio onChange={() => { settings.conversions = DocumentConversions.AlwaysConvertToPDF }}
    //                        label={this.loc.ConversionTypes.AlwaysConvertDOCXToPDF} value={DocumentConversions.AlwaysConvertToPDF}></v-radio>
    //                </v-radio-group>
    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //render(h) {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;

    //    return (
    //        <div>
    //            <v-checkbox input-value={settings.replaceTokenOnPublishing} label={this.loc.ReplaceTokenOnPublishing} onChange={(val) => { settings.replaceTokenOnPublishing = val; }}></v-checkbox>
    //            <v-checkbox input-value={settings.allowRevisions} label={this.loc.AllowRevisions} onChange={(val) => { settings.allowRevisions = val; }}></v-checkbox>
    //            {
    //                settings.allowRevisions &&
    //                <v-card>
    //                    <v-card-text>
    //                        <v-checkbox input-value={settings.allowBypassApprovalForRevisions} label={this.loc.AllowBypassApprovalForRevisions} onChange={(val) => { settings.allowBypassApprovalForRevisions = val; }}></v-checkbox>
    //                    </v-card-text>
    //                </v-card>
    //            }
    //            <v-checkbox input-value={this.enablePublishingApproval} label={this.loc.PublishingApproval} onChange={(val) => { this.enablePublishingApproval = val; this.onEnablePublishingApprovalChanged() }}></v-checkbox>
    //            {
    //                this.enablePublishingApproval && this.renderPublishingApproval(h, settings)
    //            }
    //            <v-checkbox input-value={this.enableConversion} label={this.loc.Conversion} onChange={(val) => { this.enableConversion = val; settings.conversions = val ? DocumentConversions.AllowConvertToPDF : DocumentConversions.NoConversion }}></v-checkbox>
    //            {
    //                this.enableConversion && this.renderConversions(h, settings)
    //            }
    //        </div>
    //    );
    //}
}