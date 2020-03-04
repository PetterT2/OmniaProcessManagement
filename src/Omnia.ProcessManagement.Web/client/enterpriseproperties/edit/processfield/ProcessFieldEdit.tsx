import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { WebComponentBootstrapper, IWebComponentInstance, vueCustomElement } from '@omnia/fx';
import { VueComponentBase, IValidator } from "@omnia/fx/ux";
import { IProcessFieldEdit } from './IProcessFieldEdit';
import { EnterprisePropertyDefinition, ValueDefinitionMultipleValueSetting } from '@omnia/fx-models';

@Component
export class ProcessFieldEdit extends VueComponentBase implements IWebComponentInstance, IProcessFieldEdit {
    @Prop() model: { [propertyInternalName: string]: string };
    @Prop() onModelChange: (value: string) => void;
    @Prop() disabled: boolean;
    @Prop() property: EnterprisePropertyDefinition;
    @Prop({ default: false }) dark?: boolean;
    @Prop({ default: null }) useValidator: IValidator;
    @Prop({ default: null }) settings: ValueDefinitionMultipleValueSetting;

    isRequired: boolean = false;

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {
        this.isRequired = this.settings.required;
        if (!this.model[this.property.internalName]) {
            this.model[this.property.internalName] = null;
        }
    }

    beforeDestroy() {
    }

    private onProcessInputChange(value: Array<string>) {
        this.model[this.property.internalName] = JSON.stringify(value);
        if (this.onModelChange)
            this.onModelChange(this.model[this.property.internalName]);
        this.$forceUpdate();
    }

    // render Process Picker
    public render(h) {
        return (
            <div>
                <opm-process-picker required={this.isRequired}
                    dark={this.dark}
                    model={this.model[this.property.internalName]}
                    label={this.property.multilingualTitle}
                    filled
                    disabled={this.disabled}
                    multiple={this.settings.allowMultipleValues}
                    onModelChange={this.onProcessInputChange}
                    validator={this.useValidator}></opm-process-picker>
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessFieldEdit);
});