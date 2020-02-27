import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue, Guid } from '@omnia/fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { DocumentsBlockData, ProcessReferenceData, Enums } from '../../fx/models';
import { CurrentProcessStore, DocumentRollupSettingsProvider } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { DocumentRollupBlockData } from '@omnia/dm/models';
import { DocumentsBlockDataSettingsKey } from '../../fx/constants';

@Component
export class DocumentsBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    //@Prop() styles: typeof TitleBlockStyles | any;

    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<DocumentsBlockData>;
    @Inject<SettingsServiceConstructor>(DocumentRollupSettingsProvider) private documentSettingsProvider: DocumentRollupSettingsProvider;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    blockData: DocumentsBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    documentsBlockData: DocumentRollupBlockData = null;
    //documentRollupSettingsKey: string = '';
    tempKey: GuidValue = Guid.newGuid().toString();

    created() {
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

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-documents-block-settings");
        this.settingsService.registerKeyProvider(DocumentsBlockDataSettingsKey.CurrentProcess, this.documentSettingsProvider);
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: {
                    title: { isMultilingualString: true }
                }
            });
        });

        this.initContent();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initContent();
        }));
    }

    initContent() {
        this.documentsBlockData = null;
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (currentReferenceData && currentReferenceData.current) {
            this.documentsBlockData = currentReferenceData.current.processData.documentBlockData;
        }
        this.tempKey = Guid.newGuid().toString();
    }

    setBlockData(blockData: DocumentsBlockData) {
        this.blockData = blockData;
    }

    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        if (!this.documentsBlockData) {
            return (
                <aside>
                    <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                    <wcm-empty-block-view dark={false} icon={"fa fa-font"} text={this.corLoc.BlockDefinitions.Title.Title}></wcm-empty-block-view>
                </aside>
            )
        }

        return <aside>
            <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>

            <odm-document-rollup key={this.tempKey} settingsKey={DocumentsBlockDataSettingsKey.CurrentProcess}></odm-document-rollup>
        </aside>;       
       
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DocumentsBlockComponent);
});

