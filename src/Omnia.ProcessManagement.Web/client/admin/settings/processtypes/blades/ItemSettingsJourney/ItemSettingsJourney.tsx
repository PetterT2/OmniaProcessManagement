import { Inject, Localize, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';
import Component from 'vue-class-component';
import Vue from 'vue';
import { IProcessTypeItemSettingsJourney } from './IItemSettingsJourney';
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { ProcessTypesItemSettingsJourneyBladeIds } from './ItemSettingsJourneyConstants';
import DefaultBlade from './blades/DefaultBlade';
import PropertySetSettingsBlade from './blades/PropertySetSettingsBlade';
import TermDrivenSettingsBlade from './blades/TermDrivenSettingsBlade';


@Component
export default class ProcessTypeItemSettingsJourney extends Vue implements IWebComponentInstance, IProcessTypeItemSettingsJourney {
    journey: JourneyInstance;
    getJourneyInstance() {
        //Need to use method callback to get instance since it dosent exist when bootstrapped
        return this.journey;
    }

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    private gotInstance(instance: JourneyInstance) {
        this.journey = instance;
        this.journey.travelTo([ProcessTypesItemSettingsJourneyBladeIds.default]);
    }

    getDefaultBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTypesItemSettingsJourneyBladeIds.default,
            size: BladeSizes.medium,
            content: <DefaultBlade journey={this.getJourneyInstance}></DefaultBlade>
        }

        return blade;
    }

    getPropertySetSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTypesItemSettingsJourneyBladeIds.propertysetsettings,
            size: BladeSizes.large,
            content: <PropertySetSettingsBlade journey={this.getJourneyInstance}></PropertySetSettingsBlade>
        }

        return blade;
    }

    getTermDrivenSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTypesItemSettingsJourneyBladeIds.termdrivensettings,
            size: BladeSizes.extramedium,
            content: <TermDrivenSettingsBlade journey={this.getJourneyInstance}></TermDrivenSettingsBlade>
        }

        return blade;
    }


    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getDefaultBlade(), this.getPropertySetSettingsBlade(), this.getTermDrivenSettingsBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessTypeItemSettingsJourney);
});