import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupLocalization } from '../../loc/localize';
import { ProcessRollupBlockSettingsStyles } from '../../../models';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessRollupBlockData, ProcessRollupFilter, Enums, ProcessRollupDatePeriodsPropFilterValue } from '../../../fx/models';
import { TaxonomyPropertySettings, PropertyIndexedType, BuiltInAppInstanceInternalNames, BuiltInEnterprisePropertyInternalNames, RollupOtherTypes, EnterprisePropertyDefinition, UserPrincipalType, PersonPropFilterValue, TaxonomyPropFilterValue, TextPropFilterValue, BooleanPropFilterValue } from '@omnia/fx-models';
import { ProcessRollupConstants } from '../../../fx';

interface UIFilterExtension extends ProcessRollupFilter {
    removed?: boolean;
    hidden?: boolean;
}

interface FilterTabProps {
    settingsKey: string;
}

@Component
export class FilterTab extends tsx.Component<FilterTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessRollupBlockData>;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------

    rollupSettingsClasses = StyleFlow.use(ProcessRollupBlockSettingsStyles);
    blockData: ProcessRollupBlockData = null;
    taxonomyPropertySettings: { [pageInternalName: string]: TaxonomyPropertySettings } = {};
    isLoadingProperties: boolean = true;

    //This is datetime picker formatter , TO DO ?!
    formatter = {
        timeformat: 'ampm',
        locale: 'en-us',
        firstdayofweek: 1
    };

    booleanFilterOptions: Array<{ id: Enums.ProcessViewEnums.BooleamFilterOption, title: string }> = [
        { id: Enums.ProcessViewEnums.BooleamFilterOption.Yes, title: this.loc.Settings.BooleanFilterOption.Yes },
        { id: Enums.ProcessViewEnums.BooleamFilterOption.No, title: this.loc.Settings.BooleanFilterOption.No }
    ]
    modifyFilterMode: boolean = false;
    datePeriods: Array<{ id: Enums.ProcessViewEnums.DatePeriods, title: string }> = [
        { id: Enums.ProcessViewEnums.DatePeriods.OneWeekFromToday, title: this.loc.Settings.DatePeriods.OneWeekFromToday },
        { id: Enums.ProcessViewEnums.DatePeriods.TwoWeeksFromToday, title: this.loc.Settings.DatePeriods.TwoWeeksFromToday },
        { id: Enums.ProcessViewEnums.DatePeriods.OneMonthFromToday, title: this.loc.Settings.DatePeriods.OneMonthFromToday }
    ]

    get availablePropertiesForSearchBoxFilter() {
        return this.propertyStore.getters.omniaSearchableEnterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Text, PropertyIndexedType.RichText])
            .filter(i => i.internalName != BuiltInEnterprisePropertyInternalNames.Title);
    }
    get availablePropertiesForUIFilter() {
        let properties = this.propertyStore.getters
            .omniaSearchableEnterprisePropertyDefinitionsByIndexedTypes(
                [PropertyIndexedType.Person, PropertyIndexedType.Boolean, PropertyIndexedType.DateTime, PropertyIndexedType.Person, PropertyIndexedType.Text, PropertyIndexedType.Taxonomy]);

        properties.push({
            internalName: ProcessRollupConstants.searchBoxInternalName,
            multilingualTitle: this.loc.Settings.FilterOption.Searchbox,
            enterprisePropertyDataType: { indexedType: RollupOtherTypes.TextSearches }
        } as any);

        return properties
    }

    created() {
        this.propertyStore.actions.ensureLoadData.dispatch().then(() => {

            let taxonomyProperties = this.propertyStore.getters.enterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Taxonomy]);
            taxonomyProperties.forEach(p => {
                this.$set(this.taxonomyPropertySettings, p.internalName, p.settings)
            })


            this.isLoadingProperties = false;
        })

        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData); //remove reference
            }

        });
    }

    updateBlockData() {
        this.blockData.settings.uiFilters = this.blockData.settings.uiFilters.filter(u => !(u as UIFilterExtension).removed);
        this.settingsService.setValue(this.settingsKey, this.blockData);
        this.$forceUpdate();
    }

    switchIndex(index1: number, index2: number) {
        let property1 = this.blockData.settings.uiFilters[index1];
        this.blockData.settings.uiFilters[index1] = this.blockData.settings.uiFilters[index2];
        this.blockData.settings.uiFilters[index2] = property1;

        this.updateBlockData();
    }

    onChangeUiFilter(filter: ProcessRollupFilter) {
        let contentPropertyDefinition = this.availablePropertiesForUIFilter.filter(p => p.internalName == filter.property)[0].enterprisePropertyDataType;
        filter.type = contentPropertyDefinition ? contentPropertyDefinition.indexedType as any : null;
        filter.valueObj = {};

        if (filter.type === PropertyIndexedType.Person) {
            (filter.valueObj as PersonPropFilterValue).value = [];
        }
        else if (filter.type === PropertyIndexedType.Taxonomy) {
            (filter.valueObj as TaxonomyPropFilterValue).fixedTermIds = [];
        }

        this.updateBlockData();
    }

    addUIFilter() {
        if (!this.blockData.settings.uiFilters)
            this.blockData.settings.uiFilters = [];

        let emptyUIFilter = this.blockData.settings.uiFilters.filter(p => !p.property)[0];
        if (!emptyUIFilter) {
            this.blockData.settings.uiFilters.push({ property: "", type: null, valueObj: null });
        }
        this.$forceUpdate();
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderOrderFilterUI(filter: ProcessRollupFilter, index: number, title: string) {
        let h = this.$createElement;
        let showDownDisabled = index === this.blockData.settings.uiFilters.length - 1;
        let showUpDisabled = index === 0;

        return (
            <v-layout align-center>
                <v-flex>{title}</v-flex>
                <v-btn disabled={showUpDisabled} class="ma-0" icon onClick={() => { !showUpDisabled && this.switchIndex(index, index - 1) }}>
                    <v-icon small>fa fa-chevron-up</v-icon>
                </v-btn>
                <v-btn disabled={showDownDisabled} class="ma-0" icon onClick={() => { !showDownDisabled && this.switchIndex(index, index + 1) }}>
                    <v-icon small>fa fa-chevron-down</v-icon>
                </v-btn>
            </v-layout>
        )

    }

    renderTextDefaultValueInput(filter: UIFilterExtension, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;
        let valueObj = filter.valueObj as TextPropFilterValue;

        return [
            <v-layout align-center>
                {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
            </v-layout>,
            <div class={this.rollupSettingsClasses.filterSettings}>
                <v-text-field v-model={valueObj.value} type="text" onChange={() => { this.updateBlockData(); }}></v-text-field>
            </div>,
            <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                <v-checkbox
                    label={this.loc.Settings.HideFilter}
                    input-value={filter.hidden}
                    onChange={(event) => { filter.hidden = event; this.updateBlockData(); }}>
                </v-checkbox>
            </v-layout>
        ]
    }

    renderBooleanDefaultValueInput(filter: UIFilterExtension, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;
        let valueObj = filter.valueObj as BooleanPropFilterValue;

        return [
            <v-layout align-center>
                {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
                <span class="mr-2" >=</span>
                <v-select clearable item-value="id" item-text="title" items={this.booleanFilterOptions} v-model={valueObj.value} onChange={() => { this.updateBlockData() }}></v-select>
            </v-layout>,
            <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                <v-checkbox
                    label={this.loc.Settings.HideFilter}
                    input-value={filter.hidden}
                    onChange={(event) => { filter.hidden = event; this.updateBlockData(); }}>
                </v-checkbox>
            </v-layout>
        ]

    }

    renderPersonDefaultValueInput(filter: UIFilterExtension, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;
        let valueObj = filter.valueObj as PersonPropFilterValue;

        return [
            <v-layout align-center>
                {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
            </v-layout>,
            <div class={this.rollupSettingsClasses.filterSettings}>
                <omfx-people-picker label=' ' showCurrentUserOption
                    principalType={UserPrincipalType.MemberAndGuest} model={valueObj.value}
                    onModelChange={(newVal) => { valueObj.value = newVal; this.updateBlockData() }}></omfx-people-picker>
            </div>,
            <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                <v-checkbox
                    label={this.loc.Settings.HideFilter}
                    input-value={filter.hidden}
                    onChange={(event) => { filter.hidden = event; this.updateBlockData(); }}>
                </v-checkbox>
            </v-layout>
        ]
    }

    renderTaxonomyDefaultValueInput(filter: UIFilterExtension, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;
        let valueObj = filter.valueObj as TaxonomyPropFilterValue;
        let settings = this.taxonomyPropertySettings[filter.property];

        if (!settings || !settings.termSetId)
            return [
                <v-layout align-center>
                    {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
                    {settings === null || !settings.termSetId ? <span class="pl-2">{this.loc.Common.TermSetNotFound}</span> : null}
                </v-layout>,
                <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                    <v-checkbox
                        label={this.loc.Settings.HideFilter}
                        input-value={filter.hidden}
                        onChange={(event) => { filter.hidden = event; this.updateBlockData(); }}>
                    </v-checkbox>
                </v-layout>
            ]
        else
            return [
                <v-layout align-center>
                    {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
                </v-layout>,
                <div class={this.rollupSettingsClasses.filterSettings}>
                    <omfx-term-picker
                        termSetId={settings.termSetId}
                        preSelectedTermIds={valueObj.fixedTermIds}
                        multi={true}
                        lcid={1033}
                        onTermsSelected={(ids) => { valueObj.fixedTermIds = ids; this.updateBlockData(); }}></omfx-term-picker>
                </div>,
                <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                    <v-checkbox
                        label={this.loc.Settings.HideFilter}
                        input-value={filter.hidden}
                        onChange={(event) => { filter.hidden = event; this.updateBlockData(); }}>
                    </v-checkbox>
                </v-layout>
            ]
    }

    renderDateDefaultValueInput(filter: ProcessRollupFilter, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;
        let valueObj: ProcessRollupDatePeriodsPropFilterValue = filter.valueObj as ProcessRollupDatePeriodsPropFilterValue;
        return [
            <v-layout align-center>
                {this.renderPropertySelection(filter, availablePropertiesForUIFilter)}
            </v-layout>,
            <div class={this.rollupSettingsClasses.filterSettings}>
                <v-select item-value="id" item-text="title" items={this.datePeriods} clearable
                    v-model={valueObj.datePeriods} onChange={() => { this.updateBlockData() }}></v-select>
            </div>,
            <v-layout class={this.rollupSettingsClasses.hiddenCheckBox}>
                <v-checkbox
                    label={this.loc.Settings.HideFilter}
                    input-value={(filter as UIFilterExtension).hidden}
                    onChange={(event) => { (filter as UIFilterExtension).hidden = event; this.updateBlockData(); }}>
                </v-checkbox>
            </v-layout>
        ]
    }

    renderPropertySelection(filter: UIFilterExtension, availablePropertiesForUIFilter: EnterprisePropertyDefinition[]) {
        let h = this.$createElement;

        return [
            <v-btn class={[this.rollupSettingsClasses.alignSelfCenter, 'mt-0 ml-0 mb-0 mr-1']} icon onClick={(event) => { (filter as UIFilterExtension).removed = true; this.updateBlockData(); }}>
                <v-icon small>fa fa-times</v-icon>
            </v-btn>,
            <v-select loading={this.isLoadingProperties} item-value="internalName" item-text="multilingualTitle" items={availablePropertiesForUIFilter} v-model={filter.property} onChange={() => { this.onChangeUiFilter(filter) }}></v-select>
        ]
    }

    renderFilterTab() {
        let h = this.$createElement;
        let availablePropertiesForUIFilter = this.availablePropertiesForUIFilter;
        let propertyTitleAsHash: { [internalName: string]: string } = {};

        availablePropertiesForUIFilter.forEach(f => propertyTitleAsHash[f.internalName] = f.multilingualTitle);

        return (
            <div>
                {
                    this.blockData.settings.uiFilters && this.blockData.settings.uiFilters.filter(filter => !(filter as UIFilterExtension).removed).map((filter, index) =>
                        this.modifyFilterMode ? this.renderOrderFilterUI(filter, index, propertyTitleAsHash[filter.property]) :
                            !filter.property ? <v-layout align-center>{this.renderPropertySelection(filter, availablePropertiesForUIFilter)}</v-layout> :
                                filter.type === PropertyIndexedType.Text || filter.type === RollupOtherTypes.TextSearches ? this.renderTextDefaultValueInput(filter, availablePropertiesForUIFilter) :
                                    filter.type === PropertyIndexedType.Boolean ? this.renderBooleanDefaultValueInput(filter, availablePropertiesForUIFilter) :
                                        filter.type === PropertyIndexedType.DateTime ? this.renderDateDefaultValueInput(filter, availablePropertiesForUIFilter) :
                                            filter.type === PropertyIndexedType.Person ? this.renderPersonDefaultValueInput(filter, availablePropertiesForUIFilter) :
                                                filter.type === PropertyIndexedType.Taxonomy ? this.renderTaxonomyDefaultValueInput(filter, availablePropertiesForUIFilter) : null


                    )
                }
                <div class={this.rollupSettingsClasses.filterActionWrapper}>
                    {
                        this.modifyFilterMode ? null : <a onClick={() => { this.addUIFilter() }}>{this.loc.Settings.AddFilter} </a>
                    }
                    {
                        this.blockData.settings.uiFilters && this.blockData.settings.uiFilters.length > 0 ?
                            <a class={this.rollupSettingsClasses.floatRight} onClick={() => { this.modifyFilterMode = !this.modifyFilterMode; }}>{this.modifyFilterMode ? this.loc.Common.Done : this.loc.Settings.AdjustFilters}</a> : null
                    }
                </div>
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {this.blockData ? this.renderFilterTab() : null}
            </div>
        )
    }
}