import { GuidValue, UserIdentity } from '@omnia/fx-models';

export interface PublishProcessWithoutApprovalRequest {
    opmProcessId: GuidValue,
    webUrl: string,
    isRevisionPublishing: boolean,
    comment: string,
    isLimitedAccess: boolean,
    limitedUsers: Array<UserIdentity>,
    notifiedUsers: Array<UserIdentity>,
    isReadReceiptRequired: boolean
}