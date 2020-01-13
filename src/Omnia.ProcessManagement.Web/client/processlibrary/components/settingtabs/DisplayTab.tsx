import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils } from '@omnia/fx';
import { IMessageBusSubscriptionHandler, Guid } from '@omnia/fx-models';
import { LocalizationService, SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization, OmniaTheming } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { ProcessLibraryBlockData, Enums, ProcessLibraryViewSettings } from '../../../fx/models';

interface DisplayTabProps {
    settingsKey: string
}

interface DefaultSelectOption {
    name: string,
    value: number
}

@Component
export class DisplayTab extends tsx.Component<DisplayTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(LocalizationService) localizationService: LocalizationService;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessLibraryBlockData>;

    blockData: ProcessLibraryBlockData = null;
    defaultTabOptions: Array<DefaultSelectOption> = [
        { name: this.loc.ViewTabs.Drafts, value: Enums.ProcessViewEnums.StartPageTab.Drafts },
        { name: this.loc.ViewTabs.Tasks, value: Enums.ProcessViewEnums.StartPageTab.Tasks },
        { name: this.loc.ViewTabs.Published, value: Enums.ProcessViewEnums.StartPageTab.Published },
    ];

    beforeDestroy() {

    }

    mounted() {
    }

    created() {     
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData);
            }
        });
    }

    updateBlockData() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    get retrievableProperties() {
        return this.propertyStore.getters.retrievableManagedProperties();
    }


    get sortableProperties() {
        return this.propertyStore.getters.sortableManagedProperties();
    }


    onUpdatedViewSettings(viewSettings: ProcessLibraryViewSettings) {
        this.blockData.settings.viewSettings = viewSettings;
        this.updateBlockData();
    }

    renderDisplayTab() {
        let h = this.$createElement;

        return (
            <div>
                <v-select label={this.loc.ProcessLibrarySettings.DefaultTab} item-value="value" item-text="name" items={this.defaultTabOptions} v-model={this.blockData.settings.viewSettings.defaultTab} onChange={() => { this.updateBlockData(); }}></v-select>
                
                <div>
                    <div class="mb-1">
                        {this.omniaLoc.Common.Padding}
                    </div>
                    <omfx-spacing-picker
                        color={this.omniaTheming.promoted.body.secondary.base}
                        individualSelection
                        model={this.blockData.settings.spacing}
                        onModelChange={(val) => { this.blockData.settings.spacing = val; this.updateBlockData(); }}>
                    </omfx-spacing-picker>
                </div>
                <div>
                    <v-checkbox input-value={this.blockData.settings.viewSettings.hideTasksTab} label={this.loc.ProcessLibrarySettings.HideTasksTab} onChange={(val) => { this.blockData.settings.viewSettings.hideTasksTab = val; this.updateBlockData() }}></v-checkbox>
                </div>
                <v-text-field onChange={() => { this.updateBlockData(); }} type="text" v-model={this.blockData.settings.viewSettings.previewPageUrl} label={this.loc.ProcessLibrarySettings.PreviewPageUrl} ></v-text-field>
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {this.blockData ? this.renderDisplayTab() : null}
            </div>
        )
    }
}

