import {
    Inject
} from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';

import { Prop, Emit } from 'vue-property-decorator';
import { OmniaTheming } from "@omnia/fx/ux"

export interface TabsPanelProps {
    sliderColor: string
}

@Component
export class TabsPanel extends tsx.Component<
TabsPanelProps>
{
    //@Prop() tabRegistrations: Array<IEditorTabRegistration>
    //@Prop() sliderColor: string
    //@Inject(EditorStore) editorStore: EditorStore;
    //@Inject(OmniaTheming) omniaTheming: OmniaTheming;

    //public mounted() {

    //}

    //private model = {
    //    activeTab: 2
    //}

    ///**
    // * Sets the tab content element
    // * @param element
    // */
    //public onTabSelected(selectedTabRegistration: IEditorTabRegistration) {
    //    this.editorStore.tabs.mutations.setSelectedTab.commit(selectedTabRegistration);
    //}


    ///**
    // * Render the tabse
    // * @param h
    // */
    //private renderTabs(h) {
    //    let result: Array<JSX.Element> = [];
    //    if (!this.editorStore.item.state) {
    //        return result;
    //    }
    //    for (let i = 0; i < this.editorStore.tabs.currentTabs.state.length; i++) {
    //        let currentTab = this.editorStore.tabs.currentTabs.state[i];
    //        if (currentTab === this.editorStore.tabs.selectedTab.state) {
    //            this.model.activeTab = i;
    //        }
    //        result.push(
    //            <v-tab onClick={() => this.onTabSelected(currentTab)}>
    //                <span class={TabspanelStyles.textColor(this.omniaTheming, this.editorStore.errorTabIndex.state === i)}>{currentTab.tabName}</span>
    //            </v-tab>
    //        );
    //    }
    //    return result;
    //}

    ///**
    // * Render 
    // * @param h
    // */
    //public render(h) {
    //    let sliderColor = this.omniaTheming.chrome.dark ? "#FFF" : "#000";
    //    if (this.editorStore.errorTabIndex.state === this.model.activeTab)
    //        sliderColor = "#FF5252";

    //    return <v-tabs dark={this.omniaTheming.chrome.dark} slider-color={sliderColor}
    //        v-model={this.model.activeTab}
    //        color="rgba(0, 0, 0, 0)">
    //        {this.renderTabs(h)}
    //    </v-tabs>
    //}
}
