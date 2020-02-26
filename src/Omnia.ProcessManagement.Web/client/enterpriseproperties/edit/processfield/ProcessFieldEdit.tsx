import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { VueComponentBase, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, IValidator, FieldValueValidation } from "@omnia/fx/ux";
import { IProcessFieldEdit } from './IProcessFieldEdit';
import { EnterprisePropertyDefinition, ValueDefinitionMultipleValueSetting } from '@omnia/fx-models';
import { Process, LightProcess } from '../../../fx/models';

@Component
export class NumberFieldEdit extends VueComponentBase implements IWebComponentInstance, IProcessFieldEdit {
    @Prop() model: any;
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

    private onProcessInputChange(value: Array<LightProcess>) {
        this.model[this.property.internalName] = value;
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
    vueCustomElement(manifest.elementName, NumberFieldEdit);
});