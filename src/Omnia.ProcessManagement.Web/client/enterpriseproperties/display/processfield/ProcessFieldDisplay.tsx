import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { StyleFlow } from "@omnia/fx/ux";
import { IProcessFieldDisplay } from './IProcessFieldDisplay';
import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { Process, ProcessFieldDisplayStyles, LightProcess } from '../../../fx/models';
import { ProcessService } from '../../../fx';

@Component
export class ProcessFieldDisplayComponent extends Vue implements IWebComponentInstance, IProcessFieldDisplay {
    @Prop({ default: [] }) model: any;
    @Prop() property: EnterprisePropertyDefinition;
    @Prop() wrapWithParentContent: (h: any, internalName: string, propertyContent: JSX.Element) => JSX.Element;

    @Inject(ProcessService) private processService: ProcessService;

    private styles = StyleFlow.use(ProcessFieldDisplayStyles);
    private processes: Array<LightProcess> = [];

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.init();
    }

    private init() {
        var ids = [];

        if (Utils.isString(this.model)) {
            ids = [this.model];
        }
        else if (Utils.isArray(this.model) && (this.model as Array<LightProcess>).length > 0) {
            ids = this.model.map(u => u.id);
            if (!Utils.isArrayNullOrEmpty(ids) && ids[0] === undefined) {
                ids = this.model.map(u => u.id);
            }
        }

        this.processService.getPublishedByIdsWithoutPermission(ids).then((data) => {
            this.processes = data;
        })
    }

    private renderProcess(h, process: LightProcess) {
        return <v-list-item class={this.styles.process}>
            <v-list-item-avatar size="32px" style={'align-self: self-start'}>
                <omfx-letter-avatar name={process.multilingualTitle} size={45}></omfx-letter-avatar>
            </v-list-item-avatar>
            <v-list-item-content>{process.multilingualTitle}</v-list-item-content>
        </v-list-item>;
    }

    private renderContent(h) {
        if (!Utils.isArrayNullOrEmpty(this.processes)) {
            return (<v-list class={this.styles.processList}>
                {this.processes.map((process) => {
                    return this.renderProcess(h, process);
                })}
            </v-list>);
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
