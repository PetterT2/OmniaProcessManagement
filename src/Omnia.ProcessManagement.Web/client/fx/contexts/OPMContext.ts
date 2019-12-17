import { GuidValue, IMutableContextProvider, IMessageBusTopicSubscription, InstanceLifetimes } from '@omnia/fx-models';
import { Injectable } from '@omnia/fx';
import { IOPMContext } from '../models';
import { OPMContextProvider } from './OPMContextProvider';

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class OPMContext implements IOPMContext {
    private provider: IMutableContextProvider<IOPMContext> = OPMContextProvider.instance;

    public get teamAppId(): GuidValue {
        return this.provider.getContext().teamAppId;
    }

    onContextChanged(): IMessageBusTopicSubscription<IOPMContext> {
        throw `Not supported yet`
        //return this.provider.getMutableContext().onContextChanged();
    }
}