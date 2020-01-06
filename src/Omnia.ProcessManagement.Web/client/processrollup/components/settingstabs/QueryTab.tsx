import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Localize, Inject, Utils, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessRollupLocalization } from '../../loc/localize';
import { ProcessRollupBlockSettingsStyles } from '../../../models';

interface QueryTabProps {
    settingsKey: string;
    styles: typeof ProcessRollupBlockSettingsStyles;
}

@Component
export class QueryTab extends tsx.Component<QueryTabProps>
{
    @Prop() settingsKey: string;
    @Prop() styles: typeof ProcessRollupBlockSettingsStyles;

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