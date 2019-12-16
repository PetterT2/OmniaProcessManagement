import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { VueComponentBase, OmniaTheming, StyleFlow } from '@omnia/fx/ux';
import { ProcessLibraryDisplaySettings } from '../../../../fx/models';
import { ProcessLibraryListViewStyles } from '../../../../models';
import { SharePointContext } from '@omnia/fx-sp';
import { OmniaContext, Inject, Localize, Utils } from '@omnia/fx';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ApprovalTask } from './ApprovalTask';
declare var moment;

interface TasksViewProps {

}

@Component
export class TasksView extends VueComponentBase<TasksViewProps>
{
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() displaySettings: ProcessLibraryDisplaySettings;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(OmniaContext) omniaContext: OmniaContext;


    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);


    created() {

    }

    mounted() {

    }

    beforeDestroy() {
    }

    render(h) {
        return (
            <div>
                <ApprovalTask closeCallback={() => { }}></ApprovalTask>
            </div>
        )
    }
}