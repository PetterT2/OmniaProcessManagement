import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Inject } from '@omnia/fx';
import { EnterprisePropertySetStore, EnterprisePropertyStore, MultilingualStore } from '@omnia/fx/store';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypeItemSettings } from '../../../../fx/models';
import { ProcessTypeHelper } from '../core';
import { MultilingualScopes } from '@omnia/fx-models';
import { ProcessTemplateStore } from '../../../../fx';

interface ItemSettingsBladeProps {

}

@Component
export default class ItemSettingsBlade extends tsx.Component<ItemSettingsBladeProps> {
    @Inject(EnterprisePropertySetStore) enterprisePropertySetStore: EnterprisePropertySetStore;
    @Inject(EnterprisePropertyStore) enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;

    isLoadingData = true;

    created() {
        Promise.all([
            this.enterprisePropertySetStore.actions.ensureLoadAllSets.dispatch(),
            this.enterprisePropertyStore.actions.ensureLoadData.dispatch(),
            this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch()
        ]).then(() => {
            this.ensureValidData();
            this.isLoadingData = false;
        })
    }

    beforeDestroy() {
        ProcessTypeHelper.disposeCheckerData();
    }

    ensureValidData() {
        let editingProcessType = this.processTypeJourneyStore.getters.editingProcessType();
        let properties = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions();
        let sets = this.enterprisePropertySetStore.getters.enterprisePropertySets();
        let defaultLanguage = this.multilingualStore.getters.languageSetting(MultilingualScopes.Tenant).defaultLanguageTag;
        ProcessTypeHelper.initCheckerData(editingProcessType, properties, sets, defaultLanguage);
        ProcessTypeHelper.ensureValidData();
    }

    render(h) {
        if (this.isLoadingData) return null;
        return (<opm-admin-settings-processtype-itemsettings-journey></opm-admin-settings-processtype-itemsettings-journey>)
    }
}