import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { OmniaTheming, VueComponentBase, IValidator, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessRollupService, ProcessTableColumnsConstants } from '../../fx';
import { ProcessDesignerLocalization } from '../loc/localize';
import { MultilingualString, RollupSetting, GuidValue } from '@omnia/fx-models';
import { IAddLinkedProcess } from './IAddLinkedProcess';
import { RollupProcess, ProcessVersionType, ProcessStep, Process } from '../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';

interface Selection {
    title: MultilingualString,
    displayText: string,
    opmProcessId: GuidValue
}

@Component
export class AddLinkedProcessComponent extends VueComponentBase implements IWebComponentInstance, IAddLinkedProcess {
    @Prop() onChange: (title: MultilingualString, opmProcessId: GuidValue) => void;
    @Prop() opmProcessId: GuidValue;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private isLoading: boolean = false;
    private selections: Array<Selection> = [];
    private searchInput: string = '';
    private selectedSelection: Selection = null;
    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.init();
    }

    beforeDestroy() {
    }

    private init() {

        this.isLoading = true;
        let query: RollupSetting = {
            resources: [{
                id: ProcessVersionType.Published.toString(),
                idProperty: ProcessTableColumnsConstants.versionType
            }],
            includeTotal: false,
            orderBy: [],
            customFilters: [],
            displayFields: []
        };
        this.processRollupService.queryProcesses(query).then((result) => {
            this.selections = [];
            let rollupProcesses = result.items as Array<RollupProcess>;
            let selectedSelection: Selection = null;
            rollupProcesses.forEach(p => {
                p.process.rootProcessStep.multilingualTitle = this.multilingualStore.getters.stringValue(p.process.rootProcessStep.title);
                let selection = {
                    opmProcessId: p.process.opmProcessId,
                    title: p.process.rootProcessStep.title,
                    displayText: p.process.rootProcessStep.multilingualTitle
                };

                if (p.process.opmProcessId == this.opmProcessId) {
                    selectedSelection = selection;
                }
                else {
                    this.selections.push(selection);
                }
            });

            this.selections.sort((a, b) => {
                return a.displayText.localeCompare(b.displayText);
            });

            if (!selectedSelection && this.opmProcessId) {
                selectedSelection = {
                    opmProcessId: this.opmProcessId,
                    title: this.multilingualStore.getters.ensureMultilingualString(this.opmProcessId.toString()),
                    displayText: this.opmProcessId.toString()
                }
            }

            if (selectedSelection) {
                this.selectedSelection = selectedSelection;
                this.selections.unshift(selectedSelection);
            }

            this.isLoading = false;
        }).catch((msg) => {
            this.isLoading = false;
        });
    }

    render(h) {
        return (
            <div>
                <v-autocomplete
                    class="mb-4"
                    dark={this.omniaTheming.promoted.body.dark}
                    loading={this.isLoading}
                    label={this.pdLoc.AddLinkedProcess.Process}
                    placeholder={this.pdLoc.AddLinkedProcess.SearchText}
                    items={this.selections}
                    v-model={this.selectedSelection}
                    hide-details
                    item-text="displayText"
                    return-object
                    searchInput={this.searchInput}
                    onChange={(val: Selection) => {
                        this.searchInput = '';
                        this.onChange(val ? val.title : null, val ? val.opmProcessId : null);
                        this.$forceUpdate();
                    }}
                    no-data-text={this.pdLoc.AddLinkedProcess.ProcessNotFound}>
                    <v-icon slot="append" color="grey">fa-search</v-icon>
                </v-autocomplete>
            </div>
        )
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AddLinkedProcessComponent, { destroyTimeout: 500 });
});
