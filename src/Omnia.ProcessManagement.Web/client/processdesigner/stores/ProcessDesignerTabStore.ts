import { Store } from '@omnia/fx/store';
import { Injectable } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';
import { TabRegistration } from '../../models/processdesigner';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Scoped) }
})
export class ProcessDesignerTabStore extends Store {
    /**
     * State
     */
    selectedTab = this.state<TabRegistration>(null);
    currentTabs = this.state<Array<TabRegistration>>([]);
    selectedTabIndex = this.state<number>(0);;

    constructor() {
        super({ id: "9729870c-9572-4a43-ba8f-923eb0dec9e3" });
    }

    onActivated() {

    }

    onDisposing() {

    }

    /**
     * Mutations
     */

    mutations = {
        setDefaultSelectedTab: this.mutation(() => {
            let selectedTab = null
            //Make the tabs sticky
            if (this.selectedTab.state) {
                this.currentTabs.state.forEach((registration) => {
                    if (registration.tabId === this.selectedTab.state.tabId) {
                        selectedTab = registration;
                        return;
                    }
                });

            }
            if (!selectedTab) {
                this.currentTabs.state.forEach((registration) => {
                    if (registration.active) {
                        selectedTab = registration;
                        return;
                    }
                });
            }
            if (selectedTab) {
                this.selectedTab.mutate(selectedTab);
            }
            this.setSelectedTabIndex();
        }),

        setSelectedTab: this.mutation((tabSelection: TabRegistration) => {
            this.currentTabs.state.forEach((registration) => {
                if (registration.tabId === tabSelection.tabId) {
                    this.selectedTab.mutate(registration);
                    return;
                }
            });
            this.setSelectedTabIndex();
        })
    }

    private setSelectedTabIndex() {
        let index = this.currentTabs.state.findIndex((tab) => { return tab.tabId === this.selectedTab.state.tabId });
        this.selectedTabIndex.mutate(index);
    }
}

