import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext, Topics } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './ContentBlock.css';
import { ContentBlockStyles } from '../../models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { VueComponentBase } from '@omnia/fx/ux';
import { ProcessContextBlockData } from '../../fx/models';
import { CurrentPageStore } from '@omnia/wcm';
import { ProcessStore, OPMRouter, ProcessRendererOptions } from '../../fx';

@Component
export class ProcessContextBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ContentBlockStyles | any;

    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessContextBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentPageStore) currentPageStore: CurrentPageStore;
    @Inject(ProcessStore) processStore: ProcessStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: ProcessContextBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    isPageEditMode: boolean = true;

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
            .subscribe((data) => { this.setBlockData(data, true) });
        this.subscriptionHandler.add(Topics.onPageEditModeChanged.subscribe((obj) => this.isPageEditMode = obj && obj.editMode ? true : false));

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-process-context-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: { pageProperty: null }
            }, false);
        });
    }

    setBlockData(blockData: ProcessContextBlockData, updated: boolean) {
        this.blockData = blockData;
        if (updated || !OPMRouter.routeContext.route) {
            this.setOPMRoute();
        }
    }

    setOPMRoute() {
        let property = this.blockData.settings.pageProperty;
        let opmProcessId = '';
        if (property) {
            let pagePropertyValue = this.currentPageStore.getters.state.currentVersion.enterpriseProperties.getValue(property);
            let opmProcessIds: Array<string> = [];
            if (pagePropertyValue && typeof pagePropertyValue === 'string') {
                opmProcessIds = JSON.parse(pagePropertyValue);
            }
            if (opmProcessIds.length) {
                opmProcessId = opmProcessIds[0];
            }
        }
        OPMRouter.clearRoute();
        if (opmProcessId) {
            this.processStore.actions.ensurePublishedProcess.dispatch(opmProcessId).then(process => {
                //Ensure the async still valid (the component is not destroyed)
                if (document.contains(this.$el)) {
                    OPMRouter.navigate(process, process.rootProcessStep, ProcessRendererOptions.ForceToBlockRenderer);
                }
            })
        }
    }


    render(h) {
        return (
            <div>
                {
                    this.isPageEditMode && <wcm-empty-block-view dark={false} icon={"fa fa-info-circle"} text={this.corLoc.BlockDefinitions.ProcessContext.Title}
                        description={this.corLoc.BlockDefinitions.ProcessContext.Description}></wcm-empty-block-view>
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessContextBlockComponent);
});

