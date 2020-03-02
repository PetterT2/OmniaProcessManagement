import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext, Topics } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, SpacingSettings, GuidValue } from '@omnia/fx/models';
import './ProcessNavigationBlock.css';
import { ProcessNavigationBlockStyles } from '../../models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore, OPMUtils, OPMRouter } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessNavigationBlockData } from '../../fx/models';
import { ProcessNavigationNodeComponent } from './navigationtree/ProcessNavigationNode';

@Component
export class ProcessNavigationBlockComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessNavigationBlockStyles | any;
    @Prop() mobileView: boolean;

    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessNavigationBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: ProcessNavigationBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    processnavigationClasses = StyleFlow.use(ProcessNavigationBlockStyles, this.styles);
    isPageEditMode: boolean = false;

    currentProcessStepId: GuidValue = '';
    indentation: number = 0;
    SpacingSettings: SpacingSettings = null;
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

        this.subscriptionHandler.add(Topics.onPageEditModeChanged.subscribe((obj) => this.isPageEditMode = obj && obj.editMode ? true : false));

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
            this.currentProcessStepId = null;
        }
        else if (this.currentProcessStepId != referenceData.current.processStep.id) {
            this.currentProcessStepId = referenceData.current.processStep.id.toString();
            let newExpandState = OPMUtils.generateProcessStepExpandState(referenceData.process.rootProcessStep, referenceData.current.processStep.id);
            this.expandState = Object.assign({}, this.expandState, newExpandState);
            this.componentUniqueKey = Utils.generateGuid();
        }
    }

    setBlockData(blockData: ProcessNavigationBlockData) {
        this.blockData = blockData;
        if (this.blockData.settings.levelIndentation)
            this.indentation = this.blockData.settings.levelIndentation;

        this.SpacingSettings = this.blockData.settings.spacing;
        if (this.mobileView) {
            this.SpacingSettings = {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10,
            };
            this.indentation = 15;
        }
    }

    renderProcessNavigation(h) {
        let rootNavigationNode = this.currentProcessStore.getters.referenceData().process.rootProcessStep;
        return (
            <ProcessNavigationNodeComponent
                key={this.componentUniqueKey}
                indentation={this.indentation}
                SpacingSettings={this.SpacingSettings}
                level={1}
                processStep={rootNavigationNode}
                expandState={this.expandState}
            >
            </ProcessNavigationNodeComponent>
        )
    }

    render(h) {
        let isEmpty = this.currentProcessStore.getters.referenceData() == null;
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        if (isEmpty) {
            return (
                <nav>
                    <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                    <wcm-empty-block-view dark={false} icon={"fas fa-bars"} text={this.corLoc.BlockDefinitions.ProcessNavigation.Title}></wcm-empty-block-view>
                </nav>
            )
        }
        return (
            <nav class={this.isPageEditMode ? this.processnavigationClasses.clickProtectionOverlay : ""}>
                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                {this.renderProcessNavigation(h)}
            </nav>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessNavigationBlockComponent);
});

