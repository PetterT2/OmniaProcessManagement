import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { IValidator, FieldValueValidation, VueComponentBase, StyleFlow } from "@omnia/fx/ux";
import { RollupSetting, PropertyIndexedType, GuidValue, RollupOtherTypes } from '@omnia/fx-models';
import { IProcessPicker } from './IProcessPicker';
import './ProcessPicker.css';
import { ProcessPickerStyles, ProcessVersionType, Process, OPMEnterprisePropertyInternalNames } from '../../fx/models';
import { ProcessPickerLocalization } from './loc/localize';
import { ProcessRollupService, ProcessTableColumnsConstants, ProcessStore } from '../../fx';

interface ProcessPickerItem {
    title: string,
    opmProcessIdNumber: string,
    titleWithId: string,
    opmProcessId: GuidValue,
    process: Process
}

interface ResolveProcessResult {
    opmProcessId: GuidValue,
    process?: Process
}

@Component
export class ProcessPickerComponent extends VueComponentBase implements IWebComponentInstance, IProcessPicker {

    @Prop({ default: false }) hideSelected?: boolean;
    @Prop({ default: false }) dark?: boolean;
    @Prop() label: string;
    @Prop() required: boolean;
    @Prop({ default: true }) filled: boolean;
    @Prop() disabled: boolean;
    @Prop() multiple: boolean;
    @Prop() model: Array<string> | string;
    @Prop() onModelChange: (processes: Array<Process>) => void;
    @Prop({ default: null }) validator?: IValidator;

    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;
    @Inject(ProcessStore) processStore: ProcessStore;

    @Localize(ProcessPickerLocalization.namespace) private loc: ProcessPickerLocalization.locInterface;

    private styles = StyleFlow.use(ProcessPickerStyles);
    private instanceId = Utils.generateGuid();
    private selectedItem: Array<ProcessPickerItem> | ProcessPickerItem = [];
    private searchInput = null;
    private backupModel: string = "";
    private processResult: Array<ProcessPickerItem> = [];
    private isInitialized: boolean = false;
    private isResolvingSelectedItem = false;
    private isSearching: boolean = false;
    private isPendingToSearch: boolean = false;

    $refs: {
        processPicker: any,
    }

    @Watch('model', { deep: true })
    dialogModelChange(model: string) {
        if (!this.isInitialized) return;
        if (model == this.backupModel) return;
        this.init();
    }

    created() {
        this.init();
        if (this.validator) {
            this.validator.register(this);
        }
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    init() {
        if (this.$refs.processPicker)
            this.$refs.processPicker.reset();

        this.isInitialized = true;
      
        var idsToResolve: Array<string> = this.model && this.model !== 'undefined' ? (Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>)) : [];

        this.selectedItem = this.multiple ? [] : null;

        if (idsToResolve && idsToResolve.length > 0) {
            this.isSearching = true;
            this.isResolvingSelectedItem = true;

            let promises: Array<Promise<ResolveProcessResult>> = idsToResolve.map(id => new Promise<ResolveProcessResult>((resolve, reject) => {
                this.processStore.actions.ensurePublishedProcess.dispatch(id).then((process) => {
                    resolve({ opmProcessId: id, process: process });
                }).catch(err => {
                    resolve({ opmProcessId: id, process: null });
                })
            }));

            Promise.all(promises).then(resolvedProcessResults => {
                if (this.multiple) {
                    this.selectedItem = resolvedProcessResults.map(r => this.mapToProcessPickerItem(r.opmProcessId, r.process));
                    this.searchCallback(this.selectedItem, true);

                    this.backupModel = JSON.stringify(this.selectedItem.map(i => i.opmProcessId.toString().toLowerCase()));
                }
                else {
                    this.selectedItem = this.mapToProcessPickerItem(resolvedProcessResults[0].opmProcessId, resolvedProcessResults[0].process)
                    this.searchCallback([this.selectedItem], true);

                    this.backupModel = JSON.stringify(this.selectedItem.opmProcessId.toString().toLowerCase());
                }

                this.isSearching = false;
                this.isResolvingSelectedItem = false;
            })
        } 
    }

    searchCallback(result: Array<ProcessPickerItem>, isInit: boolean = false) {
        result = result.filter(r => isInit || !this.checkIfAdded(r.process.opmProcessId.toString()));
        this.processResult = isInit ? result : this.processResult.filter(u => this.checkIfAdded(u.opmProcessId.toString())).concat(result);
        this.isSearching = false;
        this.updateDimensions();
    }

    search(text: string) {
        text = text ? text.trim() : '';
        if (this.searchInput !== text) {
            this.searchInput = text;
            if (Utils.isNullOrEmpty(this.searchInput)) {
                this.searchCallback([]);
                return;
            }
            this.isSearching = false;
            this.isPendingToSearch = true;
            Utils.timewatch(`process_picker_wc_${this.instanceId}`, () => {
                let trackingSearchText = this.searchInput;
                if (!Utils.isNullOrEmpty(trackingSearchText)) {
                    this.isSearching = true;
                    this.isPendingToSearch = true;
                    var query = this.getQuery();
                    this.processRollupService.queryProcesses(query).then((data) => {
                        // ensure return result for current search text
                        if (this.searchInput === trackingSearchText) {
                            this.searchCallback(data.items.map(i => this.mapToProcessPickerItem(i.process.opmProcessId, i.process, i.searchTitle)));
                            this.isPendingToSearch = false;
                        }
                    }).catch(err => {
                        if (this.searchInput === trackingSearchText) {
                            this.searchCallback([]);
                            this.isPendingToSearch = false;
                        }
                    })
                }
                else {
                    this.isSearching = false;
                    this.isPendingToSearch = false;
                }
            }, 500);
        }
    }

    mapToProcessPickerItem(opmProcessId: GuidValue, process?: Process, searchTitle?: string): ProcessPickerItem {
        let title = searchTitle || (process ? process.rootProcessStep.multilingualTitle : this.loc.UnauthorizedOrNotFound);
        let idNumber = process ? process.rootProcessStep.enterpriseProperties[OPMEnterprisePropertyInternalNames.OPMProcessIdNumber] : "?";
        let processPickerItem: ProcessPickerItem = {
            process: process,
            title: title,
            titleWithId: `${title} ${process ? idNumber : ''}`,
            opmProcessIdNumber: idNumber,
            opmProcessId: opmProcessId
        }
        return processPickerItem;
    }

    updateDimensions() {
        if (this.$refs && this.$refs.processPicker) {
            this.$nextTick(() => {
                this.$refs.processPicker.$refs.menu.updateDimensions();
            })
        }
    }


    getQuery(): RollupSetting {
        let query: RollupSetting = {
            resources: [
                {
                    id: ProcessVersionType.Published.toString(),
                    idProperty: ProcessTableColumnsConstants.versionType
                }
            ],
            customFilters: [
                {
                    property: '',
                    type: RollupOtherTypes.TextSearches,
                    valueObj: {
                        searchValue: this.searchInput,
                        value: this.searchInput
                    }
                }
            ],
            includeTotal: false,
            orderBy: [],
            itemLimit: 20,
            displayFields: []
        };
        return query;
    }

    onInput(newValue: Array<ProcessPickerItem> | ProcessPickerItem) {
        this.selectedItem = newValue
        let resultProcesses: Array<ProcessPickerItem> = [];

        if (this.multiple) {
            newValue = newValue || [];
            resultProcesses = (newValue as Array<ProcessPickerItem>).map<ProcessPickerItem>(item => { return item });
        }
        else if (newValue) {
            resultProcesses = [newValue as ProcessPickerItem];
        }

        var processes = resultProcesses.map(p => p.process).filter(p => p);
        var opmProcessIds = resultProcesses.map(p => p.opmProcessId);
        let backupModel = JSON.stringify(opmProcessIds);
        let previousBackupModel = this.backupModel;
        this.backupModel = JSON.stringify(opmProcessIds);

        if (this.onModelChange && previousBackupModel != backupModel) {
            this.onModelChange(processes);
        }

        this.$forceUpdate();
    }

    filter(item: Process, queryText: string, itemText: string) {
        return !this.checkIfAdded(item.opmProcessId.toString()) && itemText && (!queryText || itemText.toLowerCase().indexOf(queryText.toLowerCase()) >= 0);
    }

    checkIfAdded(id: string) {
        if (this.multiple)
            return this.selectedItem && (this.selectedItem as Array<ProcessPickerItem>).filter(e => e.opmProcessId == id).length > 0 ? true : false;
        else
            return this.selectedItem && (this.selectedItem as ProcessPickerItem).opmProcessId == id ? true : false;
    }

    remove(item: ProcessPickerItem) {
        if (this.isSearching) return;

        if (this.multiple)
            this.selectedItem = (this.selectedItem as Array<ProcessPickerItem>).filter(e => e.opmProcessId != item.opmProcessId);
        else
            this.selectedItem = null;

        this.searchInput = '';
        this.onInput(this.selectedItem);
    }

    renderSelectedItem(h, p: { selected: boolean, item: ProcessPickerItem }) {
        let clickCloseSpread = { on: { "click:close": () => { this.remove(p.item); } } };
        return [
            <v-chip
                dark={this.dark}
                class={this.styles.selectedItemWrapper}
                close={!this.disabled}
                input-value={p.selected}
                {...clickCloseSpread}>
                <v-avatar color={this.theming.colors.primary.base} class={[this.styles.avatarStyle, 'mr-2']}>
                    {p.item.opmProcessIdNumber}
                </v-avatar>
                {p.item.title}
            </v-chip>
        ];
    }

    renderItem(h, p: { item: ProcessPickerItem }) {
        return (
            [
                <v-list-item-avatar size="32" color={this.theming.colors.primary.base} class={this.styles.avatarStyle}>
                    {p.item.opmProcessIdNumber}
                </v-list-item-avatar>,
                <v-list-item-content dark={this.dark}>
                    <v-list-item-title>{p.item.title}</v-list-item-title>
                </v-list-item-content>
            ])
    }

    render(h) {
        const toSpread = {
            on: {
                'update:search-input': this.search,
            },
        }

        let rules = [];
        if (this.required)
            if (this.multiple === true)
                rules = new FieldValueValidation().IsArrayRequired(true, this.loc.IsRequiredMessage).getRules();
            else
                rules = new FieldValueValidation().IsRequired(true, this.loc.IsRequiredMessage).getRules();

        let label = this.label || this.loc.DefaultLabel;
        label = this.required ? label + '*' : label;

        return (
            <div>
                <v-autocomplete
                    filled={this.filled}
                    dark={this.dark}
                    ref="processPicker"
                    readonly={this.disabled || this.isResolvingSelectedItem}
                    loading={this.isSearching ? this.styles.loadingColor : false}
                    label={label}
                    items={this.processResult}
                    item-text="titleWithId"
                    v-model={this.selectedItem}
                    onChange={this.onInput}
                    return-object
                    multiple={this.multiple}
                    chips
                    disabled={this.disabled}
                    hide-no-data={Utils.isNullOrEmpty(this.searchInput) || this.isPendingToSearch}
                    no-data-text={this.loc.NoProcessFound}
                    hide-selected={this.hideSelected}
                    filter={this.filter}
                    rules={rules}
                    {...this.transformVSlot({
                        item: p => this.renderItem(h, p),
                        selection: p => this.renderSelectedItem(h, p)
                    })}
                    {...toSpread} />
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessPickerComponent);
});
