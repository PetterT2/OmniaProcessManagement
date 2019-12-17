import { ContextProviderCollection, AppRoutePropertyBagFactory, Injectable, ServiceContainer, Inject, OmniaContext } from '@omnia/fx';
import { InstanceLifetimes, BusinessProfilePathProperty, IOmniaContext } from "@omnia/fx-models";
import { AxiosResponse } from 'axios';
import { Topic, GuidValue, IRouteContext, IMutableContextProvider, IMutableContext, IMessageBusTopicSubscription, HttpHeaders } from '@omnia/fx/models';
import { IOPMContext } from '../models';
import { Router } from '@omnia/fx/ux';

/**
 * Team Collaboration App
 * */
class BusinessProfileAppProvisioning extends BusinessProfilePathProperty {
    appInstanceId: GuidValue;
    constructor() {
        super("8beeb5cb-12bb-4db8-8da1-7708a64bc4e4", "otcAppProvider");
    }
}

class ContextData {
    public teamAppId: GuidValue = null;

    constructor(private context: IOPMContext) {

    }

    public updateData = (modifierFunc: ((data: ContextData) => void)) => {
        let teamAppId: GuidValue = this.teamAppId;
        modifierFunc(this);

        //TO-DO : Handle if the team app context changed 
    }
}

export interface IOPMMutableContextProvider extends IMutableContextProvider<IOPMContext> {

}

@Injectable({ lifetime: InstanceLifetimes.Singelton })
class InternalOPMContextProvider implements IOPMMutableContextProvider, IOPMContext {
    public contextData: ContextData = null;
    @Inject(OmniaContext) omniaContext: IOmniaContext;
    //Do not use http services in constructor since theese can be context aware and lead to recursion issues
    public constructor() { }

    public init() {
        this.contextData = new ContextData(this);

        this.handleRouteContext(this.omniaContext);

        this.omniaContext.onContextChanged().subscribe((context) => {
            this.handleRouteContext(context);
        })
    }

    private handleRouteContext = (omniaContext: IOmniaContext) => {
        let teamAppId: GuidValue = null;
        var teamAppProperty = omniaContext.businessProfile.pathPropertyBag.getModel(BusinessProfileAppProvisioning);

        if (teamAppProperty && teamAppProperty.appInstanceId)
            teamAppId = teamAppProperty.appInstanceId;

        this.contextData.updateData((data) => {
            data.teamAppId = teamAppId;
        })
    }

    public get teamAppId(): GuidValue {
        return this.contextData.teamAppId;
    }

    public getMutableContext = (): IMutableContext<IOPMContext> => {
        return this;
    }

    public getContext = (): IOPMContext => {
        return this;
    }

    public onContextChanged = (): IMessageBusTopicSubscription<IOPMContext> => {
        throw `Not supported yet!`
    }

    getProviderUniqueId = () => "22c9b14e-aada-4123-9fc3-316d657217c0";
    getSerializeableContextRepresentation = () => null;
    createFromContextRepresentation = (contextRepresentation: any) => { };
    getContextHttpHeaders = () => Promise.resolve(<HttpHeaders>{});
    getHttpHeaders = () => Promise.resolve(<HttpHeaders>{});
    shouldRetryHttpRequest = (httpResponse: AxiosResponse<any>) => Promise.resolve<boolean>(false);
}

export class OPMContextProvider {
    private static _instance: InternalOPMContextProvider = null;

    public static get instance(): InternalOPMContextProvider {

        if (OPMContextProvider._instance === null) {
            OPMContextProvider._instance = ServiceContainer.createInstance(InternalOPMContextProvider);
            this._instance.init();
        }

        return OPMContextProvider._instance;
    }
}

//Register as a context provider
ContextProviderCollection.registerProvider(OPMContextProvider.instance);