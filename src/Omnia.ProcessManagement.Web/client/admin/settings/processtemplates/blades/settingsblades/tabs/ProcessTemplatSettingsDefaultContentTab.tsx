import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogDisplay, ConfirmDialogResponse, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessTemplate } from '../../../../../../fx/models';

interface ProcessTemplatSettingsDefaultContentTabProps {
    journey: () => JourneyInstance;
    editingProcessTemplate: ProcessTemplate;
}

@Component
export default class ProcessTemplatSettingsDefaultContentTab extends VueComponentBase<ProcessTemplatSettingsDefaultContentTabProps> {
    @Prop() journey: () => JourneyInstance;
    @Prop() editingProcessTemplate: ProcessTemplate;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = true;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};


    created() {
    }

    render(h) {
        return (
            <div>Default Content</div>
        );
    }
}