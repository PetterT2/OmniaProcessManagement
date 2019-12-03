import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization, FieldValueValidation } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { EnterprisePropertySetStore } from '@omnia/fx/store';
import { ProcessTemplateStore } from '../../../../../../fx';
import { ProcessType, ProcessTypeItemSettings } from '../../../../../../fx/models';
import { ProcessTypeHelper } from '../../../core';

interface GeneralTabProps {
    formValidator: FormValidator;
    processType: ProcessType;
    openPropertySetSettings: () => void;
    closeAllSettings: () => void;
}

@Component
export default class GeneralTab extends VueComponentBase<GeneralTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() processType: ProcessType;
    @Prop() openPropertySetSettings: () => void;
    @Prop() closeAllSettings: () => void;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;

    priviousPropertySetId = null;

    created() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        this.priviousPropertySetId = settings.enterprisePropertySetId;
    }

    processTemplateIdsChanged(settings: ProcessTypeItemSettings) {
        if (settings.defaultProcessTemplateId && !settings.processTemplateIds.find(d => d == settings.defaultProcessTemplateId)) {
        } settings.defaultProcessTemplateId = null;
    }

    render(h) {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        let sets = this.enterprisePropertySetStore.getters.enterprisePropertySets();
        let processTemplates = this.processTemplateStore.getters.processTemplates();

        let selectingProcessTemplates = processTemplates.filter(d => settings.processTemplateIds.indexOf(d.id) >= 0);

        return (
            <div>
                <omfx-multilingual-input
                    requiredWithValidator={this.formValidator}
                    model={this.processType.title}
                    onModelChange={(title) => { this.processType.title = title }}
                    forceTenantLanguages label={this.omniaLoc.Common.Title}></omfx-multilingual-input>

                <v-layout align-center>
                    <v-flex grow>
                        <v-select required persistent-hint hint={settings.enterprisePropertySetId ? this.loc.ProcessTypes.Settings.ChangePropertySetHint : ""}
                            onChange={() => { this.closeAllSettings(); ProcessTypeHelper.ensureValidData(); }} label={this.loc.ProcessTypes.Settings.PropertySet}
                            item-value="id" item-text="multilingualTitle" items={sets} v-model={settings.enterprisePropertySetId}>
                        </v-select>
                    </v-flex>
                    {
                        settings.enterprisePropertySetId &&
                        <v-btn dark={this.omniaTheming.promoted.body.dark} icon onClick={() => { this.openPropertySetSettings() }}>
                            <v-icon size='18'>fas fa-cog</v-icon>
                        </v-btn>
                    }
                </v-layout>
                <omfx-field-validation
                    useValidator={this.formValidator}
                    checkValue={settings.enterprisePropertySetId}
                    rules={
                        new FieldValueValidation().IsRequired().getRules()
                    }>
                </omfx-field-validation>

                <v-select class="mt-4" chips deletable-chips multiple item-value="id" item-text="multilingualTitle"
                    label={this.loc.ProcessTemplates.Title}
                    items={processTemplates}
                    v-model={settings.processTemplateIds}
                    onChange={() => { this.processTemplateIdsChanged(settings) }}></v-select>

                <v-select item-value="id" item-text="multilingualTitle"
                    label={this.loc.ProcessTypes.Settings.DefaultProcessTemplate}
                    items={selectingProcessTemplates}
                    v-model={settings.defaultProcessTemplateId}></v-select>

                {this.processType.id && <v-text-field disabled label={this.loc.ProcessTypes.UniqueId} value={this.processType.id}></v-text-field>}
            </div>
        );
    }
}