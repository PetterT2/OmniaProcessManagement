import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement } from '@omnia/fx';
import { VueComponentBase, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux";
import { IProcessFieldValueDefinition } from './IProcessFieldValueDefinition';
import { EnterprisePropertyItemSettings } from '@omnia/fx-models';

interface EnterprisePropertyProcessItemSettings extends EnterprisePropertyItemSettings {
    allowMultipleValues?: boolean;
}

@Component
export class ProcessFieldValueDefinition extends VueComponentBase implements IWebComponentInstance, IProcessFieldValueDefinition {
    @Prop() model: EnterprisePropertyProcessItemSettings;
    @Prop() onModelChanged: (model: EnterprisePropertyProcessItemSettings) => void;
    @Prop() disabled: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OmniaUxLocalizationNamespace) private omniaUxLoc: OmniaUxLocalization;


    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    created() {

    }

    beforeDestroy() {
    }

    private onRequiredChanged() {
        this.model.required = !this.model.required;
        this.onValueChanged();
        this.$forceUpdate();
    }

    private onAllowMultiValuesChanged() {
        this.model.allowMultipleValues = !this.model.allowMultipleValues;
        this.onValueChanged();
        this.$forceUpdate();
    }

    private onValueChanged() {
        if (this.onModelChanged)
            this.onModelChanged(this.model);
    }

    public render(h) {
        return (
            <div>
                <v-flex xs12>
                    <v-checkbox
                        dark={this.omniaTheming.promoted.body.dark}
                        disabled={this.disabled}
                        color={this.omniaTheming.promoted.body.primary.base}
                        label={this.omniaUxLoc.EnterpriseProperties.ValueDefinition.Required}
                        input-value={this.model.required}
                        onChange={() => { this.onRequiredChanged(); }}>
                    </v-checkbox>
                </v-flex>
                <v-flex xs12>
                    <v-checkbox
                        dark={this.omniaTheming.promoted.body.dark}
                        disabled={this.disabled}
                        color={this.omniaTheming.promoted.body.primary.base}
                        label={this.omniaUxLoc.EnterpriseProperties.ValueDefinition.AllowMultipleValues}
                        input-value={this.model.allowMultipleValues}
                        onChange={() => { this.onAllowMultiValuesChanged(); }}>
                    </v-checkbox>
                </v-flex>
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessFieldValueDefinition);
});