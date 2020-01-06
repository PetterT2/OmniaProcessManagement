import { Console, HttpClient, Inject, Localize, OmniaContext, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Topics } from '@omnia/fx';
import Vue from 'vue';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Prop } from 'vue-property-decorator';
import { EnterprisePropertyDefinition, PropertyIndexedType } from '@omnia/fx/models';
import './ListSettings.css';
import { OmniaTheming, StyleFlow } from '@omnia/fx/ux';
import { ListViewDateTimeColumn } from '@omnia/wcm/models';
import { ProcessRollupLocalization } from '../../../loc/localize';
import { ProcessRollupListViewSettings, IProcessRollupViewSettingsInterface, ProcessRollupBlockListViewSettingsStyles } from '../../../../models';


@Component
export class ListSettings extends Vue implements IWebComponentInstance, IProcessRollupViewSettingsInterface<ProcessRollupListViewSettings> {
    @Prop() styles: typeof ProcessRollupBlockListViewSettingsStyles;
    @Prop() viewSettings: ProcessRollupListViewSettings;
    @Prop() availableProperties: Array<EnterprisePropertyDefinition>;
    @Prop() onUpdatedViewSettings: (viewSettings: ProcessRollupListViewSettings) => void;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(ProcessRollupLocalization.namespace) private loc: ProcessRollupLocalization.locInterface;

    private listViewStyleClasses = StyleFlow.use(ProcessRollupBlockListViewSettingsStyles, this.styles);


    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
    }

    created() {
        this.init();
    }

    init() {

    }

    render(h) {
        return (
            <div class="pb-12">
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ListSettings);
});

