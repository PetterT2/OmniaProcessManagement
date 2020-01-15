import { Topics } from '@omnia/workplace';

const CTApprovalTaskStringId = "0x010048629609AA6E4577B841268AA6AFDA0F";

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
