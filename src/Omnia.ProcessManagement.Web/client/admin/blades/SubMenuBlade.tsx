import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../loc/localize';
import { SubMenuItem } from '../models';
import { AdminJourneyStore } from '../store';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class SubMenuBlade extends tsx.Component<DefaultBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(AdminJourneyStore) adminJourneyStore: AdminJourneyStore;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    render(h) {
        let subMenuItems = this.adminJourneyStore.getters.subMenuItems();
        return (
            <div>
                <v-toolbar prominent dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessManagement}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-list dense>
                    {
                        subMenuItems.map(subMenuItem =>
                            <v-list-item
                                ripple
                                onClick={() => { this.adminJourneyStore.mutations.setActiveSubMenuItem.commit(subMenuItem); }}>
                                <v-list-item-action>
                                    <v-icon color={this.omniaTheming.promoted.body.onComponent.base}>{subMenuItem.icon}</v-icon>
                                </v-list-item-action>
                                <v-list-item-content >
                                    <v-list-item-title color={this.omniaTheming.promoted.body.onComponent.base}>{subMenuItem.title}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        )
                    }
                </v-list>
            </div>
        );
    }
}