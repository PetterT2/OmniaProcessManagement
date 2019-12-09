import { Store } from '@omnia/fx/store';
import { Injectable, Inject, Topics, Utils, Localize } from '@omnia/fx';
import { FormValidator, VueComponentBase } from '@omnia/fx/ux';
import { InstanceLifetimes, IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx-models';
import { ProcessDesignerSettingsStore } from './ProcessDesignerSettingsStore';
import { ProcessDesignerTabStore } from './ProcessDesignerTabStore';
import { CurrentProcessStore } from '../../fx';
import { IProcessDesignerItem, ActionItem, DisplayModes, AddShapeStep } from '../../models/processdesigner';
import { IProcessDesignerItemFactory } from '../../processdesigner/designeritems';
import { ProcessDesignerPanelStore } from './ProcessDesignerPanelStore';
import { ProcessStep, ProcessReferenceData, ProcessData, CanvasDefinition, ShapeDefinition } from '../../fx/models';
import { ProcessDesignerLocalization } from '../loc/localize';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})

export class AddShapeWizardStore extends Store {
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    /**
     * State
     */
    wizardSteps = this.state<Array<AddShapeStep>>(null);
    //currentStep = this.state<AddShapeStep>(null);
    currentStepIndex = this.state<number>(1);
    selectedShape = this.state<ShapeDefinition>(null);
    

    constructor() {
        super({ id: "2df7748c-29f2-48ef-ba66-e16a2c1bc53f" });
    }

    onActivated() {
        this.wizardSteps.mutate([
            {
                elementToRender: 'opm-processdesigner-shapeselection-step',
                title: this.pdLoc.SelectShape
            },
            {
                elementToRender: 'opm-processdesigner-shapetype-step',
                title: this.pdLoc.ShapeType
            }
        ]);
        this.currentStepIndex.mutate(1);
        console.log('shape store init');
    }

    onDisposing() {
        //if (this.subscriptionHandler)
        //    this.subscriptionHandler.unsubscribe();
    }


    getters = {
    }

    /**
     * Adds an item to the layout.
     */
    mutations = {
        setSelectedShape: this.mutation((shapeDefinition: ShapeDefinition) => {
            this.selectedShape.mutate(shapeDefinition);
        })
    }

    actions = {
        goToNextStep: this.action(() => {
            return new Promise<null>((resolve, reject) => {
                var stepperIndex = this.currentStepIndex.state;
                this.currentStepIndex.mutate(stepperIndex + 1);
				//this.currentStep.mutate(this.wizardSteps[this.currentStepIndex.state - 1]);
				resolve();
            });
        }),
        goToPreviousStep: this.action(() => {
            return new Promise<null>((resolve, reject) => {
				var stepperIndex = this.currentStepIndex.state;
                this.currentStepIndex.mutate(stepperIndex - 1);
				//this.currentStep.mutate(this.wizardSteps[this.currentStepIndex.state - 1]);
				resolve();
            });
        })
    }
}