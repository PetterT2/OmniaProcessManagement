import { Inject, Localize, Utils, SubscriptionHandler, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';


@Component
export class ProcessRendererComponent extends VueComponentBase implements IWebComponentInstance
{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;  

    created() {
     
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {      
    }

    public render(h) {
        return (
            <div>process</div>
            )
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessRendererComponent);
});
