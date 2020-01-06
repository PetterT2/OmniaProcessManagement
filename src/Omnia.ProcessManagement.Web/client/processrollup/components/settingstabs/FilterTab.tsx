import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessRollupLocalization } from '../../loc/localize';
import { ProcessRollupBlockSettingsStyles } from '../../../models';

interface FilterTabProps {
    settingsKey: string;
}

@Component
export class FilterTab extends tsx.Component<FilterTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    created() { }

    render(h) {
        return (
            <div>

            </div>
        )
    }
}