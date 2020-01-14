export module ProcessNavigationBlockLocalization {
    export const namespace = "OPM.ProcessNavigationBlock";
    export interface locInterface {
        ProcessNavigationBlockSettings: {
            Title: string,
            StartLevel: string,
            GetParentSiblings: string,
            LevelIndentation: string,
        }
    }
}