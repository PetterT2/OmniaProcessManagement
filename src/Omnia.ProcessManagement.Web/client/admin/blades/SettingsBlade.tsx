import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../loc/localize';
import { AdminJourneyStore } from '../store';


interface SettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class SettingsBlade extends tsx.Component<SettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Inject(AdminJourneyStore) adminJourneyStore: AdminJourneyStore;

    render(h) {
        let activeSubItem = this.adminJourneyStore.getters.activeSubMenuItem();
        return (
            <div style={{ height: '100%' }}>
                {activeSubItem ? h(activeSubItem.element) : null}
            </div>
        )
    }
}