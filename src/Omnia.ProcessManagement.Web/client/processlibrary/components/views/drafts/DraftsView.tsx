import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessLibraryDisplaySettings, Enums, Process } from '../../../../fx/models';
import { ProcessLibraryListViewStyles, DraftProcess, FilterOption, FilterAndSortInfo, FilterAndSortResponse } from '../../../../models';
import { ProcessLibraryService } from '../../../services';
import { SharePointContext, TermStore } from '@omnia/fx-sp';
import { OmniaContext, Inject, Localize, Utils } from '@omnia/fx';
import { TenantRegionalSettings, EnterprisePropertyDefinition, PropertyIndexedType, User, TaxonomyPropertySettings, MultilingualScopes, LanguageTag } from '@omnia/fx-models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { FilterDialog } from '../dialogs/FilterDialog';
import { ProcessService } from '../../../../fx';
import { LibrarySystemFieldsConstants, DefaultDateFormat } from '../../../Constants';
import { DeletedDialog } from '../dialogs/DeleteDialog';
import { FiltersAndSorting } from '../../../filtersandsorting';
import { EnterprisePropertyStore, UserStore, MultilingualStore } from '@omnia/fx/store';

interface DraftsViewProps {
    displaySettings: ProcessLibraryDisplaySettings;
}

@Component
export class DraftsView extends VueComponentBase<DraftsViewProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() displaySettings: ProcessLibraryDisplaySettings;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessLibraryService) documentLibraryService: ProcessLibraryService;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(EnterprisePropertyStore) private enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(FiltersAndSorting) private filtersAndSorting: FiltersAndSorting;
    @Inject(UserStore) private userStore: UserStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;
    @Inject(TermStore) private termStore: TermStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    openFilterDialog: boolean = false;
    openNewProcessDialog: boolean = false;
    selectedFilterColumn: EnterprisePropertyDefinition;
    filterOptions: Array<FilterOption> = [];

    isCurrentUserCanAddDoc: boolean = true;
    isLoadingContextMenu: boolean = false;
    disableButtonEdit: boolean = false;
    disableButtonPreview: boolean = false;
    disableButtonSendForComments: boolean = false;
    disableButtonPublish: boolean = false;
    disableButtonWorkflowHistory: boolean = false;
    disableButtonDelete: boolean = false;
    dateFormat: string = DefaultDateFormat;
    isLoading: boolean = false;
    openDeleteDialog: boolean = false;
    request: FilterAndSortInfo;
    filterAndSortProcesses: FilterAndSortResponse = { total: 0, processes: [] };
    allProcesses: Array<DraftProcess>;
    selectedProcess: Process;
    pageTotal: number = 1;
    lcid: number = 1033;

    created() {
        let languageSettings = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant);
        if (languageSettings.availableLanguages.length > 0) {
            let userLanguageSettings = languageSettings.availableLanguages.find(l => l.name == (languageSettings.userPreferredLanguageTag.toLowerCase() as LanguageTag));
            if (userLanguageSettings) this.lcid = userLanguageSettings.lcid;
        }
        this.isLoading = true;

        this.enterprisePropertyStore.actions.ensureLoadData.dispatch().then(() => {
            this.init();
        });
    }

    mounted() {

    }

    beforeDestroy() {

    }

    private applyFilterAndSort() {
        let pageSize = this.displaySettings.pageSize ? parseInt(this.displaySettings.pageSize.toString()) : 0;
        this.filterAndSortProcesses = this.filtersAndSorting.applyFiltersAndSort(this.allProcesses, this.request, this.displaySettings.pagingType == Enums.ProcessViewEnums.PagingType.Classic ? pageSize : 0);
        this.isLoading = false;
    }

    private loadProcesses() {
        this.processService.getProcessesBySite(this.request.webUrl)
            .then((processes) => {
                this.allProcesses = processes as Array<DraftProcess>;
                this.allProcesses.forEach(p => p.sortValues = {});
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
                let promises: Array<Promise<any>> = [
                    this.userStore.actions.ensureUsersByPrincipalNames.dispatch(identities)
                ];
                termSetIds.forEach(t => {
                    promises.push(this.termStore.actions.ensureTermSetWithAllTerms.dispatch(t))
                })

                Promise.all(promises).then((result) => {
                    this.filtersAndSorting.setInformation(result[0], this.lcid, this.dateFormat);
                    this.applyFilterAndSort();
                });
            }).catch(() => {
                this.isLoading = false;
            });
    }

    private init() {
        this.isLoading = true;
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.request = {
            webUrl: this.spContext.pageContext.web.absoluteUrl,
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

    }

    private openDeleteDraft(item: Process) {
        this.selectedProcess = item;
        this.openDeleteDialog = true;
    }

    private isFilter(internalName: string) {
        return this.request.filters && this.request.filters[internalName] != null;
    }

    private pagingNumberChanged(pageNumber: number) {
        this.request.pageNum = pageNumber;
        this.applyFilterAndSort();
    }

    private getEnterpriseProperty(internalName: string) {
        let field: EnterprisePropertyDefinition = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions().find(p => p.internalName == internalName);
        if (internalName == LibrarySystemFieldsConstants.Title)
            field = {
                multilingualTitle: this.coreLoc.Columns.Title, enterprisePropertyDataType: {
                    indexedType: PropertyIndexedType.Text
                },
                internalName: LibrarySystemFieldsConstants.Title
            } as EnterprisePropertyDefinition;
        return field;
    }

    renderDeleteDialog(h) {
        return (
            <DeletedDialog
                closeCallback={(hasUpdate: boolean) => {
                    this.openDeleteDialog = false;
                    if (hasUpdate) {
                        this.request.pageNum = 1;
                        this.applyFilterAndSort();
                    }
                }}
                opmProcessId={this.selectedProcess.opmProcessId}>
            </DeletedDialog>
        )
    }

    renderItems(h, item: DraftProcess) {
        return (
            <tr onMouseover={() => { item.isMouseOver = true; this.$forceUpdate(); }} onMouseout={() => { item.isMouseOver = false; this.$forceUpdate(); }}>
                {
                    this.displaySettings.selectedFields.map((internalName: string) => {
                        switch (internalName) {
                            case LibrarySystemFieldsConstants.Menu:
                                return (
                                    <td class={this.listViewClasses.menuColumn}>
                                        <v-menu close-delay="50"
                                            {
                                            ...this.transformVSlot({
                                                activator: (ref) => {
                                                    const toSpread = {
                                                        on: ref.on
                                                    }
                                                    return [
                                                        <v-button {...toSpread} icon class={this.listViewClasses.menuHeader} v-show={item.isMouseOver} onClick={() => {

                                                        }}><v-icon>more_vert</v-icon></v-button>
                                                    ]
                                                }
                                            })}>
                                            <v-list>
                                                <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonEdit}>
                                                    <v-list-item-title>{this.loc.ProcessActions.Edit}</v-list-item-title>
                                                </v-list-item>
                                                <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonPreview}>
                                                    <v-list-item-title>{this.loc.ProcessActions.Preview}</v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                                <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonSendForComments}>
                                                    <v-list-item-title>{this.loc.ProcessActions.SendForComments}</v-list-item-title>
                                                </v-list-item>
                                                <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonPublish}>
                                                    <v-list-item-title>{this.loc.ProcessActions.Publish}</v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                                <v-list-item onClick={() => { }} disabled={this.isLoadingContextMenu || this.disableButtonWorkflowHistory}>
                                                    <v-list-item-title>{this.loc.ProcessActions.WorkflowHistory}</v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                                <v-list-item onClick={() => { this.openDeleteDraft(item); }} disabled={this.isLoadingContextMenu || this.disableButtonDelete}>
                                                    <v-list-item-title>{this.loc.ProcessActions.DeleteDraft}</v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </td>
                                );
                            case LibrarySystemFieldsConstants.Title:
                                return (
                                    <td>
                                        <a onClick={() => { this.openProcess(item); }}>{item.rootProcessStep.multilingualTitle}</a>
                                    </td>
                                );
                            default:
                                return (
                                    <td>{Utils.isNullOrEmpty(item.sortValues[internalName]) ? this.filtersAndSorting.parseProcessValue(item, internalName) : item.sortValues[internalName]}</td>
                                )
                        };
                    })
                }
            </tr>
        );
    }

    renderHeaderForOtherColumns(h, internalName: string) {
        let field = this.getEnterpriseProperty(internalName);

        return (
            <th class={'text-left font-weight-bold'}    >
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
                        {this.loc.Common.NoDraftItemToShow}
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

    renderNewProcessDialog(h) {
        return (
            <opm-new-process-dialog
                closeCallback={(isUpdate: boolean) => {
                    this.openNewProcessDialog = false;
                    if (isUpdate) {
                        this.request.pageNum = 1;
                        this.request.filters = {};
                        this.applyFilterAndSort();
                    }
                }}
            ></opm-new-process-dialog>
        )
    }

    render(h) {
        return (
            <div>
                <v-toolbar flat color="white">
                    <v-card-actions>
                        {
                            this.isCurrentUserCanAddDoc ?
                                <v-btn text class="ml-2"
                                    color={this.omniaTheming.promoted.body.primary.base as any} onClick={() => { this.openNewProcessDialog = true; }}>
                                    {this.loc.Buttons.NewProcess}
                                </v-btn> :
                                null
                        }
                    </v-card-actions>
                </v-toolbar>
                {
                    this.isLoading ?
                        <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        this.renderProcesses(h)
                }
                {this.openFilterDialog && this.renderFilterDialog(h)}
                {this.openNewProcessDialog && this.renderNewProcessDialog(h)}
                {this.openDeleteDialog && this.renderDeleteDialog(h)}
            </div>
        )
    }
}