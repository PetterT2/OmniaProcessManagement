import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessLibraryDisplaySettings, Enums, ProcessLibraryRequest, Process, HeaderTable } from '../../../../fx/models';
import { ProcessLibraryListViewStyles } from '../../../../models';
import { ProcessLibraryService } from '../../../services';
import { SharePointContext } from '@omnia/fx-sp';
import { OmniaContext, Inject, Localize } from '@omnia/fx';
import { TenantRegionalSettings } from '@omnia/fx-models';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { FilterDialog } from '../dialogs/FilterDialog';
import { ProcessService } from '../../../../fx';
import { LibrarySystemFieldsConstants, DefaultDateFormat } from '../../../Constants';
import { DeletedDialog } from '../dialogs/DeleteDialog';
declare var moment;

interface DraftsViewProps {
    displaySettings: ProcessLibraryDisplaySettings
}

interface DraftProcess extends Process {
    isMouseOver?: boolean;
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

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    openFilterDialog: boolean = false;
    openNewProcessDialog: boolean = false;
    selectedFilterColumn: HeaderTable;

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
    request: ProcessLibraryRequest;
    processes: Array<Process>;
    selectedProcess: Process;
    pageTotal: number = 1;
    headers: Array<HeaderTable> = [
        {
            text: this.coreLoc.Columns.Title,
            value: LibrarySystemFieldsConstants.Title,
            align: 'start',
            sortable: true,
            filterable: true,
            type: Enums.ProcessViewEnums.PropertyType.Text
        },
        {
            text: '',
            value: LibrarySystemFieldsConstants.Menu,
            align: 'center',
            type: Enums.ProcessViewEnums.PropertyType.None
        }
    ];

    created() {
        this.init();
    }

    beforeDestroy() {

    }

    private getProcesses() {
        this.isLoading = true;
        this.processService.getProcessesBySite(this.request)
            .then((value) => {
                this.processes = value.processes;
                this.pageTotal = Math.ceil(value.total / this.displaySettings.pageSize);
                this.isLoading = false;
            }).catch(() => {
                this.isLoading = false;
            });
    }

    private init() {
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.request = {
            webUrl: this.spContext.pageContext.web.absoluteUrl,
            pageNum: 1,
            filters: {},
            pageSize: this.displaySettings.pagingType == Enums.ProcessViewEnums.PagingType.Classic ? this.displaySettings.pageSize : 0
        };
        this.getProcesses();
    }

    private changeSortColumn(column: HeaderTable, isAsc: boolean) {
        this.request.sortBy = column.value;
        this.request.sortAsc = isAsc;
        this.getProcesses();
    }

    private clearFilter(column: string) {
        if (this.request.filters && this.request.filters[column]) {
            delete this.request.filters[column];
            this.getProcesses();
        }
    }

    private getSortByAscendingText(column: HeaderTable) {
        switch (column.type) {
            case Enums.ProcessViewEnums.PropertyType.Text:
                return this.loc.SortText.TextFieldAscending;
        }
        return '';
    }

    private getSortByDescendingText(column: HeaderTable) {
        switch (column.type) {
            case Enums.ProcessViewEnums.PropertyType.Text:
                return this.loc.SortText.TextFieldDescending;
        }
        return '';
    }

    private openFilter(column: HeaderTable) {
        this.selectedFilterColumn = column;
        this.openFilterDialog = true;
    }

    private openProcess(item: Process) {

    }

    private openDeleteDraft(item: Process) {
        this.selectedProcess = item;
        this.openDeleteDialog = true;
    }

    private isFilter(column: HeaderTable) {
        return this.request.filters && this.request.filters[column.value] != null;
    }

    private pagingNumberChanged(pageNumber: number) {
        this.request.pageNum = pageNumber;
        this.getProcesses();
    }

    renderDeleteDialog(h) {
        return (
            <DeletedDialog
                closeCallback={(hasUpdate: boolean) => {
                this.openDeleteDialog = false;
                if (hasUpdate) {
                    this.getProcesses();
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
                    this.headers.map((column: HeaderTable) => {
                        switch (column.value) {
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
                        };
                    })
                }
            </tr>
        );
    }

    private renderHeaderForOtherColumns(h, column: HeaderTable) {
        return column.sortable || column.filterable ?
            (
                <th class={column.align == 'start' ? 'text-left font-weight-bold' : column.align == 'center' ? 'text-center font-weight-bold' : 'text-right font-weight-bold'}    >
                    <v-icon v-show={this.isFilter(column)}>fal fa-filter</v-icon>
                    <v-icon small v-show={this.request.sortBy == column.value && this.request.sortAsc == true}>arrow_upward</v-icon>
                    <v-icon small v-show={this.request.sortBy == column.value && this.request.sortAsc != true}>arrow_downward</v-icon>
                    <v-menu offset-y close-delay="50"
                        {
                        ...this.transformVSlot({
                            activator: (ref) => {
                                const toSpread = {
                                    on: ref.on
                                }
                                return [
                                    <span {...toSpread} class={this.listViewClasses.menuHeader}>{column.text} <v-icon small>expand_more</v-icon></span>
                                ]
                            }
                        })}>
                        <v-list>
                            {column.sortable &&
                                [<v-list-item onClick={() => { this.changeSortColumn(column, true); }}>
                                    <v-list-item-title>{this.getSortByAscendingText(column)}</v-list-item-title>
                                </v-list-item>,
                                <v-list-item onClick={() => { this.changeSortColumn(column, false); }}>
                                    <v-list-item-title>{this.getSortByDescendingText(column)}</v-list-item-title>
                                </v-list-item>]
                            }
                            {column.sortable && column.filterable && <v-divider></v-divider>}
                            {column.filterable &&
                                [
                                    <v-list-item onClick={() => { this.openFilter(column); }}>
                                        <v-list-item-title>{this.loc.Filter.FilterBy}</v-list-item-title>
                                    </v-list-item>,
                                    (
                                        (<v-list-item onClick={() => { this.clearFilter(column.value); }}>
                                            <v-list-item-title>{this.loc.Filter.ClearFilter}</v-list-item-title>
                                        </v-list-item>)
                                    )
                                ]
                            }

                        </v-list>
                    </v-menu>
                </th>
            ) : (
                <th class='text-left'>
                    <v-tooltip top {
                        ...this.transformVSlot({
                            activator: (ref) => {
                                const toSpread = {
                                    on: ref.on
                                }
                                return [
                                    <span {...toSpread}>{column.text}</span>
                                ]
                            }
                        })}>
                        <span>{column.text}</span>
                    </v-tooltip>
                </th>);
    }

    renderHeaders(h) {
        return (
            <thead>
                <tr>
                    {
                        this.headers.map(header => {
                            return header.value == LibrarySystemFieldsConstants.Menu ?
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
        return (
            <div>
                <v-data-table
                    headers={this.headers}
                    items={this.processes}
                    hide-default-footer
                    hide-default-header
                    items-per-page={isPaging ? this.displaySettings.pageSize : Number.MAX_SAFE_INTEGER}
                    scopedSlots={{
                        item: p => this.renderItems(h, p.item),
                        header: p => this.renderHeaders(h)
                    }}>
                    <div slot="no-data">
                        {this.loc.Common.NoDraftItemToShow}
                    </div>
                </v-data-table>
                {
                    isPaging ?
                        <div class="text-center">
                            <v-pagination
                                v-model={this.request.pageNum}
                                length={this.pageTotal}
                                onInput={(pageNumber) => { this.pagingNumberChanged(pageNumber); }}
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
                    this.request.filters[column] = selectedOptions;
                    this.openFilterDialog = false;
                    this.getProcesses();
                }}
                clearFilter={(column: string) => {
                    this.clearFilter(column);
                    this.openFilterDialog = false;
                }}
                isFilteringValue={(column: string, value: string) => {
                    return this.request.filters && this.request.filters[column] && this.request.filters[column].findIndex(v => v == value) > -1;
                }}
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
                        this.getProcesses();
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