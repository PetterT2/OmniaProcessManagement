import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './TasksBlock.css';
import { TasksBlockStyles } from '../../models';
import { TasksBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { TasksBlockData, ProcessReferenceData, Task } from '../../fx/models';
import { CurrentProcessStore } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class TasksBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof TasksBlockStyles | any;

    @Localize(TasksBlockLocalization.namespace) loc: TasksBlockLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<TasksBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: TasksBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    tasks: Array<Task> = [];
    tasksClasses = StyleFlow.use(TasksBlockStyles, this.styles);

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    init() {
        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData);

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-tasks-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: { title: { isMultilingualString: true } }
            });
        });

        this.initTasks();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initTasks();
        }));
    }

    initTasks() {
        this.tasks = [];
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (currentReferenceData && currentReferenceData.current.processData.tasks) {
            this.tasks = currentReferenceData.current.processData.tasks;
            this.tasks.forEach(t => t.multilingualTitle = this.multilingualStore.getters.stringValue(t.title));
        }
    }

    setBlockData(blockData: TasksBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    renderTask(ele: Task): JSX.Element {
        let h: CreateElement = this.$createElement;

        return (
            <v-list-item>
                <v-list-item-action class="mr-2">
                    <v-icon size='14'>check</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title class="pa-1">{ele.multilingualTitle}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        );
    }

    renderTasks(h) {
        return (
            <div>
                {this.tasks.map(ele => this.renderTask(ele))}
            </div>
        )
    }

    render(h) {
        return (
            <aside>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        Utils.isArrayNullOrEmpty(this.tasks) ?
                            <wcm-empty-block-view dark={false} icon={"fa fa-tasks"} text={this.corLoc.Blocks.Tasks.Title}></wcm-empty-block-view>
                            :
                            <div class={this.tasksClasses.blockPadding(this.blockData.settings.spacing)}>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div key={this.componentUniqueKey}>{this.renderTasks(h)}</div>
                            </div>
                }
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TasksBlockComponent);
});

