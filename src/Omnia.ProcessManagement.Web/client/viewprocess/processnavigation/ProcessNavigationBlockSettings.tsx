import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IProcessNavigationBlockSettingsComponent } from './IProcessNavigationBlockSettings';
import { ProcessNavigationBlockLocalization } from './loc/localize';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from "@omnia/fx/ux"
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessNavigationBlockData, ProcessNavigationBlockDataData } from '../../fx/models';
import { ProcessNavigationBlockStyles } from '../../models';

@Component
export class ProcessNavigationBlockSettingsComponent extends Vue implements IWebComponentInstance, IProcessNavigationBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessNavigationBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(ProcessNavigationBlockLocalization.namespace) private loc: ProcessNavigationBlockLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;

    blockData: ProcessNavigationBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    processNavigationClasses = StyleFlow.use(ProcessNavigationBlockStyles);

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            this.setBlockData(blockData || {
                data: {} as ProcessNavigationBlockDataData,
                settings: {
                    title: { isMultilingualString: true }
                }
            } as ProcessNavigationBlockData);
        });

    }

    setBlockData(blockData: ProcessNavigationBlockData) {
        this.blockData = blockData;
    }

    beforeDestroy() {
        this.subscriptionHandler.unsubscribe();
    }

    updateSettings() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    ensureValidLevelIdentation(value: number) {
        if (!this.blockData.settings.levelIndentation || this.blockData.settings.levelIndentation < 1) {
            this.blockData.settings.levelIndentation = 0;
        }
        this.blockData.settings.levelIndentation = parseInt(this.blockData.settings.levelIndentation as any);
        if (value > 0 || this.blockData.settings.levelIndentation > 0)
            this.blockData.settings.levelIndentation += value;
    }    
    
    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        return (
            <v-container>
                <v-row no-gutters>
                    <v-col cols="12">
                        <omfx-multilingual-input
                            label={this.loc.ProcessNavigationBlockSettings.Title}
                            model={this.blockData.settings.title}
                            onModelChange={(title) => { this.blockData.settings.title = title; this.updateSettings() }}>
                        </omfx-multilingual-input>
                    </v-col>                
                    <v-layout class="pb-3" align-center>
                        <v-flex>
                            <v-text-field
                                dark={this.omniaTheming.promoted.body.dark}
                                label={this.loc.ProcessNavigationBlockSettings.LevelIndentation}
                                placeholder=""
                                hide-details
                                v-model={this.blockData.settings.levelIndentation}
                                suffix="px"
                                type="number"
                                min="0"
                                filled
                                onChange={() => { this.ensureValidLevelIdentation(0); this.updateSettings() }}
                            ></v-text-field>
                        </v-flex>
                        <v-flex class={this.processNavigationClasses.levelIndentationIconWrapper}>
                            <v-btn
                                dark={this.omniaTheming.promoted.body.dark}
                                icon
                                class="mb-0"
                                onClick={() => { this.ensureValidLevelIdentation(1); this.updateSettings() }}>
                                <v-icon>add</v-icon>
                            </v-btn>
                            <v-btn
                                dark={this.omniaTheming.promoted.body.dark}
                                icon
                                class="mt-0"
                                onClick={() => { this.ensureValidLevelIdentation(-1); this.updateSettings() }}>
                                <v-icon>remove</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    <v-col cols="12">
                        <div class="mb-1">
                            {this.uxLoc.Common.Padding}
                        </div>
                        <omfx-spacing-picker
                            dark={this.omniaTheming.promoted.body.dark}
                            color={this.omniaTheming.promoted.body.dark ? this.omniaTheming.promoted.body.text.base : this.omniaTheming.promoted.body.primary.base}
                            individualSelection
                            model={this.blockData.settings.spacing}
                            onModelChange={(val) => { this.blockData.settings.spacing = val; this.updateSettings(); }}>
                        </omfx-spacing-picker>
                    </v-col>
                </v-row>
            </v-container>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessNavigationBlockSettingsComponent);
});
