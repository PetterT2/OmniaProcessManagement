import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { Enums, Process } from '../../../../fx/models';

interface PublishedProcessingStatusProps {
    closeCallback: (isUpdate: boolean) => void;
    process: Process;
}

@Component
export class PublishedProcessingStatus extends VueComponentBase<PublishedProcessingStatusProps> implements IWebComponentInstance {
    @Prop() closeCallback: (isUpdate: boolean) => void;
    @Prop() process: Process;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    selectedProcess: Process;   
    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    render(h) {
        return (
            <div>               
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PublishedProcessingStatus);
});

