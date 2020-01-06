import { RollupEnums, DatePropFilterValue } from '@omnia/fx-models';

export interface ProcessRollupDatePropFilterValue extends DatePropFilterValue {
    value: RollupEnums.DatePeriods,
    fromDateStr?: string,
    toDateStr?: string
}