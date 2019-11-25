import { NavigationData } from './NavigationData';
import { NavigationNodePosition } from './NavigationNodePosition';
import { AuditingInformation } from '../auditinginformation/AuditingInformation'

/**
 * Used for clientside type identification, only used for typ identification, casting
 * */
export enum NavigationNodeType {
    //The type used for external nodes i.e. not pointing to a wcm page
    Generic = 0,
    //A page in wcm, could be any of the supported types
    Page = 1,
    PageType = 2,
    PageCollection = 3,
}

/**
 * This is no enum, it's the id of the page and trully is a number generated serverside for this insance
 * */
export enum NodeId { }

export interface NavigationNode<T extends NavigationData> extends AuditingInformation {

    navigationNodeType: NavigationNodeType;

    //The node id in the DB navigation tree
    id: NodeId;

    position: NavigationNodePosition;

    publishingAppId: string;

    //The data stored on this navigation node
    navigationData: T;

    /**
     * The number of direct children, i.e. the number of other nodes having  this node as parent
     * */
    childCount: number;

    path?: string;
}