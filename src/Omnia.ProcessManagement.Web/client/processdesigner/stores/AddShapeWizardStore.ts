import { Store } from '@omnia/fx/store';
import { Injectable, Localize } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';
import { AddShapeStep } from '../../models/processdesigner';
import { ShapeDefinition } from '../../fx/models';
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
        }),
        goToNextStep: this.mutation(() => {
            var stepperIndex = this.currentStepIndex.state;
            this.currentStepIndex.mutate(stepperIndex + 1);
        }),
        goToPreviousStep: this.mutation(() => {
            var stepperIndex = this.currentStepIndex.state;
            this.currentStepIndex.mutate(stepperIndex - 1);
        })
    }

    actions = {

    }
}