import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { JourneyInstance, OmniaTheming, VueComponentBase, FormValidator, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { ProcessType, PropertySetItemSettings, DocumentTypeItemSettings, PropertySetBooleanItemSettings, PropertySetDateTimeItemSettings, PropertySetTaxonomyItemSettings, PropertySetPersonItemSettings, PropertySetTextItemSettings } from '../../../../../../fx/models';
import { ProcessTypeJourneyStore } from '../../../store';
import { ProcessTypeHelper } from '../../../core';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { EnterprisePropertyDefinition, GuidValue, PropertyIndexedType, TaxonomyPropertySettings, UserPrincipalType } from '@omnia/fx-models';
import { TermStore } from '@omnia/fx-sp';
import { UserService } from '@omnia/fx/services';


interface PropertySetSettingsBladeProps {
    journey: () => JourneyInstance;
}


@Component
export default class PropertySetSettingsBlade extends VueComponentBase<PropertySetSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(UserService) userService: UserService;
    @Inject(TermStore) termStore: TermStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    //This is datetime picker formatter , TO DO ?!
    //formatter = {
    //    timeformat: 'ampm',
    //    locale: 'en-us',
    //    firstdayofweek: 1
    //};

    //headers = [
    //    {
    //        text: this.loc.Property,
    //        align: 'left',
    //        sortable: false
    //    },
    //    {
    //        text: this.loc.AlternativeInternalName,
    //        sortable: false
    //    },
    //    {
    //        text: this.loc.DefaultValue,
    //        sortable: false
    //    },
    //    {
    //        text: '',
    //        sortable: false
    //    }
    //];

    //selectingPropertyId: GuidValue = null;
    //editingDocumentType: DocumentType = null;

    //defaultValueTypes: Array<{ id: boolean, title: string }> = [
    //    { id: true, title: this.loc.DefaultValueTypes.FixedValue },
    //    { id: false, title: this.loc.DefaultValueTypes.FromSiteProperty }
    //]

    //selectedDefaultValueTypes: { [id: string]: boolean } = {};
    //userNames: { [id: string]: string } = {};
    //termNames: { [id: string]: string } = {}
    //created() {

    //    this.editingDocumentType = this.processTypeJourneyStore.getters.editingDocumentType();
    //    let propertySetItemSettings = (this.editingDocumentType.settings as DocumentTypeItemSettings).propertySetItemSettings
    //    Object.keys(propertySetItemSettings).forEach(key => {
    //        let fixedValueType = propertySetItemSettings[key].defaultValueFromAppPropertyDefinitionId == null;
    //        this.$set(this.selectedDefaultValueTypes, key, fixedValueType)
    //    })

    //    this.loadSelectedTaxonomyAndPersonDataAsync(propertySetItemSettings);
    //}

    ////We don't need to wait for it to finish to start rendering
    ////Just render other stuff first, these value will be render later
    //loadSelectedTaxonomyAndPersonDataAsync(settings: { [id: string]: PropertySetItemSettings }) {
    //    let userIdMark: { [id: string]: boolean } = {};
    //    let termIdMark: { [id: string]: boolean } = {};

    //    let userIds: Array<string> = [];
    //    let termIdsGroupByTermSets: { [termSetId: string]: Array<string> } = {};

    //    let taxonomyProperties = this.enterprisePropertyStore.getters
    //        .enterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Taxonomy]);

    //    Object.keys(settings).forEach(key => {
    //        if (settings[key].type == PropertyIndexedType.Person && !settings[key].defaultValueFromAppPropertyDefinitionId) {
    //            let users = (settings[key] as PropertySetPersonItemSettings).fixedDefaultValues;
    //            users.forEach(u => {
    //                if (!userIdMark[u.uid]) {
    //                    userIdMark[u.uid] = true;
    //                    userIds.push(u.uid);
    //                }
    //            })
    //        }
    //        else if (settings[key].type == PropertyIndexedType.Taxonomy && !settings[key].defaultValueFromAppPropertyDefinitionId) {
    //            let termIds = (settings[key] as PropertySetTaxonomyItemSettings).fixedDefaultValues;
    //            let property = taxonomyProperties.find(p => p.id.toString() == key);
    //            let termSetId = (property.settings as TaxonomyPropertySettings).termSetId;

    //            termIds.forEach(id => {
    //                if (!termIdMark[id.toString()]) {
    //                    termIdMark[id.toString()] = true;

    //                    if (!termIdsGroupByTermSets[termSetId])
    //                        termIdsGroupByTermSets[termSetId] = [];

    //                    termIdsGroupByTermSets[termSetId].push(id.toString());
    //                }
    //            })

    //        }
    //    });

    //    if (userIds.length > 0)
    //        this.userService.resolveUsersByPrincipalNames(userIds).then((users) => {
    //            users.forEach(user => {
    //                this.$set(this.userNames, user.id, user.displayName);
    //            })
    //        })


    //    Object.keys(termIdsGroupByTermSets).forEach(termSet => {
    //        let termIds = termIdsGroupByTermSets[termSet];
    //        this.termStore.actions.ensureTermByIds.dispatch(termSet, termIds).then((result) => {
    //            result.forEach(term => {
    //                this.$set(this.termNames, term.id, term.name)
    //            })
    //        })
    //    })
    //}

    //renderDefaultValueEdit(h, property: EnterprisePropertyDefinition, settings: { [id: string]: PropertySetItemSettings }) {
    //    let element: JSX.Element = null;
    //    let itemSettings = settings[property.id.toString()];
    //    let properties =
    //        this.enterprisePropertyStore.getters.enterprisePropertyDefinitionsByIndexedTypes([property.enterprisePropertyDataType.indexedType]);
    //    if (this.selectedDefaultValueTypes[property.id.toString()]) {
    //        if (itemSettings.type == PropertyIndexedType.Boolean) {
    //            let booleanSettings = itemSettings as PropertySetBooleanItemSettings;
    //            element = (
    //                <v-checkbox
    //                    onChange={(val) => { booleanSettings.fixedDefaultValue = val; }}
    //                    input-value={booleanSettings.fixedDefaultValue}></v-checkbox>
    //            )
    //        }
    //        else if (itemSettings.type == PropertyIndexedType.DateTime) {
    //            let dateOnly = DocumentTypeHelper.isDateOnly(property.id);
    //            let pickerMode = dateOnly ? "date-time" : "date-time";
    //            let dateTimeSettings = itemSettings as PropertySetDateTimeItemSettings;
    //            let model = dateTimeSettings.fixedDefaultValue ? dateTimeSettings.fixedDefaultValue.toString() : ''
    //            element = (
    //                <omfx-date-time-picker model={model}
    //                    color={this.omniaTheming.themes.primary.base}
    //                    dark={this.omniaTheming.promoted.body.dark}
    //                    pickerMode={pickerMode as any}
    //                    formatter={this.formatter}
    //                    onModelChange={(newVal) => { dateTimeSettings.fixedDefaultValue = newVal ? new Date(newVal) : null }}>
    //                </omfx-date-time-picker>
    //            )
    //        }
    //        else if (itemSettings.type == PropertyIndexedType.Taxonomy) {
    //            let multiple = DocumentTypeHelper.isMultiple(property.id);
    //            let termSetId = (property.settings as TaxonomyPropertySettings).termSetId;
    //            let taxonomySettings = itemSettings as PropertySetTaxonomyItemSettings;
    //            element = (
    //                <omfx-term-picker termSetId={termSetId}
    //                    multi={multiple}
    //                    preSelectedTermIds={taxonomySettings.fixedDefaultValues}
    //                    onTermsSelected={(val) => { taxonomySettings.fixedDefaultValues = val }}
    //                >
    //                </omfx-term-picker>
    //            )
    //        }
    //        else if (itemSettings.type == PropertyIndexedType.Person) {
    //            let multiple = DocumentTypeHelper.isMultiple(property.id);
    //            let personSettings = itemSettings as PropertySetPersonItemSettings;
    //            element = (
    //                <omfx-people-picker
    //                    multiple={multiple}
    //                    dark={this.omniaTheming.promoted.body.dark}
    //                    label=" "
    //                    principalType={UserPrincipalType.Member}
    //                    model={personSettings.fixedDefaultValues}
    //                    onModelChange={(model) => { personSettings.fixedDefaultValues = model }}></omfx-people-picker>
    //            )
    //        }
    //        else if (itemSettings.type == PropertyIndexedType.Text) {
    //            let textSettings = itemSettings as PropertySetTextItemSettings;
    //            element = (
    //                <v-text-field v-model={textSettings.fixedDefaultValue}></v-text-field>
    //            )
    //        }
    //    }
    //    else {
    //        element = (
    //            <v-select item-value="id" item-text="multilingualTitle"
    //                items={properties}
    //                v-model={itemSettings.defaultValueFromAppPropertyDefinitionId}></v-select>
    //        )
    //    }
    //    return element;
    //}

    //renderDefaultValueDisplay(h, property: EnterprisePropertyDefinition, settings: { [id: string]: PropertySetItemSettings }) {
    //    let element: JSX.Element | string = null;

    //    let itemSettings = settings[property.id.toString()];
    //    if (itemSettings.defaultValueFromAppPropertyDefinitionId) {
    //        element = property.multilingualTitle
    //    }
    //    else if (itemSettings.type == PropertyIndexedType.Boolean) {
    //        let value = (itemSettings as PropertySetBooleanItemSettings).fixedDefaultValue;
    //        element = value ? (<v-icon small>check</v-icon>) : null
    //    }
    //    else if (itemSettings.type == PropertyIndexedType.DateTime) {
    //        let dateOnly = DocumentTypeHelper.isDateOnly(property.id);
    //        let value = (itemSettings as PropertySetDateTimeItemSettings).fixedDefaultValue;
    //        element = value ? (dateOnly ? value.toLocaleDateString() : value.toLocaleString()) : '';
    //    }
    //    else if (itemSettings.type == PropertyIndexedType.Person) {
    //        let users = (itemSettings as PropertySetPersonItemSettings).fixedDefaultValues;
    //        element = users.map(user => this.userNames[user.uid]).filter(u => u).join(', ');
    //    }
    //    else if (itemSettings.type == PropertyIndexedType.Taxonomy) {
    //        let termIds = (itemSettings as PropertySetTaxonomyItemSettings).fixedDefaultValues;
    //        element = termIds.map(id => this.termNames[id.toString()]).filter(u => u).join(', ');
    //    }
    //    else if (itemSettings.type == PropertyIndexedType.Text) {
    //        let value = (itemSettings as PropertySetTextItemSettings).fixedDefaultValue;
    //        element = value;
    //    }
    //    return element;
    //}

    //renderDefaultValueTypeEdit(h, property: EnterprisePropertyDefinition, settings: { [id: string]: PropertySetItemSettings }) {
    //    return (
    //        <v-select item-value="id" item-text="title"
    //            items={this.defaultValueTypes}
    //            v-model={this.selectedDefaultValueTypes[property.id.toString()]}></v-select>
    //    )
    //}
    //renderDefaultValueTypeDisplay(h, property: EnterprisePropertyDefinition, settings: { [id: string]: PropertySetItemSettings }) {
    //    return this.selectedDefaultValueTypes[property.id.toString()] ? this.loc.DefaultValueTypes.FixedValue : this.loc.DefaultValueTypes.FromSiteProperty
    //}

    //renderPropertySetSettings(h, settings: { [id: string]: PropertySetItemSettings }) {
    //    let availableProperties = DocumentTypeHelper.getAvailableProperties();

    //    return (
    //        <v-data-table
    //            hide-default-footer
    //            items-per-page={Number.MAX_SAFE_INTEGER}
    //            headers={this.headers}
    //            items={availableProperties}
    //            scopedSlots={{
    //                item: (props: { item: EnterprisePropertyDefinition }) =>
    //                    <tr onClick={() => { this.selectingPropertyId = props.item.id }}>
    //                        <td>
    //                            {props.item.multilingualTitle}
    //                        </td>
    //                        <td>
    //                            {
    //                                this.selectingPropertyId == props.item.id ?
    //                                    <v-text-field persistent-hint hint={props.item.internalName} v-model={settings[this.selectingPropertyId.toString()].alternativeInternalName}></v-text-field> :
    //                                    settings[props.item.id.toString()].alternativeInternalName
    //                            }
    //                        </td>
    //                        <td>
    //                            {
    //                                this.selectingPropertyId == props.item.id ?
    //                                    this.renderDefaultValueTypeEdit(h, props.item, settings) :
    //                                    this.renderDefaultValueTypeDisplay(h, props.item, settings)
    //                            }
    //                        </td>
    //                        <td class="text-right">
    //                            {
    //                                this.selectingPropertyId == props.item.id ?
    //                                    this.renderDefaultValueEdit(h, props.item, settings) :
    //                                    this.renderDefaultValueDisplay(h, props.item, settings)
    //                            }
    //                        </td>
    //                    </tr>
    //            }}>
    //        </v-data-table>
    //    )
    //}

    //render(h) {

    //    return (
    //        <div>
    //            <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
    //                <v-toolbar-title>{this.loc.PropertySet}</v-toolbar-title>
    //                <v-spacer></v-spacer>
    //                <v-btn icon onClick={() => { this.journey().travelBack() }}>
    //                    <v-icon>close</v-icon>
    //                </v-btn>
    //            </v-toolbar>
    //            <v-divider></v-divider>
    //            <v-container>
    //                {this.renderPropertySetSettings(h, (this.editingDocumentType.settings as DocumentTypeItemSettings).propertySetItemSettings)}
    //            </v-container>
    //        </div>
    //    );
    //}
}