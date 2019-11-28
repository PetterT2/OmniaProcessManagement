import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, ServiceContainer, OmniaContext } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';
import { OPMRouter, CurrentProcessStore } from '../../fx';
import { ViewOptions } from '../../fx/models';

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
            OPMRouter.routeContext.route.viewOption != ViewOptions.viewLatestPublishedInBlock ? true : false
    }

    renderProcess(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        return (
            <p>Process Step: {currentReferenceData.currentProcessStep.title['en-us']}</p>
        )
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

