import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject } from "@omnia/fx";
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { IGlobalSettingsJourney } from './IGlobalSettingsJourney';
import { GlobalSettingsJourneyBladeIds } from './GlobalSettingsJourneyConstants';
import DefaultBlade from './blades/DefaultBlade';

@Component
export default class GlobalSettingsJourney extends Vue implements IWebComponentInstance, IGlobalSettingsJourney {

    journey: JourneyInstance;
    getJourneyInstance() {
        //Need to use method callback to get instance since it dosent exist when bootstrapped
        return this.journey;
    }

    created() {

    }

    mounted() {
        WebComponentBootstrapper
            .registerElementInstance(this, this.$el);
    }

    private gotInstance(instance: JourneyInstance) {
        this.journey = instance;
        this.journey.travelTo([GlobalSettingsJourneyBladeIds.default]);
    }

    getDefaultBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: GlobalSettingsJourneyBladeIds.default,
            size: BladeSizes.medium,
            content: <DefaultBlade journey={this.getJourneyInstance}></DefaultBlade>
        }

        return blade;
    }       

    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getDefaultBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, GlobalSettingsJourney);
});

