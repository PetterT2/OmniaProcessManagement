import { ISettingsKeyProvider, SettingsServiceConstructor, SettingsService, SecurityRoles } from '@omnia/fx/services';
import { Inject, Injectable } from '@omnia/fx';
import { Guid, InstanceLifetimes } from '@omnia/fx-models';
import { DocumentRollupBlockData, DocumentRollupBlockSettings } from '@omnia/dm/models';
import { CurrentProcessStore } from '../stores/CurrentProcessStore';
import { DocumentsBlockDataSettingsKey } from '../constants';
//import { ODMDocumentRollupDisplayFields } from '@omnia/dm';


@Injectable({ lifetime: InstanceLifetimes.Transient })
export class DocumentRollupSettingsProvider implements ISettingsKeyProvider {
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    protectKeyWithSecurityRole = (securityRoleId: string) => {

    };

    private initDefaultBlockData() {
        let defaultSettings = {
            title: { isMultilingualString: true },
            sortDescending: false,
            queryConfigurationType: 1,//Circular inject issue if using Enums.DocumentViewEnums.QueryConfigurationType.PickDocuments,
            pagingType: 1,
            itemLimit: 30,
            refiners: [],
            filters: [],
            query: '',
            //viewSettings: {
            //    selectProperties: ["title", ODMDocumentRollupDisplayFields.InfoIcon.toString()],
            //    columns: [{ internalName: ODMDocumentRollupDisplayFields.IconTitleLink.toString(), isShowHeading: true }, { internalName: ODMDocumentRollupDisplayFields.InfoIcon.toString(), isShowHeading: true }]
            //} as any,
            viewSettings: {
                selectProperties: ["title", "cbc0ab3a-fc36-4ebe-97d2-75cc450ed2be"],
                columns: [
                    {
                        internalName: "cd49fdbc-ea98-4bfd-ad97-f471b68c4505", isShowHeading: true
                    },
                    {
                        internalName: "cbc0ab3a-fc36-4ebe-97d2-75cc450ed2be", isShowHeading: true
                    }]
            } as any,
            selectedViewId: "0573c149-cac2-461e-818a-e6011ca60cc1",//todo
            dayLimitProperty: '',
            defaultExpandedSectionIndex: 2
        };
        let blockData: DocumentRollupBlockData = {
            data: {},
            settings: defaultSettings as DocumentRollupBlockSettings
        };
        return blockData;
    }

    getValue = (key: string) => {
        let result: DocumentRollupBlockData = null;

        let processReference = this.getProcessReference(key);
        if (processReference) {
            result = processReference.processData.documentBlockData;
        }
        if (!result) {
            result = this.initDefaultBlockData();
        }
        return Promise.resolve(result);
    }

    canSetValue = (key: string) => {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        });
    }

    setValue = (key: string, value: DocumentRollupBlockData) => {
        return new Promise<any>((resolve, reject) => {
            let processReference = this.getProcessReference(key);
            if (processReference) {
                processReference.processData.documentBlockData = value;
            }
            resolve(value);
        });
    }

    private getProcessReference(key) {
        let processRefData = null;
        switch (key) {
            case DocumentsBlockDataSettingsKey.CurrentProcess:
                processRefData = this.currentProcessStore.getters.referenceData().current;
                break;
            case DocumentsBlockDataSettingsKey.ShortcutProcess:
                processRefData = this.currentProcessStore.getters.referenceData().shortcut;
                break;
        }
        return processRefData;
    }
}