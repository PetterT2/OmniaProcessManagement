import { TabRegistration } from '../../models/processdesigner';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { Localize } from '@omnia/fx';
import { ProcessContentTabRenderer } from '../processstepcomponents/content';
import { ProcessDocumentsTabRenderer } from '../processstepcomponents/documents';
import { ProcessLinksTabRenderer } from '../processstepcomponents/links';
import { ProcessTasksTabRenderer } from '../processstepcomponents/tasks';

export class ProcessStepShortcutDesignerItem {

    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;

    protected contentTab: TabRegistration = {
        tabId: "8e51f519-7073-4398-a3f6-ca792b953781",
        tabRenderer: new ProcessContentTabRenderer(true),
        tabName: this.opmCoreLoc.Process.Content,
        active: false
    };
    protected documentsTab: TabRegistration = {
        tabId: "4273a5d1-a389-41aa-9cf9-bade153f75c6",
        tabRenderer: new ProcessDocumentsTabRenderer(),
        tabName: this.opmCoreLoc.Process.Documents,
        active: false
    };
    protected linksTab: TabRegistration = {
        tabId: "9a2017e4-dd73-4385-bf57-c3568a0bf74e",
        tabRenderer: new ProcessLinksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Links,
        active: false
    };
    protected tasksTab: TabRegistration = {
        tabId: "0e551d8f-19fc-4f02-8b1b-518d96362785",
        tabRenderer: new ProcessTasksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Tasks,
        active: false
    };

    tabs: Array<TabRegistration> = [this.contentTab, this.documentsTab, this.linksTab, this.tasksTab];

    constructor() {
    }
}