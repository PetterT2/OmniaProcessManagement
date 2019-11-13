import { Store } from '@omnia/fx/store';
import { Injectable, Inject, Localize } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { SubMenuItem } from '../models';
import { OPMAdminLocalization } from '../loc/localize';
import { BladeSizes } from '@omnia/fx/ux';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class AdminJourneyStore extends Store {
    @Localize(OPMAdminLocalization.namespace) private loc: OPMAdminLocalization.locInterface;

    private subMenuItems = this.state<Array<SubMenuItem>>([]);
    private activeSubMenuItem = this.state<SubMenuItem>(null);

    constructor() {
        super({
            id: "8e1039db-be75-48cd-af3d-25fe510fc212"
        });
    }

    getters = {
        subMenuItems: () => {
            return this.subMenuItems.state;
        },
        activeSubMenuItem: () => {
            return this.activeSubMenuItem.state;
        }
    }

    mutations = {
        setActiveSubMenuItem: this.mutation((item: SubMenuItem) => {
            if (item && this.subMenuItems.state.indexOf(item) < 0) {
                throw `Not found sub menu item`
            }
            this.activeSubMenuItem.mutate(item);
        })
    }


    protected onActivated() {
        this.subMenuItems.mutate([
            { element: 'opm-admin-settings-globalsettings', title: this.loc.Settings, icon: 'fas fa-cogs' },
            { element: 'opm-admin-settings-process-types-journey', title: this.loc.ProcessTypes.Title, icon: 'fa fa-angle-right' },
            { element: 'opm-admin-settings-process-templates-journey', title: this.loc.ProcessTemplates.Title, icon: 'fa fa-th' },
        ])
    }
    protected onDisposing() {

    }
}

