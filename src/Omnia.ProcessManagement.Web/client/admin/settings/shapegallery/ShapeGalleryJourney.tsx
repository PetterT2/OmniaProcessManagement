import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject } from "@omnia/fx";
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { ShapeGalleryJourneyBladeIds } from './ShapeGalleryJourneyConstants';
import { IShapeGalleryJourney } from './IShapeGalleryJourney';
import DefaultBlade from './blades/DefaultBlade';
import ShapeGalleryDefaultSettingsBlade from './blades/settingsblades/ShapeGalleryDefaultSettingsBlade';

@Component
export default class ShapeGalleryJourney extends Vue implements IWebComponentInstance, IShapeGalleryJourney {

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
        this.journey.travelTo([ShapeGalleryJourneyBladeIds.default]);
    }

    getDefaultBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ShapeGalleryJourneyBladeIds.default,
            size: BladeSizes.medium,
            content: <DefaultBlade journey={this.getJourneyInstance}></DefaultBlade>
        }

        return blade;
    }

    getShapeGalleryDefaultSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: ShapeGalleryJourneyBladeIds.shapeGallerySettingsDefault,
            size: BladeSizes.medium,
            content: <ShapeGalleryDefaultSettingsBlade journey={this.getJourneyInstance}></ShapeGalleryDefaultSettingsBlade>
        }

        return blade;
    }

    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getDefaultBlade(), this.getShapeGalleryDefaultSettingsBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeGalleryJourney);
});

