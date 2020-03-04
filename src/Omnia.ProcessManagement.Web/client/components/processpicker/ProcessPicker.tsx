import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, IValidator, FieldValueValidation, VueComponentBase, StyleFlow } from "@omnia/fx/ux";
import { ValueDefinitionSetting, EnterprisePropertyDefinition, BuiltInEnterprisePropertyInternalNames, RollupSetting, PropertyIndexedType, GuidValue, Guid } from '@omnia/fx-models';
import { IProcessPicker } from './IProcessPicker';
import './ProcessPicker.css';
import { ProcessPickerStyles, ProcessVersionType, LightProcess } from '../../fx/models';
import { ProcessPickerLocalization } from './loc/localize';
import { ProcessRollupService, ProcessTableColumnsConstants, SharePointFieldsConstants, ProcessStore } from '../../fx';

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
    @Prop() onModelChange: (opmProcessIds: Array<string>) => void;
    @Prop({ default: null }) validator?: IValidator;

    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;
    @Inject(ProcessStore) processStore: ProcessStore;

    @Localize(ProcessPickerLocalization.namespace) private loc: ProcessPickerLocalization.locInterface;

    private styles = StyleFlow.use(ProcessPickerStyles);
    private instanceId = Utils.generateGuid();
    private selectedItem: Array<LightProcess> | LightProcess = [];
    private searchInput = null;
    private backupModel: string = "";
    private processResult: Array<LightProcess> = [];
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
        if (Utils.isNull(this.label))
            this.label = this.loc.DefaultLabel

        if (this.$refs.processPicker)
            this.$refs.processPicker.reset();

        this.isInitialized = true;
        this.isSearching = true;
        this.isResolvingSelectedItem = true;

        this.processStore.actions.ensureLightProcessLoaded.dispatch().then(() => {
            var resolvedModel: Array<string> = this.model && this.model !== 'undefined' ? (Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>)) : [];

            if (resolvedModel && resolvedModel.length > 0) {
                var existedProcesses = this.processStore.getters.lightProcess(resolvedModel);

                if (this.multiple) {
                    this.selectedItem = existedProcesses;
                    this.searchCallback(this.selectedItem, true);
                }
                else {
                    this.selectedItem = existedProcesses ? existedProcesses[0] : null;
                    this.searchCallback(this.selectedItem ? [this.selectedItem] : [], true);
                }

                this.backupModel = existedProcesses ? JSON.parse(JSON.stringify(existedProcesses.map(p => { return p.opmProcessId; }))) : null;
            }
            this.isSearching = false;
            this.isResolvingSelectedItem = false;
        })
    }

    searchCallback(result: Array<LightProcess>, isInit: boolean = false) {
        result = result.filter(r => isInit || !this.checkIfAdded(r.opmProcessId.toString()));
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
                    this.processRollupService.queryProcessesWithoutPermission(query).then((data) => {
                        // ensure return result for current search text
                        if (this.searchInput === trackingSearchText) {
                            this.searchCallback(data);
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
                    idProperty: ProcessTableColumnsConstants.versionType,
                    filters: []
                }
            ],
            includeTotal: false,
            orderBy: [],
            itemLimit: 20,
            customFilters: [
                {
                    property: SharePointFieldsConstants.Title,
                    type: PropertyIndexedType.Text,
                    valueObj: {
                        searchValue: this.searchInput,
                        value: this.searchInput
                    }
                }
            ],
            displayFields: []
        };
        return query;
    }

    onInput(newValue: Array<LightProcess> | LightProcess) {
        this.selectedItem = newValue
        let resultProcesses: Array<LightProcess> = [];

        if (this.multiple) {
            newValue = newValue || [];
            resultProcesses = (newValue as Array<LightProcess>).map<LightProcess>(item => { return item });
        }
        else if (newValue) {
            resultProcesses = [newValue as LightProcess];
        }

        var result = resultProcesses.map(p => { return p.opmProcessId.toString(); });

        this.backupModel = JSON.stringify(result);

        if (this.onModelChange) {
            this.onModelChange(result);
        }
        this.$forceUpdate();
    }

    filter(item: LightProcess, queryText: string, itemText: string) {
        return !this.checkIfAdded(item.opmProcessId.toString()) && itemText && (!queryText || itemText.toLowerCase().indexOf(queryText.toLowerCase()) >= 0);
    }

    checkIfAdded(id: string) {
        if (this.multiple)
            return this.selectedItem && (this.selectedItem as Array<LightProcess>).filter(e => e.opmProcessId == id).length > 0 ? true : false;
        else
            return this.selectedItem && (this.selectedItem as LightProcess).opmProcessId == id ? true : false;
    }

    remove(item: LightProcess) {
        if (this.isSearching) return;

        if (this.multiple)
            this.selectedItem = (this.selectedItem as Array<LightProcess>).filter(e => e.opmProcessId != item.opmProcessId);
        else
            this.selectedItem = null;

        this.searchInput = '';
        this.onInput(this.selectedItem);
    }

    renderSelectedItem(h, p: { selected: boolean, item: LightProcess }) {
        let clickCloseSpread = { on: { "click:close": () => { this.remove(p.item) } } };
        return [
            <v-chip
                dark={this.dark}
                class={this.styles.selectedItemWrapper}
                close={!this.disabled}
                input-value={p.selected}
                {...clickCloseSpread}>
                <v-avatar class={this.styles.avatarStyle}>
                    <omfx-letter-avatar name={p.item.multilingualTitle} size={45}></omfx-letter-avatar>
                </v-avatar>
                {p.item.multilingualTitle + ' (' + p.item.opmProcessIdNumber.toString() + ')'}
            </v-chip>
        ];
    }

    renderItem(h, p: { item: LightProcess }) {
        return (
            [
                <v-list-item-avatar left dark={this.dark}>
                    <omfx-letter-avatar name={p.item.multilingualTitle} size={45}></omfx-letter-avatar>
                </v-list-item-avatar>,
                <v-list-item-content dark={this.dark}>
                    <v-list-item-title>{p.item.multilingualTitle + '(' + p.item.opmProcessIdNumber.toString() + ')'}</v-list-item-title>
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


        let label = this.required ? this.label + '*' : this.label;

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
                    item-text="multilingualTitle"
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
