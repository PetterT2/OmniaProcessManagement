import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, ScrollPagingUtils, Utils, WebUtils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessRollupBlockStyles } from '../../models';
import { ProcessRollupLocalization } from '../loc/localize';
import { MultilingualStore, EnterprisePropertyStore, TargetingPropertyStore } from '@omnia/fx/store';
import { ProcessRollupBlockData, Enums, ProcessRollupFilter, RollupProcess, ProcessRollupViewRegistration, ProcessRollupDatePeriodsPropFilterValue } from '../../fx/models';
import { PropertyIndexedType, SpacingSettings, IMessageBusSubscriptionHandler, OmniaUserContext, Guid, RollupSetting, RollupFilter, RollupFilterValue, Constants, TaxonomyPropFilterValue, RollupOtherTypes, GuidValue, TargetingPropertyFlatResult, TargetingPropertyQuery, TextPropFilterValue, PersonPropFilterValue } from '@omnia/fx-models';
import { FilterComponent } from './FilterComponent';
import { ProcessRollupService } from '../../fx';
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupConfigurationFactory } from '../factory/ProcessRollupConfigurationFactory';
import { OPMPublicTopics } from '../../fx/messaging';
import { PublishingAppDefaultScrollElementClass, CurrentPageStore } from '@omnia/wcm';
import { VersionedPageData, PlainPageData } from '@omnia/wcm/models';
import './ProcessRollup.css';

@Component
export class ProcessRollupComponent extends Vue implements IWebComponentInstance {
    @Prop({ default: "" }) settingsKey: string;
    @Prop() styles: typeof ProcessRollupBlockStyles | any;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;

    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;
    @Inject(CurrentPageStore) currentPageStore: CurrentPageStore;
    @Inject(TargetingPropertyStore) targetingPropertyStore: TargetingPropertyStore;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------
    timewatchUniqueKey: string = Utils.generateGuid();
    componentUniqueKey: string = Utils.generateGuid();

    lastSettings: string;
    blockData: ProcessRollupBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    userContext: OmniaUserContext = null;

    processes: Array<RollupProcess> = [];
    currentPage: number = 1;
    isLoading: boolean = false;
    noNextPage: boolean = false;
    uiFilters: Array<ProcessRollupFilter> = [];
    registeredViewElemMsg: { [id: string]: string } = {};
    currentVersionedPageData: VersionedPageData<PlainPageData> = null;
    targetingData: Array<TargetingPropertyFlatResult> = [];
    currentLoginName: string = '';
    prepareTargetingDataRejector: () => void = null;

    errorMsg: string = '';
    total = 0;

    processRollupClasses = StyleFlow.use(ProcessRollupBlockStyles, this.styles);

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler) this.subscriptionHandler.unsubscribe();
    }

    created() {
        this.init();
    }

    init() {
        Promise.all([
            this.omniaContext.user,
            this.enterprisePropertyStore.actions.ensureLoadData.dispatch()
        ]).then((results) => {
            this.currentLoginName = results[0].loginName;
            this.subscriptionHandler = OPMPublicTopics.registerProcessRollupView.subscribe(this.registerProcessRollupView);

            if (this.currentPageStore.getters.state) {
                this.currentVersionedPageData = this.currentPageStore.getters.state.currentVersion.versionData;
            }
            this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-process-rollup-settings");
            this.settingsService.getValue(this.settingsKey).then((blockData) => {
                this.subscriptionHandler.add(this.settingsService
                    .onKeyValueUpdated(this.settingsKey)
                    .subscribe(this.setBlockData));

                if (blockData) {
                    this.setBlockData(blockData);
                }
                else {
                    this.settingsService.setValue(this.settingsKey, ProcessRollupConfigurationFactory.create());
                }

            });
        });
    }

    setBlockData(blockData: ProcessRollupBlockData) {
        if (JSON.stringify(blockData) != JSON.stringify(this.lastSettings)) {
            this.targetingData = [];

            Promise.all([
                this.prepareTargetingData(blockData).then((targetingData) => { this.targetingData = targetingData }),
            ]).then(() => {
                this.blockData = Utils.clone(blockData);
                this.lastSettings = JSON.stringify(this.blockData);
                this.initUIFilters();
                this.getData(1);

                //Ensure the view component is re-rendered
                this.componentUniqueKey = Utils.generateGuid();
                this.$forceUpdate();
            }).catch(() => { })
        }
    }

    initUIFilters() {
        this.uiFilters = this.blockData.settings.uiFilters ? Utils.clone(this.blockData.settings.uiFilters) : [];
        this.uiFilters.forEach(filter => this.resolveRollupFilter(filter));
    }

    prepareTargetingData(blockData: ProcessRollupBlockData): Promise<Array<TargetingPropertyFlatResult>> {
        if (this.prepareTargetingDataRejector) this.prepareTargetingDataRejector();
        return new Promise((resolve, reject) => {
            this.prepareTargetingDataRejector = reject;
            let queries: Array<TargetingPropertyQuery> = [];
            let contentProperties = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions()
                .filter(p => p.enterprisePropertyDataType.indexedType == PropertyIndexedType.Taxonomy);
            blockData.settings.resources.forEach(resource => {
                resource.filters.filter(f =>
                    f.type == PropertyIndexedType.Taxonomy &&
                    f.valueObj && (f.valueObj as TaxonomyPropFilterValue).filterType == Enums.ProcessViewEnums.TaxonomyFilterType.User)
                    .forEach(f => {
                        let property = contentProperties.find(p => p.internalName == f.property);
                        if (property) {
                            let includeChildTerms = (f.valueObj as TaxonomyPropFilterValue).includeChildTerms;
                            if (!queries.find(q => q.enterprisePropertyDefinitionId == property.id && (q.includeChildTerms && includeChildTerms || !q.includeChildTerms && !includeChildTerms)))
                                queries.push({ enterprisePropertyDefinitionId: property.id, includeChildTerms: includeChildTerms })
                        }
                    })
            })

            if (queries.length > 0) {
                this.targetingPropertyStore.actions.ensureUserTargetingResult.dispatch().then((result) => {
                    if (result) {
                        let targetingData = this.targetingPropertyStore.getters.userTargetingResult(queries);
                        resolve(targetingData);
                    }
                    else {
                        reject();
                    }
                }).catch(reject);
            }
            else {
                resolve();
            }
        })
    }

    registerProcessRollupView(msg: ProcessRollupViewRegistration) {
        if (msg) {
            msg.id = new Guid(msg.id.toString().toLowerCase());
            this.registeredViewElemMsg[msg.id.toString()] = msg.viewElement;

            //force update if the processes already loaded
            if (this.processes) this.$forceUpdate();
        }
    }

    isComponentEmtpy() {
        return !this.blockData ||
            !this.blockData.settings.resources ||
            this.blockData.settings.resources.length == 0;
    }

    pagingNumberChanged(pageNumber: number) {
        if (this.isLoading) return;
        this.getData(pageNumber);
    }

    generateFilters(filters: Array<ProcessRollupFilter>) {
        let queryFilters: Array<ProcessRollupFilter> = [];
        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                let fil = this.resolveRollupFilter(filter);
                if (fil) queryFilters.push(fil);
            });
        }
        return queryFilters;
    }

    resolveRollupFilter(uiFilter: ProcessRollupFilter) {
        switch (uiFilter.type) {
            case PropertyIndexedType.Text:
            case RollupOtherTypes.TextSearches:
                let textValue = (uiFilter.valueObj as TextPropFilterValue).value;
                if (!textValue || !(textValue.trim())) return null;

                return uiFilter;
            case PropertyIndexedType.Taxonomy:
                uiFilter.valueObj = this.resolveTaxonamyFilter(uiFilter);
                let taxValue = uiFilter.valueObj as TaxonomyPropFilterValue;
                if (Utils.isArrayNullOrEmpty(taxValue.fixedTermIds)) return null;
                break;
            case PropertyIndexedType.Person:
                let perValue = uiFilter.valueObj as PersonPropFilterValue;
                if (Utils.isArrayNullOrEmpty(perValue.value)) return null;
                if (!Utils.isArrayNullOrEmpty(perValue.value) && perValue.value[0].uid == Constants.ux.components.peoplePicker.currentUserId)
                    perValue.value[0].uid = this.currentLoginName;
                break;
            case PropertyIndexedType.DateTime:
                let value: ProcessRollupDatePeriodsPropFilterValue = uiFilter.valueObj as ProcessRollupDatePeriodsPropFilterValue;
                if (value.datePeriods == null && value.fromDate == null && value.toDate == null) {
                    return null;
                }
                uiFilter.valueObj = this.resolveDateFilter(uiFilter);

                break;

            default:
                if (Utils.isNullOrEmpty((uiFilter.valueObj as any).value)) {
                    return null;
                }
                break;
        }
        return uiFilter;
    }

    resolveDateFilter(filter: ProcessRollupFilter): RollupFilterValue {
        let value: ProcessRollupDatePeriodsPropFilterValue = filter.valueObj as ProcessRollupDatePeriodsPropFilterValue;
        let fromDate = value.fromDate ? value.fromDate.toString() : '';
        let toDate = value.toDate ? value.toDate.toString() : '';;
        if (value.datePeriods) {
            let currentDate = new Date();
            if (value.datePeriods == Enums.ProcessViewEnums.DatePeriods.OneWeekFromToday) {
                currentDate.setDate(currentDate.getDate() - 6);
                fromDate = this.generateFromDateFilter(currentDate, false);
                toDate = this.generateFromDateFilter(new Date(), false);
            }
            else if (value.datePeriods == Enums.ProcessViewEnums.DatePeriods.TwoWeeksFromToday) {
                currentDate.setDate(currentDate.getDate() - 13);
                fromDate = this.generateFromDateFilter(currentDate, false);
                toDate = this.generateFromDateFilter(new Date(), false);
            }
            else if (value.datePeriods == Enums.ProcessViewEnums.DatePeriods.OneMonthFromToday) {
                currentDate.setMonth(currentDate.getMonth() - 1);
                fromDate = this.generateFromDateFilter(currentDate, false);
                toDate = this.generateFromDateFilter(new Date(), false);
            }
            else if (value.datePeriods == Enums.ProcessViewEnums.DatePeriods.EarlierThanNow) {
                fromDate = this.generateFromDateFilter(null, true);
                toDate = this.generateFromDateFilter(currentDate, true);
            }
            else if (value.datePeriods == Enums.ProcessViewEnums.DatePeriods.LaterThanNow) {
                fromDate = this.generateFromDateFilter(currentDate, true);
                toDate = this.generateFromDateFilter(null, true);
            }
        }

        value.fromDate = fromDate ? new Date(fromDate) : null;
        value.toDate = toDate ? new Date(toDate) : null;

        return value;
    }

    generateFromDateFilter(from: Date, filterOnDateTime?: boolean): string {
        if (from) {
            from = new Date(from);
            if (!filterOnDateTime) {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
            }

            let fromDateQueryValue = from.toISOString();
            return fromDateQueryValue;
        }
    }

    resolveTaxonamyFilter(filter: ProcessRollupFilter): RollupFilterValue {
        let valueObj: TaxonomyPropFilterValue = filter.valueObj as TaxonomyPropFilterValue;
        if (valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.FixedValue) {
            valueObj.fixedTermIds = this.generateTaxonomyFilter(valueObj.fixedTermIds, valueObj.includeEmpty);
        }
        else if (valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.CurrentPage) {
            let contentPropertyName = this.getContentPropertyInternalName(filter.property);
            valueObj.fixedTermIds = this.generateTaxonomyFilter(this.currentVersionedPageData.pageData.enterpriseProperties[contentPropertyName], valueObj.includeEmpty);
        }
        else if (valueObj.filterType == Enums.ProcessViewEnums.TaxonomyFilterType.User) {
            let contentPropertyName = this.getContentPropertyInternalName(filter.property);
            let targetings = this.targetingData.filter(t => t.internalName == contentPropertyName && (t.includeChildTerms && valueObj.includeChildTerms || !t.includeChildTerms && !valueObj.includeChildTerms));
            if (targetings.length > 0) {
                targetings.forEach(targeting => {
                    valueObj.fixedTermIds.push(...this.generateTaxonomyFilter(targeting.values, valueObj.includeEmpty));
                });
            }
        }
        return valueObj;
    }

    getContentPropertyInternalName(pagePropertyInternalName: string) {
        if (pagePropertyInternalName.startsWith('Prop'))
            pagePropertyInternalName = pagePropertyInternalName.substr(4);
        return pagePropertyInternalName;
    }

    generateTaxonomyFilter(termIds: Array<GuidValue>, includeEmpty: boolean): Array<string> {
        let result: Array<string> = [];
        if (termIds && termIds.length > 0) {
            termIds.forEach(termId => {
                result.push(termId.toString());
            })
        }
        if (includeEmpty) {
            result.push('');
        }

        return result;
    }

    getQuery(): RollupSetting {
        let query: RollupSetting = {
            resources: this.blockData.settings.resources.map((res) => {
                res.filters = this.generateFilters(res.filters);
                return res;
            }),
            includeTotal: false,
            orderBy: this.blockData.settings.orderBy,
            itemLimit: this.blockData.settings.itemLimit ? parseInt(this.blockData.settings.itemLimit.toString()) : 50,
            customFilters: this.generateFilters(this.uiFilters),
            displayFields: this.blockData.settings.viewSettings.selectProperties
        };
        return query;
    }

    getData(pageNumber: number) {
        ScrollPagingUtils.removeScrollPaging(this.$el as HTMLElement);

        this.noNextPage = false;

        let query = this.getQuery();
        query.includeTotal = true;
        let hasPaging = this.blockData.settings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging;
        if (hasPaging) {
            query.skip = !pageNumber ? 0 : (pageNumber - 1) * this.blockData.settings.itemLimit;
        } else query.skip = 0;

        this.isLoading = true;
        this.processRollupService.queryProcesses(query).then((result) => {
            this.processes = result.items as Array<RollupProcess>;
            this.total = result.total;
            this.isLoading = false;
            if (this.blockData.settings.pagingType === Enums.ProcessViewEnums.PagingType.Scroll && this.total > 0) {
                ScrollPagingUtils.registerScrollPaging(this.$el as HTMLElement, `.${PublishingAppDefaultScrollElementClass}`, this.nextPage);
            }
            this.$forceUpdate();
        }).catch((msg) => {
            this.errorMsg = msg;
            this.isLoading = false;
            ScrollPagingUtils.removeScrollPaging(this.$el as HTMLElement);
            this.$forceUpdate();
        });
    }

    nextPage(): Promise<boolean> {
        if (this.isLoading || this.noNextPage) return Promise.resolve(false);
        this.currentPage = this.currentPage + 1;

        let query = this.getQuery();
        query.includeTotal = true;

        let hasPaging = this.blockData.settings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging;
        if (hasPaging) {
            query.skip = !this.currentPage ? 0 : (this.currentPage - 1) * this.blockData.settings.itemLimit;
        };

        this.isLoading = true;
        return this.processRollupService.queryProcesses(query).then((result) => {
            this.processes.push(...result.items as Array<RollupProcess>);
            this.total = result.total;
            this.isLoading = false;
            let hasData = result.items.length > 0;
            this.noNextPage = !hasData;
            return Promise.resolve(hasData);
        }).catch((msg) => {
            this.isLoading = false;
            return Promise.reject();
        });
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderProcessRollup(h) {

        if (this.isLoading || this.blockData.settings.selectedViewId && !this.registeredViewElemMsg[this.blockData.settings.selectedViewId])
            return (<v-skeleton-loader loading={true} height="100%" type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"></v-skeleton-loader>)


        if (!Utils.isArrayNullOrEmpty(this.errorMsg)) {
            return <div class={[this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing), this.processRollupClasses.queryFailMsgWrapper]}>{this.loc.Common.QueryFailedMsg} - {this.errorMsg}</div>
        }

        if (!this.blockData.settings.selectedViewId)
            return <div class={this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing)}>{this.loc.Common.NoViewToRender}</div>

        let renderFilterComponent = this.uiFilters.length > 0;
        return [
            <div class={renderFilterComponent ? this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing, { bottom: true }) : ''}>
                {
                    renderFilterComponent ?
                        <FilterComponent isLoadingData={this.isLoading} uiFilters={this.uiFilters} updateUIQueryFilters={() => { this.getData(1); }}></FilterComponent>
                        : null
                }
            </div>,
            h(this.registeredViewElemMsg[this.blockData.settings.selectedViewId], {
                domProps: {
                    processes: this.processes,
                    viewSettings: Utils.clone(this.blockData.settings.viewSettings),
                    SpacingSettings: this.blockData.settings.spacing,
                    viewPageUrl: this.blockData.settings.viewPageUrl,
                    openInNewWindow: this.blockData.settings.openInNewWindow,
                    styles: this.styles,
                    settingsKey: this.settingsKey
                }
            }),
            this.blockData.settings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging ? <div class={[this.isLoading ? "" : this.processRollupClasses.transparent]}><v-progress-linear height="2" indeterminate></v-progress-linear></div> : null,
            this.blockData.settings.pagingType === Enums.ProcessViewEnums.PagingType.Classic && this.total && this.total > (this.blockData.settings.itemLimit > 0 ? this.blockData.settings.itemLimit : 50) ?
                <div class={["text-center", this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing, { top: true, left: true, right: true })]}>
                    <v-pagination
                        disabled={this.isLoading}
                        v-model={this.currentPage}
                        length={Math.ceil(this.total / (this.blockData.settings.itemLimit > 0 ? this.blockData.settings.itemLimit : 50))}
                        onInput={(pageNumber) => { this.pagingNumberChanged(pageNumber); }}>
                    </v-pagination></div> : null
        ];
    }

    render(h) {
        let isEmpty = this.isComponentEmtpy();
        return (
            <div>
                {
                    !this.blockData ? <v-skeleton-loader loading={true} height="100%" type="list-item-avatar-two-line,list-item-avatar-two-line"></v-skeleton-loader>
                        :
                        isEmpty ?
                            <wcm-empty-block-view dark={false} icon={"fal fa-file-alt"} title={this.loc.BlockTitle} description={this.loc.BlockDescription}></wcm-empty-block-view>
                            :
                            <div key={this.componentUniqueKey}>
                                {
                                    this.multilingualStore.getters.stringValue(this.blockData.settings.title) ?
                                        <wcm-block-title title="" settingsKey={this.settingsKey} alternativeContent={
                                            <v-layout row align-center>
                                                <v-flex>{this.multilingualStore.getters.stringValue(this.blockData.settings.title)}</v-flex>
                                            </v-layout>
                                        }></wcm-block-title> : null
                                }
                                {this.renderProcessRollup(h)}
                            </div>
                }
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessRollupComponent);
});