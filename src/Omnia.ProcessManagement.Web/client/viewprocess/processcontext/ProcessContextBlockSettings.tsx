import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IProcessContextBlockSettingsComponent } from './IProcessContextBlockSettings';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux"
import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { ProcessContextBlockData, OPMProcessProperty } from '../../fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';

@Component
export class ProcessContextBlockSettingsComponent extends Vue implements IWebComponentInstance, IProcessContextBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessContextBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;

    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    blockData: ProcessContextBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    isLoadingProperties: boolean = true;

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.enterprisePropertyStore.actions.ensureLoadData.dispatch().then(() => { this.isLoadingProperties = false; })
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            this.setBlockData(blockData || {
                data: {},
                settings: {
                    pageProperty: null
                }
            });
        });
    }

    get availableProperties() {
        return this.enterprisePropertyStore.getters.enterprisePropertyDefinitions()
            .filter(i => (i.enterprisePropertyDataType.id == OPMProcessProperty.Id));
    }

    setBlockData(blockData: ProcessContextBlockData) {
        this.blockData = blockData;
    }

    beforeDestroy() {
        this.subscriptionHandler.unsubscribe();
    }

    updateSettings() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    render(h) {
        let dark = this.omniaTheming.promoted.body.dark;
        let properties = this.availableProperties;
        if (!this.blockData || this.isLoadingProperties) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        return (
            <v-card dark={dark}>
                <v-card-text>
                    <v-select
                        clearable
                        loading={this.isLoadingProperties}
                        item-value="internalName"
                        item-text="multilingualTitle"
                        items={properties}
                        v-model={this.blockData.settings.pageProperty}
                        label={this.corLoc.Blocks.Context.PageProperty}
                        onChange={() => { this.updateSettings(); }}>
                    </v-select>
                </v-card-text>
            </v-card>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessContextBlockSettingsComponent);
});
