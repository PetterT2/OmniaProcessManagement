import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue, Guid } from '@omnia/fx-models';
import { SettingsService } from '../services';
import { Setting } from '../models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class SettingsStore extends Store {
    @Inject(SettingsService) private settingsService: SettingsService;

    private ensureSettingsPromises: { [key: string]: Promise<null> } = {};
    private settings = this.state<{ [key: string]: Setting }>({});

    constructor() {
        super({
            id: "82b8818e-3cd6-44c5-aa58-06b4f4fa1200"
        });
    }

    getters = {
        getByModel: (): Setting => {
            let instance = new Setting();
            if (instance.key) {
                return this.settings.state[instance.key] as Setting || null;
            }
            else
                return null;
        }
    }

    private mutations = {
        addOrUpdateSettings: this.mutation((setting: Setting, remove?: boolean) => {
            if (setting.key) {
                this.settings.mutate(state => {
                    if (remove) {
                        delete state.state[setting.key]
                    }
                    else {
                        state.state[setting.key] = setting;
                    }
                })
            }
        })
    }

    actions = {
        ensureSettings: this.action(() => {
            let instance = new Setting();
            let key = instance.key;
            if (!this.ensureSettingsPromises[key]) {
                this.ensureSettingsPromises[key] = this.settingsService.getSettings().then(settings => {
                    if (settings)
                        this.mutations.addOrUpdateSettings.commit(settings);
                    return null;
                })
            }
            return this.ensureSettingsPromises[key];
        }),
        addOrUpdateSettings: this.action((settings: Setting) => {
            return this.settingsService.addOrUpdate(settings).then((savedSettings) => {
                this.mutations.addOrUpdateSettings.commit(savedSettings);
                return null;
            })
        })
    }


    protected onActivated() {

    }
    protected onDisposing() {

    }
}

