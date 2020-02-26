import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, IValidator, FieldValueValidation, VueComponentBase, StyleFlow } from "@omnia/fx/ux";
import { ValueDefinitionSetting, EnterprisePropertyDefinition, BuiltInEnterprisePropertyInternalNames, RollupSetting, PropertyIndexedType } from '@omnia/fx-models';
import { IProcessPicker } from './IProcessPicker';
import './ProcessPicker.css';
import { ProcessPickerStyles, ProcessVersionType, LightProcess } from '../../fx/models';
import { ProcessPickerLocalization } from './loc/localize';
import { ProcessRollupService, ProcessTableColumnsConstants, SharePointFieldsConstants } from '../../fx';

@Component
export class ProcessPickerComponent extends VueComponentBase implements IWebComponentInstance, IProcessPicker {

    @Prop({ default: false }) hideSelected?: boolean;
    @Prop({ default: false }) dark?: boolean;
    @Prop() label: string;
    @Prop() required: boolean;
    @Prop({ default: true }) filled: boolean;
    @Prop() disabled: boolean;
    @Prop() multiple: boolean;
    @Prop() model: Array<LightProcess>;
    @Prop() onModelChange: (process: Array<LightProcess>) => void;
    @Prop({ default: null }) validator?: IValidator;

    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;

    @Localize(ProcessPickerLocalization.namespace) private loc: ProcessPickerLocalization.locInterface;

    private styles = StyleFlow.use(ProcessPickerStyles);
    private instanceId = Utils.generateGuid();
    private selectedItem: Array<LightProcess> | LightProcess = [];
    private searchInput = null;
    private processResult: Array<LightProcess> = [];
    private isSearching: boolean = false;
    private isPendingToSearch: boolean = false;

    $refs: {
        processPicker: any,
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
    }

    search(text: string) {
        text = text ? text.trim() : '';
        if (this.searchInput !== text) {
            this.searchInput = text;
            if (Utils.isNullOrEmpty(this.searchInput)) {
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
                            this.processResult = data;
                            this.isSearching = false;
                            this.updateDimensions();
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
        let result: Array<LightProcess> = [];

        if (this.multiple) {
            newValue = newValue || [];
            result = (newValue as Array<LightProcess>).map<LightProcess>(item => { return item });
        }
        else if (newValue) {
            result = [newValue as LightProcess];
        }

        if (this.onModelChange) {
            this.onModelChange(result);
        }
        this.$forceUpdate();
    }

    remove(item: LightProcess) {
        if (this.isSearching) return;

        if (this.multiple)
            this.selectedItem = (this.selectedItem as Array<LightProcess>).filter(e => e.id != item.id);
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
                {p.item.multilingualTitle}
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
                    <v-list-item-title>{p.item.multilingualTitle}</v-list-item-title>
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
                    readonly={this.disabled}
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
