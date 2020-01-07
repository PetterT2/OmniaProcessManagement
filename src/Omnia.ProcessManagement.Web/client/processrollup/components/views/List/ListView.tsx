import { Console, HttpClient, Inject, Localize, OmniaContext, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Topics, Utils } from '@omnia/fx';
import Vue from 'vue';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Prop } from 'vue-property-decorator';
import { IconSize, StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { PropertyIndexedType, BuiltInEnterprisePropertyInternalNames, EnterprisePropertyDefinition, SpacingSetting, UserIdentity, IMessageBusSubscriptionHandler, Guid, TenantRegionalSettings } from '@omnia/fx-models';
import { EnterprisePropertyStore, FeatureStore } from '@omnia/fx/store';
import {
    ProcessRollupListViewSettings, ListViewColumn, ProcessRollupBlockListViewStyles, IProcessRollupViewInterface
} from '../../../../models';
import { ProcessRollupLocalization } from '../../../loc/localize';
import { classes } from 'typestyle';
import { DefaultDateFormat } from '../../../../fx';
import { RollupProcess } from '../../../../fx/models';
import './List.css';

@Component
export class ListView extends Vue implements IWebComponentInstance, IProcessRollupViewInterface<ProcessRollupListViewSettings> {

    @Prop() styles: typeof ProcessRollupBlockListViewStyles | any;
    @Prop() processes: Array<RollupProcess>;
    @Prop() viewSettings: ProcessRollupListViewSettings;
    @Prop() spacingSetting: SpacingSetting;
    @Prop({ default: {} }) taxonomyProperties: { [internalName: string]: EnterprisePropertyDefinition };
    @Prop() sortByCallback?: (sortKey: string, descending: boolean) => void;
    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(FeatureStore) featureStore: FeatureStore;

    formatDate: string = DefaultDateFormat;

    listViewClasses = StyleFlow.use(ProcessRollupBlockListViewStyles, this.styles);

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
    }

    created() {

    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    render(h) {

        return (
            <div>
                
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ListView);
});

