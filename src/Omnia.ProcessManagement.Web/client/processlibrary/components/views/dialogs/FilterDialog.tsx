import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject } from '@omnia/fx';
import { OmniaTheming, StyleFlow, DialogPositions } from '@omnia/fx/ux';
import { classes } from "typestyle";
import { ProcessLibraryStyles } from '../../../../models';
import { SharePointContext } from '@omnia/fx-sp';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { HeaderTable } from '../../../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessService } from '../../../../fx';
import { DefaultDateFormat } from '../../../Constants';

interface FilterDialogProps {
    selectedColumn: HeaderTable;
    changeFilterValues: (column: string, selectedValues: Array<any>) => void;
    clearFilter: (column: string) => void;
    closeCallback: () => void;
    isFilteringValue: (column: string, value: string) => boolean;
}

interface FilterOption {
    value: string;
    isSelected: boolean;
}

@Component
export class FilterDialog extends tsx.Component<FilterDialogProps>
{
    @Prop() styles: typeof ProcessLibraryStyles | any;
    @Prop() selectedColumn: HeaderTable;
    @Prop() changeFilterValues: (column: string, selectedValues: Array<any>) => void;
    @Prop() clearFilter: (column: string) => void;
    @Prop() closeCallback: () => void;
    @Prop() isFilteringValue: (column: string, value: string) => boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;

    private classes = StyleFlow.use(ProcessLibraryStyles, this.styles);
    private dateFormat: string = DefaultDateFormat;
    private filterOptions: Array<FilterOption>;
    private opened: boolean = true;
    private isLoadingFilterOptions: boolean = false;

    created() {
        this.filterOptions = [];
        this.getFilterOptions();
    }

    private getFilterOptions() {
        this.isLoadingFilterOptions = true;
        this.processService.getFilteringOptions(this.spContext.pageContext.web.absoluteUrl, this.selectedColumn.value)
            .then(data => {
                data.forEach(d => this.filterOptions.push({
                    value: d,
                    isSelected: this.isFilteringValue(this.selectedColumn.value, d)
                }));
                this.isLoadingFilterOptions = false;
            })
    }

    private applyFilter() {
        var selectedOptions = this.getSelectedOptions(this.filterOptions);
        if (selectedOptions && selectedOptions.length > 0) {
            this.changeFilterValues(this.selectedColumn.value, selectedOptions.map(f => f.value));
        }
        else {
            this.clearFilter(this.selectedColumn.value);
        }
        this.$forceUpdate();
    }

    private getSelectedOptions(options): Array<FilterOption> {
        var selectedOptions = options.filter(o => o.isSelected);
        options.forEach((item) => {
            if (item.filterOptions && item.filterOptions.length > 0) {
                var childSelectedOptions = this.getSelectedOptions(item.filterOptions);
                childSelectedOptions.forEach((childSelectedOption) => {
                    selectedOptions.push(childSelectedOption);
                });
            }
        });
        return selectedOptions;
    }

    private clearAllFilter(filters: Array<{ value: string, isSelected: boolean }>) {
        filters.forEach((item) => {
            item.isSelected = false;
        });
        this.$forceUpdate();
    }

    private selectFilter(option: any, selected: boolean) {
        option.isSelected = selected;
        this.$forceUpdate();
    }

    private close() {
        this.closeCallback();
        this.opened = false;
    }

    private renderOption(h, option: FilterOption, level, parent) {
        return <v-list-item style={{ paddingLeft: (level * 40) + 'px' }}>
            <v-list-item-action>
                <v-checkbox primary hide-details input-value={option.isSelected} onChange={(newValue: boolean) => {
                    this.selectFilter(option, newValue);
                }}>
                </v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
                <v-list-item-title >{option.value}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>;
    }

    private renderFilterOptions(h) {
        return (this.filterOptions && this.filterOptions.length > 0 &&
            <v-list class="ml-4">
                {
                    this.filterOptions.map(option => {
                        return this.renderOption(h, option, 0, null)
                    })
                }
            </v-list>
        )
    }

    render(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.close() }}
                model={{ visible: this.opened }}
                hideCloseButton
                width="480px"
                position={DialogPositions.Right}>

                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                    <v-toolbar-title>{this.loc.Filter.FilterBy + " " + this.selectedColumn.text}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={() => { this.close() }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>

                <div>
                    <v-container class={this.classes.dialogContent}>
                        {
                            this.isLoadingFilterOptions ? (<div class="text-center"><v-progress-circular indeterminate color="primary"></v-progress-circular></div>) :
                                this.renderFilterOptions(h)
                        }
                    </v-container>

                    <div class={[this.classes.dialogFooter, "text-right"]}>
                        <v-btn
                            text
                            class="pull-right"
                            color={this.omniaTheming.promoted.body.text.base}
                            onClick={() => { this.clearAllFilter(this.filterOptions); }}>
                            {this.loc.Filter.ClearAll}
                        </v-btn>
                        <v-btn
                            text
                            class="pull-right"
                            color={this.omniaTheming.promoted.body.text.base}
                            onClick={this.applyFilter}>
                            {this.loc.Filter.ApplyFilter}
                        </v-btn>
                    </div>
                </div>
            </omfx-dialog>
        )
    }
}
