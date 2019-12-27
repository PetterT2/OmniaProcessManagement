import { Enums } from '../..';

export interface ProcessLibraryDisplaySettings {
    pagingType: Enums.ProcessViewEnums.PagingType;
    pageSize: number;
    selectedFields: Array<string>,
    defaultOrderingFieldName: string,
    orderDirection: Enums.ProcessViewEnums.OrderDirection,
    previewPageUrl: string
}