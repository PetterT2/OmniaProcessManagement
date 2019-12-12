import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { PageEditModeMessage, IMessageBusSubscriptionHandler, OmniaUserContext, LanguageTag } from '@omnia/fx/models';
import { EnterprisePropertyStore, MultilingualStore } from '@omnia/fx/store';
import './ProcessLibrary.css';
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../loc/localize';
import { ProcessLibraryStyles } from '../../models';
import { ProcessLibraryBlockData } from '../../fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { ProcessLibraryConfigurationFactory } from '../factory/ProcessLibraryConfigurationFactory';


@Component
export class ProcessLibraryComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessLibraryStyles | any;

    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;
    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessLibraryBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------

    componentUniqueKey: string = Utils.generateGuid();
    previousSettings: string = '';
    blockData: ProcessLibraryBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    userContext: OmniaUserContext = null;
    desiredLanguage: LanguageTag;

    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles, this.styles);

    // -------------------------------------------------------------------------
    // Life Cycle Hooks
    // -------------------------------------------------------------------------

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    // -------------------------------------------------------------------------
    // Event
    // -------------------------------------------------------------------------

    init() {
        let promises: Array<Promise<any>> = [
            this.omniaContext.user.then(user => {
                this.userContext = user;
            })
        ]

        Promise.all(promises).then(() => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData);

            this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-process-library-settings");
            this.settingsService.getValue(this.settingsKey).then((blockData) => {
                if (blockData && blockData.settings && blockData.settings.viewSettings && blockData.settings.viewSettings.draftTabDisplaySettings &&
                    blockData.settings.viewSettings.publishedTabDisplaySettings) {
                    this.setBlockData(blockData)
                }
                else {
                    var defaultSettings = ProcessLibraryConfigurationFactory.create();
                    defaultSettings.settings.title = { "en-us": this.corLoc.Blocks.ProcessLibrary.Title, isMultilingualString: true };
                    this.settingsService.setValue(this.settingsKey, defaultSettings);
                }
            });
        })
    }

    setBlockData(blockData: ProcessLibraryBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    isComponentEmtpy() {
        let title = '';
        if (this.blockData && this.blockData.settings) {
            if (this.blockData.settings.title) {
                title = this.multilingualStore.getters.stringValue(this.blockData.settings.title);
                title = title.trim();
            }
        }
        return !title;
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderProcessLibrary(h) {
        return (
            <opm-process-library-list-view
                desiredLanguage={this.desiredLanguage}
                viewSettings={this.blockData.settings.viewSettings}
                spacingSetting={this.blockData.settings.spacing}
            ></opm-process-library-list-view>
        )
    }

    render(h) {
        let isEmpty = this.isComponentEmtpy();
        return (
            <div>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        isEmpty ?
                            <wcm-empty-block-view dark={false} icon={"fal fa-file-alt"} text={this.corLoc.Blocks.ProcessLibrary.Title}></wcm-empty-block-view>
                            :
                            <div>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div key={this.componentUniqueKey}>{this.renderProcessLibrary(h)}</div>
                            </div>
                }
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessLibraryComponent);
});

