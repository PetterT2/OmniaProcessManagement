import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue, EnterprisePropertyDefinition, EnterprisePropertyDataType, PropertyIndexedType } from '@omnia/fx/models';
import './PropertiesBlock.css';
import { PropertiesBlockStyles } from '../../models';
import { PropertiesBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { PropertiesBlockData, ProcessReferenceData, ProcessPropertyInfo, ProcessPropertySetting } from '../../fx/models';
import { CurrentProcessStore, SystemProcessProperties } from '../../fx';
import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { classes } from 'typestyle';

import moment = require('moment');

export interface ProcessProperty extends ProcessPropertyInfo {
    value: any,
    displayElement: string,
    contentProperty: EnterprisePropertyDefinition,
    settings: ProcessPropertySetting
}

@Component
export class PropertiesBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof PropertiesBlockStyles | any;

    @Localize(PropertiesBlockLocalization.namespace) loc: PropertiesBlockLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<PropertiesBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: PropertiesBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    propertiesClasses = StyleFlow.use(PropertiesBlockStyles);

    isLoadingProperties: boolean = true;
    readySettings: boolean = false;
    openSettings: boolean = false;
    displaySettingsForm: boolean = false;
    isLoading: boolean = true;
    showContent: boolean = false;
    properties: Array<ProcessProperty> = [];

    created() {
        this.propertiesClasses = StyleFlow.use(PropertiesBlockStyles, this.styles);
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    init() {
        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData);

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-properties-block-settings");

        Promise.all([
            this.propertyStore.actions.ensureLoadData.dispatch(),
            this.settingsService.getValue(this.settingsKey),
        ]).then((result) => {
            this.isLoadingProperties = false;
            this.setBlockData(result[1] || {
                data: {},
                settings: { title: { isMultilingualString: true }, properties: [] }
            });
        })

        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.properties = this.getProperties();
        }));
    }

    private generatePropertyValue(referenceData: ProcessReferenceData, availablePropertyTypes: EnterprisePropertyDataType[], item: ProcessPropertySetting) {
        let processProperties: { [internalName: string]: any } = {};
        if (referenceData) {
            processProperties = referenceData.process.rootProcessStep.enterpriseProperties;
        }
        let value = processProperties[item.internalName];
        let title = "";
        let displayElement = "";
        let contentProperty: EnterprisePropertyDefinition = null;
        if (item.internalName == SystemProcessProperties.Published) {
            title = this.loc.Properties.Published;
            let enterprisePropertyDataType = availablePropertyTypes.find((p) => {
                return p.indexedType === PropertyIndexedType.DateTime;
            });
            if (enterprisePropertyDataType && enterprisePropertyDataType.uiOptions) {
                displayElement = enterprisePropertyDataType.uiOptions.displayModeElementName || "";
                contentProperty = { internalName: item.internalName } as EnterprisePropertyDefinition;
            }
            if (referenceData && referenceData.process.publishedAt) {
                value = referenceData.process.publishedAt;
            }
        }
        if (item.internalName == SystemProcessProperties.LinkToProcessLibrary) {
            title = this.loc.Properties.LinkToProcessLibrary;
            let enterprisePropertyDataType = availablePropertyTypes.find((p) => {
                return p.indexedType === PropertyIndexedType.RichText;
            });
            if (enterprisePropertyDataType && enterprisePropertyDataType.uiOptions) {
                displayElement = enterprisePropertyDataType.uiOptions.displayModeElementName || "";
                contentProperty = { internalName: item.internalName } as EnterprisePropertyDefinition;
            }
            if (referenceData && referenceData.processSite) {
                value = `<a href=${referenceData.processSite.url} target='_blank'>${referenceData.processSite.name}</a>`;
            }
        }
        let property: ProcessProperty = {
            internalName: item.internalName,
            value: value,
            displayElement: displayElement,
            settings: item,
            title: title,
            contentProperty: contentProperty
        } as ProcessProperty;
        return property;
    }

    private getProperties() {
        let properties: Array<ProcessProperty> = [];
        if (!this.isLoadingProperties || this.blockData == null) {
            let availableProperties = this.propertyStore.getters.enterprisePropertyDefinitions();
            let availablePropertyTypes = this.propertyStore.getters.enterprisePropertyDataTypes();

            if (!Utils.isArrayNullOrEmpty(this.blockData.settings.properties)) {

                this.blockData.settings.properties = this.blockData.settings.properties || [];
                if (this.blockData.settings.properties.length > 0 &&
                    this.blockData.settings.properties[0].internalName == null) {
                    let obsoletePropertiesSetting: any[] = this.blockData.settings.properties;
                    this.blockData.settings.properties = obsoletePropertiesSetting.map((item) => {
                        return {
                            internalName: item,
                            showLabel: false,
                        } as ProcessPropertySetting;
                    });
                }

                let referenceData = this.currentProcessStore.getters.referenceData();

                this.blockData.settings.properties.forEach((item) => {
                    if (!Utils.isNullOrEmpty(item.internalName)) {
                        let property: ProcessProperty = this.generatePropertyValue(referenceData, availablePropertyTypes, item);
                        let contentProperty = availableProperties.find((p) => {
                            return p.internalName === item.internalName;
                        });
                        if (contentProperty && contentProperty.enterprisePropertyDataType && contentProperty.enterprisePropertyDataType.uiOptions) {
                            property.title = contentProperty.multilingualTitle;
                            property.displayElement = contentProperty.enterprisePropertyDataType.uiOptions.displayModeElementName || "";
                            property.contentProperty = contentProperty;
                        }
                        properties.push(property);
                    }
                })
            }
        }

        return properties;
    }

    setBlockData(blockData: PropertiesBlockData) {
        if (blockData) {
            this.blockData = Object.assign({}, this.blockData, blockData);
        }
        this.properties = this.getProperties();
        this.readySettings = true;
    }

    private renderDisplayElement(property: ProcessProperty) {
        let h = this.$createElement;
        let props = {};
        props["model"] = property.value;
        props["property"] = property.contentProperty;
        props["settings"] = property.settings;
        props["wrapWithParentContent"] = this.renderPropertyWrapper;
        return h(property.displayElement, {
            key: Utils.generateGuid(),
            domProps: props
        })
    }

    private renderPropertyWrapper(h, internalName: string, propertyContent: JSX.Element): JSX.Element {
        if (propertyContent == null) return null;

        this.showContent = true;

        let label: string = null;
        let property = this.properties.find(p => p.internalName == internalName);
        let settingProperty = property.settings;
        if (property && settingProperty && settingProperty.showLabel) {
            label = property.title;
        }
        let valueClass = classes('subheading', this.propertiesClasses.propertyValue, this.theming.body.text.css);
        if (label) {
            valueClass = classes(valueClass, 'pt-2');
        }
        return (
            <div class="py-2">
                {
                    label &&
                    <div class={classes(this.propertiesClasses.propertyLabel, "body-1", this.theming.body.text.css)}>
                        {label}
                    </div>
                }
                <div class={valueClass}>
                    {propertyContent}
                </div>
            </div>);
    }

    renderProperty(h, property: ProcessProperty) {
        if (!Utils.isNullOrEmpty(property.displayElement))
            return this.renderDisplayElement(property)
        else
            return this.renderPropertyWrapper(h, property.internalName, <div>{property.value}</div>);
    }

    render(h) {
        if (this.isLoadingProperties || !this.readySettings) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        if (this.properties.length == 0 || !this.currentProcessStore.getters.referenceData()) {
            return (
                <aside>
                    <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                    <wcm-empty-block-view dark={false} icon={"fas fa-info"} text={this.corLoc.Blocks.Properties.Title}></wcm-empty-block-view>
                </aside>
            )
        }

        let className = '';
        if (this.showContent) {
            className = classes(this.propertiesClasses.wrapper, this.propertiesClasses.blockPadding(this.blockData.settings.spacing));
        }
        else {
            className = classes(this.propertiesClasses.wrapper, this.propertiesClasses.contentHidden);
        }
        return (
            <aside>
                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                <div class={className} key={this.componentUniqueKey} >
                    {
                        this.properties.map((property) => this.renderProperty(h, property))
                    }
                </div>
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PropertiesBlockComponent);
});

