import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, Utils, OmniaContext } from "@omnia/fx";
import { StyleFlow, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../../loc/localize';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ProcessLibraryStyles } from '../../../../models';
import { ProcessLibraryListViewTabs } from '../../../Constants';

interface DraftsActionButtonsProps {
    closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;
}

@Component
export class DraftsActionButtons extends VueComponentBase<DraftsActionButtonsProps> implements IWebComponentInstance {
    @Prop() closeCallback: (refreshList: boolean, tab?: ProcessLibraryListViewTabs) => void;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    isCurrentUserCanAddDoc: boolean = true;
    openNewProcessDialog: boolean = false;

    processLibraryClasses = StyleFlow.use(ProcessLibraryStyles);

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }

    renderNewProcessDialog(h) {
        return (
            <opm-new-process-dialog
                closeCallback={(isUpdate: boolean) => {
                    this.openNewProcessDialog = false;
                    this.closeCallback(isUpdate);
                }}
            ></opm-new-process-dialog>
        )
    }

    render(h) {
        return (
            <div>
                {
                    this.isCurrentUserCanAddDoc ?
                        <v-btn text class="ml-2"
                            color={this.omniaTheming.promoted.body.primary.base as any} onClick={() => { this.openNewProcessDialog = true; }}>
                            {this.coreLoc.ProcessActions.NewProcess}
                        </v-btn> :
                        null
                }
                {this.openNewProcessDialog && this.renderNewProcessDialog(h)}
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, DraftsActionButtons);
});

