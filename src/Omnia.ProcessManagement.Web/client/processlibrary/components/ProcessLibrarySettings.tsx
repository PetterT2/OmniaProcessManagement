import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessLibraryLocalization } from '../loc/localize';
import { OmniaTheming } from '@omnia/fx/ux';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { ProcessLibraryBlockData } from '../../fx/models';
import { ProcessLibraryConfigurationFactory } from '../factory/ProcessLibraryConfigurationFactory';
import { DisplayTab } from './settingtabs/DisplayTab';
import { DisplayFieldsTab } from './settingtabs/DisplayFileldTab';
import { GeneralTab } from './settingtabs/GeneralTab';

@Component
export class ProcessLibrarySettingsComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessLibraryBlockData>;

    blockData: ProcessLibraryBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;

    // -------------------------------------------------------------------------
    // Lifecycle Hooks
    // -------------------------------------------------------------------------

    beforeDestroy() {
        if (this.subscriptionHandler) this.subscriptionHandler.unsubscribe();
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            if (!blockData) {
                blockData = ProcessLibraryConfigurationFactory.create();
                this.settingsService.setValue(this.settingsKey, blockData);
            }
            else
                this.setBlockData(blockData)
        });
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    setBlockData(blockData: ProcessLibraryBlockData) {
        this.blockData = Utils.clone(blockData); 
    }

    renderSettings() {
        let h = this.$createElement;
        return (
            <v-expansion-panels accordion>
                <v-expansion-panel>
                    <v-expansion-panel-header>{this.loc.ProcessLibrarySettings.Tabs.General}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <GeneralTab settingsKey={this.settingsKey} ></GeneralTab>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                    <v-expansion-panel-header>{this.loc.ProcessLibrarySettings.Tabs.Display}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <DisplayTab settingsKey={this.settingsKey}></DisplayTab>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel>
                    <v-expansion-panel-header>{this.loc.ProcessLibrarySettings.Tabs.Drafts}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <DisplayFieldsTab settingsKey={this.settingsKey} isPublished={false}></DisplayFieldsTab>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        );
    }

    render(h) {
        return (
            <div>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> : this.renderSettings()
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessLibrarySettingsComponent, { destroyTimeout: 1000 });
});

