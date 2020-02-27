import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IDocumentsBlockSettingsComponent } from './IDocumentsBlockSettings';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from "@omnia/fx/ux"
import { MultilingualStore } from '@omnia/fx/store';
import { DocumentsBlockData, DocumentsBlockDataData } from '../../fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';

@Component
export class DocumentsBlockSettingsComponent extends Vue implements IWebComponentInstance, IDocumentsBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<DocumentsBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) private coreLoc: OPMCoreLocalization.locInterface;

    blockData: DocumentsBlockData = null;
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
                data: {} as DocumentsBlockDataData,
                settings: {
                    title: { isMultilingualString: true }
                }
            } as DocumentsBlockData);
        });

    }

    setBlockData(blockData: DocumentsBlockData) {
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
                </v-row>
            </v-container>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DocumentsBlockSettingsComponent);
});
