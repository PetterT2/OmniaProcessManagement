import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, HeadingStyles, FormValidator, FieldValueValidation, StyleFlow } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Enums, Task, VDialogScrollableDialogStyles } from '../../../fx/models';
import { CurrentProcessStore } from '../../../fx';
import { ICreateTask } from './ICreateTask';
import '../../../core/styles/dialog/VDialogScrollableDialogStyles.css';

@Component
export class CreateTaskComponent extends VueComponentBase implements IWebComponentInstance, ICreateTask {
    @Prop() onClose: () => void;
    @Prop() onSave: (task: Task) => void;
    @Prop() taskId?: GuidValue;
    @Prop() isProcessStepShortcut: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private editingTask: Task = null;
    private isNew: boolean = false;
    private internalValidator: FormValidator = null;
    private processStepTasks: Array<Task> = null;
    dialogVisible: boolean = true;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);

    created() {
        this.init();
    }

    init() {
        this.processStepTasks = this.currentProcessStepReferenceData.processData.tasks;

        if (this.processStepTasks) {
            var existedTask = this.processStepTasks.find((item) => item.id == this.taskId);
            if (existedTask) {
                this.editingTask = Utils.clone(existedTask);
                this.isNew = false;
            }
        }
        else {
            this.processStepTasks = this.currentProcessStepReferenceData.processData.tasks = [];
        }
        if (!this.editingTask) {
            this.editingTask = this.initDefaultTask();
            this.isNew = true;
        }
    }

    get currentProcessStepReferenceData() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (!this.isProcessStepShortcut) {
            return referenceData.current;
        }
        return referenceData.shortcut;
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
        if (this.internalValidator.validateAll()) {
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
    }


    visible: boolean = true;
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <v-dialog
            v-model={this.dialogVisible}
            width="800px"
            scrollable
            persistent
            dark={this.theming.body.bg.dark}>
            <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                <v-card-title
                    class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                    dark={this.theming.chrome.bg.dark}>
                    <div>{this.isNew ? this.pdLoc.AddTask : this.pdLoc.EditTask}</div>
                    <v-spacer></v-spacer>
                    <v-btn
                        icon
                        dark={this.theming.chrome.bg.dark}
                        onClick={this.onClose}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                    <omfx-multilingual-input
                        requiredWithValidator={this.internalValidator}
                        model={this.editingTask.title}
                        onModelChange={(title) => { this.editingTask.title = title; }}
                        forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color={this.omniaTheming.themes.primary.base} dark={this.omniaTheming.promoted.body.dark} onClick={this.saveTask}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                    <v-btn text onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, CreateTaskComponent);
});

