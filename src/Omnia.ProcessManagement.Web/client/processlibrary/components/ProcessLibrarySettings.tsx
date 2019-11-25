import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessLibraryLocalization } from '../loc/localize';
import { OmniaTheming } from '@omnia/fx/ux';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';

@Component
export class ProcessLibrarySettingsComponent extends Vue implements IWebComponentInstance {
    @Prop() settingsKey: string;

    // Localize
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;

    //services
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    subscriptionHandler: IMessageBusSubscriptionHandler = null;

    // -------------------------------------------------------------------------
    // Lifecycle Hooks
    // -------------------------------------------------------------------------

    beforeDestroy() {
        if (this.subscriptionHandler) this.subscriptionHandler.unsubscribe();
    }


    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    render(h) {
        return (
            <div>

            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessLibrarySettingsComponent, { destroyTimeout: 1000 });
});

