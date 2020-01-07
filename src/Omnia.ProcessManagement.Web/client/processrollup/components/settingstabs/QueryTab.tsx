import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupLocalization } from '../../loc/localize';
import { ProcessRollupBlockSettingsStyles } from '../../../models';
import { ProcessRollupBlockData, Enums, ProcessRollupBooleanPropFilterValue, ProcessRollupPersonPropFilterValue, ProcessRollupTextPropFilterValue, ProcessRollupTaxonomyPropFilterValue, ProcessRollupDatePropFilterValue } from '../../../fx/models';
import { RollupFilter, PropertyIndexedType, UserPrincipalType, TaxonomyPropertySettings } from '@omnia/fx-models';
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { EnterprisePropertyStore, TargetingPropertyStore } from '@omnia/fx/store';

interface PropertyFilterExtension extends RollupFilter {
    removed?: boolean;
}

interface QueryTabProps {
    settingsKey: string;
}

@Component
export class QueryTab extends tsx.Component<QueryTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(TargetingPropertyStore) targetingPropertyStore: TargetingPropertyStore;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------

    rollupSettingsClasses = StyleFlow.use(ProcessRollupBlockSettingsStyles);
    blockData: ProcessRollupBlockData = null;
    isLoadingProperties: boolean = true;

    taxonomyPropertySettings: { [pageInternalName: string]: TaxonomyPropertySettings } = {};
    taxonomyPropertiesHasTargeting: { [pageInternalName: string]: boolean } = {};

    datePeriods: Array<{ id: Enums.ProcessViewEnums.DatePeriods, title: string }> = [
        { id: Enums.ProcessViewEnums.DatePeriods.OneWeekFromToday, title: this.loc.Settings.DatePeriods.OneWeekFromToday },
        { id: Enums.ProcessViewEnums.DatePeriods.TwoWeeksFromToday, title: this.loc.Settings.DatePeriods.TwoWeeksFromToday },
        { id: Enums.ProcessViewEnums.DatePeriods.OneMonthFromToday, title: this.loc.Settings.DatePeriods.OneMonthFromToday },
        { id: Enums.ProcessViewEnums.DatePeriods.EarlierThanNow, title: this.loc.Settings.DatePeriods.EarlierThanNow },
        { id: Enums.ProcessViewEnums.DatePeriods.LaterThanNow, title: this.loc.Settings.DatePeriods.LaterThanNow }
    ]
    taxonomyFilterTypes: Array<{ id: Enums.ProcessViewEnums.TaxonomyFilterType, title: string }> = [
        { id: Enums.ProcessViewEnums.TaxonomyFilterType.FixedValue, title: this.loc.Settings.TaxonomyFilterTypes.FixedValue },
        { id: Enums.ProcessViewEnums.TaxonomyFilterType.CurrentPage, title: this.loc.Settings.TaxonomyFilterTypes.CurrentPage },
    ]
    taxonomyFilterTypesWithTargeting: Array<{ id: Enums.ProcessViewEnums.TaxonomyFilterType, title: string }> = [
        { id: Enums.ProcessViewEnums.TaxonomyFilterType.FixedValue, title: this.loc.Settings.TaxonomyFilterTypes.FixedValue },
        { id: Enums.ProcessViewEnums.TaxonomyFilterType.CurrentPage, title: this.loc.Settings.TaxonomyFilterTypes.CurrentPage },
        { id: Enums.ProcessViewEnums.TaxonomyFilterType.User, title: this.loc.Settings.TaxonomyFilterTypes.User }
    ]

    get availablePropertiesForFilter() {
        return this.propertyStore.getters.omniaSearchableEnterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Boolean, PropertyIndexedType.DateTime, PropertyIndexedType.Person, PropertyIndexedType.Text, PropertyIndexedType.Taxonomy]);
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData);
            }
        });

        Promise.all(
            [
                this.propertyStore.actions.ensureLoadData.dispatch().then(() => { this.isLoadingProperties = false }),
                this.targetingPropertyStore.actions.ensureLoadData.dispatch()
            ])
            .then(() => {
                let taxonomyProperties = this.propertyStore.getters.enterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Taxonomy]);
                taxonomyProperties.forEach(p => {
                    let targetingProperties = this.targetingPropertyStore.getters.propertiesForEnterpriseProperty(p.id);
                    if (targetingProperties && targetingProperties.length > 0) {
                        this.$set(this.taxonomyPropertiesHasTargeting, p.internalName, true);
                    }

                    this.$set(this.taxonomyPropertySettings, p.internalName, p.settings)
                })
            })
    }

    updateBlockData() {
        if (!this.blockData.settings.resources || this.blockData.settings.resources.length == 0) {
            this.blockData.settings.resources.push({
                id: "",
                idProperty: "",
                filters: []
            })
        }
        this.blockData.settings.resources.forEach(p => p.filters = p.filters.filter(p => !(p as PropertyFilterExtension).removed));
        this.settingsService.setValue(this.settingsKey, this.blockData);

        this.$forceUpdate();
    }

    updateFilter(filter: RollupFilter) {
        filter.type = this.availablePropertiesForFilter.filter(p => p.internalName == filter.property)[0].enterprisePropertyDataType.indexedType as any;
        filter.valueObj = {};

        if (filter.type == PropertyIndexedType.Person)
            (filter.valueObj as ProcessRollupPersonPropFilterValue).value = [];

        this.updateBlockData();
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderPropertySelection(filter: PropertyFilterExtension) {
        let h = this.$createElement;

        return [
            <v-btn class={[this.rollupSettingsClasses.alignSelfCenter, 'mt-0 ml-0 mb-0 mr-1']} icon onClick={() => { filter.removed = true; this.updateBlockData() }}>
                <v-icon small>fa fa-times</v-icon>
            </v-btn>,
            <v-select
                loading={this.isLoadingProperties}
                class={this.rollupSettingsClasses.alignSelfCenter}
                item-value="internalName"
                item-text="multilingualTitle"
                items={this.availablePropertiesForFilter}
                v-model={filter.property}
                onChange={() => { this.updateFilter(filter) }}></v-select>
        ];
    }

    renderFilter(h, filter: RollupFilter) {
        if (!filter.property) {
            return (<div class={this.rollupSettingsClasses.filterItemWrapper}>{this.renderPropertySelection(filter)}</div>)
        }
        else if (filter.type == PropertyIndexedType.Boolean) {
            let valueObj = filter.valueObj as ProcessRollupBooleanPropFilterValue;
            return [
                <v-layout align-center>
                    {this.renderPropertySelection(filter)}
                </v-layout>,
                <div class={this.rollupSettingsClasses.filterSettings}>
                    <v-checkbox class={this.rollupSettingsClasses.checkboxFilter} input-value={valueObj.value} onChange={(val) => { valueObj.value = val; this.updateBlockData(); }}></v-checkbox>
                </div>
            ]
        }
        else if (filter.type == PropertyIndexedType.DateTime) {
            let valueObj = filter.valueObj as ProcessRollupDatePropFilterValue;
            return [<v-layout align-center>
                {this.renderPropertySelection(filter)}
            </v-layout>,
                <div class={this.rollupSettingsClasses.filterSettings}>
                <v-select class={this.rollupSettingsClasses.alignSelfCenter} item-value="id" item-text="title" items={this.datePeriods} v-model={valueObj.value} onChange={() => { this.updateBlockData() }}></v-select>
            </div>]

        }
        else if (filter.type == PropertyIndexedType.Text) {
            let valueObj = filter.valueObj as ProcessRollupTextPropFilterValue;
            return [<v-layout align-center>
                {this.renderPropertySelection(filter)}
            </v-layout>,
                <div class={this.rollupSettingsClasses.filterSettings}>
                <v-text-field v-model={valueObj.searchValue} onChange={() => { this.updateBlockData() }}></v-text-field>
            </div>]

        }
        else if (filter.type == PropertyIndexedType.Person) {
            let valueObj = filter.valueObj as ProcessRollupPersonPropFilterValue;
            return [<v-layout align-center>
                {this.renderPropertySelection(filter)}
            </v-layout>,
                <div class={this.rollupSettingsClasses.filterSettings}>
                <omfx-people-picker label=' ' showCurrentUserOption principalType={UserPrincipalType.MemberAndGuest} model={valueObj.value} onModelChange={(newVal) => { valueObj.value = newVal; this.updateBlockData() }}></omfx-people-picker>
            </div>]
        }
        else if (filter.type == PropertyIndexedType.Taxonomy) {
            let valueObj = filter.valueObj as ProcessRollupTaxonomyPropFilterValue;
            let filterTypes = this.taxonomyPropertiesHasTargeting[filter.property] ? this.taxonomyFilterTypesWithTargeting : this.taxonomyFilterTypes;
            let settings = this.taxonomyPropertySettings[filter.property];
            if (!settings && settings !== null)
                return (<div class={this.rollupSettingsClasses.filterItemWrapper}>{this.renderPropertySelection(filter)}</div>)
            else if (settings == null || !settings.termSetId)
                return (
                    <div class={this.rollupSettingsClasses.filterItemWrapper}>
                        {this.renderPropertySelection(filter)}
                        <span class="pl-2">{this.loc.Common.TermSetNotFound}</span>
                    </div>
                )
            else
                return [
                    <v-layout align-center>
                        {this.renderPropertySelection(filter)}
                    </v-layout>,
                    <div class={this.rollupSettingsClasses.filterSettings}>
                        <v-select class={this.rollupSettingsClasses.alignSelfCenter} item-value="id" item-text="title" items={filterTypes} v-model={valueObj.filterType} onChange={() => { valueObj.fixedTermIds = []; this.updateBlockData(); }}></v-select>
                    </div>,
                    valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.FixedValue ?
                        <div class={this.rollupSettingsClasses.taxonomyFilterMargin}>
                            <omfx-term-picker
                                termSetId={settings.termSetId}
                                preSelectedTermIds={valueObj.fixedTermIds}
                                multi={true}
                                lcid={1033}
                                onTermsSelected={(ids) => { valueObj.fixedTermIds = ids; this.updateBlockData(); }}
                            ></omfx-term-picker>
                        </div>
                        : null,
                    valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.User ?
                        <v-checkbox hide-details class={[this.rollupSettingsClasses.taxonomyFilterMargin, "mt-0"]} input-value={valueObj.includeChildTerms} onChange={(val) => { valueObj.includeChildTerms = val; this.updateBlockData(); }} label={this.loc.Settings.IncludeChildTerms}></v-checkbox>
                        : null,
                    valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.FixedValue || valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.User ?
                        <v-checkbox hide-details class={[this.rollupSettingsClasses.taxonomyFilterMargin, "mt-0 pb-4"]} input-value={valueObj.includeEmpty} onChange={(val) => { valueObj.includeEmpty = val; this.updateBlockData(); }} label={this.loc.Settings.IncludeEmpty}></v-checkbox>
                        : null
                ]

        }
    }

    renderFilters(h, filters: Array<PropertyFilterExtension>) {
        return (
            <div class={'pb-4'}>
                {
                    filters.map(filter => !filter.removed ? this.renderFilter(h, filter) : null)
                }
                <a onClick={() => { filters.push({} as RollupFilter); this.updateBlockData(); }} class={this.rollupSettingsClasses.pointer}>{this.loc.Settings.AddFilter}</a>
            </div>
        );
    }

    renderQueryTab(h) {
        return (
            <div>
                <v-radio-group hide-details class="ma-0" name="queryscope" v-model={this.blockData.settings.searchScope} onChange={() => { this.updateBlockData(); }}>
                    <v-radio onChange={() => { this.blockData.settings.searchScope = Enums.ProcessViewEnums.QueryScope.PublishedProcesses }}
                        label={this.loc.Settings.QueryScope.PublishedProcesses} value={Enums.ProcessViewEnums.QueryScope.PublishedProcesses}></v-radio>
                    <v-radio onChange={() => { this.blockData.settings.searchScope = Enums.ProcessViewEnums.QueryScope.ArchivedProcesses }}
                        label={this.loc.Settings.QueryScope.ArchivedProcesses} value={Enums.ProcessViewEnums.QueryScope.ArchivedProcesses}></v-radio>
                </v-radio-group>
                {this.blockData.settings.resources && this.blockData.settings.resources.length > 0 && this.renderFilters(h, this.blockData.settings.resources[0].filters)}
            </div>
        );
    }

    render(h) {
        return (
            <div>
                {this.blockData ? this.renderQueryTab(h) : null}
            </div>
        )
    }
}