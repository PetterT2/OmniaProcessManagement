export interface Archive {
    /**
     * let it empty to use global settings url
     * */
    url?: string;
}


/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ArchiveFactory = {
    createDefault(): Archive {
        let settings: Archive = {
            url: ''
        }

        return settings;
    }
}