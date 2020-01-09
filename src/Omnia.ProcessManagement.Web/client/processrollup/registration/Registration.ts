import { Guid } from '@omnia/fx-models';
import { OPMPublicTopics } from '../../fx/messaging/PublicOPMTopics';

OPMPublicTopics.registerProcessRollupView.publish({
    id: new Guid('2e46df6c-fa1f-4423-b9f5-8d5af51b7d60'),
    title: '$Localize:OPM.ProcessRollup.ViewTitle.List;',
    settingsElement: 'opm-process-rollup-list-settings',
    viewElement: 'opm-process-rollup-list-view',
    supportClassicPaging: true,
    supportScrollPaging: true
});