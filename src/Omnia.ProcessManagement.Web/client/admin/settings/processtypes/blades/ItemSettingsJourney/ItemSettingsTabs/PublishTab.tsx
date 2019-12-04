import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessType, ProcessTypeItemSettings, PublishingApprovalSettingsTypes, LimitedUsersPublishingApprovalSettings, PublishingApprovalSettingsFactory, TermDrivenPublishingApprovalSettings, PersonPropertyPublishingApprovalSettings } from '../../../../../../fx/models';
import { UserPrincipalType, EnterprisePropertyDefinition, PropertyIndexedType } from '@omnia/fx-models';
import { EnterprisePropertySetStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { ProcessTypeHelper } from '../../../core';

interface PublishTabProps {
    formValidator: FormValidator;
    processType: ProcessType;
    openTermDrivenSettings: () => void;
    closeAllSettings: () => void;
}

@Component
export default class PublishTab extends VueComponentBase<PublishTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() processType: ProcessType;
    @Prop() openTermDrivenSettings: () => void;
    @Prop() closeAllSettings: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    selectingPublishingApprovalSettingsType: PublishingApprovalSettingsTypes = null;
    enablePublishingApproval = false;
    isLoading = true;

    created() {
        this.init();
    }

    init() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        if (settings.publishingApprovalSettings) {
            this.enablePublishingApproval = true;
            this.selectingPublishingApprovalSettingsType = settings.publishingApprovalSettings.type;

        }
    }

    onPublishingApprovalTypeChanged() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        settings.publishingApprovalSettings = PublishingApprovalSettingsFactory.createDefault(this.selectingPublishingApprovalSettingsType);

        this.closeAllSettings();
    }

    onEnablePublishingApprovalChanged() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        if (this.enablePublishingApproval) {
            this.selectingPublishingApprovalSettingsType = PublishingApprovalSettingsTypes.Anyone;
            this.onPublishingApprovalTypeChanged();
        }
        else {
            this.selectingPublishingApprovalSettingsType = null;
            settings.publishingApprovalSettings = null;

            this.closeAllSettings();
        }
    }

    renderTermDrivenPublishingApproval(h, settings: TermDrivenPublishingApprovalSettings) {
        let availableTaxonomyProperties = ProcessTypeHelper.getAvailableProperties(PropertyIndexedType.Taxonomy);
        return [
            <v-layout class="ml-4" align-center>
                <v-flex grow>
                    <v-select onChange={() => { this.closeAllSettings() }} item-value="id" item-text="multilingualTitle" items={availableTaxonomyProperties} v-model={settings.taxonomyEnterprisePropertyDefinitionId}></v-select>
                </v-flex>
                {
                    settings.taxonomyEnterprisePropertyDefinitionId &&
                    <v-btn dark={this.omniaTheming.promoted.body.dark} icon onClick={() => { this.openTermDrivenSettings() }}>
                        <v-icon size='18'>fal fa-cog</v-icon>
                    </v-btn>
                }
            </v-layout>,
            <omfx-field-validation
                useValidator={this.formValidator}
                checkValue={settings.taxonomyEnterprisePropertyDefinitionId}
                rules={
                    new FieldValueValidation().IsRequired().getRules()
                }>
            </omfx-field-validation>
        ]
    }

    renderPersonPropertyPublishingApproval(h, settings: PersonPropertyPublishingApprovalSettings) {
        let availablePersonProperties = ProcessTypeHelper.getAvailableProperties(PropertyIndexedType.Person);
        return [
            <v-select class="ml-4" item-value="id" item-text="multilingualTitle"
                items={availablePersonProperties}
                v-model={settings.personEnterprisePropertyDefinitionId}></v-select>,
            <omfx-field-validation
                useValidator={this.formValidator}
                checkValue={settings.personEnterprisePropertyDefinitionId}
                rules={
                    new FieldValueValidation().IsRequired().getRules()
                }>
            </omfx-field-validation>
        ]
    }

    renderLimitedUsersPublishingApproval(h, settings: LimitedUsersPublishingApprovalSettings) {
        return (
            <div class="ml-4">
                <omfx-people-picker
                    multiple
                    dark={this.omniaTheming.promoted.body.dark}
                    label=" "
                    principalType={UserPrincipalType.Member}
                    model={settings.users}
                    onModelChange={(model) => { settings.users = model }}></omfx-people-picker>
                <omfx-field-validation
                    useValidator={this.formValidator}
                    checkValue={settings.users}
                    rules={
                        new FieldValueValidation().IsArrayRequired().getRules()
                    }>
                </omfx-field-validation>
            </div>
        )
    }

    renderPublishingApprovalRadio(h, type: PublishingApprovalSettingsTypes, label: string) {
        return (
            <v-radio-group hide-details class="mt-1" name="processTypePublishingApprovalTypes" v-model={this.selectingPublishingApprovalSettingsType}>
                <v-radio label={label}
                    value={type}
                    onChange={() => {
                        this.selectingPublishingApprovalSettingsType = type;
                        this.onPublishingApprovalTypeChanged();
                    }}></v-radio>
            </v-radio-group>
        )
    }

    renderPublishingApproval(h, settings: ProcessTypeItemSettings) {

        return (
            <v-card>
                <v-card-text>
                    {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.Anyone, this.loc.ProcessTypes.Settings.PublishingApprovalTypes.Anyone)}
                    {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.LimitedUsers, this.loc.ProcessTypes.Settings.PublishingApprovalTypes.LimitedUsers)}
                    {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.LimitedUsers &&
                        this.renderLimitedUsersPublishingApproval(h, settings.publishingApprovalSettings as LimitedUsersPublishingApprovalSettings)}

                    {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.TermDriven, this.loc.ProcessTypes.Settings.PublishingApprovalTypes.TermDriven)}
                    {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.TermDriven &&
                        this.renderTermDrivenPublishingApproval(h, settings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings)}

                    {this.renderPublishingApprovalRadio(h, PublishingApprovalSettingsTypes.PersonProperty, this.loc.ProcessTypes.Settings.PublishingApprovalTypes.PersonProperty)}
                    {this.selectingPublishingApprovalSettingsType == PublishingApprovalSettingsTypes.PersonProperty &&
                        this.renderPersonPropertyPublishingApproval(h, settings.publishingApprovalSettings as PersonPropertyPublishingApprovalSettings)}
                </v-card-text>
            </v-card>
        )
    }

    render(h) {
        let settings = this.processType.settings as ProcessTypeItemSettings;

        return (
            <div>
                <v-checkbox input-value={settings.allowRevisions} label={this.loc.ProcessTypes.Settings.AllowRevisions} onChange={(val) => { settings.allowRevisions = val; }}></v-checkbox>
                {
                    settings.allowRevisions &&
                    <v-card>
                        <v-card-text>
                            <v-checkbox input-value={settings.allowBypassApprovalForRevisions} label={this.loc.ProcessTypes.Settings.AllowBypassApprovalForRevisions} onChange={(val) => { settings.allowBypassApprovalForRevisions = val; }}></v-checkbox>
                        </v-card-text>
                    </v-card>
                }
                <v-checkbox input-value={this.enablePublishingApproval} label={this.loc.ProcessTypes.Settings.PublishingApproval} onChange={(val) => { this.enablePublishingApproval = val; this.onEnablePublishingApprovalChanged() }}></v-checkbox>
                {
                    this.enablePublishingApproval && this.renderPublishingApproval(h, settings)
                }
            </div>
        );
    }
}