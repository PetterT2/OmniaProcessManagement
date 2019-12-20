import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore } from '../../../fx';
import { OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { Prop } from 'vue-property-decorator';

export class ProcessTasksTabRenderer extends TabRenderer {
    private isProcessStepShortcut: boolean = false;
    constructor(isProcessStepShortcut: boolean = false) {
        super();
        this.isProcessStepShortcut = isProcessStepShortcut;
    }
    generateElement(h): JSX.Element {
        return (<ProcessTasksComponent key={Guid.newGuid().toString()} isProcessStepShortcut={this.isProcessStepShortcut}></ProcessTasksComponent>);
    }
}

export interface ProcessTasksProps {
    isProcessStepShortcut: boolean;
}

@Component
export class ProcessTasksComponent extends VueComponentBase<ProcessTasksProps, {}, {}>
{
    @Prop() isProcessStepShortcut: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private isEditMode: boolean = false;

    created() {
        this.init();
    }

    init() {
    }

    mounted() {
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    get currentProcessStepReferenceData() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (!this.isProcessStepShortcut) {
            return referenceData.current;
        }
        return referenceData.shortcut;
    }

    onContentChanged(content) {
        let referenceData = this.currentProcessStepReferenceData;
        //ToDo
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                Tasks tab content
            </v-card-text>
        </v-card>)
    }
}

