import { Enums } from '../../Enums';

export interface HeaderTable {
    text: string
    value: string
    align?: 'start' | 'center' | 'end'
    sortable?: boolean
    filterable?: boolean,
    type: Enums.ProcessViewEnums.PropertyType
}