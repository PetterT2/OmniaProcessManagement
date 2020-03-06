import { RollupEnums, DatePropFilterValue } from '@omnia/fx-models';

//TODO : in the better solution, this datePeriods should be move into the base DatePropFilterValue

export interface ProcessRollupDatePeriodsPropFilterValue extends DatePropFilterValue {
    datePeriods: RollupEnums.DatePeriods,
}