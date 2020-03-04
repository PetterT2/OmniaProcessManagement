import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { StyleFlow } from "@omnia/fx/ux";
import { IProcessFieldDisplay } from './IProcessFieldDisplay';
import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { Process, ProcessFieldDisplayStyles, LightProcess } from '../../../fx/models';
import { ProcessStore } from '../../../fx';

@Component
export class ProcessFieldDisplayComponent extends Vue implements IWebComponentInstance, IProcessFieldDisplay {
    @Prop() model: Array<string> | string;
    @Prop() property: EnterprisePropertyDefinition;
    @Prop() wrapWithParentContent: (h: any, internalName: string, propertyContent: JSX.Element) => JSX.Element;

    @Inject(ProcessStore) private processStore: ProcessStore;

    private styles = StyleFlow.use(ProcessFieldDisplayStyles);
    private internalModel: Array<string> = []
    private processes: Array<LightProcess> = [];

    @Watch('model', { deep: true })
    filterChange(newValue: Array<string>, oldValue: Array<string>) {
        if (newValue !== oldValue) {
            this.processStore.actions.ensureLightProcessLoaded.dispatch().then(() => {
                this.internalModel = Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>);
                this.processes = this.processStore.getters.lightProcess(this.internalModel);
            })
        }
    }

    created() {
        this.processStore.actions.ensureLightProcessLoaded.dispatch().then(() => {
            this.internalModel = Utils.isString(this.model) ? JSON.parse(this.model.toString()) : (this.model as Array<string>);
            this.processes = this.processStore.getters.lightProcess(this.internalModel);
        })
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    private renderContent(h) {
        if (!Utils.isArrayNullOrEmpty(this.processes)) {
            return (
                <div>
                    {this.processes.map((process) => <v-chip class="ma-1">{process.multilingualTitle + ' (' + process.opmProcessIdNumber.toString() + ')'}</v-chip>)}
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
