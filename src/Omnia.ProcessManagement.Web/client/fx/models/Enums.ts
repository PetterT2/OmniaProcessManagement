export module Enums {
    export module ProcessViewEnums {
        export enum QueryScope {
            PublishedProcesses = 1,
            ArchivedProcesses = 2
        }

        export enum TaxonomyFilterType {
            FixedValue = 1,
            CurrentPage = 2,
            User = 3
        }

        export enum OrderDirection {
            Ascending = 1,
            Descending = 2
        }

        export enum PagingType {
            NoPaging = 1,
            Classic = 2,
            Scroll = 3
        }

        export enum StartPageTab {
            Drafts = 0,
            Tasks = 1,
            Published = 2
        }

        export enum PropertyType {
            None = 0,
            Text = 1,
            Number = 2
        }

        export enum ProcessAccessTypes {
            DefaultReaderGroup = 0,
            LimitedAccess = 1
        }

        export enum Positions {
            Top = 1,
            Left = 2,
            Right = 3
        }

        export enum DatePeriods {
            OneWeekFromToday = 1,
            TwoWeeksFromToday = 2,
            OneMonthFromToday = 3,
            LaterThanNow = 4,
            EarlierThanNow = 5
        }

        export enum RefinerOrderBy {
            Count = 1,
            Alphabetic = 2
        }

        export enum BooleamFilterOption {
            Yes = 1,
            No = 2
        }

        export enum DateTimeMode {
            Normal = 1,
            Social = 2
        }
    }
    export enum ShapeTypes {
        None = 0,
        ProcessStep = 1,
        Link = 2
    }
    export module WorkflowEnums {

        export enum VersionPublishingTypes {
            NewEdition = 1,
            NewRevision = 2
        }

    }
    export enum LinkType {
        CustomLink = 0,
        Heading = 1
    }

    export enum TaskContentType {
        Undefined = 0,
        ApprovalTask = 1,
    }

    export enum TaskViewType {
        AssignedToMe = 1,
        AssignedByMe = 2,
        CompletedTasks = 3
    }

}