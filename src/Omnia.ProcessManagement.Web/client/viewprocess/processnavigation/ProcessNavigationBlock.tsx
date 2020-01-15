import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, SpacingSetting } from '@omnia/fx/models';
import './ProcessNavigationBlock.css';
import { ProcessNavigationBlockStyles } from '../../models';
import { ProcessNavigationBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore, OPMUtils, OPMRouter } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessNavigationBlockData } from '../../fx/models';
import { ProcessNavigationNodeComponent } from './navigationtree/ProcessNavigationNode';

@Component
export class ProcessNavigationBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessNavigationBlockStyles | any;
    @Prop() mobileView: boolean;

    @Localize(ProcessNavigationBlockLocalization.namespace) loc: ProcessNavigationBlockLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessNavigationBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: ProcessNavigationBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    processnavigationClasses = StyleFlow.use(ProcessNavigationBlockStyles, this.styles);

    indentation: number = 0;
    spacingSetting: SpacingSetting = null;
    expandState: { [id: string]: true } = {};

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

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-processnavigation-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: {
                    title: { isMultilingualString: true },
                    levelIndentation: 20
                }
            });
        });
        this.refreshExpandState();
    }

    setBlockData(blockData: ProcessNavigationBlockData) {
        this.blockData = blockData;
        if (this.blockData.settings.levelIndentation)
            this.indentation = this.blockData.settings.levelIndentation;

        this.spacingSetting = this.blockData.settings.spacing;
        if (this.mobileView) {
            this.spacingSetting = {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10,
            };
            this.indentation = 15;
        }
    }

    refreshExpandState() {
        let currentProcessReferenceData = this.currentProcessStore.getters.referenceData();
        let newExpandState = OPMUtils.generateProcessStepExpandState(currentProcessReferenceData.process.rootProcessStep, OPMRouter.routeContext.route.processStepId);
        this.expandState = Object.assign({}, this.expandState, newExpandState);
    }

    renderProcessNavigation(h) {
        let rootNavigationNode = this.currentProcessStore.getters.referenceData().process.rootProcessStep;
        return (
            <ProcessNavigationNodeComponent
                indentation={this.indentation}
                spacingSetting={this.spacingSetting}
                level={1}
                processStep={rootNavigationNode}
                expandState={this.expandState}
            >
            </ProcessNavigationNodeComponent>
        )
    }

    render(h) {
        let isEmpty = this.currentProcessStore.getters.referenceData() == null;

        return (
            <aside>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        isEmpty ?
                            <wcm-empty-block-view dark={false} icon={"fas fa-bars"} text={this.corLoc.Blocks.ProcessNavigation.Title}></wcm-empty-block-view>
                            :
                            <div class={this.processnavigationClasses.blockPadding(this.blockData.settings.spacing)}>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div key={this.componentUniqueKey}>{this.renderProcessNavigation(h)}</div>
                            </div>
                }
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessNavigationBlockComponent);
});

