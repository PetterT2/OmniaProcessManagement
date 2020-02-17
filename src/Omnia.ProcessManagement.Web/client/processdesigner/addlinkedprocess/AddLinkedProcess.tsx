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
import { RollupProcess, ProcessVersionType, ProcessStep } from '../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class AddLinkedProcessComponent extends VueComponentBase implements IWebComponentInstance, IAddLinkedProcess {
    @Prop() onChange: (title: MultilingualString) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private isLoading: boolean = false;
    private isSearching: boolean = false;
    private processes: Array<ProcessStep> = [];
    private searchInput: string = '';
    private selectedProcess: ProcessStep;

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
        this.isSearching = false;
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
            this.processes = [];
            let rollupProcesses = result.items as Array<RollupProcess>;
            rollupProcesses.forEach(p => {
                p.process.rootProcessStep.multilingualTitle = this.multilingualStore.getters.stringValue(p.process.rootProcessStep.title);
                this.processes.push(p.process.rootProcessStep);
            });
            this.processes.sort((a, b) => {
                return a.multilingualTitle.localeCompare(b.multilingualTitle);
            });
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
                    loading={this.isSearching || this.isLoading}
                    label={this.pdLoc.AddLinkedProcess.Process}
                    placeholder={this.pdLoc.AddLinkedProcess.SearchText}
                    items={this.processes}
                    v-model={this.selectedProcess}
                    hide-details
                    hide-selected="true"
                    item-text="multilingualTitle"
                    return-object
                    searchInput={this.searchInput}
                    onChange={(val: ProcessStep) => {
                        this.searchInput = '';
                        this.isSearching = false;
                        this.onChange(val ? val.title : null);
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
