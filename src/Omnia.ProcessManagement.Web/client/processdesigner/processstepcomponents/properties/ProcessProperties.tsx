import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Prop } from 'vue-property-decorator';
import { Guid, EnterprisePropertyDefinition, GuidValue, PropertySetPersonItem, PropertySetTaxonomyItem, TaxonomyPropertySettings, PropertySetDateTimeItem, TenantRegionalSettings, LanguageTag, TimeFormats, MultilingualScopes, PropertyIndexedType, UserPrincipalType } from '@omnia/fx-models';
import { CurrentProcessStore, ProcessTypeStore } from '../../../fx';
import { OmniaTheming, VueComponentBase, FieldValueValidation, IValidator, IDatetimePickerFormatter } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { ProcessPropertyInfo, ProcessTextPropertyInfo, ProcessBooleanPropertyInfo, ProcessPersonPropertyInfo, PropertySetPersonItemSettings, ProcessTaxonomyPropertyInfo, ProcessDatetimePropertyInfo, ProcessTypeItemSettings, ProcessNumberPropertyInfo, ProcessReferenceData } from '../../../fx/models';
import { EnterprisePropertyStore, EnterprisePropertySetStore, MultilingualStore } from '@omnia/fx/store';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { ProcessDesignerStore } from '../../stores';

export class ProcessPropertiesTabRenderer extends TabRenderer {
    useValidator: IValidator;

    constructor(useValidator: IValidator) {
        super();
        this.useValidator = useValidator;
    }
    generateElement(h): JSX.Element {
        return (<ProcessPropertiesComponent key={Guid.newGuid().toString()} useValidator={this.useValidator}></ProcessPropertiesComponent>);
    }
}

export interface ProcessDrawingProps {
    useValidator: IValidator;
}

@Component
export class ProcessPropertiesComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>
{
    @Prop({ default: null }) useValidator: IValidator;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(OmniaContext) private omniaContext: OmniaContext;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;

    private isLoading: boolean = false;
    private taxonomyComponentKey: { [propertyId: string]: string } = {};
    private processProperties: Array<ProcessPropertyInfo> = [];
    private formatter: IDatetimePickerFormatter;
    private lcid: number = 1033;
    private contentChangedTimewatchId: string = "processstep_contentchanged_" + Utils.generateGuid();

    created() {
        this.init();
    }

    get referenceData(): ProcessReferenceData {
        return this.currentProcessStore.getters.referenceData();
    }

    init() {
        this.useValidator.register(this);
        this.isLoading = true;
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        this.formatter =
        {
            timeformat: regionalSettings ? this.getTimeFormatAsString(regionalSettings.timeFormat) : "ampm",
            locale: this.omniaContext.language,
            firstdayofweek: 1
        };
        let languageSettings = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant);
        if (languageSettings.availableLanguages.length > 0) {
            let userLanguageSettings = languageSettings.availableLanguages.find(l => l.name == (languageSettings.userPreferredLanguageTag.toLowerCase() as LanguageTag));
            if (userLanguageSettings) this.lcid = userLanguageSettings.lcid;
        }
        this.loadProcessTypeData();
    }

    getTimeFormatAsString(timeFormat: TimeFormats) {
        if (timeFormat === TimeFormats.hour24) {
            return "24hr"
        }
        return "ampm"
    }

    mounted() {

    }

    beforeDestroy() {
        this.useValidator.clearValidation();
    }

    getValue(propertyInfo: ProcessPropertyInfo) {
        let value = null;
        switch (propertyInfo.type) {
            case PropertyIndexedType.Text:
                value = (propertyInfo as ProcessTextPropertyInfo).value;
                break;
            case PropertyIndexedType.Boolean:
                value = (propertyInfo as ProcessBooleanPropertyInfo).value;
                break;
            case PropertyIndexedType.Person:
                value = (propertyInfo as ProcessPersonPropertyInfo).identities || [];
                break;
            case PropertyIndexedType.Taxonomy:
                value = (propertyInfo as ProcessTaxonomyPropertyInfo).termIds;
                break;
            case PropertyIndexedType.DateTime:
                value = (propertyInfo as ProcessDatetimePropertyInfo).value;
                break;
            case PropertyIndexedType.Number:
                value = (propertyInfo as ProcessNumberPropertyInfo).value;
                break;
        }
        return value;
    }

    onPropertiesChanged(propertyInfo: ProcessPropertyInfo) {
        let value = this.getValue(propertyInfo);
        if (this.referenceData.process.rootProcessStep.enterpriseProperties[propertyInfo.internalName] != value) {
            this.referenceData.process.rootProcessStep.enterpriseProperties[propertyInfo.internalName] = value;
            this.processDesignerStore.mutations.setHasDataChangedState.commit(true);
            Utils.timewatch(this.contentChangedTimewatchId, () => {
                this.currentProcessStore.actions.saveState.dispatch().then(() => {
                    this.processDesignerStore.mutations.setHasDataChangedState.commit(false);
                });
            }, 1500)
        }
    }

    private loadProcessTypeData() {
        let promises: Array<Promise<any>> = [
            this.propertyStore.actions.ensureLoadData.dispatch(),
            this.enterprisePropertySetStore.actions.ensureLoadAllSets.dispatch(),
            this.processTypeStore.actions.ensureProcessTypes.dispatch([this.referenceData.process.rootProcessStep.processTypeId])
        ];

        Promise.all(promises).then(() => {
            this.processProperties = [];
            let processType = this.processTypeStore.getters.byId(this.referenceData.process.rootProcessStep.processTypeId);
            if (processType) {
                let enterprisePropertySetId = (processType.settings as ProcessTypeItemSettings).enterprisePropertySetId;
                let propertySet = this.enterprisePropertySetStore.getters.enterprisePropertySets().find(s => s.id == enterprisePropertySetId)
                let availableProperties: Array<EnterprisePropertyDefinition> = this.propertyStore.getters.enterprisePropertyDefinitions();
                propertySet.settings.items.forEach(item => {
                    let property = availableProperties.find(p => p.id == item.enterprisePropertyDefinitionId);
                    if (property != null) {
                        let propertyInfo: ProcessPropertyInfo = {
                            id: property.id,
                            internalName: property.internalName,
                            title: property.multilingualTitle,
                            required: item.required,
                            type: property.enterprisePropertyDataType.indexedType
                        };
                        let value = this.referenceData.process.rootProcessStep.enterpriseProperties[property.internalName];
                        switch (propertyInfo.type) {
                            case PropertyIndexedType.Text:
                                (propertyInfo as ProcessTextPropertyInfo).value = value;
                                break;
                            case PropertyIndexedType.Boolean:
                                (propertyInfo as ProcessBooleanPropertyInfo).value = value;
                                break;
                            case PropertyIndexedType.Person:
                                (propertyInfo as ProcessPersonPropertyInfo).multiple = (item as PropertySetPersonItem).multiple;
                                (propertyInfo as ProcessPersonPropertyInfo).identities = value || [];
                                break;
                            case PropertyIndexedType.Taxonomy:
                                (propertyInfo as ProcessTaxonomyPropertyInfo).multiple = (item as PropertySetTaxonomyItem).multiple;
                                (propertyInfo as ProcessTaxonomyPropertyInfo).termIds = value;
                                (propertyInfo as ProcessTaxonomyPropertyInfo).termSetId = (property.settings as TaxonomyPropertySettings).termSetId;
                                break;
                            case PropertyIndexedType.DateTime:
                                (propertyInfo as ProcessDatetimePropertyInfo).value = value;
                                (propertyInfo as ProcessDatetimePropertyInfo).isDateOnly = (item as PropertySetDateTimeItem).dateOnly;
                                break;
                            case PropertyIndexedType.Number:
                                (propertyInfo as ProcessNumberPropertyInfo).value = value;
                                break;
                        }

                        this.processProperties.push(propertyInfo);
                    }
                });

                this.processProperties.filter(f => f.type == PropertyIndexedType.Taxonomy).forEach(f => this.taxonomyComponentKey[f.internalName] = Utils.generateGuid().toString());
            }
            this.isLoading = false;
        });
    }

    resetChildTermPickers(field: ProcessTaxonomyPropertyInfo, fields: Array<ProcessTaxonomyPropertyInfo>) {
        fields
            .filter(f => f.parentInternalName == field.internalName)
            .forEach(f => {
                f.termIds = [];
                this.$set(this.taxonomyComponentKey, f.internalName, Utils.generateGuid().toString());
                this.resetChildTermPickers(f, fields);
            });
    }


    /**
        * Render 
        * @param h
        */

    renderTextField(h, field: ProcessTextPropertyInfo, label: string) {
        return [
            <v-text-field filled={true} dark={this.omniaTheming.promoted.body.dark} label={label} v-model={field.value}
                rules={new FieldValueValidation().IsRequired(field.required).getRules()} onChange={() => { this.onPropertiesChanged(field); }}>
            </v-text-field>
        ]
    }

    renderNumberField(h, field: ProcessNumberPropertyInfo, label: string) {

        return [
            <v-text-field filled={true} type="number" dark={this.omniaTheming.promoted.body.dark} label={label} v-model={field.value}
                rules={new FieldValueValidation().IsRequired(field.required).getRules()} onChange={() => { this.onPropertiesChanged(field); }}>
            </v-text-field>
        ]
    }

    renderBooleanField(h, field: ProcessBooleanPropertyInfo) {
        if (Utils.isNullOrEmpty(field.value))
            field.value = false;
        return (
            <v-checkbox dark={this.omniaTheming.promoted.body.dark}
                label={field.title}
                input-value={field.value} onChange={(val) => { field.value = val; this.onPropertiesChanged(field); }}></v-checkbox>
        )
    }

    renderPersonField(h, field: ProcessPersonPropertyInfo) {
        return (
            <omfx-people-picker
                key={"p_" + Utils.generateGuid()}
                dark={this.omniaTheming.promoted.body.dark}
                filled
                required={field.required}
                multiple={field.multiple}
                validator={this.useValidator}
                label={field.title}
                model={field.identities}
                onModelChange={val => { field.identities = val; this.onPropertiesChanged(field); }}>
            </omfx-people-picker>
        )
    }

    renderTaxonomyField(h, field: ProcessTaxonomyPropertyInfo, label: string, fields: Array<ProcessTaxonomyPropertyInfo>) {
        let key = this.taxonomyComponentKey[field.internalName];
        let startWithIds: Array<GuidValue> = null;
        let limitLevel = field.limitLevel
        let disabled = false;
        if (field.parentInternalName) {
            let parentTermIds = fields.find(f => f.internalName == field.parentInternalName).termIds;
            if (parentTermIds && parentTermIds.length > 0) {
                startWithIds = parentTermIds;
            }
            else {
                disabled = true;
            }
        }

        return [
            <omfx-term-picker
                lcid={this.lcid}
                key={key}
                limitLevel={limitLevel}
                startWithIds={startWithIds}
                disabled={disabled}
                multi={field.multiple}
                dark={this.omniaTheming.promoted.body.dark}
                label={label}
                termSetId={field.termSetId}
                preSelectedTermIds={field.termIds}
                onTermsSelected={(model) => {
                    field.termIds = model;
                    this.resetChildTermPickers(field, fields);
                    this.onPropertiesChanged(field);
                }} ></omfx-term-picker>,
            field.required &&
            <omfx-field-validation
                useValidator={this.useValidator}
                checkValue={field.termIds}
                rules={field.required ? new FieldValueValidation().IsArrayRequired().getRules() : null}>
            </omfx-field-validation>
        ]
    }

    renderDateTimeField(h, field: ProcessDatetimePropertyInfo) {
        return [
            <omfx-date-time-picker model={field.value as any}
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                label={field.title}
                formatter={this.formatter}
                pickerMode="date"
                isRequired={field.required}
                validator={this.useValidator}
                onModelChange={(newVal) => {
                    field.value = newVal ? new Date(newVal) : null;
                    this.onPropertiesChanged(field);
                }}>
            </omfx-date-time-picker>
        ]
    }

    renderProperty(h, field: ProcessPropertyInfo, taxonomyProperties: Array<ProcessPropertyInfo>) {
        let label = field.required ? field.title + ' *' : field.title;
        switch (field.type) {
            case PropertyIndexedType.Text:
                return this.renderTextField(h, field as ProcessTextPropertyInfo, label);
            case PropertyIndexedType.Number:
                return this.renderNumberField(h, field as ProcessNumberPropertyInfo, label);
            case PropertyIndexedType.Boolean:
                return this.renderBooleanField(h, field as ProcessBooleanPropertyInfo);
            case PropertyIndexedType.Person:
                return this.renderPersonField(h, field as ProcessPersonPropertyInfo);
            case PropertyIndexedType.Taxonomy:
                return this.renderTaxonomyField(h, field as ProcessTaxonomyPropertyInfo, label, taxonomyProperties as Array<ProcessTaxonomyPropertyInfo>);
            case PropertyIndexedType.DateTime:
                return this.renderDateTimeField(h, field as ProcessDatetimePropertyInfo);
            default:
                return null;
        }
    }

    renderProperties(h) {
        let taxonomyProperties = this.processProperties.filter(p => p.type == PropertyIndexedType.Taxonomy);
        return this.processProperties.map(field => {
            return (<v-col cols="12" class="py-1">{this.renderProperty(h, field, taxonomyProperties)}</v-col>);
        })
    }

    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <v-row no-gutter class="ml-0">
                    <v-col cols="12" md="6" offset-md="3">
                        <v-row no-gutter>
                            {
                                this.isLoading ?
                                    <v-skeleton-loader
                                        loading={this.isLoading}
                                        height="320"
                                        type="table-tbody"
                                    >
                                    </v-skeleton-loader> :
                                    (this.processProperties.length == 0 ?
                                        <div>{this.loc.NoProperties}</div>
                                        :
                                        this.renderProperties(h))
                            }
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>)
    }
}

