import { OPMEnterprisePropertyInternalNames } from '../fx/models';

export const DefaultDateFormat = "YYYY-MM-DD";

export const UrlParameters = {
    get DisplayTab() { return "displaytab" },
    get Drafts() { return "drafts" },
    get Tasks() { return "tasks" },
    get Published() { return "published" },
    get TaskId() { return "taskid" },
    get TaskType() { return "viewtasktype"}
}

export const LibrarySystemFieldsConstants = {
    get Menu() { return "Menu" },
    get Title() { return "Title" },
    get Status() { return "Status" },    
}

export const ProcessLibraryFields = {
    get Edition() { return OPMEnterprisePropertyInternalNames.OPMEdition},
    get Revision() { return OPMEnterprisePropertyInternalNames.OPMRevision },
    get Published() { return "Published" },
    get ModifiedAt() { return "ModifiedAt" }
}
