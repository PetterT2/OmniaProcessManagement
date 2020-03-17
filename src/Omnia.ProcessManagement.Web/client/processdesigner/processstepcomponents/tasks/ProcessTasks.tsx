import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase, ConfirmDialogResponse, DialogPositions } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { Task } from '../../../fx/models';
import { ProcessDesignerStore } from '../../stores';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Prop } from 'vue-property-decorator';

export class ProcessTasksTabRenderer extends TabRenderer {
    private isProcessStepShortcut: boolean = false;
    constructor(isProcessStepShortcut: boolean = false) {
        super();
        this.isProcessStepShortcut = isProcessStepShortcut;
    }
    generateElement(h): JSX.Element {
        return (<ProcessTasksComponent key={Guid.newGuid().toString()} isProcessStepShortcut={this.isProcessStepShortcut}></ProcessTasksComponent>);
    }
}

export interface ProcessTasksProps {
    isProcessStepShortcut: boolean;
}

@Component
export class ProcessTasksComponent extends VueComponentBase<ProcessTasksProps, {}, {}>
{
    @Prop() isProcessStepShortcut: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private openTaskPicker: boolean = false;
    private selectedTask: Task;
    private orderTasks: Array<Task> = [];
    private isDragging: boolean = false;

    created() {
        this.init();
    }

    init() {
        this.orderTasks = Utils.clone(this.currentProcessStepReferenceData.processData.tasks) || [];
        for (let task of this.orderTasks) {
            task.multilingualTitle = this.multilingualStore.getters.stringValue(task.title);
        }
    }

    mounted() {
    }

    beforeDestroy() {
    }

    openAddTasksForm() {
        this.selectedTask = { id: null } as Task;
        this.openTaskPicker = true;
    }    

    get currentProcessStepReferenceData() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (!this.isProcessStepShortcut) {
            return referenceData.current;
        }
        return referenceData.shortcut;
    }

    onTasksChanged(task?: Task, isDelete?: boolean) {
        if (Utils.isNullOrEmpty(this.currentProcessStepReferenceData.processData.tasks))
            return;
        if (task) {
            task.multilingualTitle = this.multilingualStore.getters.stringValue(task.title);
            let findTaskIndex = this.orderTasks.findIndex(l => l.id == task.id);
            if (isDelete) {
                this.orderTasks.splice(findTaskIndex, 1);
            }
            else {
                if (findTaskIndex == -1)
                    this.orderTasks.push(task);
                else
                    this.orderTasks[findTaskIndex] = task;
            }
        }
        this.currentProcessStepReferenceData.processData.tasks = this.orderTasks;
        this.processDesignerStore.actions.saveState.dispatch();
    }

    private deleteTask(task) {
        this.$confirm.open().then((res) => {
            if (res == ConfirmDialogResponse.Ok) {
                this.onTasksChanged(task, true);
            }
        })
    }

    /**
        * Render 
        * @param h
        */
    renderTaskPicker(h) {
        return <opm-processdesigner-createtask
            taskId={this.selectedTask.id}
            onSave={(task: Task) => {
                this.openTaskPicker = false;
                this.onTasksChanged(task, false);
            }}
            onClose={() => {
                this.openTaskPicker = false;
            }}
            isProcessStepShortcut={this.isProcessStepShortcut}
        ></opm-processdesigner-createtask>;
    }

    renderItems() {
        let h = this.$createElement;
        return (
            <draggable
                options={{ handle: ".drag-handle", animation: "100" }}
                onStart={() => { this.isDragging = true; }}
                onEnd={() => { this.isDragging = false; }}
                element="v-list"
                v-model={this.orderTasks}
                onChange={() => { this.onTasksChanged(); }}>
                {
                    this.orderTasks.length == 0 ?
                        <div>{this.pdLoc.MessageNoTasksItem}</div>
                        : this.orderTasks.map((task) => {
                            return (
                                <v-list-item class={!this.isDragging && "notdragging"} >
                                    <v-list-item-action class="mr-2">
                                        <v-icon size='14'>check</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                        <v-list-item-title color={this.omniaTheming.promoted.body.onComponent.base}>{task.multilingualTitle}</v-list-item-title>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                        <v-btn icon class="mr-1 ml-1" onClick={() => {
                                            this.selectedTask = task;
                                            this.openTaskPicker = true;
                                        }}>
                                            <v-icon size='14' color={this.omniaTheming.promoted.body.onComponent.base}>fas fa-pen</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                    <v-list-item-action>
                                        <v-btn icon class="mr-0" onClick={() => { this.deleteTask(task); }}>
                                            <v-icon size='14' color={this.omniaTheming.promoted.body.onComponent.base}>far fa-trash-alt</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                    <v-list-item-action>
                                        <v-btn icon class="mr-0" onClick={() => { }}>
                                            <v-icon class="drag-handle" size='14' color={this.omniaTheming.promoted.body.onComponent.base}>fas fa-grip-lines</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item>
                            )
                        })
                }
            </draggable>
        )
    }

    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <div>
                    <v-btn text onClick={(e: Event) => { e.stopPropagation(); this.openAddTasksForm() }} >
                        <v-icon small>add</v-icon>
                        <span>{this.pdLoc.AddTask}</span>
                    </v-btn>
                </div>
                <div>{this.renderItems()}</div>
            </v-card-text>
            {this.openTaskPicker && this.renderTaskPicker(h)}
        </v-card>)
    }
}

