import { GuidValue, UserIdentity } from '@omnia/fx-models';
import { PublishProcessWithoutApprovalRequest } from './PublishProcessWithoutApprovalRequest';

export interface PublishProcessWithApprovalRequest extends PublishProcessWithoutApprovalRequest {
    approver: UserIdentity,
    dueDate: Date
}