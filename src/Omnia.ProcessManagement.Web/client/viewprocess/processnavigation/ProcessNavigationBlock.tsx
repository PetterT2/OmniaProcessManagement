import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, SpacingSetting, GuidValue } from '@omnia/fx/models';
import './ProcessNavigationBlock.css';
import { ProcessNavigationBlockStyles } from '../../models';
import { ProcessNavigationBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore, OPMUtils, OPMRouter } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessNavigationBlockData, RootProcessStep, ProcessStep } from '../../fx/models';
import { ProcessNavigationNodeComponent } from './navigationtree/ProcessNavigationNode';

@Component
export class ProcessNavigationBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessNavigationBlockStyles | any;
    @Prop() mobileView: boolean;
    @Prop() inGlobalView: boolean;

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

    currentProcessId: GuidValue = '';
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

        this.subscriptionHandler.add(
            this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()(() => {
                this.refreshExpandState();
            })
        )
        this.refreshExpandState();

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
    }

    refreshExpandState() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (!referenceData) {
            this.expandState = {};
            this.currentProcessId = null;
        }
        else if (this.currentProcessId != referenceData.process.id) {
            this.currentProcessId = referenceData.process.id;
            let newExpandState = OPMUtils.generateProcessStepExpandState(referenceData.process.rootProcessStep, referenceData.current.processStep.id);
            this.expandState = Object.assign({}, this.expandState, newExpandState);
            this.componentUniqueKey = Utils.generateGuid();
        }
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

    renderProcessNavigation(h) {
        let level = this.inGlobalView ? 2 : 1; //temp make the component in globalview has the intenation for the first level
        let rootNavigationNode = this.currentProcessStore.getters.referenceData().process.rootProcessStep;
        return (
            <ProcessNavigationNodeComponent
                indentation={this.indentation}
                spacingSetting={this.spacingSetting}
                level={level}
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

