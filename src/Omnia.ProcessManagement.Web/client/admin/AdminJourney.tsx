import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject } from "@omnia/fx";
import { IAdminJourney } from './IAdminJourney';
import { JourneyInstance, Blade, BladeSizes } from '@omnia/fx/ux';
import { AdminJourneyBladeIds } from './AdminJourneyConstants';
import SubMenuBlade from './blades/SubMenuBlade';
import SettingsBlade from './blades/SettingsBlade';
import { AdminJourneyStore } from './store';


@Component
export default class AdminJourney extends Vue implements IWebComponentInstance, IAdminJourney {
    @Inject(AdminJourneyStore) adminJourneyStore: AdminJourneyStore;

    journey: JourneyInstance;
    getJourneyInstance() {
        //Need to use method callback to get instance since it dosent exist when bootstrapped
        return this.journey;
    }

    created() {
        this.adminJourneyStore.mutations.setActiveSubMenuItem.commit(null);
    }

    mounted() {
        WebComponentBootstrapper
            .registerElementInstance(this, this.$el);
    }

    private gotInstance(instance: JourneyInstance) {
        this.journey = instance;
        this.journey.travelTo([AdminJourneyBladeIds.submenu, AdminJourneyBladeIds.settings]);
    }

    getSubMenuBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: AdminJourneyBladeIds.submenu,
            size: BladeSizes.small,
            content: <SubMenuBlade journey={this.getJourneyInstance}></SubMenuBlade>
        }

        return blade;
    }

    getSettingsBlade() {
        let h = this.$createElement;
        let blade: Blade = {
            id: AdminJourneyBladeIds.settings,
            size: null,
            content: <SettingsBlade journey={this.getJourneyInstance}></SettingsBlade>
        }

        return blade;
    }


    render(h) {
        return (
            <omfx-journey onInstanceCreated={this.gotInstance}
                blades={[this.getSubMenuBlade(), this.getSettingsBlade()]}></omfx-journey>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AdminJourney);
});

