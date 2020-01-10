import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Utils, Inject } from '@omnia/fx';
import {
    ProcessRollupFilter, Enums, ProcessRollupBooleanPropFilterValue, ProcessRollupTextPropFilterValue, ProcessRollupUISearchboxFilterValue,
    ProcessRollupTaxonomyPropFilterValue, ProcessRollupPersonPropFilterValue, ProcessRollupDatePeriodsPropFilterValue
} from '../../fx/models';
import { EnterprisePropertyDefinition, TaxonomyPropertySettings, PropertyIndexedType, UserPrincipalType, RollupOtherTypes } from '@omnia/fx-models';
import { ProcessRollupLocalization } from '../loc/localize';
import { EnterprisePropertyStore, MultilingualStore } from '@omnia/fx/store';
import { UserService } from '@omnia/fx/services';
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupBlockStyles } from '../../models';

declare var moment: any;

export interface FilterExtension extends ProcessRollupFilter {
    hidden?: boolean;
}

export interface SearchBoxFilterExtension extends FilterExtension {
    othersManagedProperties: Array<string>
}

interface FilterComponentProps {
    isLoadingData: boolean;
    uiFilters: Array<FilterExtension>
    updateUIQueryFilters: () => void;
}

@Component
export class FilterComponent extends tsx.Component<FilterComponentProps>
{
    @Prop() isLoadingData: boolean;
    @Prop() uiFilters: Array<ProcessRollupFilter>;
    @Prop() updateUIQueryFilters: () => void;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(UserService) userService: UserService;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;

    taxonomyPropertySettings: { [pageInternalName: string]: TaxonomyPropertySettings } = {};
    private processRollupClasses = StyleFlow.use(ProcessRollupBlockStyles);
    //TO DO ?!
    formatter = {
        timeformat: 'ampm',
        locale: 'en-us',
        firstdayofweek: 1
    };

    booleanFilterOptions: Array<{ id: Enums.ProcessViewEnums.BooleamFilterOption, title: string }> = [
        { id: Enums.ProcessViewEnums.BooleamFilterOption.Yes, title: this.loc.Settings.BooleanFilterOption.Yes },
        { id: Enums.ProcessViewEnums.BooleamFilterOption.No, title: this.loc.Settings.BooleanFilterOption.No }
    ]


    created() {
        let taxonomyProperties = this.propertyStore.getters.enterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Taxonomy]);
        taxonomyProperties.forEach(p => {
            this.$set(this.taxonomyPropertySettings, p.internalName, p.settings)
        })
    }

    onUpdateFilter() {
        this.updateUIQueryFilters();
    }


    getContentPropertyTitle() {
        let title: { [internalName: string]: string } = {};

        let properties = this.propertyStore.getters.enterprisePropertyDefinitions();
        if (properties)
            properties.forEach(p => title[p.internalName] = p.multilingualTitle);

        return title
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderBooleanFilter(filter: ProcessRollupFilter, label: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupBooleanPropFilterValue = filter.valueObj as ProcessRollupBooleanPropFilterValue;
        return (
            <div class={[this.processRollupClasses.uiFilterItem, 'mr-2']}>
                <v-select disabled={this.isLoadingData} clearable item-value="id" item-text="title" items={this.booleanFilterOptions} v-model={valueObj.value} label={label} onChange={() => { this.onUpdateFilter() }}></v-select>
            </div>
        )
    }

    renderTextFilter(filter: ProcessRollupFilter, label?: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupTextPropFilterValue = filter.valueObj as ProcessRollupTextPropFilterValue;

        return (
            <div class={[this.processRollupClasses.uiFilterItem, 'mr-2']}>
                <v-text-field label={label} disabled={this.isLoadingData} v-model={valueObj.searchValue} append-icon={label ? '' : 'search'} onChange={() => { this.onUpdateFilter() }}></v-text-field>
            </div>
        )
    }
    renderSearchBoxFilter(filter: ProcessRollupFilter, label?: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupUISearchboxFilterValue = filter.valueObj as ProcessRollupUISearchboxFilterValue;

        return (
            <div class={[this.processRollupClasses.uiFilterItem, 'mr-2']}>
                <v-text-field label={label} disabled={this.isLoadingData} v-model={valueObj.searchValue} append-icon={label ? '' : 'search'} onChange={() => { this.onUpdateFilter() }}></v-text-field>
            </div>
        )
    }

    renderTaxonomyFilter(filter: ProcessRollupFilter, title: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupTaxonomyPropFilterValue = filter.valueObj as ProcessRollupTaxonomyPropFilterValue;
        let settings = this.taxonomyPropertySettings[filter.property];

        if (settings && settings.termSetId)
            return (
                <div class={['mr-2', this.processRollupClasses.uiFilterItem]}>
                    <omfx-term-picker
                        termSetId={settings.termSetId}
                        preSelectedTermIds={valueObj.fixedTermIds}
                        multi={true}
                        label={title}
                        lcid={1033}
                        onTermsSelected={(ids) => { valueObj.fixedTermIds = ids; this.onUpdateFilter() }}
                    ></omfx-term-picker>
                </div>
            )
        else
            return null;
    }

    renderPersonFilter(filter: ProcessRollupFilter, title: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupPersonPropFilterValue = filter.valueObj as ProcessRollupPersonPropFilterValue;

        let hasValue = valueObj.value[0];

        return (
            <div class={['mr-2', this.processRollupClasses.uiFilterItem]}>
                <omfx-people-picker label={title} principalType={UserPrincipalType.MemberAndGuest} model={valueObj.value}
                    onModelChange={(newVal) => { valueObj.value = newVal; this.onUpdateFilter() }}></omfx-people-picker>
            </div>
        )
    }

    renderDateFilter(filter: ProcessRollupFilter, title: string) {
        let h = this.$createElement;
        let valueObj: ProcessRollupDatePeriodsPropFilterValue = filter.valueObj as ProcessRollupDatePeriodsPropFilterValue;
        return (
            <div class={[this.processRollupClasses.uiFilterDateTimeItem, 'mr-2']}>
                <v-layout align-center>
                    <omfx-date-time-picker class={this.processRollupClasses.uiFilterDateTimePicker} model={valueObj.fromDateStr}
                        label={title}
                        formatter={this.formatter}
                        pickerMode="date"
                        disabled={this.isLoadingData}
                        onModelChange={(newVal) => {
                            if (valueObj.fromDateStr != newVal) {
                                valueObj.fromDateStr = newVal;
                                valueObj.value = null;
                                this.onUpdateFilter();
                            }
                        }}>
                    </omfx-date-time-picker>
                    <span class="mr-2">-</span>
                    <omfx-date-time-picker class={this.processRollupClasses.uiFilterDateTimePicker} model={valueObj.toDateStr}
                        formatter={this.formatter}
                        pickerMode="date"
                        disabled={this.isLoadingData}
                        onModelChange={(newVal) => {
                            if (valueObj.toDateStr != newVal) {
                                valueObj.toDateStr = newVal;
                                valueObj.value = null;
                                this.onUpdateFilter();
                            }
                        }}>
                    </omfx-date-time-picker>
                </v-layout>
            </div>
        )
    }


    render(h) {
        let propertyTitles = this.getContentPropertyTitle();
        if (!this.uiFilters || this.uiFilters.length === 0) return null;

        return (
            <v-layout align-end wrap>
                {
                    this.uiFilters.filter(filter => !(filter as FilterExtension).hidden).map(filter => {
                        return filter.type === PropertyIndexedType.Text ?
                            this.renderTextFilter(filter, propertyTitles[filter.property]) :
                            filter.type === RollupOtherTypes.TextSearches ?
                                this.renderSearchBoxFilter(filter, propertyTitles[filter.property]) :
                                filter.type === PropertyIndexedType.Boolean ?
                                    this.renderBooleanFilter(filter, propertyTitles[filter.property]) :
                                    filter.type === PropertyIndexedType.DateTime ?
                                        this.renderDateFilter(filter, propertyTitles[filter.property]) :
                                        filter.type === PropertyIndexedType.Person ?
                                            this.renderPersonFilter(filter, propertyTitles[filter.property]) :
                                            filter.type === PropertyIndexedType.Taxonomy ?
                                                this.renderTaxonomyFilter(filter, propertyTitles[filter.property]) : null
                    })
                }
            </v-layout>
        )
    }
}