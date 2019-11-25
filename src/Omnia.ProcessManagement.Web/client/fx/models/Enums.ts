export module Enums {
    export module ProcessViewEnums {
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
    }
}