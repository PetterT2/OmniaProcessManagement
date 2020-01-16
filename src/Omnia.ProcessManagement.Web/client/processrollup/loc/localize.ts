export module ProcessRollupLocalization {
    export const namespace = "OPM.ProcessRollup";
    export interface locInterface {
        BlockTitle: string,
        BlockDescription: string,
        ViewTitle: {
            List: string,
        },
        Settings: {
            IncludeEmpty: string,
            IncludeChildTerms: string,
            AdjustFilters: string,
            AddQuery: string,
            AddFilter: string,
            HideFilter: string,
            Paging: string,
            ItemLimit: string,
            ViewPageUrl: string,
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
            },
            FilterOption: {
                Searchbox: string,
            },
            BooleanFilterOption: {
                Yes: string,
                No: string
            },
            DatePeriods: {
                OneWeekFromToday: string,
                TwoWeeksFromToday: string,
                OneMonthFromToday: string
                EarlierThanNow: string,
                LaterThanNow: string
            },
            SearchBoxMessage: {
                SearchOnTeamTitleAnd: string,
                ProcessProperties: string
            },
            TaxonomyFilterTypes: {
                FixedValue: string,
                CurrentPage: string,
                User: string
            },
            QueryScope: {
                PublishedProcesses: string,
                ArchivedProcesses: string
            },
            OpenInNewWindow: string
        },
        Common: {
            NoProcessToShow: string,
            TermSetNotFound: string,
            Done: string,
            NoViewToRender: string,
            QueryFailedMsg: string
        },
        ListView: {
            NoColumnsMsg: string,
            ProcessTitle: string,
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