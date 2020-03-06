import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Inject, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, ResolvablePromise } from '@omnia/fx';
import { StyleFlow, VueComponentBase } from "@omnia/fx/ux";
import { IProcessFieldDisplay } from './IProcessFieldDisplay';
import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import {  Process, OPMEnterprisePropertyInternalNames, ProcessFieldDisplayStyles } from '../../../fx/models';
import { ProcessStore, OPMRouter, ProcessRendererOptions } from '../../../fx';
import './ProcessFieldDisplay.css';

@Component
export class ProcessFieldDisplayComponent extends VueComponentBase implements IWebComponentInstance, IProcessFieldDisplay {
    @Prop() model: Array<string> | string;
    @Prop() property: EnterprisePropertyDefinition;
    @Prop() wrapWithParentContent: (h: any, internalName: string, propertyContent: JSX.Element) => JSX.Element;

    @Inject(ProcessStore) private processStore: ProcessStore;
    private styles = StyleFlow.use(ProcessFieldDisplayStyles);

    private internalModel: Array<string> = []
    private processes: Array<Process> = [];
    private resolvablePromise: ResolvablePromise<void> = new ResolvablePromise<void>();

    @Watch('model', { deep: true })
    modelChanged() {
        let internalModel = this.model && this.model !== 'undefined' ? (Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>)) : [];
        if (JSON.stringify(this.internalModel) != JSON.stringify(internalModel)) {
            this.internalModel = internalModel;
            this.invalidatePendingResolvePromise();
            this.resolvablePromise = new ResolvablePromise<void>();
            this.resolveProcess();
        }
    }

    created() {
        this.internalModel = this.model && this.model !== 'undefined' ? (Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>)) : [];
        this.resolveProcess();
    }

    beforeDestroy() {
        this.invalidatePendingResolvePromise();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }


    clickProcess(process: Process) {
        OPMRouter.navigate(process, process.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
    }


    invalidatePendingResolvePromise() {
        if (this.resolvablePromise.resolving) {
            this.resolvablePromise.reject('invalidated resolving process field due to a new state');
        }
    }

    resolveProcess() {
        let resolvablePromise = this.resolvablePromise;
        resolvablePromise.resolving = true;

        let promises: Array<Promise<Process>> = this.internalModel.map(id => new Promise<Process>((resolve, reject) => {
            this.processStore.actions.ensurePublishedProcess.dispatch(id).then((process) => {
                resolve(process);
            }).catch(err => {
                resolve(null);
            })
        }));

        Promise.all(promises).then(processes => {
            if (resolvablePromise.resolving) {
                let resolvedProcesses = processes.filter(p => p); //filter out cannot resolve process due to unauthorized or not found
                this.processes = resolvedProcesses;

                resolvablePromise.resolve();
            }
        })
    }

    private renderContent(h) {
        if (!Utils.isArrayNullOrEmpty(this.processes)) {
            return (
                <div>
                    {
                        this.processes.map((process) =>
                            <v-chip onClick={() => { this.clickProcess(process) }} class="ma-1">
                                <i class="fal fa-angle-double-right mr-2"></i>
                                {process.rootProcessStep.multilingualTitle}
                            </v-chip>
                        )}
                </div>)
        }
        return null;
    }

    render(h) {
        if (Utils.isFunction(this.wrapWithParentContent)) {
            return this.wrapWithParentContent(h, this.property.internalName, this.renderContent(h));
        }
        return this.renderContent(h);
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessFieldDisplayComponent);
});
