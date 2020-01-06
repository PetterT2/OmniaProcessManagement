import { GuidValue } from '@omnia/fx-models';

export interface ProcessRollupViewRegistration {
    id: GuidValue,
    title: string,
    viewElement: string,
    settingsElement: string,

    supportScrollPaging?: boolean,
    supportClassicPaging?: boolean
}
