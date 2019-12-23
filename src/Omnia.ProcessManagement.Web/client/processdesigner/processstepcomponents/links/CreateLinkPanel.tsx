import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, FormValidator, FieldValueValidation } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { Link, Enums } from '../../../fx/models';
import { CurrentProcessStore } from '../../../fx';
import { ICreateLinkPanel } from './ICreateLinkPanel';


@Component
export class CreateLinkPanelComponent extends VueComponentBase implements IWebComponentInstance, ICreateLinkPanel {
    @Prop() onClose: () => void;
    @Prop() onSave: (link: Link) => void;
    @Prop() linkId?: GuidValue;
    @Prop() linkType: Enums.LinkType;
    @Prop() isProcessStepShortcut: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private editingLink: Link = null;
    private isNew: boolean = false;
    private internalValidator: FormValidator = null;
    private processStepLinks: Array<Link> = null;

    created() {
        this.init();
    }

    init() {
        this.processStepLinks = this.currentProcessStepReferenceData.processData.links;

        if (this.processStepLinks) {
            var existedLink = this.processStepLinks.find((item) => item.id == this.linkId);
            if (existedLink) {
                this.editingLink = Utils.clone(existedLink);
                this.isNew = false;
            }
        }
        else {
            this.processStepLinks = this.currentProcessStepReferenceData.processData.links = [];
        }
        if (!this.editingLink) {
            this.editingLink = this.initDefaultLink();
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

    private initDefaultLink(): Link {
        return {
            id: Guid.newGuid(),
            title: null,
            url: '',
            openNewWindow: false,
            linkType: this.linkType
        };
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.internalValidator = new FormValidator(this);
    }

    beforeDestroy() {
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
        let header = "";
        if (this.linkType == Enums.LinkType.Heading)
            header = this.isNew ? this.pdLoc.AddHeader : this.pdLoc.EditHeader;
        else
            header = this.isNew ? this.pdLoc.AddLink : this.pdLoc.EditLink;
        return <div>
            <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                <v-toolbar-title>{header}</v-toolbar-title>
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
                            {
                                this.linkType == Enums.LinkType.CustomLink ?
                                    [<v-col cols="12">
                                        <v-text-field v-model={this.editingLink.url} label={this.omniaLoc.Common.Url}></v-text-field>
                                        <omfx-field-validation
                                            useValidator={this.internalValidator}
                                            checkValue={this.editingLink.url}
                                            rules={new FieldValueValidation().IsRequired().getRules()}>
                                        </omfx-field-validation>
                                    </v-col>,
                                    <v-col cols="12">
                                        <v-checkbox input-value={this.editingLink.openNewWindow}
                                            onChange={(val) => { this.editingLink.openNewWindow = val; }}
                                            label={this.pdLoc.LinkObject.OpenNewWindow}>
                                        </v-checkbox>
                                    </v-col>]
                                    : null
                            }
                        </v-row>
                    </v-card-content>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text color={this.omniaTheming.themes.primary.base} dark={this.omniaTheming.promoted.body.dark} onClick={this.saveLink}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
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

