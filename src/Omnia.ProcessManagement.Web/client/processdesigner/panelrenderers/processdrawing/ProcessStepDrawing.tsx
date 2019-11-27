import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { TabRenderer } from '..';

export class ProcessStepDrawingTabRenderer extends TabRenderer {
    generateElement(h): JSX.Element {
        return (<ProcessStepDrawingComponent key={Guid.newGuid().toString()}></ProcessStepDrawingComponent>);
    }
}

export interface ProcessDrawingProps {
}

@Component
export class ProcessStepDrawingComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>{
    //@Prop() public callerEditorStore?: EditorStore;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private isEditMode: boolean = false;

    created() {
        this.init();
    }

    init() {
        //todo
        //if (this.callerEditorStore) {
        //    this.callerEditorStore = this.editorStore;
        //    this.callerEditorStore.mutations.initFormValidator.commit(this);
        //}
    }

    mounted() {
        //todo
        //this.$nextTick(function () {
        //    setTimeout(() => {
        //        if (this.editorStore.errorTabIndex.state > -1)
        //            this.editorStore.formValidator.validateAll();
        //    }, 1000);
        //});
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                Drawing tab content
            </v-card-text>
        </v-card>)
    }
}

