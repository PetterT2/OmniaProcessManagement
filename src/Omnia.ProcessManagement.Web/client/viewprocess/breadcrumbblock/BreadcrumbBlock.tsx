import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore, OPMRouter, OPMUtils } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import './BreadcrumbBlock.css';
import { BreadcrumbBlockStyles } from '../../models';
import { BreadcrumbBlockData, ProcessStep, Process } from '../../fx/models';

interface BreadcrumbNode {
    processStep: ProcessStep,
    process: Process
}

@Component
export class BreadcrumbBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;


    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<BreadcrumbBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    private breadcrumbClasses = StyleFlow.use(BreadcrumbBlockStyles);

    blockData: BreadcrumbBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;

    beforeDestroy() {
        if (this.subscriptionHandler) this.subscriptionHandler.unsubscribe();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-breadcrumb-block-settings");

        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData);

        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: {}
            });
        });
    }

    setBlockData(blockData: BreadcrumbBlockData) {
        this.blockData = Utils.clone(blockData);
    }

    onNodeClick(e: Event, node: BreadcrumbNode) {
        e.stopPropagation();
        e.preventDefault();

        OPMRouter.navigate(node.process, node.processStep);

    }

    renderEmptyBlock() {
        let h = this.$createElement;

        return (<div><wcm-empty-block-view dark={false} icon={"fas fa-ellipsis-h"} text={this.corLoc.BlockDefinitions.Breadcrumb.Title}></wcm-empty-block-view></div>);

    }

    generateNodes() {
        let nodes: Array<BreadcrumbNode> = [];
        let referenceData = this.currentProcessStore.getters.referenceData();

        if (referenceData && OPMRouter.routeContext && OPMRouter.routeContext.route) {
            if (OPMRouter.routeContext.route.externalParents) {
                for (let parent of OPMRouter.routeContext.route.externalParents) {
                    this.addNodes(parent.processStepId, nodes);
                }
            }
            this.addNodes(OPMRouter.routeContext.route.processStepId, nodes);
        }

        return nodes;
    }

    addNodes(processStepId: GuidValue, nodes: Array<BreadcrumbNode>) {
        let relevantProcess = this.currentProcessStore.getters.relevantProcess(processStepId);
        if (relevantProcess) {
            let { desiredProcessStep, parentProcessSteps } = OPMUtils.getProcessStepInProcess(relevantProcess.process.rootProcessStep, processStepId);
            if (desiredProcessStep) {
                for (let parentProcessStep of parentProcessSteps) {
                    nodes.push({
                        process: relevantProcess.process,
                        processStep: parentProcessStep
                    })
                }
                nodes.push({
                    process: relevantProcess.process,
                    processStep: desiredProcessStep
                })
            }
        }
    }

    render(h) {
        let nodes = this.generateNodes();

        let lastIndex = nodes.length - 1;

        if (!this.blockData || nodes.length == 0) {
            return this.renderEmptyBlock();
        }

        return (
            <nav>
                <v-card tile flat class={["body-1", this.breadcrumbClasses.layout, this.breadcrumbClasses.padding(this.blockData.settings.spacing)]}>
                    {
                        nodes.map((node, idx) => {
                            return (
                                <span>
                                    {
                                        <a tabindex={0} href="javascript:void(0)" onClick={(e) => { this.onNodeClick(e, node) }} class={[this.breadcrumbClasses.breadcrumbLink, this.theming.body.text.csslighter3]}>
                                            {node.processStep.multilingualTitle}
                                        </a>
                                    }
                                    <span v-show={idx !== lastIndex} class={["mx-2"]}>
                                        <v-icon small class={this.theming.body.text.csslighter3}>keyboard_arrow_right</v-icon>
                                    </span>
                                </span>
                            )
                        })
                    }
                </v-card>
            </nav>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, BreadcrumbBlockComponent);
});

