export module ProcessRollupLocalization {
    export const namespace = "OPM.ProcessRollup";
    export interface locInterface {
        BlockTitle: string,
        BlockDescription: string,
        ViewTitle: {
            List: string,
        },
        Settings: {
            Search: string,
            FullTextSearch: string,
            Display: string,
            Query: string,
            Filter: string,
        },
        Common: {
            NoViewToRender: string,
            QueryFailedMsg: string
        }
    }
}