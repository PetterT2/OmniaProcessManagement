import { RollupEnums, DatePropFilterValue } from '@omnia/fx-models';

export interface ProcessRollupDatePeriodsPropFilterValue extends DatePropFilterValue {
    value: RollupEnums.DatePeriods,
    fromDateStr?: string,
    toDateStr?: string
}