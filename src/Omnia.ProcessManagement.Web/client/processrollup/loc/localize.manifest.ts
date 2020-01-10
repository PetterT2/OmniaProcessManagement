import { Composer } from '@omnia/tooling/composers';
import { ProcessRollupLocalization } from "./localize";

Composer.registerManifest("39ea7d35-7472-48f4-825d-866b0ddce732")
    .registerLocalization()
    .namespace(ProcessRollupLocalization.namespace)
    .add<ProcessRollupLocalization.locInterface>({
        BlockTitle: "Process Rollup",
        BlockDescription: "Possibility to roll up processes with different views and filters.",
        ViewTitle: {
            List: "List View"
        },
        Settings: {
            IncludeEmpty: "Include Empty",
            IncludeChildTerms: "Include Child Terms",
            AdjustFilters: "Adjust filters",
            AddQuery: "Add query",
            AddFilter: "Add filter",
            HideFilter: "Hide this section",
            Paging: "Paging",
            ItemLimit: "Item Limit",
            PageSize: "Page Size",
            SortBy: "Sort By",
            View: "View",
            Search: "Search",
            FullTextSearch: "Full text search",
            Display: "Display",
            Query: "Query",
            Filter: "Filter",
            General: "General",
            Ascending: "Ascending",
            Descending: "Descending",
            PagingType: {
                NoPaging: "No Paging",
                Classic: "Classic",
                Scroll: "Scroll"
            },
            FilterOption: {
                Searchbox: "Search Box",
            },
            BooleanFilterOption: {
                Yes: "Yes",
                No: "No"
            },
            DatePeriods: {
                OneWeekFromToday: "One week from today",
                TwoWeeksFromToday: "Two weeks from today",
                OneMonthFromToday: "One month from today",
                EarlierThanNow: "Earlier than now",
                LaterThanNow: "Later than now"
            },
            SearchBoxMessage: {
                SearchOnTeamTitleAnd: "Search on Title and",
                ProcessProperties: "Process Properties"
            },
            TaxonomyFilterTypes: {
                FixedValue: "Fixed value",
                CurrentPage: "Current page",
                User: "User"
            },
            QueryScope: {
                PublishedProcesses: "Published Processes",
                ArchivedProcesses: "Archived Processes"
            }
        },
        Common: {
            NoProcessToShow: "No process to show.",
            TermSetNotFound: "Term set not found",
            Done: "Done",
            QueryFailedMsg: "The configured query failed.",
            NoViewToRender: "Please select a view template",
        },
        ListView: {
            NoColumnsMsg: "No columns",
            ProcessTitle: "Title",
            TitleAndLink: "Title And Link",
            AdjustColumns: "Adjust Columns",
            AddColumn: "Add Column",
            Format: "Format",
            WidthPlaceholder: "width",
            ShowHeading: "Show Heading",
            DateTimeMode: {
                Normal: "Normal",
                Social: "Social"
            }
        }
    });