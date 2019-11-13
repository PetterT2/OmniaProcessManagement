import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject } from "@omnia/fx";
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { ProcessTemplatesJourneyBladeIds } from './ProcessTemplatesJourneyConstants';
import { IProcessTemplatesJourney } from './IProcessTemplatesJourney';
import DefaultBlade from './blades/DefaultBlade';
import ProcessTemplateDefaultSettingsBlade from './blades/settingsblades/ProcessTemplateDefaultSettingsBlade';

@Component
export default class ProcessTemplatesJourney extends Vue implements IWebComponentInstance, IProcessTemplatesJourney {

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
        this.journey.travelTo([ProcessTemplatesJourneyBladeIds.default]);
    }

    getDefaultBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTemplatesJourneyBladeIds.default,
            size: BladeSizes.medium,
            content: <DefaultBlade journey={this.getJourneyInstance}></DefaultBlade>
        }

        return blade;
    }

    getDocumentTemplateSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ProcessTemplatesJourneyBladeIds.documentTemplateSettingsDefault,
            size: BladeSizes.medium,
            content: <ProcessTemplateDefaultSettingsBlade journey={this.getJourneyInstance}></ProcessTemplateDefaultSettingsBlade>
        }

        return blade;
    }

    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getDefaultBlade(), this.getDocumentTemplateSettingsBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessTemplatesJourney);
});

