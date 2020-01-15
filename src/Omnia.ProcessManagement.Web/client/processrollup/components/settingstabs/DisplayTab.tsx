import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { IMessageBusSubscriptionHandler, PropertyIndexedType, Guid } from '@omnia/fx-models';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { VariationRules } from '@omnia/wcm';
import { SettingsServiceConstructor, SettingsService, LocalizationService } from '@omnia/fx/services';
import { OPMPublicTopics } from '../../../fx/messaging';
import { ProcessRollupLocalization } from '../../loc/localize';
import { ProcessRollupBlockSettingsStyles } from '../../../models';
import { ProcessRollupBlockData, Enums, ProcessRollupViewRegistration, ProcessRollupViewSettings } from '../../../fx/models';

interface ProcessRollupRegistrationViewExtension extends ProcessRollupViewRegistration {
    idAsString: string
}

interface DisplayTabProps {
    settingsKey: string;
}

@Component
export class DisplayTab extends tsx.Component<DisplayTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(LocalizationService) localizationService: LocalizationService;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------

    rollupSettingsClasses = StyleFlow.use(ProcessRollupBlockSettingsStyles);
    isLoadingProperties: boolean = true;
    blockData: ProcessRollupBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    registeredViewMsg: Array<ProcessRollupRegistrationViewExtension> = [];
    pagings: Array<{ id: Enums.ProcessViewEnums.PagingType, title: string }> = [
        { id: Enums.ProcessViewEnums.PagingType.NoPaging, title: this.loc.Settings.PagingType.NoPaging },
        { id: Enums.ProcessViewEnums.PagingType.Classic, title: this.loc.Settings.PagingType.Classic },
        { id: Enums.ProcessViewEnums.PagingType.Scroll, title: this.loc.Settings.PagingType.Scroll },
    ]
    sortBys: Array<{ id: boolean, title: string }> = [
        { id: false, title: this.loc.Settings.Ascending },
        { id: true, title: this.loc.Settings.Descending },
    ]


    get availableProperties() {
        let properties = this.propertyStore.getters.enterprisePropertyDefinitions();
        return properties;
    }
    get availablePropertiesForSort() {
        let properties = this.propertyStore.getters.omniaSearchableEnterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.DateTime]);

        return properties
    }

    beforeDestroy() {
        this.clearMsgSubscriptionHandler();
    }

    created() {
        this.propertyStore.actions.ensureLoadData.dispatch().then(() => { this.isLoadingProperties = false; });

        this.addMsgSubscriptionHandler(
            OPMPublicTopics.registerProcessRollupView.subscribe(this.regisProcessRollupView)
        )

        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData); //remove reference
            }

        });
    }

    updateBlockData() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
        this.$forceUpdate();
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

    onViewChanged() {
        this.blockData.settings.viewSettings = { selectProperties: [] };
        this.blockData.settings.pagingType = Enums.ProcessViewEnums.PagingType.NoPaging;

        this.updateBlockData();
    }

    regisProcessRollupView(msg: ProcessRollupViewRegistration) {
        if (msg) {
            msg.title = this.localizationService.transform(msg.title);
            msg.id = new Guid(msg.id.toString().toLowerCase());
            this.registeredViewMsg = this.registeredViewMsg.filter(i => i.id.toString() != msg.id.toString())
            this.registeredViewMsg.push(Object.assign(msg, { idAsString: msg.id.toString() }));
        }
    }

    onUpdatedViewSettings(viewSettings: ProcessRollupViewSettings) {
        this.blockData.settings.viewSettings = viewSettings;
        this.updateBlockData();
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderViewSettings() {
        let h = this.$createElement;
        let pagings: Array<{ id: Enums.ProcessViewEnums.PagingType, title: string }> = [];
        let selectedViewSupportPaging = false;

        let selectedViewMsg = this.registeredViewMsg.filter(i => i.idAsString == this.blockData.settings.selectedViewId)[0];
        if (!selectedViewMsg || !selectedViewMsg.settingsElement)
            return null;

        if (this.isLoadingProperties)
            return <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>

        pagings = this.pagings.filter(p => p.id === Enums.ProcessViewEnums.PagingType.NoPaging ||
            (selectedViewMsg.supportClassicPaging && p.id === Enums.ProcessViewEnums.PagingType.Classic) ||
            (selectedViewMsg.supportScrollPaging && p.id === Enums.ProcessViewEnums.PagingType.Scroll));

        selectedViewSupportPaging = pagings.length > 1; //If there is only No Paging option, means view does not support paging

        return (
            <div>
                {
                    h(selectedViewMsg.settingsElement, {
                        domProps: {
                            viewSettings: this.blockData.settings.viewSettings,
                            availableProperties: this.availableProperties,
                            onUpdatedViewSettings: this.onUpdatedViewSettings
                        }
                    })
                }

                <omfx-multilingual-input
                    filled
                    forceOneLanguage={VariationRules.showOneLanguageTitle()}
                    label={this.omniaUxLoc.Common.Title}
                    model={this.blockData.settings.title}
                    onModelChange={(title) => { this.blockData.settings.title = title; this.updateBlockData() }}>
                </omfx-multilingual-input>

                <v-text-field filled onChange={() => { this.updateBlockData(); }} v-model={this.blockData.settings.viewPageUrl} label={this.loc.Settings.ViewPageUrl}></v-text-field>

                <v-checkbox input-value={this.blockData.settings.openInNewWindow} onChange={(val) => { this.blockData.settings.openInNewWindow = val; this.updateBlockData(); }} label={this.loc.Settings.OpenInNewWindow}></v-checkbox>

                <v-select dark={this.omniaTheming.promoted.body.dark}
                    label={this.loc.Settings.Paging}
                    item-value="id"
                    item-text="title"
                    items={pagings}
                    v-model={this.blockData.settings.pagingType}
                    onChange={() => { this.updateBlockData(); }}></v-select>

                {
                    selectedViewSupportPaging && this.blockData.settings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging ?
                        <v-text-field filled onChange={() => { this.updateBlockData(); }} min={1} type="number" v-model={this.blockData.settings.itemLimit} label={this.loc.Settings.PageSize} placeholder="50"></v-text-field> :
                        <v-text-field filled onChange={() => { this.updateBlockData(); }} min={1} type="number" v-model={this.blockData.settings.itemLimit} label={this.loc.Settings.ItemLimit}></v-text-field>
                }
                {
                    this.blockData.settings.orderBy && this.blockData.settings.orderBy.length ?
                        <div><v-select clearable label={this.loc.Settings.SortBy} item-value="internalName" item-text="multilingualTitle" items={this.availablePropertiesForSort} v-model={this.blockData.settings.orderBy[0].propertyName} onChange={() => { this.updateBlockData(); }}></v-select>
                            <v-select item-value="id" item-text="title" items={this.sortBys} v-model={this.blockData.settings.orderBy[0].descending} onChange={() => { this.updateBlockData(); }}></v-select></div>
                        : null
                }

                <div>
                    <div class="mb-1">
                        {this.omniaUxLoc.Common.Padding}
                    </div>
                    <omfx-spacing-picker
                        dark={this.omniaTheming.promoted.body.dark}
                        color={this.omniaTheming.promoted.body.primary.base}
                        individualSelection
                        model={this.blockData.settings.spacing}
                        onModelChange={(val) => { this.blockData.settings.spacing = val; this.updateBlockData(); }}>
                    </omfx-spacing-picker>
                </div>
            </div>
        );
    }

    renderDisplayTab() {
        let h = this.$createElement;

        return (
            <div>
                <v-select label={this.loc.Settings.View} item-value="idAsString" item-text="title" items={this.registeredViewMsg} v-model={this.blockData.settings.selectedViewId} onChange={() => { this.onViewChanged(); }}></v-select>
                {this.renderViewSettings()}
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {
                    this.blockData ? this.renderDisplayTab() : null
                }
            </div>
        )
    }
}