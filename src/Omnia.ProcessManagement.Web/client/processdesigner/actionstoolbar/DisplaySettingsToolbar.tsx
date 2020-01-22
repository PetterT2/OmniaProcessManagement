import {
    Inject
} from '@omnia/fx';
import { OmniaTheming } from "@omnia/fx/ux"
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { ActionToolbarStyles } from './ActionToolbar.css';
import { DisplayModes, DisplayActionButton } from '../../models/processdesigner';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerStyles } from '../ProcessDesigner.css';
import { CurrentProcessStore } from '../../fx';


export interface DisplaySettingsActionButtonsProps {
}


@Component
export class DisplaySettingsToolbarComponent extends tsx.Component<DisplaySettingsActionButtonsProps>
{
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(OmniaTheming) private omniaTheming: OmniaTheming;

    public mounted() {

    }

    /**
     * Gets the initial active class for the items. It is not working setting v-bottom-nav component directly somehow. 
     * @param editorMode
     */
    public getButtonClass(editorMode: DisplayModes) {
        if (editorMode === this.processDesignerStore.settings.displayMode.state) {
            return ActionToolbarStyles.activeViewButton
        }
        return "";
    }

    /**
     * Eventhandler to change editor display mode
     * @param editorDisplayMode
     */
    public onChangeEditorDisplayMode(editorDisplayMode: DisplayModes) {
        this.processDesignerStore.mutations.changeDisplayMode.commit(editorDisplayMode);
    }


    private renderEditorActionButton(h, button: DisplayActionButton) {
        let showButton = true;
        if (button.visibilityCallBack) showButton = button.visibilityCallBack();
        if (!showButton) return null;

        return (<v-btn
            text
            key={1}
            dark={this.omniaTheming.chrome.dark}
            onClick={() => { this.onChangeEditorDisplayMode(button.displayMode) }}
            class={[ActionToolbarStyles.viewButton, this.getButtonClass(button.displayMode)]}>
            <span>{button.title}</span>
            <v-icon>{button.icon}</v-icon>
        </v-btn>);
    }

    public render(h) {
        //if (!this.processDesignerStore.settings.itemIsCheckOut.state) {
        //    return <div />
        //}

        let compensateDrawerLeftCss = ""
        let compensateDrawerRightCss = ""
        if (this.processDesignerStore.settings.showContentNavigation.state) {
            compensateDrawerLeftCss = ProcessDesignerStyles.compensateDrawerLeft
        }

        //todo
        //if (this.processDesignerStore.canvas.settingsPanel.state.visible) {
        //    compensateDrawerRightCss = EditorStyles.compensateDrawerRight
        //}

        let displaySettingsButtons = new Array<JSX.Element>();
        if (this.processDesignerStore.tabs.selectedTab.state)
            this.processDesignerStore.tabs.selectedTab.state.actionToolbar.editorDisplayActionButtons.forEach((button) => {
                displaySettingsButtons.push(this.renderEditorActionButton(h, button));
            });
        return (
            <v-layout key={1} class={[ActionToolbarStyles.positioning(this.omniaTheming.chrome.background), compensateDrawerLeftCss, compensateDrawerRightCss]}>
                <div key={1} class={ActionToolbarStyles.displayToolbar.positioningBar(this.omniaTheming.chrome.background)}>
                    {displaySettingsButtons}
                </div>
            </v-layout>
        );
    }
}

