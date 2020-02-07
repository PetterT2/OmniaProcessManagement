import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper, Utils } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IPropertiesBlockSettingsComponent } from './IPropertiesBlockSettings';
import { PropertiesBlockLocalization } from './loc/localize';
import { IMessageBusSubscriptionHandler, PropertyIndexedType, GuidValue, EnterprisePropertySet, EnterprisePropertyDefinition, EnterprisePropertyDataType } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from "@omnia/fx/ux"
import { MultilingualStore, EnterprisePropertyStore, EnterprisePropertySetStore } from '@omnia/fx/store';
import { PropertiesBlockData, PropertiesBlockDataData, ProcessPropertySetting, DateTimeMode, DatePropertySetting, ProcessType, OPMEnterprisePropertyInternalNames, ProcessTypeItemSettings } from '../../fx/models';
import { PropertiesBlockStyles } from '../../models';
import { CurrentProcessStore, ProcessTypeStore, SystemProcessProperties } from '../../fx';

export interface DisplaySettingProperty {
    title: string;
    settings: ProcessPropertySetting;
    propertyType: PropertyIndexedType;
}

@Component
export class PropertiesBlockSettingsComponent extends Vue implements IWebComponentInstance, IPropertiesBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<PropertiesBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(EnterprisePropertySetStore) propertySetStore: EnterprisePropertySetStore;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(PropertiesBlockLocalization.namespace) private loc: PropertiesBlockLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) private uxLoc: OmniaUxLocalization;

    private propertiesClasses = StyleFlow.use(PropertiesBlockStyles);

    blockData: PropertiesBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;

    enterpriseProperties: Array<EnterprisePropertyDefinition> = [];
    availableProperties: Array<DisplaySettingProperty> = [];
    availablePropertySets: Array<EnterprisePropertySet> = [];
    selectedPropertySet: EnterprisePropertySet;
    settingProperties: Array<DisplaySettingProperty> = [];
    selectedProperty: DisplaySettingProperty = null;
    isLoadingProperties: boolean = true;
    dateModes: Array<{ id: DateTimeMode, title: string }> =
        [
            { id: DateTimeMode.Default, title: this.loc.Settings.FormatModeDefault },
            { id: DateTimeMode.Normal, title: this.loc.Settings.FormatModeNormal },
            { id: DateTimeMode.Social, title: this.loc.Settings.FormatModeSocial }
        ]

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        Promise.all([
            this.propertyStore.actions.ensureLoadData.dispatch(),
            this.propertySetStore.actions.ensureLoadAllSets.dispatch(),
        ]).then(() => {
            this.isLoadingProperties = false;
            this.generateData();
        })

        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            blockData = blockData || {
                data: {} as PropertiesBlockDataData,
                settings: {
                    title: { isMultilingualString: true },
                    properties: []
                }
            } as PropertiesBlockData;
            if (blockData.settings.properties.length > 0 &&
                blockData.settings.properties[0].internalName == null) {
                let obsoletePropertiesSetting: any[] = blockData.settings.properties;
                blockData.settings.properties = obsoletePropertiesSetting.map((item) => {
                    return {
                        internalName: item,
                        showLabel: false,
                    } as ProcessPropertySetting;
                });
            }
            this.setBlockData(blockData);
        });

        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData)

        this.subscriptionHandler.add(this.propertyStore.enterprisePropertyDefinitions.onMutated(() => { this.generateData() }));

    }

    setBlockData(blockData: PropertiesBlockData) {
        this.blockData = blockData;
        this.generateData();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    generateData() {
        this.availablePropertySets = this.propertySetStore.getters.enterprisePropertySets();
        this.enterpriseProperties = this.propertyStore.getters.enterprisePropertyDefinitions();
        this.availableProperties = this.getAvailableProperties();
        // get properties to show in setting selected list
        this.getUISetting();
    }

    private getUISetting() {
        this.settingProperties = [];
        if (!Utils.isNullOrEmpty(this.blockData)) {
            this.blockData.settings.properties.forEach((propertySetting) => {

                var foundProperty = this.availableProperties.find((property) => { return property.settings.internalName === propertySetting.internalName });
                this.availableProperties = this.availableProperties.filter(settingProperty => settingProperty.settings.internalName !== propertySetting.internalName);

                if (foundProperty != null) {
                    foundProperty.settings = propertySetting;
                    this.settingProperties.push(foundProperty);
                }
            });
        }
    }

    private propertiesSetChanged() {
        this.availableProperties = this.getAvailableProperties();
    }

    private getAvailableProperties(): DisplaySettingProperty[] {
        let availableProperties: EnterprisePropertyDefinition[] = this.propertyStore.getters.enterprisePropertyDefinitions();
        if (this.selectedPropertySet) {
            availableProperties = availableProperties.filter(p => this.selectedPropertySet.settings.items.findIndex(i => i.enterprisePropertyDefinitionId == p.id) > -1);
        }
        let publishedSystemProperty: EnterprisePropertyDefinition = {
            multilingualTitle: "[" + this.loc.Properties.Published + "]",
            enterprisePropertyDataType: { indexedType: PropertyIndexedType.DateTime } as EnterprisePropertyDataType,
            internalName: SystemProcessProperties.Published
        } as EnterprisePropertyDefinition;
        let linkToProcessLibrarySystemProperty: EnterprisePropertyDefinition = {
            multilingualTitle: "[" + this.loc.Properties.LinkToProcessLibrary + "]",
            enterprisePropertyDataType: { indexedType: PropertyIndexedType.Text } as EnterprisePropertyDataType,
            internalName: SystemProcessProperties.LinkToProcessLibrary
        } as EnterprisePropertyDefinition;

        availableProperties.unshift(linkToProcessLibrarySystemProperty);
        availableProperties.unshift(publishedSystemProperty);

        return availableProperties.map((p) => {
            return {
                title: p.multilingualTitle,
                propertyType: p.enterprisePropertyDataType.indexedType,
                settings:
                {
                    internalName: p.internalName,
                    showLabel: false,
                }
            };
        });
    }

    onRemoveProperties(property: DisplaySettingProperty) {
        this.blockData.settings.properties = this.blockData.settings.properties
            .filter(settingProperty => !Utils.isNullOrEmpty(settingProperty.internalName) && settingProperty.internalName !== property.settings.internalName);

        this.settingProperties = this.settingProperties
            .filter(settingProperty => settingProperty.settings.internalName.toLowerCase() !== property.settings.internalName.toLowerCase());

        this.availableProperties.push(property);

        this.updateSettings();
        this.$forceUpdate();
    }

    onAddProperty() {
        if (!Utils.isNullOrEmpty(this.selectedProperty)) {
            let internalName = this.selectedProperty.settings.internalName;
            let foundProperty = this.availableProperties.find((property) => property.settings.internalName == internalName);
            if (!Utils.isNullOrEmpty(foundProperty)) {
                this.settingProperties.push(foundProperty);

                this.blockData.settings.properties = this.blockData.settings.properties || [];
                this.blockData.settings.properties.push(foundProperty.settings);
            }

            this.availableProperties = this.availableProperties
                .filter(settingProperty => settingProperty.settings.internalName !== internalName);

            this.selectedProperty = null;
            this.$forceUpdate();
            this.updateSettings();
        }
    }

    onShowLabelChanged(property: DisplaySettingProperty) {
        property.settings.showLabel = !property.settings.showLabel;
        this.updateSettings();
    }

    private onPropertyOrderChanged() {
        let propertiesSortOrder = this.settingProperties.map(p => p.settings.internalName);
        this.blockData.settings.properties = this.blockData.settings.properties.sort((item1, item2) => {
            const item1Index = propertiesSortOrder.indexOf(item1.internalName);
            const item2Index = propertiesSortOrder.indexOf(item2.internalName);
            if (item1Index != item2Index) {
                if (item1Index == -1) {
                    return 1;
                }
                if (item2Index == -1) {
                    return -1;
                }
            }
            return item1Index - item2Index;
        });
        this.updateSettings();
    }

    onUpdateDateMode(v, settings: DatePropertySetting) {
        settings.mode = v;
        if (settings.mode == DateTimeMode.Social) {
            settings.format = "#SocialDate";
        }
        else {
            settings.format = "";
        }
        this.$forceUpdate();
        this.updateSettings();
    }

    updateSettings() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    renderProperty(h, property: DisplaySettingProperty) {
        let isDateTimeType: boolean = property.propertyType == PropertyIndexedType.DateTime;
        if (property.settings.internalName == SystemProcessProperties.Published)
            property.title = this.loc.Properties.Published;
        if (property.settings.internalName == SystemProcessProperties.LinkToProcessLibrary)
            property.title = this.loc.Properties.LinkToProcessLibrary;

        return (
            <v-card class="mb-3">
                <v-card-text>
                    <v-layout row wrap pb-2>
                        <v-flex grow class={this.propertiesClasses.propertyText(this.omniaTheming)}>{property.title}</v-flex>
                        <v-spacer></v-spacer>
                        <v-flex shrink>
                            <v-btn icon style={{ margin: "0px" }}>
                                <v-icon onClick={() => { this.onRemoveProperties(property) }}>delete</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap>
                        <v-flex xs12 pb-3={isDateTimeType}>
                            <v-checkbox
                                color={this.omniaTheming.promoted.body.text.base}
                                input-value={property.settings.showLabel}
                                onChange={() => { this.onShowLabelChanged(property) }}
                                label={this.loc.Settings.ShowLabel}>
                            </v-checkbox>
                        </v-flex>
                        {
                            isDateTimeType &&
                            this.renderDateTimeSetting(h, property.settings as DatePropertySetting)
                        }
                    </v-layout>
                </v-card-text>
            </v-card>);
    }

    renderDateTimeSetting(h, settings: DatePropertySetting) {
        if (Utils.isNullOrEmpty(settings.mode))
            settings.mode = DateTimeMode.Default;

        let jsx =
            [
                <v-flex xs12 pb-3={settings.mode == DateTimeMode.Normal}>
                    <v-select
                        items={this.dateModes}
                        item-value="id"
                        item-text="title"
                        v-model={settings.mode}
                        onChange={(v) => { this.onUpdateDateMode(v, settings) }}
                        label={this.loc.Settings.DateFormatMode}>
                    </v-select>
                </v-flex>,
                settings.mode == DateTimeMode.Normal &&
                <v-flex xs12>
                    <v-text-field
                        v-model={settings.format}
                        label={this.loc.Settings.Format}
                        placeholder="MM/DD/YYYY"
                        onChange={() => { this.updateSettings() }}>
                    </v-text-field>
                </v-flex>
            ]

        return jsx;
    }

    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }
        let dark = this.omniaTheming.promoted.body.dark;

        return (
            <v-container>
                <v-row no-gutters>
                    <v-col cols="12">
                        <omfx-multilingual-input
                            label={this.loc.PropertiesBlockSettings.Title}
                            model={this.blockData.settings.title}
                            onModelChange={(title) => { this.blockData.settings.title = title; this.updateSettings() }}>
                        </omfx-multilingual-input>
                    </v-col>
                    <v-col cols="12">
                        <v-list dark={dark}>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-select
                                        dark={dark}
                                        clearable
                                        item-text="multilingualTitle"
                                        return-object
                                        items={this.availablePropertySets}
                                        v-model={this.selectedPropertySet}
                                        label={this.loc.Settings.SelectPropertySet}
                                        onChange={() => { this.propertiesSetChanged(); }}>
                                    </v-select>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-select
                                        dark={dark}
                                        clearable
                                        return-object
                                        item-text="title"
                                        items={this.availableProperties}
                                        v-model={this.selectedProperty}
                                        label={this.loc.Settings.SelectProperties}>
                                    </v-select>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn onClick={() => { this.onAddProperty() }}
                                        depressed={!dark} small fab
                                        color={this.omniaTheming.promoted.body.primary.base}
                                    >
                                        <v-icon>add</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-col>
                    <v-col cols="12">
                        <v-list dark={dark}>
                            <draggable v-model={this.settingProperties} onChange={this.onPropertyOrderChanged}>
                                {
                                    this.settingProperties.map((property) => this.renderProperty(h, property))
                                }
                            </draggable>
                        </v-list>
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
    vueCustomElement(manifest.elementName, PropertiesBlockSettingsComponent);
});
