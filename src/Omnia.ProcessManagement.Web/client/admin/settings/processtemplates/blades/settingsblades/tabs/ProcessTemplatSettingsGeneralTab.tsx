import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import {
    JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogDisplay, ConfirmDialogResponse, VueComponentBase,
    FormValidator
} from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessTemplate } from '../../../../../../fx/models';
import { ProcessTemplateJourneyStore } from '../../../store';

interface ProcessTemplatSettingsGeneralTabProps {
    journey: () => JourneyInstance;
}

@Component
export default class ProcessTemplatSettingsGeneralTab extends VueComponentBase<ProcessTemplatSettingsGeneralTabProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    private internalValidator: FormValidator = new FormValidator(this);
    private editingProcessTemplate: ProcessTemplate = null;

    created() {
        this.editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
    }

    render(h) {
        return (
            <div>
                <omfx-multilingual-input
                    requiredWithValidator={this.internalValidator}
                    model={this.editingProcessTemplate.settings.title}
                    onModelChange={(title) => { this.editingProcessTemplate.settings.title = title }}
                    forceTenantLanguages label={this.omniaUxLoc.Common.Title}></omfx-multilingual-input>
            </div>
        );
    }
}