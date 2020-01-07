export module ProcessRollupLocalization {
    export const namespace = "OPM.ProcessRollup";
    export interface locInterface {
        BlockTitle: string,
        BlockDescription: string,
        ViewTitle: {
            List: string,
        },
        Settings: {
            Paging: string,
            ItemLimit: string,
            PageSize: string,
            SortBy: string,
            View: string,
            Search: string,
            FullTextSearch: string,
            Display: string,
            Query: string,
            Filter: string,
            General: string,
            Ascending: string,
            Descending: string,
            PagingType: {
                NoPaging: string,
                Classic: string,
                Scroll: string
            }
        },
        Common: {
            Done: string,
            NoViewToRender: string,
            QueryFailedMsg: string
        },
        ListView: {
            TitleAndLink: string,
            AdjustColumns: string,
            AddColumn: string,
            Format: string,
            WidthPlaceholder: string,
            ShowHeading: string,
            DateTimeMode: {
                Normal: string,
                Social: string
            }
        }
    }
}