import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ITitleBlockSettingsComponent } from './ITitleBlockSettings';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from "@omnia/fx/ux"
import { MultilingualStore } from '@omnia/fx/store';
import { TitleBlockData, TitleBlockDataData, Enums, TitleBlockStyles } from '../../fx/models';
import './TitleBlockStyles.css.js';
import { OPMCoreLocalization } from '../../core/loc/localize';

@Component
export class TitleBlockSettingsComponent extends Vue implements IWebComponentInstance, ITitleBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<TitleBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) private coreLoc: OPMCoreLocalization.locInterface;

    blockData: TitleBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;

    formattings: Array<{ id: Enums.ProcessViewEnums.HeadingFormatting, title: string }> = [
        { id: Enums.ProcessViewEnums.HeadingFormatting.Normal, title: this.coreLoc.Blocks.Title.FormatingOptions.Normal },
        { id: Enums.ProcessViewEnums.HeadingFormatting.Heading1, title: this.coreLoc.Blocks.Title.FormatingOptions.Heading1 },
        { id: Enums.ProcessViewEnums.HeadingFormatting.Heading2, title: this.coreLoc.Blocks.Title.FormatingOptions.Heading2 },
        { id: Enums.ProcessViewEnums.HeadingFormatting.Heading3, title: this.coreLoc.Blocks.Title.FormatingOptions.Heading3 }
    ];

    titleBlockStyles = StyleFlow.use(TitleBlockStyles);

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            this.setBlockData(blockData || {
                data: {} as TitleBlockDataData,
                settings: {
                    title: { isMultilingualString: true },
                    formatting: Enums.ProcessViewEnums.HeadingFormatting.Heading1
                }
            } as TitleBlockData);
        });

    }

    setBlockData(blockData: TitleBlockData) {
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
                            label={this.uxLoc.Common.Title}
                            model={this.blockData.settings.title}
                            onModelChange={(title) => { this.blockData.settings.title = title; this.updateSettings() }}>
                        </omfx-multilingual-input>
                    </v-col>
                    <v-col cols="12">
                        <div class="mb-1">
                            {this.coreLoc.Blocks.Title.Formatting}
                        </div>
                        <v-select
                            dark={this.omniaTheming.promoted.body.dark}
                            item-value="id" item-text="title"
                            items={this.formattings}
                            v-model={this.blockData.settings.formatting}
                            label={this.coreLoc.Blocks.Title.Formatting} onChange={() => { this.updateSettings() }}
                            scopedSlots={{
                                item: p =>
                                    <v-list-item-content class={this.titleBlockStyles.formattingLabels(p.item.id)}>
                                        {p.item.title}
                                    </v-list-item-content>
                            }}>
                        </v-select>
                    </v-col>
                </v-row>
            </v-container>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TitleBlockSettingsComponent);
});
