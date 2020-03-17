import {
    Inject
} from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';

import { Prop, Emit } from 'vue-property-decorator';
import { OmniaTheming } from "@omnia/fx/ux"
import { TabRegistration } from '../../models/processdesigner';
import { ProcessDesignerStore } from '../stores';
import { TabsPanelStyles } from './TabsPanel.css';

export interface TabsPanelProps {
    sliderColor: string
}

@Component
export class TabsPanelComponent extends tsx.Component<TabsPanelProps>
{
    @Prop() tabRegistrations: Array<TabRegistration>
    @Prop() sliderColor: string
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    public mounted() {

    }

    private model = {
        activeTab: 2
    }

    /**
     * Sets the tab content element
     * @param element
     */
    public onTabSelected(selectedTabRegistration: TabRegistration) {
        this.processDesignerStore.tabs.mutations.setSelectedTab.commit(selectedTabRegistration);
    }


    /**
     * Render the tabse
     * @param h
     */
    private renderTabs(h) {
        let result: Array<JSX.Element> = [];
        if (!this.processDesignerStore.item.state) {
            return result;
        }
        for (let i = 0; i < this.processDesignerStore.tabs.currentTabs.state.length; i++) {
            let currentTab = this.processDesignerStore.tabs.currentTabs.state[i];
            if (currentTab === this.processDesignerStore.tabs.selectedTab.state) {
                this.model.activeTab = i;
            }
            result.push(
                <v-tab onClick={() => {
                    this.onTabSelected(currentTab);
                    if (this.processDesignerStore.panels.editShapeSettingsPanel.state && this.processDesignerStore.panels.editShapeSettingsPanel.state.show)
                        this.processDesignerStore.panels.mutations.toggleEditShapeSettingsPanel.commit(false);
                }}>
                    <span class={TabsPanelStyles.textColor(this.omniaTheming, this.processDesignerStore.errorTabIndex.state === i)}>{currentTab.tabName}</span>
                </v-tab>
            );
        }
        return result;
    }

    /**
     * Render 
     * @param h
     */
    public render(h) {
        let sliderColor = this.omniaTheming.chrome.dark ? "#FFF" : "#000";
        if (this.processDesignerStore.errorTabIndex.state === this.model.activeTab)
            sliderColor = "#FF5252";

        return <v-tabs dark={this.omniaTheming.chrome.dark} slider-color={sliderColor}
            v-model={this.model.activeTab}
            color="rgba(0, 0, 0, 0)">
            {this.renderTabs(h)}
        </v-tabs>
    }
}
