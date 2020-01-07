import { Composer } from '@omnia/tooling/composers';
import { ProcessRollupLocalization } from "./localize";

Composer.registerManifest("39ea7d35-7472-48f4-825d-866b0ddce732")
    .registerLocalization()
    .namespace(ProcessRollupLocalization.namespace)
    .add<ProcessRollupLocalization.locInterface>({
        BlockTitle: "Process Rollup",
        BlockDescription: "Possibility to roll up processes with different views, filters and refiners.",
        ViewTitle: {
            List: "List View"
        },
        Settings: {
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
            }
        },
        Common: {
            Done: "Done",
            QueryFailedMsg: "The configured query failed.",
            NoViewToRender: "Please select a view template",
        },
        ListView: {
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