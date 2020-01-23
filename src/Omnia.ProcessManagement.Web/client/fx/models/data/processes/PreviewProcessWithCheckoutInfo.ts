import { GuidValue } from '@omnia/fx-models';
import { Process } from './Process';
import { ProcessCheckoutInfo } from './ProcessCheckoutInfo';

export interface PreviewProcessWithCheckoutInfo {
    process: Process,
    checkoutInfo: ProcessCheckoutInfo
}