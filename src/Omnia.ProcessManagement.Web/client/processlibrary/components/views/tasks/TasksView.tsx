import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow } from '@omnia/fx/ux';
import { ProcessLibraryDisplaySettings, IPagingServerQuery, PagingServerQuery, Enums, TaskRequest, CSOMSharePointTaskResponse, SharePointTask } from '../../../../fx/models';
import { ProcessLibraryListViewStyles } from '../../../../models';
import { SharePointContext } from '@omnia/fx-sp';
import { OmniaContext, Inject, Localize, Utils, WebUtils } from '@omnia/fx';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ApprovalTask } from './ApprovalTask';
import { PropertyIndexedType, TenantRegionalSettings } from '@omnia/fx-models';
import { SharePointFieldsConstants, SharePointTaskService, OPMUtils } from '../../../../fx';
import { UrlParameters } from '../../../Constants';
import Vue from 'vue';
declare var moment;

interface TasksViewProps {

}

interface TaskViewOption {
    value: number,
    name: string
}


interface Header {
    title: string,
    internalName: string,
    type: PropertyIndexedType
}

@Component
export class TasksView extends VueComponentBase<TasksViewProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() displaySettings: ProcessLibraryDisplaySettings;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(SharePointTaskService) spTaskService: SharePointTaskService;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    pageSize = 10;

    selectingTaskId: string = '';
    selectingTaskType: Enums.TaskContentType = Enums.TaskContentType.Undefined;;
    selectingSharePointTask: SharePointTask = null;

    pager: IPagingServerQuery = new PagingServerQuery(this.pageSize);
    dateFormat: string = '';
    displayEditTaskForm: boolean = false;
    currentTaskViewOption: Enums.TaskViewType = Enums.TaskViewType.AssignedToMe;
    sortAsc: boolean = false;
    sortPropName: string = "";
    isLoadingTaskList = false;
    tasks: Array<SharePointTask> = [];
    nextLinkUrls: string[] = [];

    headers: Array<Header> = [
        { title: this.coreLoc.Columns.Title, internalName: SharePointFieldsConstants.Title, type: PropertyIndexedType.Text },
        { title: this.coreLoc.Columns.AssignedTo, internalName: SharePointFieldsConstants.AssignedTo, type: PropertyIndexedType.Person },
        { title: this.coreLoc.Columns.DueDate, internalName: SharePointFieldsConstants.DueDate, type: PropertyIndexedType.DateTime },
        { title: this.coreLoc.Columns.Status, internalName: SharePointFieldsConstants.Status, type: PropertyIndexedType.Data }
    ];

    taskViewOptions: Array<TaskViewOption> = [
        { name: this.loc.TaskViews.TasksAssignedToMe, value: Enums.TaskViewType.AssignedToMe },
        { name: this.loc.TaskViews.TasksAssignedByMe, value: Enums.TaskViewType.AssignedByMe },
        { name: this.loc.TaskViews.CompletedTasks, value: Enums.TaskViewType.CompletedTasks }
    ];

    mounted() {

    }

    beforeDestroy() {
    }


    created() {
        this.init();
    }

    init() {
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat)
            this.dateFormat = regionalSettings.dateFormat;

        let viewTaskType = WebUtils.getQs(UrlParameters.TaskType);
        if (viewTaskType != null)
            this.selectingTaskType = parseInt(viewTaskType) as Enums.TaskContentType;
        this.selectingTaskId = WebUtils.getQs(UrlParameters.TaskId);
        if (this.selectingTaskType != undefined && this.selectingTaskId != undefined && !isNaN(parseInt(this.selectingTaskId)) && this.selectingTaskType == Enums.TaskContentType.ApprovalTask) {
            this.displayEditTaskForm = true;
        }
        else {
            this.loadTaskList();
        }
    }

    private getFilterTasks() {
        var spTaskRequest: TaskRequest = {
            queryText: '',
            rowPerPage: this.pager.rowsPerPage,
            pagingInfo: this.pager.pagingInfo,
            viewMode: this.currentTaskViewOption,
            sortAsc: this.sortAsc,
            sortBy: this.sortPropName,
            webUrl: this.spContext.pageContext.web.absoluteUrl,
            spItemId: 0,
            currentPage: this.pager.page
        }
        this.isLoadingTaskList = true;
        this.pager.isLoading = true;

        this.spTaskService.getTasksByCSOM(spTaskRequest).then((result) => {
            this.tasks = result.tasks;
            this.setPagingInfo(result.nextPageString, result.previousPageString);
            this.isLoadingTaskList = false;
        }).catch((errorMessage: string) => {
            this.isLoadingTaskList = false;
        });
    }


    getTasks() {
        if (this.sortPropName == SharePointFieldsConstants.AssignedTo) {
            this.getFilterTasks();
        }
        else {
            var spTaskRequest: TaskRequest = {
                queryText: '',
                rowPerPage: this.pager.rowsPerPage,
                pagingInfo: this.pager.pagingInfo,
                viewMode: this.currentTaskViewOption,
                sortAsc: this.sortAsc,
                sortBy: this.sortPropName,
                webUrl: this.spContext.pageContext.web.absoluteUrl,
                spItemId: 0
            }
            this.isLoadingTaskList = true;
            this.pager.isLoading = true;

            this.spTaskService.getTasksByGraph(spTaskRequest).then((result) => {
                this.tasks = result.tasks;
                if (!Utils.isNullOrEmpty(result.nextLinkUrl)) this.nextLinkUrls.push(result.nextLinkUrl);
                this.setPagingGraphApiInfo(result.nextLinkUrl);
                this.isLoadingTaskList = false;
                this.pager.isLoading = false;
            }).catch((errorMessage: string) => {
                this.isLoadingTaskList = false;
            });
        }
    }

    setPagingGraphApiInfo(nextLinkUrl: string) {
        this.pager.itemCount = this.tasks.length;
        if (this.tasks.length > 0 && !Utils.isNullOrEmpty(nextLinkUrl)) {
            this.pager.hasPaging = true;
            this.pager.hasNextPage = true;
            if (this.pager.page > 0) {
                this.pager.loadPreviousPage = () => {
                    this.pager.pagingInfo = this.nextLinkUrls[this.pager.page - 1];
                    this.getTasks();
                };
            }

            this.pager.loadNextPage = () => {
                this.pager.pagingInfo = this.nextLinkUrls[this.pager.page - 1];
                this.getTasks();
            };
        }
        else if (this.tasks.length > 0 && Utils.isNullOrEmpty(nextLinkUrl) && this.pager.page > 0) {
            this.pager.hasNextPage = false;
            this.pager.loadPreviousPage = () => {
                this.pager.pagingInfo = this.nextLinkUrls[this.pager.page - 1];
                this.getTasks();
            };
        }
        else if ((this.tasks.length === 0) || (Utils.isNullOrEmpty(nextLinkUrl) && this.pager.page === 0)) {
            this.pager.hasPaging = false;
        }
    }

    getSortByAscendingText(internalName: string) {
        switch (internalName) {
            case SharePointFieldsConstants.Title:
            case SharePointFieldsConstants.AssignedTo:
            case SharePointFieldsConstants.Status:
                return this.loc.SortText.TextFieldAscending;
            case SharePointFieldsConstants.DueDate:
                return this.loc.SortText.DateFieldAscending;
        }
        return '';
    }

    private getSortByDescendingText = (internalName: string) => {
        switch (internalName) {
            case SharePointFieldsConstants.Title:
            case SharePointFieldsConstants.AssignedTo:
            case SharePointFieldsConstants.Status:
                return this.loc.SortText.TextFieldDescending;
            case SharePointFieldsConstants.DueDate:
                return this.loc.SortText.DateFieldDescending;
        }
        return '';
    }

    changeSort(propName: string, sortAsc: boolean) {
        if (propName === this.sortPropName && sortAsc === this.sortAsc) return;
        this.sortPropName = propName;
        this.sortAsc = sortAsc;
        this.pager.resetPage();
        this.getTasks();
    }

    loadTaskList() {
        this.pager.resetPage();
        this.nextLinkUrls = [];
        this.sortPropName = SharePointFieldsConstants.DueDate;
        this.sortAsc = false;
        this.getTasks();
    }

    setPagingInfo(nextPageString: string, previousPageString: string) {
        if (this.tasks.length > 0 && nextPageString !== "") {
            this.pager.hasPaging = true;
            this.pager.hasNextPage = true;
            this.pager.loadPreviousPage = () => {
                this.pager.pagingInfo = previousPageString;
                this.getFilterTasks();
            };
            this.pager.loadNextPage = () => {
                this.pager.pagingInfo = nextPageString;
                this.getFilterTasks();
            };
        }
        else if (this.tasks.length > 0 && nextPageString === "" && this.pager.page > 0) {
            this.pager.hasNextPage = false;
            this.pager.loadPreviousPage = () => {
                this.pager.pagingInfo = previousPageString;
                this.getFilterTasks();
            };
        }
        else if ((this.tasks.length === 0) || (nextPageString === "" && this.pager.page === 0)) {
            this.pager.hasPaging = false;
        }
        this.pager.isLoading = false;
    }

    onEditTaskFormClose() {
        this.selectingTaskType = null;
        this.selectingTaskId = "";
        OPMUtils.navigateToNewState('?' + UrlParameters.DisplayTab + "=" + UrlParameters.Tasks);
        this.displayEditTaskForm = false;
        this.loadTaskList();
    }

    onTaskViewOptionChanged() {
        this.pager.resetPage();
        this.getTasks();
    }

    openTaskItem(taskItem: SharePointTask) {
        this.selectingTaskId = taskItem.id.toString();
        if (taskItem.contentType == Enums.TaskContentType.ApprovalTask) {
            this.selectingTaskType = Enums.TaskContentType.ApprovalTask;
        }

        let url = '?' + UrlParameters.DisplayTab + "=" + UrlParameters.Tasks + "&" +
            UrlParameters.TaskId + "=" + this.selectingTaskId + "&" +
            UrlParameters.TaskType + "=" + this.selectingTaskType;
        OPMUtils.navigateToNewState(url);

        this.displayEditTaskForm = true;
    }

    renderEditTaskForm(h) {
        switch (this.selectingTaskType) {
            case Enums.TaskContentType.ApprovalTask:
                return (<ApprovalTask closeCallback={this.onEditTaskFormClose}></ApprovalTask>)

            default:
                return null
        }
    }

    renderTask(h, task: SharePointTask) {
        return (
            <tr>
                {
                    this.headers.map((header) => {
                        switch (header.internalName) {
                            case SharePointFieldsConstants.Title:
                                return (
                                    <td>
                                        <a style={{ cursor: 'pointer' }} onClick={() => { this.openTaskItem(task); }}>{task.title}</a>
                                    </td>
                                );
                            case SharePointFieldsConstants.AssignedTo:
                                return (
                                    <td>
                                        <span>{task.assignedTo != null ? task.assignedTo : ''}</span>
                                    </td>
                                );
                            case SharePointFieldsConstants.DueDate:
                                return (
                                    <td>
                                        <span>{!Utils.isNullOrEmpty(task.dueDate) ? moment(task.dueDate).locale(this.omniaContext.language).format(this.dateFormat) : ""}</span>
                                    </td>
                                );
                            default:
                                return (
                                    <td>
                                        <span>{task.status}</span>
                                    </td>
                                );
                        }
                    })
                }
            </tr>
        )
    }

    renderHeaders(h) {
        return (
            <thead>
                <tr>
                    {this.headers.map((field) => {
                        return (
                            <th class={this.sortPropName == field.internalName ? 'text-left font-weight-bold' : 'text-left'}>
                                <v-icon small v-show={this.sortPropName == field.internalName && this.sortAsc == true}>arrow_upward</v-icon>
                                <v-icon small v-show={this.sortPropName == field.internalName && this.sortAsc != true}>arrow_downward</v-icon>
                                <v-menu offset-y close-delay="50"
                                    {
                                    ...this.transformVSlot({
                                        activator: (ref) => {
                                            const toSpread = {
                                                on: ref.on
                                            }
                                            return [
                                                <v-tooltip top {...toSpread} close-delay="50"
                                                    {
                                                    ...this.transformVSlot({
                                                        activator: (ref) => {
                                                            const toSpread1 = {
                                                                on: ref.on
                                                            }
                                                            return [
                                                                <span {...toSpread1} class={this.listViewClasses.menuHeader}>{field.title} <v-icon small>expand_more</v-icon></span>
                                                            ]
                                                        }
                                                    })}>
                                                    <span>{field.title}</span>
                                                </v-tooltip>
                                            ]
                                        }
                                    })}>
                                    <v-list>
                                        <v-list-item onClick={() => { this.changeSort(field.internalName, true); }}>
                                            <v-list-item-title>{this.getSortByAscendingText(field.internalName)}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item onClick={() => { this.changeSort(field.internalName, false); }}>
                                            <v-list-item-title>{this.getSortByDescendingText(field.internalName)}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </th>
                        )
                    })
                    }
                </tr>
            </thead >
        )
    }

    renderTasks(h) {
        return (
            <div>
                <v-data-table
                    loading={this.isLoadingTaskList}
                    headers={this.headers}
                    items={this.tasks}
                    hide-default-footer
                    hide-default-header
                    items-per-page={this.pageSize}
                    scopedSlots={{
                        item: p => this.renderTask(h, p.item),
                        header: p => this.renderHeaders(h)
                    }}>
                    <div slot="no-data">
                        {this.loc.Messages.MessageNoItem}
                    </div>
                </v-data-table>
                <div>
                    <Paging currentPager={this.pager}></Paging>
                </div>
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {
                    this.displayEditTaskForm ?
                        <div class="pa-4">{this.renderEditTaskForm(h)}</div> :
                        <div v-show={!this.displayEditTaskForm}>
                            <div class={this.listViewClasses.taskOptions}>
                                <v-select v-model={this.currentTaskViewOption} items={this.taskViewOptions}
                                    item-text="name" item-value="value" onInput={this.onTaskViewOptionChanged}></v-select>
                            </div>
                            {
                                !this.isLoadingTaskList ?
                                    this.renderTasks(h)
                                    :
                                    <v-skeleton-loader loading={true} height="100%" type="table-tbody"></v-skeleton-loader>
                            }
                        </div>
                }
            </div>
        )
    }
}

//If we need to use this in other components, we should make it as web component

@Component
export class Paging extends VueComponentBase<{ currentPager: IPagingServerQuery }, {}>  {
    @Prop() currentPager: IPagingServerQuery;

    render(h) {
        if (this.currentPager != null) {
            return this.currentPager.isLoading === true ? null :
                (
                    <div v-show={this.currentPager.isShowPager()} >
                        <table>
                            <tr>
                                <td>
                                    <v-btn text small icon onClick={this.currentPager.previousPage} v-show={!this.currentPager.isFirstPage()}>
                                        <v-icon>chevron_left</v-icon>
                                    </v-btn>
                                </td>
                                <td  >
                                    {(this.currentPager.page * this.currentPager.rowsPerPage + 1)} - {(this.currentPager.page * this.currentPager.rowsPerPage) + this.currentPager.itemCount}
                                </td>
                                <td  >
                                    <v-btn text small icon onClick={this.currentPager.nextPage} v-show={!this.currentPager.isLastPage()}>
                                        <v-icon>chevron_right</v-icon>
                                    </v-btn>
                                </td >
                            </tr >
                        </table >
                    </div >

                )
        }
        else
            return null;
    }
}
