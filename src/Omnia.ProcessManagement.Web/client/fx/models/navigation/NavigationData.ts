import { GuidValue, Guid } from '@omnia/fx-models';

export class NavigationRenders {
    public static processStep: GuidValue = new Guid("d4e61830-0553-40ec-b034-c3208d681ceb");
}

/**
 * This is no enum, it's only used to get typying and compile errors.
 * */
export enum NavigationDataType {}

/**
 * Used for filtering tree etc, use bit mask etc
 * */
export class OPMNavigationDataTypes {

    /// <summary>
    /// Use maskable values
    /// </summary>
    public static processStep: NavigationDataType = 1;
    //const int FutureReserved = 4096;

    public static all: NavigationDataType = ~0;
}

export interface NavigationData {

    /**
     * Uses const values and not enum so new types might be defined by others
     * For opm any of WCMNavigationDataTypes
     * */
    type: NavigationDataType;
    rendererId: GuidValue;
    urlSegment?: string;
}

