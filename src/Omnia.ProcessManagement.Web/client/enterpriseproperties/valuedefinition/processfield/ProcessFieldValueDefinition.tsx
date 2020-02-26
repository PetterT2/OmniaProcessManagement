﻿import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { VueComponentBase, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux";
import { IProcessFieldValueDefinition } from './IProcessFieldValueDefinition';
import { ValueDefinitionSetting } from '@omnia/fx-models';

@Component
export class ProcessFieldValueDefinition extends VueComponentBase implements IWebComponentInstance, IProcessFieldValueDefinition {
    @Prop() model: ValueDefinitionSetting;
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
        this.$forceUpdate();
    }

    public render(h) {
        return (
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
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessFieldValueDefinition);
});