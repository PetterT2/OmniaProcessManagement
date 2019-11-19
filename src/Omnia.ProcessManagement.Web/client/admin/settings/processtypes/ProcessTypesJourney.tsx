import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject } from "@omnia/fx";
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { ProcessTypesJourneyBladeIds } from './ProcessTypesJourneyConstants';
import { IProcessTypesJourney } from './IProcessTypesJourney';
import DefaultBlade from './blades/DefaultBlade';
import ItemSettingsBlade from './blades/ItemSettingsBlade';

@Component
export default class ProcessTypesJourney extends Vue implements IWebComponentInstance, IProcessTypesJourney {

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
        this.journey.travelTo([ProcessTypesJourneyBladeIds.default]);
    }

    getDefaultBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTypesJourneyBladeIds.default,
            size: BladeSizes.medium,
            content: <DefaultBlade journey={this.getJourneyInstance}></DefaultBlade>
        }

        return blade;
    }

    getItemSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTypesJourneyBladeIds.itemSettings,
            size: BladeSizes.medium,
            content: <ItemSettingsBlade></ItemSettingsBlade>
        }

        return blade;
    }

    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getDefaultBlade(), this.getItemSettingsBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessTypesJourney);
});

