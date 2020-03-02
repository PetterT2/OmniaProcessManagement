import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow, ConfirmDialogResponse } from '@omnia/fx/ux';
import { ProcessLibraryListViewStyles, DisplayProcess, FilterOption, FilterAndSortInfo, FilterAndSortResponse } from '../../../models';
import { LibrarySystemFieldsConstants, ProcessLibraryFields, DefaultDateFormat, ProcessLibraryListViewTabs } from '../../Constants';
import { Utils, OmniaContext, Inject } from '@omnia/fx';
import { TenantRegionalSettings } from '@omnia/fx-models';
import { ProcessLibraryDisplaySettings, ProcessListViewComponentKey, ProcessWorkingStatus, Process } from '../../../fx/models';
import { FiltersAndSorting } from '../../filtersandsorting/FiltersAndSorting';

declare var moment;

interface BaseListViewItemRowProps {
    item: DisplayProcess;
    displaySettings: ProcessLibraryDisplaySettings;
    processListViewComponentKey: ProcessListViewComponentKey;
    isAuthor: boolean;
    previewPageUrl: string;
    closeSubComponentCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    openProcess: (item: Process) => void;
    filtersAndSorting: FiltersAndSorting;
}

@Component
export class BaseListViewItemRow extends VueComponentBase<BaseListViewItemRowProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() processListViewComponentKey: ProcessListViewComponentKey;
    @Prop() item: DisplayProcess;
    @Prop() displaySettings: ProcessLibraryDisplaySettings;
    @Prop() isAuthor: boolean;
    @Prop() previewPageUrl: string;
    @Prop() closeSubComponentCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
    @Prop() openProcess: (item: Process) => void;
    @Prop() filtersAndSorting: FiltersAndSorting;
    @Inject(OmniaContext) omniaContext: OmniaContext;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    dateFormat: string = DefaultDateFormat;

    created() {
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }
    }

    private isErrorStatus(status: ProcessWorkingStatus) {
        if (status == ProcessWorkingStatus.SendingForApprovalFailed ||
            status == ProcessWorkingStatus.CancellingApprovalFailed ||
            status == ProcessWorkingStatus.SendingForReviewFailed ||
            status == ProcessWorkingStatus.CancellingReviewFailed ||
            status == ProcessWorkingStatus.SyncingToSharePointFailed ||
            status == ProcessWorkingStatus.ArchivingFailed) {
            return true;
        }
        else {
            return false;
        }
    }

    renderMenuAction(item: DisplayProcess) {
        let h = this.$createElement;
        return h(this.processListViewComponentKey.processMenuComponent, {
            domProps: {
                closeCallback: (refreshList, tab) => { this.closeSubComponentCallback(refreshList, tab) },
                process: item,
                isAuthor: this.isAuthor,
                viewPageUrl: this.previewPageUrl
            }
        });
    }

    render(h) {
        return (
            <tr onMouseover={() => { this.item.isMouseOver = true; this.$forceUpdate(); }} onMouseout={() => { this.item.isMouseOver = false; this.$forceUpdate(); }}>
                {
                    this.displaySettings.selectedFields.map((internalName: string) => {
                        switch (internalName) {
                            case LibrarySystemFieldsConstants.Menu:
                                return (
                                    <td class={this.listViewClasses.menuColumn}>
                                        {this.renderMenuAction(this.item)}
                                    </td>
                                );
                            case LibrarySystemFieldsConstants.Status:
                                let errorStatus = this.isErrorStatus(this.item.processWorkingStatus);
                                return (<td>
                                    {h(this.processListViewComponentKey.processingStatusComponent, {
                                        domProps: {
                                            redLabel: errorStatus,
                                            closeCallback: (refreshList, tab) => { this.closeSubComponentCallback(refreshList, tab) },
                                            process: this.item,
                                            isAuthor: this.isAuthor
                                        }
                                    })}
                                </td>)
                            case LibrarySystemFieldsConstants.Title:
                                return (
                                    <td>
                                        <a onClick={() => { this.openProcess(this.item); }}>{this.item.rootProcessStep.multilingualTitle}</a>
                                    </td>
                                );
                            case ProcessLibraryFields.Edition:
                            case ProcessLibraryFields.Revision:
                                return (
                                    <td>
                                        {this.item.rootProcessStep.enterpriseProperties[internalName]}
                                    </td>
                                );
                            case ProcessLibraryFields.PublishedAt:
                                return (
                                    <td>
                                        {moment(this.item.publishedAt).isValid() ? moment(this.item.publishedAt).format(this.dateFormat) : ""}
                                    </td>
                                );
                            case ProcessLibraryFields.ModifiedAt:
                                return (
                                    <td>
                                        {moment(this.item.modifiedAt).isValid() ? moment(this.item.modifiedAt).format(this.dateFormat) : ""}
                                    </td>
                                );
                            case ProcessLibraryFields.ModifiedBy:
                                return (
                                    <td>
                                        {this.item.modifiedByName}
                                    </td>
                                );
                            default:
                                return (
                                    <td>{Utils.isNullOrEmpty(this.item.sortValues[internalName]) ? this.filtersAndSorting.parseProcessValue(this.item, internalName) : this.item.sortValues[internalName]}</td>
                                )
                        };
                    })
                }
            </tr>
        )
    }
}