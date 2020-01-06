import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, ServiceContainer, OmniaContext } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';
import { OPMRouter, CurrentProcessStore } from '../../fx';
import { RouteOptions } from '../../fx/models';

@Component
export class BlockProcessRendererComponent extends Vue implements IWebComponentInstance {
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    get hidden(): boolean {
        return !this.currentProcessStore.getters.referenceData() ||
            !OPMRouter.routeContext.route ||
            (OPMRouter.routeContext.route.routeOption != RouteOptions.publishedInBlockRenderer &&
                OPMRouter.routeContext.route.routeOption != RouteOptions.previewInBlockRenderer) ? true : false
    }

    //TODO: Complete the render process function
    renderProcess(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        return [
            <p>Process Step: {currentReferenceData.current.processStep.title['en-us']}</p>,
            <div>{JSON.stringify(currentReferenceData)}</div>
        ]
    }


    render(h) {
        if (this.hidden) {
            return (<div>Nothing to show</div>)
        }

        return (
            <div>
                {this.renderProcess(h)}
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, BlockProcessRendererComponent);
});

