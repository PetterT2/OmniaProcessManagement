import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogDisplay, ConfirmDialogResponse, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessTemplatesJourneyBladeIds } from '../../../ProcessTemplatesJourneyConstants';

interface DocumentTemplateTabProps {
    journey: () => JourneyInstance;
}

@Component
export default class DocumentTemplateTab extends VueComponentBase<DocumentTemplateTabProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = true;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};


    created() {
    }

    openShapeSettingBlade() {
        this.journey().travelBackToFirstBlade();
        this.$nextTick(() => {
            this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.documentTemplateSettingsShapes);
        });
    }

    travelToEditShapeSettings() {
        this.openShapeSettingBlade();
    }

    render(h) {
        return (
            <div>Default Content</div>
        );
    }
}