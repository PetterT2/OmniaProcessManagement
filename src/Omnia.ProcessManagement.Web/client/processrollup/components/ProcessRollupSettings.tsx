import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils } from '@omnia/fx'
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services'

import { ProcessRollupLocalization } from '../loc/localize';
import { GeneralTab } from './settingstabs/GeneralTab';
import { QueryTab } from './settingstabs/QueryTab';
import { DisplayTab } from './settingstabs/DisplayTab';
import { FilterTab } from './settingstabs/FilterTab';
import { IMessageBusSubscriptionHandler, BuiltInEnterprisePropertyInternalNames } from '@omnia/fx-models';
import { OmniaTheming } from "@omnia/fx/ux"
import { ProcessRollupBlockData } from '../../fx/models';
import { ProcessRollupConfigurationFactory } from '../factory/ProcessRollupConfigurationFactory';

@Component
export class ProcessRollupSettingsComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: any;
    // Localize
    @Localize(ProcessRollupLocalization.namespace) private loc: ProcessRollupLocalization.locInterface;

    //services
    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    blockData: ProcessRollupBlockData = null;

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        this.clearMsgSubscriptionHandler();
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {

            this.addMsgSubscriptionHandler(
                this.settingsService
                    .onKeyValueUpdated(this.settingsKey)
                    .subscribe(this.setBlockData)
            );

            if (!blockData) {
                blockData = ProcessRollupConfigurationFactory.create();
                this.settingsService.setValue(this.settingsKey, blockData);
            }
            else
                this.setBlockData(blockData)
        });
    }

    addMsgSubscriptionHandler(msgSubscribe: IMessageBusSubscriptionHandler) {
        if (!this.subscriptionHandler)
            this.subscriptionHandler = msgSubscribe;
        else
            this.subscriptionHandler.add(msgSubscribe);
    }

    clearMsgSubscriptionHandler() {
        if (this.subscriptionHandler) this.subscriptionHandler.unsubscribe();
        this.subscriptionHandler = null;
    }

    setBlockData(blockData: ProcessRollupBlockData) {
        this.blockData = Utils.clone(blockData);
    }

    renderSettings() {
        let h = this.$createElement;

        return (
            <v-expansion-panels dark={this.omniaTheming.promoted.body.dark}>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h4 class="subtitle-1"> {this.loc.Settings.Query}</h4>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <GeneralTab styles={this.styles} settingsKey={this.settingsKey}></GeneralTab>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h4 class="subtitle-1">{this.loc.Settings.Display}</h4>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <DisplayTab styles={this.styles} settingsKey={this.settingsKey}></DisplayTab>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h4 class="subtitle-1">{this.loc.Settings.Filter}</h4>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <FilterTab settingsKey={this.settingsKey}></FilterTab>
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
    vueCustomElement(manifest.elementName, ProcessRollupSettingsComponent);
});

