import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, OmniaContext, ServiceContainer } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';
import { CurrentProcessStore, OPMRouter } from '../../fx';
import { RouteOptions } from '../../fx/models';
import './GlobalProcessRenderer.css';
import { GlobalProcessRendererStyles } from '../../models';
import { StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { OPMCoreLocalization } from '../../core/loc/localize';

const TabNames = {
    Content: 'content',
    Links: 'links',
    Tasks: 'taks'
}

@Component
export class GlobalProcessRendererComponent extends Vue implements IWebComponentInstance {
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(OmniaContext) private omniaContext: IOmniaContext;
    @Inject(OmniaTheming) private omniaTheming: OmniaTheming;

    @Localize(OPMCoreLocalization.namespace) private loc: OPMCoreLocalization.locInterface;
    private styles = StyleFlow.use(GlobalProcessRendererStyles);

    navigationBlockSettingsKey = '8B1D86EE-7994-4694-9BF1-982BCC47A6C3';
    drawingBlockSettingsKey = '1A0DA029-68D5-48AC-91B9-E4B939A09D79';
    contentBlockSettingsKey = 'A4AD7AA5-2050-406B-BC0A-949E29276B61';
    linkBlockSettingsKey = 'C526C872-0837-4315-AAEE-AB7DC6D5BB31';
    taskBlockSettingsKey = 'B15B8194-F13E-45D9-81C2-C7D64CDD27B5'

    selectedTab = TabNames.Content;

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    get hidden(): boolean {
        return !this.currentProcessStore.getters.referenceData() ||
            !OPMRouter.routeContext.route ||
            (OPMRouter.routeContext.route.routeOption != RouteOptions.publishedInGlobalRenderer &&
                OPMRouter.routeContext.route.routeOption != RouteOptions.previewInGlobalRenderer) ? true : false
    }

    renderProcess(h) {
        let currentProcessStep = this.currentProcessStore.getters.referenceData().current;
        let title = currentProcessStep.processStep.multilingualTitle;
        return (
            <v-container fluid>
                <v-row justify="center" align="center">
                    <v-col cols="auto">Breadcrumb</v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto">
                        <v-btn icon onClick={() => { OPMRouter.clearRoute() }}><v-icon>close</v-icon></v-btn>
                    </v-col>
                </v-row>
                <v-row justify="start">
                    <v-col cols="4">
                        <v-container fluid class={[this.styles.background, 'pa-0']}>
                            <opm-processnavigation-block inGlobalView settingsKey={this.navigationBlockSettingsKey}></opm-processnavigation-block>
                        </v-container>
                    </v-col>
                    <v-col cols="8">
                        <v-container fluid class={this.styles.background}>
                            <v-row>
                                <v-col><h2>{title}</h2></v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <opm-drawing-block settingsKey={this.drawingBlockSettingsKey}></opm-drawing-block>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-tabs dark color="white" background-color={this.omniaTheming.themes.primary.base} v-model={this.selectedTab}
                                        onChange={(selectedTab) => { this.selectedTab = selectedTab; }}>
                                        <v-tab href={`#${TabNames.Content}`}>{this.loc.Process.Content}</v-tab>
                                        <v-tab href={`#${TabNames.Links}`}>{this.loc.Process.Links}</v-tab>
                                        <v-tab href={`#${TabNames.Tasks}`}>{this.loc.Process.Tasks}</v-tab>

                                        <v-tab-item id={TabNames.Content}>
                                            {this.selectedTab == TabNames.Content && <opm-content-block settingsKey={this.contentBlockSettingsKey}></opm-content-block>}
                                        </v-tab-item>
                                        <v-tab-item id={TabNames.Links}>
                                            {this.selectedTab == TabNames.Links && <opm-links-block settingsKey={this.linkBlockSettingsKey}></opm-links-block>}
                                        </v-tab-item>
                                        <v-tab-item id={TabNames.Tasks}>
                                            {this.selectedTab == TabNames.Tasks && <opm-tasks-block settingsKey={this.taskBlockSettingsKey}></opm-tasks-block>}
                                        </v-tab-item>
                                    </v-tabs>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-col>
                </v-row>
            </v-container>
        )
    }

    render(h) {
        if (this.hidden) {
            return null;
        }

        let styleClass = this.omniaContext.environment.omniaApp ? this.styles.containerInOmnia() :
            window.self == window.top ? this.styles.containerInSpfx() : this.styles.containerInSpfxIFrame()

        return (
            <div class={styleClass}>
                {this.renderProcess(h)}
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, GlobalProcessRendererComponent);

    let omniaCtx: IOmniaContext = ServiceContainer.createInstance(OmniaContext);
    if (omniaCtx.environment.omniaApp) {
        let omniaBody = document.getElementById('omnia-body'); //To-do get the value from omnia fx
        if (omniaBody) {
            omniaBody.appendChild(document.createElement(manifest.elementName));
        }
    }
    else {
        document.body.appendChild(document.createElement(manifest.elementName));
    }
});

