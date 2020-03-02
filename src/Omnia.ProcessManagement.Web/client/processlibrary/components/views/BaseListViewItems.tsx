import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessLibraryDisplaySettings, Enums, Process, ProcessVersionType, ProcessListViewComponentKey, ProcessWorkingStatus, Security, IdDict } from '../../../fx/models';
import { ProcessLibraryListViewStyles, DisplayProcess, FilterOption, FilterAndSortInfo, FilterAndSortResponse, DraftProcessLibraryStatus } from '../../../models';
import { SharePointContext, TermStore } from '@omnia/fx-sp';
import { OmniaContext, Inject, Localize, Utils, ResolvablePromise, SubscriptionHandler } from '@omnia/fx';
import { TenantRegionalSettings, EnterprisePropertyDefinition, PropertyIndexedType, User, TaxonomyPropertySettings, MultilingualScopes, LanguageTag, IMessageBusSubscriptionHandler, RoleDefinitions, Parameters, PermissionBinding, Guid, GuidValue } from '@omnia/fx-models';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { OPMCoreLocalization } from '../../../core/loc/localize';
import { ProcessService, OPMUtils, OPMRouter, ProcessStore, ProcessRendererOptions } from '../../../fx';
import { LibrarySystemFieldsConstants, DefaultDateFormat, ProcessLibraryFields, ProcessLibraryListViewTabs } from '../../Constants';
import { FiltersAndSorting } from '../../filtersandsorting';
import { EnterprisePropertyStore, UserStore, MultilingualStore } from '@omnia/fx/store';
import { FilterDialog } from './dialogs/FilterDialog';
import { OPMContext } from '../../../fx/contexts';
import { SecurityService, UserService } from '@omnia/fx/services';
import { InternalOPMTopics } from '../../../fx/messaging/InternalOPMTopics';
import { ProcessDesignerStore } from '../../../processdesigner/stores';
import { ProcessDesignerUtils } from '../../../processdesigner/Utils';
import { ProcessDesignerItemFactory } from '../../../processdesigner/designeritems';
import { DisplayModes } from '../../../models/processdesigner';
import { BaseListViewItemRow } from './BaseListViewItemRow';
import { ProcessLibraryStatus } from '../../../models';
import { DraftsProcessingStatus } from './drafts/DraftsProcessingStatus';
declare var moment;

interface BaseListViewItemsProps {
    displaySettings: ProcessLibraryDisplaySettings;
    versionType: ProcessVersionType.Draft | ProcessVersionType.Published;
    processListViewComponentKey: ProcessListViewComponentKey;
    changeTab: (tab: ProcessLibraryListViewTabs) => void;
    previewPageUrl: string;
    isAuthor: boolean;
}

@Component
export class BaseListViewItems extends VueComponentBase<BaseListViewItemsProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() displaySettings: ProcessLibraryDisplaySettings;
    @Prop() versionType: ProcessVersionType.Draft | ProcessVersionType.Published;
    @Prop() processListViewComponentKey: ProcessListViewComponentKey;
    @Prop() changeTab: (tab: ProcessLibraryListViewTabs) => void;
    @Prop() previewPageUrl: string;
    @Prop() isAuthor: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(EnterprisePropertyStore) private enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(FiltersAndSorting) private filtersAndSorting: FiltersAndSorting;
    @Inject(UserStore) private userStore: UserStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(TermStore) private termStore: TermStore;
    @Inject(OPMContext) opmContext: OPMContext;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Inject(SecurityService) securityService: SecurityService;
    @Inject(SubscriptionHandler) subcriptionHandler: SubscriptionHandler;
    @Inject(ProcessStore) processStore: ProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(UserService) userService: UserService;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    openFilterDialog: boolean = false;
    selectedFilterColumn: EnterprisePropertyDefinition;
    filterOptions: Array<FilterOption> = [];

    refreshStatusInterval: any;
    isSettingInterval: boolean = false;
    refreshStatusPromise: ResolvablePromise<IdDict<ProcessLibraryStatus>> = null;

    dateFormat: string = DefaultDateFormat;
    isLoading: boolean = false;

    request: FilterAndSortInfo;
    filterAndSortProcesses: FilterAndSortResponse = { total: 0, processes: [] };
    allProcesses: Array<DisplayProcess>;
    selectedProcess: Process;
    pageTotal: number = 1;
    lcid: number = 1033;

    created() {
        let languageSettings = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant);
        if (languageSettings && languageSettings.availableLanguages.length > 0) {
            let userLanguageSettings = languageSettings.availableLanguages.find(l => l.name == (languageSettings.userPreferredLanguageTag.toLowerCase() as LanguageTag));
            if (userLanguageSettings) this.lcid = userLanguageSettings.lcid;
        }
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }
        this.isLoading = true;

        this.controlGettingWorkingStatus(true);
        this.processDesignerStore.editmode.onMutated((value) => {
            if (value.newState == this.isSettingInterval)
                this.controlGettingWorkingStatus(!value.newState);
        });
        this.enterprisePropertyStore.actions.ensureLoadData.dispatch().then(() => {
            this.initProcesses();
            this.initSubscription();


        });
    }

    initSubscription() {
        this.subcriptionHandler.add(InternalOPMTopics.onProcessWorkingStatusChanged.subscribe((versionType) => {
            if (this.versionType == versionType) {
                this.refreshStatus(true);
            }
        }));

        this.subcriptionHandler.add(InternalOPMTopics.onProcessChanged.subscribe((versionType) => {
            if (this.versionType == versionType) {
                this.initProcesses();
            }
        }))
    }

    mounted() {

    }

    beforeDestroy() {
        this.controlGettingWorkingStatus(false);
    }

    private controlGettingWorkingStatus(isSettingInterval: boolean) {
        this.isSettingInterval = isSettingInterval;
        if (isSettingInterval)
            this.refreshStatusInterval = setInterval(() => {
                this.refreshStatus();
            }, 5000);
        else
            clearInterval(this.refreshStatusInterval);
    }

    private getCheckedOutBys(statusDict: IdDict<DraftProcessLibraryStatus>) {
        let identities: string[] = [];
        for (var key in statusDict) {
            if (!Utils.isNullOrEmpty(statusDict[key].checkedOutBy) && identities.find(i => i == statusDict[key].checkedOutBy) == null)
                identities.push(statusDict[key].checkedOutBy);
        }
        return identities;
    }

    private updateProcessStatus(statusDict: IdDict<ProcessLibraryStatus>, opmProcessIds: GuidValue[], users?: User[]) {
        for (let opmProcessId of opmProcessIds) {
            let filterProcess = this.filterAndSortProcesses.processes.find(p => p.opmProcessId == opmProcessId);
            let process = this.allProcesses.find(p => p.opmProcessId == opmProcessId);
            let status = statusDict[opmProcessId.toString()];
            if (process == null) {
                this.allProcesses = this.allProcesses.filter(p => p != process);
                this.filterAndSortProcesses.processes = this.filterAndSortProcesses.processes.filter(p => p != process);
            }
            else if (filterProcess && status != null) {
                filterProcess.processWorkingStatus = status.processWorkingStatus;
                process.processWorkingStatus = status.processWorkingStatus;
                if (users && this.versionType == ProcessVersionType.Draft) {
                    let checkedOutBy = (status as DraftProcessLibraryStatus).checkedOutBy;
                    let user = users.find(us => us.uid == checkedOutBy);
                    filterProcess.checkedOutByName = user ? user.displayName : "";
                    process.checkedOutByName = filterProcess.checkedOutByName;
                    process.checkedOutBy = checkedOutBy;
                }
            }
        }
    }

    private loadProcessStatus(opmProcessIds: GuidValue[], isGetAll: boolean) {
        return this.versionType == ProcessVersionType.Draft ?
            this.processService.getDraftProcessWorkingStatus(this.request.teamAppId, opmProcessIds, isGetAll) : this.processService.getPublishedProcessWorkingStatus(this.request.teamAppId, opmProcessIds);
    }

    private refreshStatus(force?: boolean) {
        if (!Utils.isArrayNullOrEmpty(this.filterAndSortProcesses.processes) &&
            (force || !this.refreshStatusPromise || !this.refreshStatusPromise.resolving)) {

            if (this.refreshStatusPromise && this.refreshStatusPromise.resolving) {
                this.refreshStatusPromise.reject('force refreshing new status');
            }

            this.refreshStatusPromise = new ResolvablePromise<IdDict<ProcessLibraryStatus>>();
            this.refreshStatusPromise.resolving = true;

            let opmProcessIds = this.filterAndSortProcesses.processes.map(p => p.opmProcessId);

            this.loadProcessStatus(opmProcessIds, false).then(this.refreshStatusPromise.resolve).catch(this.refreshStatusPromise.reject);

            this.refreshStatusPromise.promise.then((statusDict) => {
                if (this.versionType == ProcessVersionType.Draft) {
                    let identities: string[] = this.getCheckedOutBys(statusDict as IdDict<DraftProcessLibraryStatus>);
                    this.userStore.actions.ensureUsersByPrincipalNames.dispatch(identities).then((users) => {
                        this.updateProcessStatus(statusDict, opmProcessIds, users);
                    })
                }
                else
                    this.updateProcessStatus(statusDict, opmProcessIds);
            }).catch((errMsg) => {
                console.warn(errMsg);
            })
        }
    }

    private applyFilterAndSort() {
        let pageSize = this.displaySettings.pageSize ? parseInt(this.displaySettings.pageSize.toString()) : 0;
        this.filterAndSortProcesses = this.filtersAndSorting.applyFiltersAndSort(this.allProcesses, this.request, this.displaySettings.pagingType == Enums.ProcessViewEnums.PagingType.Classic ? pageSize : 0);
        this.isLoading = false;
    }

    private loadProcesses() {
        let allPromises: Array<Promise<any>> = this.versionType == ProcessVersionType.Draft ?
            [this.processService.getDraftProcessesBySite(this.request.teamAppId), this.loadProcessStatus([], true)] :
            [this.processService.getPublishedProcessesBySite(this.request.teamAppId)]
        Promise.all(allPromises)
            .then((results) => {
                this.allProcesses = results[0] as Array<DisplayProcess>;
                this.allProcesses.forEach(p => p.sortValues = {});
                let draftProcessStatuses: IdDict<DraftProcessLibraryStatus> = results[1] ? results[1] as IdDict<DraftProcessLibraryStatus> : {};
                let personFields = [];
                let termSetIds = [];
                this.displaySettings.selectedFields.forEach(f => {
                    let field = this.getEnterpriseProperty(f);
                    if (field) {
                        if (field.enterprisePropertyDataType.indexedType == PropertyIndexedType.Person)
                            personFields.push(f);
                        if (field.enterprisePropertyDataType.indexedType == PropertyIndexedType.Taxonomy)
                            termSetIds.push((field.settings as TaxonomyPropertySettings).termSetId);
                    }
                })

                let identities = this.filtersAndSorting.ensurePersonField(this.allProcesses, personFields);
                if (this.versionType == ProcessVersionType.Draft) {
                    let checkedOutBys = this.getCheckedOutBys(draftProcessStatuses);
                    checkedOutBys.forEach(us => { if (identities.find(id => id == us) == null) identities.push(us); });
                }
                let promises: Array<Promise<any>> = [
                    this.userStore.actions.ensureUsersByPrincipalNames.dispatch(identities)
                ];
                termSetIds.forEach(t => {
                    promises.push(this.termStore.actions.ensureTermSetWithAllTerms.dispatch(t))
                })

                Promise.all(promises).then((result) => {
                    if (this.versionType == ProcessVersionType.Draft && draftProcessStatuses) {
                        this.allProcesses.forEach(p => {
                            if (draftProcessStatuses[p.opmProcessId.toString()]) {
                                p.checkedOutBy = draftProcessStatuses[p.opmProcessId.toString()].checkedOutBy;
                                p.checkedOutByName = this.filtersAndSorting.getUserDisplayName(p.checkedOutBy);
                            }
                        })
                    }
                    this.filtersAndSorting.setInformation(result[0], this.lcid, this.dateFormat);
                    this.applyFilterAndSort();
                });
            }).catch(() => {
                this.isLoading = false;
            });
    }

    private initProcesses() {
        this.isLoading = true;
        this.request = {
            webUrl: this.spContext.pageContext.web.absoluteUrl,
            teamAppId: this.opmContext.teamAppId,
            pageNum: 1,
            filters: {},
            sortBy: this.displaySettings.defaultOrderingFieldName,
            sortAsc: this.displaySettings.orderDirection == Enums.ProcessViewEnums.OrderDirection.Ascending ? true : false
        };
        this.loadProcesses();
    }

    private changeSortColumn(internalName: string, isAsc: boolean) {
        this.request.pageNum = 1;
        this.request.sortBy = internalName;
        this.request.sortAsc = isAsc;
        this.applyFilterAndSort();
    }

    private clearFilter(column: string) {
        this.request.pageNum = 1;
        if (this.request.filters && this.request.filters[column]) {
            delete this.request.filters[column];
            this.applyFilterAndSort();
        }
    }

    private getSortByAscendingText(field: EnterprisePropertyDefinition) {
        switch (field.enterprisePropertyDataType.indexedType) {
            case PropertyIndexedType.Text:
            case PropertyIndexedType.Person:
            case PropertyIndexedType.Taxonomy:
                return this.loc.SortText.TextFieldAscending;
            case PropertyIndexedType.Number:
                return this.loc.SortText.NumberFieldAscending;
            case PropertyIndexedType.Boolean:
                return this.loc.SortText.BooleanFieldAscending;
            case PropertyIndexedType.DateTime:
                return this.loc.SortText.DateFieldAscending;
        }
        return '';
    }

    private getSortByDescendingText(field: EnterprisePropertyDefinition) {
        switch (field.enterprisePropertyDataType.indexedType) {
            case PropertyIndexedType.Text:
            case PropertyIndexedType.Person:
            case PropertyIndexedType.Taxonomy:
                return this.loc.SortText.TextFieldDescending;
            case PropertyIndexedType.Number:
                return this.loc.SortText.NumberFieldDescending;
            case PropertyIndexedType.Boolean:
                return this.loc.SortText.BooeleanFieldDescending;
            case PropertyIndexedType.DateTime:
                return this.loc.SortText.DateFieldDescending;
        }
        return '';
    }

    private openFilter(field: EnterprisePropertyDefinition) {
        this.selectedFilterColumn = field;
        this.filterOptions = this.filtersAndSorting.getFilterOptions(this.allProcesses, this.selectedFilterColumn.internalName, this.request.filters);
        this.openFilterDialog = true;
    }

    private openProcess(item: Process) {
        if (this.versionType === ProcessVersionType.Published) {
            if (this.previewPageUrl) {
                var viewUrl = OPMUtils.createProcessNavigationUrl(item, item.rootProcessStep, this.previewPageUrl, false);
                var win = window.open(viewUrl, '_blank');
                win.focus();
            } else {
                OPMRouter.navigate(item, item.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
            }
        }
        else {
            let loadPreviewProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(item.rootProcessStep.id);

            loadPreviewProcessPromise.then((processWithCheckoutInfo) => {
                this.processDesignerStore.actions.setProcessToShow.dispatch(processWithCheckoutInfo.process, processWithCheckoutInfo.process.rootProcessStep).then(() => {
                    ProcessDesignerUtils.openProcessDesigner();
                    this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentPreview);
                })
            })
        }
    }

    private isFilter(internalName: string) {
        return this.request.filters && this.request.filters[internalName] != null;
    }

    private pagingNumberChanged(pageNumber: number) {
        this.request.pageNum = pageNumber;
        this.applyFilterAndSort();
    }

    private getEnterpriseProperty(internalName: string) {
        let field: EnterprisePropertyDefinition = null;
        switch (internalName) {
            case LibrarySystemFieldsConstants.Title:
                field = {
                    multilingualTitle: this.coreLoc.Columns.Title, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.Text
                    },
                    internalName: LibrarySystemFieldsConstants.Title
                } as EnterprisePropertyDefinition;
                break;
            case ProcessLibraryFields.Edition:
                field = {
                    multilingualTitle: this.coreLoc.Columns.Edition, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.Number
                    },
                    internalName: ProcessLibraryFields.Edition
                } as EnterprisePropertyDefinition;
                break;
            case ProcessLibraryFields.Revision:
                field = {
                    multilingualTitle: this.coreLoc.Columns.Revision, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.Number
                    },
                    internalName: ProcessLibraryFields.Revision
                } as EnterprisePropertyDefinition;
                break;
            case ProcessLibraryFields.PublishedAt:
                field = {
                    multilingualTitle: this.coreLoc.Columns.Published, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.DateTime
                    },
                    internalName: ProcessLibraryFields.PublishedAt
                } as EnterprisePropertyDefinition;
                break;
            case ProcessLibraryFields.ModifiedAt:
                field = {
                    multilingualTitle: this.coreLoc.Columns.ModifiedAt, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.DateTime
                    },
                    internalName: ProcessLibraryFields.ModifiedAt
                } as EnterprisePropertyDefinition;
                break;
            case ProcessLibraryFields.ModifiedBy:
                field = {
                    multilingualTitle: this.coreLoc.Columns.ModifiedBy, enterprisePropertyDataType: {
                        indexedType: PropertyIndexedType.Text
                    },
                    internalName: ProcessLibraryFields.ModifiedBy
                } as EnterprisePropertyDefinition;
                break;
        }
        if (field == null) {
            field = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions().find(p => p.internalName == internalName);
        }
        return field;
    }

    private closeSubComponentCallback(refreshList: boolean, tab?: ProcessLibraryListViewTabs) {
        if (tab) {
            this.changeTab(tab);
        }
        else if (refreshList) {
            this.initProcesses();
        }
    }

    renderItems(h, item: DisplayProcess) {
        return (
            <BaseListViewItemRow item={item}
                filtersAndSorting={this.filtersAndSorting}
                displaySettings={this.displaySettings}
                processListViewComponentKey={this.processListViewComponentKey}
                isAuthor={this.isAuthor}
                previewPageUrl={this.previewPageUrl}
                closeSubComponentCallback={this.closeSubComponentCallback}
                openProcess={this.openProcess}>
            </BaseListViewItemRow>
        );
    }

    renderHeaderForOtherColumns(h, internalName: string) {
        let field = this.getEnterpriseProperty(internalName);
        if (field == null)
            return null;
        return (
            <th class={'text-left font-weight-bold'}>
                <v-icon v-show={this.isFilter(internalName)} size='16' class="mr-1">fal fa-filter</v-icon>
                <v-icon small v-show={this.request.sortBy == internalName && this.request.sortAsc == true}>arrow_upward</v-icon>
                <v-icon small v-show={this.request.sortBy == internalName && this.request.sortAsc != true}>arrow_downward</v-icon>
                <v-menu offset-y close-delay="50"
                    {
                    ...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <span {...toSpread} class={this.listViewClasses.menuHeader}>{field ? field.multilingualTitle : ''} <v-icon small>expand_more</v-icon></span>
                            ]
                        }
                    })}>
                    <v-list>
                        <v-list-item onClick={() => { this.changeSortColumn(internalName, true); }}>
                            <v-list-item-title>{this.getSortByAscendingText(field)}</v-list-item-title>
                        </v-list-item>
                        <v-list-item onClick={() => { this.changeSortColumn(internalName, false); }}>
                            <v-list-item-title>{this.getSortByDescendingText(field)}</v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>

                        <v-list-item onClick={() => { this.openFilter(field); }}>
                            <v-list-item-title>{this.loc.Filter.FilterBy}</v-list-item-title>
                        </v-list-item><v-list-item disabled={!(this.request.filters && this.request.filters[internalName])} onClick={() => { this.clearFilter(internalName); }}>
                            <v-list-item-title>{this.loc.Filter.ClearFilter}</v-list-item-title>
                        </v-list-item>

                    </v-list>
                </v-menu>
            </th>
        )
    }

    renderHeaders(h) {
        return (
            <thead>
                <tr>
                    {
                        this.displaySettings.selectedFields.map(header => {
                            return header == LibrarySystemFieldsConstants.Menu ?
                                <th class={this.listViewClasses.menuColumn}></th>
                                : header == LibrarySystemFieldsConstants.Status ?
                                    <th class={'text-left font-weight-bold'}>{this.coreLoc.Columns.Status}</th>
                                    : this.renderHeaderForOtherColumns(h, header);
                        })
                    }
                </tr>
            </thead>
        )
    }

    renderProcesses(h) {
        let isPaging = this.displaySettings.pagingType == Enums.ProcessViewEnums.PagingType.Classic;
        if (!isPaging && this.pageTotal > 0)
            this.applyFilterAndSort();
        let pageSize = this.displaySettings.pageSize ? parseInt(this.displaySettings.pageSize.toString()) : 0;
        this.pageTotal = isPaging && pageSize > 0 ? Math.ceil(this.filterAndSortProcesses.total / pageSize) : 0;

        return (
            <div>
                <v-data-table
                    headers={this.displaySettings.selectedFields.map(t => {
                        return {
                            text: t
                        };
                    })}
                    items={this.filterAndSortProcesses.processes}
                    hide-default-footer
                    hide-default-header
                    items-per-page={isPaging ? pageSize : Number.MAX_SAFE_INTEGER}
                    scopedSlots={{
                        item: p => this.renderItems(h, p.item),
                        header: p => this.renderHeaders(h)
                    }}>
                    <div slot="no-data">
                        {this.loc.ProcessNoItem[ProcessVersionType[this.versionType]]}
                    </div>
                </v-data-table>
                {
                    isPaging && this.pageTotal > 1 ?
                        <div class="text-center">
                            <v-pagination
                                v-model={this.request.pageNum}
                                length={this.pageTotal}
                                onInput={(pageNumber) => {
                                    this.pagingNumberChanged(pageNumber);
                                }}
                            ></v-pagination>
                        </div>
                        : null
                }
            </div>
        )
    }

    renderFilterDialog(h) {
        return (
            <FilterDialog
                closeCallback={() => { this.openFilterDialog = false; }}
                selectedColumn={this.selectedFilterColumn}
                changeFilterValues={(column: string, selectedOptions: Array<any>) => {
                    this.request.pageNum = 1;
                    this.request.filters[column] = selectedOptions;
                    this.openFilterDialog = false;
                    this.applyFilterAndSort();
                }}
                clearFilter={(column: string) => {
                    this.clearFilter(column);
                    this.openFilterDialog = false;
                }}
                filterOptions={this.filterOptions}
            >
            </FilterDialog>
        )
    }

    render(h) {
        let hasActionButtons = !Utils.isNullOrEmpty(this.processListViewComponentKey.actionButtonComponent) && this.isAuthor;
        return (
            <div class={!hasActionButtons ? "mt-3" : ""}>
                {
                    hasActionButtons ?
                        <v-toolbar flat color="white">
                            <v-card-actions>
                                {h(this.processListViewComponentKey.actionButtonComponent, {
                                    domProps: {
                                        closeCallback: (refreshList, tab) => { this.closeSubComponentCallback(refreshList, tab) }
                                    }
                                })}
                            </v-card-actions>
                        </v-toolbar>
                        : null
                }
                {
                    this.isLoading ?
                        <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        this.renderProcesses(h)
                }
                {this.openFilterDialog && this.renderFilterDialog(h)}
            </div>
        )
    }
}