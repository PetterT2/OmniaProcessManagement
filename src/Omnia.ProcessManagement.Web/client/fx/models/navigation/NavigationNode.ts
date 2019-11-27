//import { NavigationData } from './NavigationData';
//import { MultilingualString, GuidValue } from '@omnia/fx-models';
//import { MultilingualData } from '../data';
//import { NodeState } from './NodeState';

///**
// * Used for clientside type identification, only used for typ identification, casting
// * */
//export enum NavigationNodeType {
//    //The type used for external nodes i.e. not pointing to a wcm page
//    Generic = 0,
//    //A page in opm, could be any of the supported types
//    ProcessStep = 1
//}

//export interface NavigationNode<T extends NavigationData> {
//    navigationNodeType: NavigationNodeType;

//    //The data stored on this navigation node
//    navigationData: T;

//    nodeState: NodeState;
//}