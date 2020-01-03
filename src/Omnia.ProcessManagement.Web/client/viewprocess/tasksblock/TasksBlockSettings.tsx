import { Inject, IWebComponentInstance, Localize, vueCustomElement, WebComponentBootstrapper } from '@omnia/fx';
import { SettingsService, SettingsServiceConstructor } from '@omnia/fx/services';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ITasksBlockSettingsComponent } from './ITasksBlockSettings';
import { TasksBlockLocalization } from './loc/localize';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux"
import { MultilingualStore } from '@omnia/fx/store';
import { TasksBlockData, TasksBlockDataData } from '../../fx/models';

@Component
export class TasksBlockSettingsComponent extends Vue implements IWebComponentInstance, ITasksBlockSettingsComponent {
    @Prop() public settingsKey: string;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<TasksBlockData>;
    @Inject(MultilingualStore) multiLIngualStore: MultilingualStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(TasksBlockLocalization.namespace) private loc: TasksBlockLocalization.locInterface;
 
    blockData: TasksBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
  
    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.settingsKey)
                .subscribe(this.setBlockData)

            this.setBlockData(blockData || {
                data: {} as TasksBlockDataData,
                settings: {
                    title: { isMultilingualString: true }
                }
            } as TasksBlockData);
        });

    }

    setBlockData(blockData: TasksBlockData) {
        this.blockData = blockData;
    }

    beforeDestroy() {
        this.subscriptionHandler.unsubscribe();
    }

    updateSettings() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        let dark = this.omniaTheming.promoted.body.dark;
        return (
            <v-card dark={dark}>
                <v-card-text>
                    <omfx-multilingual-input
                        label={this.loc.TasksBlockSettings.Title}
                        model={this.blockData.settings.title}
                        onModelChange={(title) => { this.blockData.settings.title = title; this.updateSettings() }}>
                    </omfx-multilingual-input>
                </v-card-text>
            </v-card>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TasksBlockSettingsComponent);
});
