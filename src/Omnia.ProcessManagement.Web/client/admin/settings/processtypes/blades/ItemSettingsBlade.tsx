import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Inject } from '@omnia/fx';
import { EnterprisePropertySetStore, EnterprisePropertyStore, MultilingualStore } from '@omnia/fx/store';
//import { DocumentTypeJourneyStore } from '../store';
//import { DocumentTypeItemSettings, GlobalSettings, DocumentTemplateSettingsTypes } from '../../../../fx/models';
//import { DocumentTypeHelper } from '../core';
import { MultilingualScopes } from '@omnia/fx-models';
//import { DocumentTemplateStore } from '../../../../stores';

interface ItemSettingsBladeProps {

}

@Component
export default class ItemSettingsBlade extends tsx.Component<ItemSettingsBladeProps> {
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    //@Inject(DocumentTypeJourneyStore) documentTypeJourneyStore: DocumentTypeJourneyStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    //@Inject(DocumentTemplateStore) documentTemplateStore: DocumentTemplateStore;

    isLoadingData = true;

    created() {
        //Promise.all([
        //    this.enterprisePropertySetStore.actions.ensureLoadAllSets.dispatch(),
        //    this.enterprisePropertyStore.actions.ensureLoadData.dispatch(),
        //    this.documentTemplateStore.actions.ensureLoadDocumentTemplates.dispatch()
        //]).then(() => {
        //    this.ensureValidData();
        //    this.isLoadingData = false;
        //})
    }

    beforeDestroy() {
        //DocumentTypeHelper.disposeCheckerData();
    }

    ensureValidData() {
        //let editingDocumentType = this.documentTypeJourneyStore.getters.editingDocumentType();
        //let properties = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions();
        //let sets = this.enterprisePropertySetStore.getters.enterprisePropertySets();
        //let defaultLanguage = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant).defaultLanguageTag;
        //let controlledDocumentTemplates = this.documentTemplateStore.getters.documentTemplates().filter(d => d.settings.type == DocumentTemplateSettingsTypes.ControlledDocument);
        //DocumentTypeHelper.initCheckerData(editingDocumentType, properties, sets, controlledDocumentTemplates, defaultLanguage);
        //DocumentTypeHelper.ensureValidData();
    }

    render(h) {
        if (this.isLoadingData) return null;
        return (<opm-admin-settings-processtype-itemsettings-journey></opm-admin-settings-processtype-itemsettings-journey>)
    }
}