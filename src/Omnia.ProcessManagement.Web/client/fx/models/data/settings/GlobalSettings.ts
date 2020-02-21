import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { Setting } from './Setting';

export class GlobalSettings extends Setting {
    constructor() {
        super("globalsettings");

        /**
        * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
        * To ensure it fully react on view
        * */
        this.archiveSiteUrl = "";
        this.processTermSetId = null;
    }

    archiveSiteUrl: string;
    processTermSetId: GuidValue
}
