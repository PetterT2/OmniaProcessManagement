import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, HeadingStyles, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Link } from '../../../fx/models';
import { CurrentProcessStore } from '../../../fx';

export interface CreateLinkPanelProps {
    onClose: () => void;
    onSave: (link: Link) => void;
    linkId?: GuidValue;
}

@Component
export class CreateLinkPanelComponent extends VueComponentBase<CreateLinkPanelProps, {}, {}>{
    @Prop() onClose: () => void;
    @Prop() onSave: (link: Link) => void;
    @Prop() linkId?: GuidValue;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openedImageDialog: boolean = false;
    private headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };
    private editingLink: Link = null;
    private isNew: boolean = false;
    private internalValidator: FormValidator = null;
    private processStepLinks: Array<Link> = null;

    created() {
        this.init();
    }

    init() {
        this.processStepLinks = this.currentProcessStore.getters.referenceData().currentProcessData.links;

        if (this.processStepLinks) {
            var existedLink = this.processStepLinks.find((item) => item.id == this.linkId);
            if (existedLink) {
                this.editingLink = Utils.clone(existedLink);
                this.isNew = false;
            }
        }
        else {
            this.processStepLinks = this.currentProcessStore.getters.referenceData().currentProcessData.links = [];
        }
        if (!this.editingLink) {
            this.editingLink = this.initDefaultLink();
            this.isNew = true;
        }
    }
    private initDefaultLink(): Link {
        return {
            id: Guid.newGuid(),
            title: null,
            url: '',
            openNewWindow: false
        };
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.internalValidator = new FormValidator(this);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    private saveLink() {
        let savedLink = Utils.clone(this.editingLink);
        if (this.isNew) {
            this.processStepLinks.push(savedLink);
        }
        else {
            let existedLink = this.processStepLinks.find((item) => item.id == this.linkId);
            existedLink = savedLink;
        }
        this.onSave(savedLink);
    }

   
    visible: boolean = true;
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <div>
            <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                <v-toolbar-title>{this.isNew ? this.pdLoc.AddLink : this.pdLoc.EditLink}</v-toolbar-title>
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
                                model={this.editingLink.title}
                                onModelChange={(title) => { this.editingLink.title = title; }}
                                forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model={this.editingLink.url} label={this.omniaLoc.Common.Url}></v-text-field>
                            <omfx-field-validation
                                useValidator={this.internalValidator}
                                checkValue={this.editingLink.url}
                                rules={new FieldValueValidation().IsRequired().getRules()}>
                            </omfx-field-validation>
                        </v-col>
                        <v-col cols="12">
                            <v-checkbox input-value={this.editingLink.openNewWindow}
                                onChange={(val) => { this.editingLink.openNewWindow = val; }}
                                label={this.pdLoc.LinkObject.OpenNewWindow}>
                            </v-checkbox>
                        </v-col>
                    </v-row>
                </v-card-content>
                <v-card-actions>
                    <v-spacer></v-spacer>
                        <v-btn text color={this.omniaTheming.themes.primary.base} dark={true} onClick={this.saveLink}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                        <v-btn text onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
                </v-card-actions>
                </v-card>
            </v-container>
        </div>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, CreateLinkPanelComponent, { destroyTimeout: 1500 });
});

