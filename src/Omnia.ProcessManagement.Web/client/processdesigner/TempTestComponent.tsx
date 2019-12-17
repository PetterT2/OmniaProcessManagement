import { Inject, Localize, Utils, SubscriptionHandler, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { JourneyInstance, OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { CurrentProcessStore } from '../fx';
import { ProcessDesignerStore } from './stores';
import { ProcessDesignerItemFactory } from './designeritems';
import { DisplayModes } from '../models/processdesigner';
import { ProcessDesignerUtils } from './Utils';


@Component
export class TempTestComponent extends VueComponentBase implements IWebComponentInstance {

    @Inject(SubscriptionHandler) subscriptionHandler: SubscriptionHandler;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    public editorModel = {
        visible: true
    }


    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }
    display: boolean = true;

    test() {
        this.currentProcessStore.actions.setProcessToShow.dispatch({
            processId: 'decd998e-1483-4241-83db-22e01fb9ffce',
            processStepId: '4e7ff975-6638-432b-9299-8c5333ad38c2',
            opmProcessId: '163a63bd-7be8-4347-a382-42fd2550aac0'
        }).then(() => {
            ProcessDesignerUtils.openProcessDesigner();
            this.processDesignerStore.actions.editCurrentProcess.dispatch(new ProcessDesignerItemFactory(), DisplayModes.contentEditing);
            this.display = false;
        });
    }

    /**
     * Render 
     * @param h
     */
    public render(h) {
        if (this.display)
            return <div onClick={() => { this.test() }} style={{position: 'absolute', top: '0px'}} >TEST click</div>;
        return null;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TempTestComponent);
});
