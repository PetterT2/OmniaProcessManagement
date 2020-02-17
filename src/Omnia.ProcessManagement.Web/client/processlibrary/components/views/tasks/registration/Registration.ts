import { Topics } from '@omnia/workplace';

const CTApprovalTaskStringId = "0x010048629609AA6E4577B841268AA6AFDA0F";
const CTReviewReminderTaskStringId = "0x010007984FC3C56A4021BBEC2EF964035DBD";

Topics.registerMyTaskItemProcessor.publish({
    contentTypeId: CTApprovalTaskStringId,
    processor: (tasks) => {
        for (var task of tasks) {
            let id = task.url.split('?ID=')[1];
            if (id && !isNaN(id as any)) {
                task.url = task.webUrl + '/SitePages/Processes.aspx?displaytab=tasks&taskid=' + id + '&viewtasktype=1';
                task.parentUrl = task.webUrl + '/SitePages/Processes.aspx?displaytab=tasks';
            }
        }
    }
})

Topics.registerMyTaskItemProcessor.publish({
    contentTypeId: CTReviewReminderTaskStringId,
    processor: (tasks) => {
        for (var task of tasks) {
            let id = task.url.split('?ID=')[1];
            if (id && !isNaN(id as any)) {
                task.url = task.webUrl + '/SitePages/Processes.aspx?displaytab=tasks&taskid=' + id + '&viewtasktype=2';
                task.parentUrl = task.webUrl + '/SitePages/Processes.aspx?displaytab=tasks';
            }
        }
    }
})
