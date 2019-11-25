import { Injectable } from '@omnia/fx';
import { InstanceLifetimes } from '@omnia/fx-models';


@Injectable({ lifetime: InstanceLifetimes.Singelton })
export class OPMRouter {

}