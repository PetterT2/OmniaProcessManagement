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
import { OPMRouter, CurrentProcessStore, ProcessStore } from '../../fx';
import { ProcessDesignerStore } from '../../processdesigner/stores';
import { ProcessDesignerItemFactory } from '../../processdesigner/designeritems';
import { DisplayModes } from '../../models/processdesigner';
import { ProcessDesignerUtils } from '../../processdesigner/Utils';


@Component
export class ProcessLibraryComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessLibraryStyles | any;

    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessStore) processStore: ProcessStore;

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
                    defaultSettings.settings.title = { "en-us": this.corLoc.BlockDefinitions.ProcessLibrary.Title, isMultilingualString: true };
                    this.settingsService.setValue(this.settingsKey, defaultSettings);
                }
            });
        })
    }

    setBlockData(blockData: ProcessLibraryBlockData) {
        this.processDesignerStore.mutations.setPreviewPageUrl.commit(blockData.settings.viewSettings.previewPageUrl);
        this.blockData = blockData;
        this.handlePreviewOnPageLoad();
    }

    handlePreviewOnPageLoad() {
        if (window.self == window.top && OPMRouter.routeContext.route && OPMRouter.routeContext.route.processStepId &&
            OPMRouter.routeContext.route.globalRenderer &&
            OPMRouter.routeContext.route.version == null) {
            let processStepId = OPMRouter.routeContext.route.processStepId;
            OPMRouter.clearRoute();

            let loadProcessPromise = this.processStore.actions.loadPreviewProcessByProcessStepId.dispatch(processStepId);
            loadProcessPromise.then(processWithCheckoutInfo => {
                this.processDesignerStore.actions.setProcessToShow.dispatch(processWithCheckoutInfo.process, processWithCheckoutInfo.process.rootProcessStep).then(() => {
                    ProcessDesignerUtils.openProcessDesigner();
                    this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentPreview);
                });
            })
        }
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderProcessLibrary(h) {
        if (window.location !== window.parent.location)
            return null;
        return (
            <opm-process-library-list-view
                desiredLanguage={this.desiredLanguage}
                viewSettings={this.blockData.settings.viewSettings}
                SpacingSettings={this.blockData.settings.spacing}
            ></opm-process-library-list-view>
        )
    }

    render(h) {
        let multilingualTitle = this.blockData ?
            this.multilingualStore.getters.stringValue(this.blockData.settings.title) : '';
        return (
            <div>
                {
                    !this.blockData ?
                        <v-skeleton-loader
                            loading={true}
                            height="100%"
                            type="table">
                        </v-skeleton-loader> :
                        <div>
                            {
                                multilingualTitle &&
                                <div class={this.processLibraryClasses.spTitleStyleWrapper}>
                                    <div>{multilingualTitle}</div>
                                </div>
                            }
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

