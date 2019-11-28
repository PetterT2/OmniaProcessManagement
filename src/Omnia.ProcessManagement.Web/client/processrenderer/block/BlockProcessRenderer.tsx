import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, ServiceContainer, OmniaContext } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';

@Component
export class BlockProcessRendererComponent extends Vue implements IWebComponentInstance {

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    render(h) {

    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, BlockProcessRendererComponent);
});

