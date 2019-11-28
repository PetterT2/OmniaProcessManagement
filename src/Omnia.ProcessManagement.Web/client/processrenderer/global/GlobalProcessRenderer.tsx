import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, OmniaContext, ServiceContainer } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';
import { CurrentProcessStore, OPMRouter } from '../../fx';
import { ViewOptions } from '../../fx/models';
import './GlobalProcessRenderer.css';
import { GlobalProcessRendererStyles } from '../../models';
import { StyleFlow } from '@omnia/fx/ux';

@Component
export class GlobalProcessRendererComponent extends Vue implements IWebComponentInstance {
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;

    private styles = StyleFlow.use(GlobalProcessRendererStyles);

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    get hidden(): boolean {
        return !OPMRouter.routeContext.route ||
            OPMRouter.routeContext.route.viewOption != ViewOptions.viewLatestPublishedInGlobal ||
            !this.currentProcessStore.getters.referenceData() ? true : false
    }

    //TODO: Complete the render process function
    renderProcess(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        return (
            <div>
                <v-btn style={{ float: 'right' }} icon onClick={() => { OPMRouter.clearRoute() }}><v-icon>close</v-icon></v-btn>
                <p>Process Step Id: {currentReferenceData.currentProcessStep.id}</p>
            </div>
        )
    }

    render(h) {
        if (this.hidden) {
            return null;
        }

        return (
            <div class={this.styles.container}>
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

