﻿import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IDrawingBlockSettingsComponent } from './IDrawingBlockSettings';
import { DrawingBlockLocalization } from './loc/localize';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux"
import { MultilingualStore } from '@omnia/fx/store';
import { DrawingBlockData, DrawingBlockDataData } from '../../fx/models';

@Component
export class DrawingBlockSettingsComponent extends Vue implements IWebComponentInstance, IDrawingBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<DrawingBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(DrawingBlockLocalization.namespace) private loc: DrawingBlockLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;

    blockData: DrawingBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
  
    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            this.setBlockData(blockData || {
                data: {} as DrawingBlockDataData,
                settings: {
                    title: { isMultilingualString: true }
                }
            } as DrawingBlockData);
        });

    }

    setBlockData(blockData: DrawingBlockData) {
        this.blockData = blockData;
    }

    beforeDestroy() {
        this.subscriptionHandler.unsubscribe();
    }

    updateSettings() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
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
                            label={this.loc.DrawingBlockSettings.Title}
                            model={this.blockData.settings.title}
                            onModelChange={(title) => { this.blockData.settings.title = title; this.updateSettings() }}>
                        </omfx-multilingual-input>
                    </v-col>
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
    vueCustomElement(manifest.elementName, DrawingBlockSettingsComponent);
});
