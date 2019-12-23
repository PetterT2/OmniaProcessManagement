import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, HeadingStyles, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Enums, Task } from '../../../fx/models';
import { CurrentProcessStore } from '../../../fx';
import { ICreateTask } from './ICreateTask';


@Component
export class CreateTaskComponent extends VueComponentBase implements IWebComponentInstance, ICreateTask {
    @Prop() onClose: () => void;
    @Prop() onSave: (task: Task) => void;
    @Prop() taskId?: GuidValue;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private editingTask: Task = null;
    private isNew: boolean = false;
    private internalValidator: FormValidator = null;
    private processStepTasks: Array<Task> = null;

    created() {
        this.init();
    }

    init() {
        this.processStepTasks = this.currentProcessStore.getters.referenceData().current.processData.tasks;

        if (this.processStepTasks) {
            var existedTask = this.processStepTasks.find((item) => item.id == this.taskId);
            if (existedTask) {
                this.editingTask = Utils.clone(existedTask);
                this.isNew = false;
            }
        }
        else {
            this.processStepTasks = this.currentProcessStore.getters.referenceData().current.processData.tasks = [];
        }
        if (!this.editingTask) {
            this.editingTask = this.initDefaultTask();
            this.isNew = true;
        }
    }

    private initDefaultTask(): Task {
        return {
            id: Guid.newGuid(),
            title: null
        };
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.internalValidator = new FormValidator(this);
    }

    beforeDestroy() {      
    }

    private saveTask() {
        let savedTask = Utils.clone(this.editingTask);
        if (this.isNew) {
            this.processStepTasks.push(savedTask);
        }
        else {
            let existedTask = this.processStepTasks.find((item) => item.id == this.taskId);
            existedTask = savedTask;
        }
        this.onSave(savedTask);
    }


    visible: boolean = true;
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <div>
            <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                <v-toolbar-title>{this.isNew ? this.pdLoc.AddTask : this.pdLoc.EditTask}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={this.onClose}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-container>
                <v-card flat>
                    <v-card-content>
                        <v-row>
                            <v-col cols="12">
                                <omfx-multilingual-input
                                    requiredWithValidator={this.internalValidator}
                                    model={this.editingTask.title}
                                    onModelChange={(title) => { this.editingTask.title = title; }}
                                    forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                            </v-col>                            
                        </v-row>
                    </v-card-content>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text color={this.omniaTheming.themes.primary.base} dark={this.omniaTheming.promoted.body.dark} onClick={this.saveTask}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn text onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-container>
        </div>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, CreateTaskComponent, { destroyTimeout: 1500 });
});

