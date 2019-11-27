import { Store } from '@omnia/fx/store';
import { Injectable } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';
import { DisplayModes, ProcessDesignerSettings } from '../../models/processdesigner';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Scoped) }
})
export class ProcessDesignerSettingsStore extends Store {

    /**
     * State
     */
    displayMode = this.state<DisplayModes>(DisplayModes.contentEditing);
    //editorUserExperience = this.state<EditorUserExperience>(EditorUserExperience.advanced);
    showContentNavigation = this.state<boolean>(false);
    itemIsCheckOut = this.state<boolean>(false);

    constructor() {
        super({ id: "ed290beb-12b4-49b3-bd37-659570624a9a" });
    }

    onActivated() {

    }

    onDisposing() {

    }

    /**
     * Mutations
     */
    mutations = {
        changeSettings: this.mutation((settings: ProcessDesignerSettings) => {
            this.displayMode.mutate(settings.displayMode);
            //this.editorUserExperience.mutate(settings.editorUserExperience);
            this.showContentNavigation.mutate(settings.showContentNavigation);
            this.itemIsCheckOut.mutate(settings.itemIsCheckOut);
        })
    }
}

