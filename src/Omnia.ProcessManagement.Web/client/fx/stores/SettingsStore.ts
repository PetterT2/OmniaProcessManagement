import { Store } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue, Guid } from '@omnia/fx-models';
import { SettingsService } from '../services';
import { Setting, DynamicKeySetting } from '../models';


@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class SettingsStore extends Store {
    @Inject(SettingsService) private settingsService: SettingsService;

    private ensureSettingsPromises: { [key: string]: Promise<null> } = {};
    private settings = this.state<{ [key: string]: Setting }>({});

    constructor() {
        super({
            id: "69cd4ac0-b617-47f7-9c80-fd5b2bbb97d0"
        });
    }

    getters = {
        getByModel: <T extends Setting>(model: new () => T): T => {
            let instance = new model();
            if (instance.key) {
                return this.settings.state[instance.key] as T || null;
            }
            else
                return null;
        },
        getByDynamicKeyModel: <T extends DynamicKeySetting>(model: new (dynamicKey: string) => T, dynamicKey: string): T => {
            let instance = new model(dynamicKey);
            if (instance.key) {
                return this.settings.state[instance.key] as T || null;
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
        ensureSettings: this.action(<T extends Setting>(model: new () => T) => {
            let instance = new model();
            let key = instance.key;
            if (!this.ensureSettingsPromises[key]) {
                this.ensureSettingsPromises[key] = this.settingsService.getByKey(key).then(settings => {
                    if (settings)
                        this.mutations.addOrUpdateSettings.commit(settings);
                    return null;
                })
            }
            return this.ensureSettingsPromises[key];
        }),
        ensureDynamicKeySettings: this.action(<T extends DynamicKeySetting>(model: new (dynamicKey: string) => T, dynamicKey: string) => {
            let instance = new model(dynamicKey);
            let key = instance.key;
            if (!this.ensureSettingsPromises[key]) {
                this.ensureSettingsPromises[key] = this.settingsService.getByKey(key).then(settings => {
                    if (settings)
                        this.mutations.addOrUpdateSettings.commit(settings);
                    return null;
                })
            }
            return this.ensureSettingsPromises[key];
        }),
        addOrUpdateSettings: this.action(<T extends Setting>(settings: T) => {
            return this.settingsService.addOrUpdate(settings).then((savedSettings) => {
                this.mutations.addOrUpdateSettings.commit(savedSettings);
                return null;
            })
        }),
        removeSettings: this.action(<T extends Setting>(model: new () => T) => {
            let instance = new model();
            let key = instance.key;

            return this.settingsService.removeByKey(key).then(() => {
                this.ensureSettingsPromises[key] = null;
                this.mutations.addOrUpdateSettings.commit(instance, true);

                return null;
            })
        }),
        removeDynamicKeySettings: this.action(<T extends DynamicKeySetting>(model: new (dynamicKey: string) => T, dynamicKey: string) => {
            let instance = new model(dynamicKey);
            let key = instance.key;

            return this.settingsService.removeByKey(key).then(() => {
                this.ensureSettingsPromises[key] = null;
                this.mutations.addOrUpdateSettings.commit(instance, true);

                return null;
            })
        }),
    }


    protected onActivated() {

    }
    protected onDisposing() {

    }
}