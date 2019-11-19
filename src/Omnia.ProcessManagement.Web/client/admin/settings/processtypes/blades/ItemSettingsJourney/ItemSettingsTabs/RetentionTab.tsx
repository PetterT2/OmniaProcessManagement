import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { DocumentType, DocumentTypeItemSettings, GlobalSettings, ArchiveFactory, Archive, RetentionFactory, Retention, RetentionTypes, CalculatedRetention, PropertyRetention } from '../../../../../../fx/models';
//import { SettingsStore } from '../../../../../../stores';
//import { style } from 'typestyle';
//import { DocumentTypeHelper } from '../../../core';
import { PropertyIndexedType } from '@omnia/fx-models';

interface RetentionTabProps {
    formValidator: FormValidator;
    documentType: DocumentType;
}

@Component
export default class RetentionTab extends VueComponentBase<RetentionTabProps> {

    @Prop() formValidator: FormValidator;
    @Prop() documentType: DocumentType;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    //@Inject(SettingsStore) settingsStore: SettingsStore;

    //enableRetention: boolean = false;
    //selectingRetentionType: RetentionTypes = null;
    //publishedTypes: Array<{ id: boolean, title: string }> = [
    //    { id: false, title: this.loc.FirstPublished },
    //    { id: true, title: this.loc.LastPublished }
    //]
    //created() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (settings.retention) {
    //        this.enableRetention = true;
    //        this.selectingRetentionType = settings.retention.type;
    //    }
    //}

    //onEnableRetentionChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (this.enableRetention) {
    //        settings.retention = RetentionFactory.createDefault();
    //        this.selectingRetentionType = settings.retention.type;
    //    }
    //    else {
    //        settings.retention = null;
    //    }
    //}

    //onRetentionTypeChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    settings.retention = RetentionFactory.createDefault(this.selectingRetentionType);
    //}

    //renderRadio(h, type: RetentionTypes, label: string) {
    //    return (
    //        <v-radio-group hide-details class="mt-1" name="documentTypeRetentionTypes" v-model={this.selectingRetentionType}>
    //            <v-radio label={label}
    //                value={type}
    //                onChange={() => {
    //                    this.selectingRetentionType = type;
    //                    this.onRetentionTypeChanged();
    //                }}></v-radio>
    //        </v-radio-group>
    //    )
    //}

    //renderRetentionSettings(h, retention: Retention) {
    //    return (
    //        <v-card>
    //            <v-card-text>
    //                {this.renderRadio(h, RetentionTypes.Calculated, this.loc.RetentionTypes.Calculated)}
    //                {this.selectingRetentionType == RetentionTypes.Calculated && this.renderCalculatedRetentionSettings(h, retention as CalculatedRetention)}
    //                {this.renderRadio(h, RetentionTypes.Property, this.loc.RetentionTypes.Property)}
    //                {this.selectingRetentionType == RetentionTypes.Property && this.renderPropertyRetentionSettings(h, retention as PropertyRetention)}
    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //renderPropertyRetentionSettings(h, propertyRetention: PropertyRetention) {
    //    return [
    //        <v-select class="ml-4" item-value="id"
    //            item-text="multilingualTitle"
    //            items={DocumentTypeHelper.getAvailableProperties(PropertyIndexedType.DateTime)}
    //            v-model={propertyRetention.dateTimeEnterprisePropertyDefinitionId}></v-select>,
    //        <omfx-field-validation
    //            useValidator={this.formValidator}
    //            checkValue={propertyRetention.dateTimeEnterprisePropertyDefinitionId}
    //            rules={
    //                new FieldValueValidation().IsRequired().getRules()
    //            }>
    //        </omfx-field-validation>
    //    ]
    //}

    //renderCalculatedRetentionSettings(h, calculatedRetention: CalculatedRetention) {
    //    return (
    //        <v-layout class="ml-4">
    //            <v-flex>
    //                <omfx-time-period-picker
    //                    dark={this.omniaTheming.promoted.body.dark}
    //                    min={1} model={calculatedRetention.settings}
    //                    onModelChange={(model) => { calculatedRetention.settings = model }}></omfx-time-period-picker>
    //            </v-flex>
    //            <v-flex shrink>
    //                <v-select item-value="id"
    //                    item-text="title"
    //                    label={this.loc.Since}
    //                    items={this.publishedTypes}
    //                    v-model={calculatedRetention.lastPublished}></v-select>
    //            </v-flex>

    //        </v-layout>
    //    )
    //}

    //render(h) {

    //    let settings = this.documentType.settings as DocumentTypeItemSettings;

    //    return (
    //        <div>
    //            <v-checkbox label={this.loc.LimitRetention}
    //                onChange={(val) => { this.enableRetention = val; this.onEnableRetentionChanged() }}
    //                input-value={this.enableRetention}></v-checkbox>
    //            {
    //                this.enableRetention && this.renderRetentionSettings(h, settings.retention)
    //            }
    //        </div>
    //    );
    //}
}