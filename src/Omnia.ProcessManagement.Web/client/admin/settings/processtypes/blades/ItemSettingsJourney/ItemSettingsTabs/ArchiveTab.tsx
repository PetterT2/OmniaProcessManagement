import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
//import { ProcessType, DocumentTypeItemSettings, GlobalSettings, ArchiveFactory, Archive } from '../../../../../../fx/models';
//import { SettingsStore } from '../../../../../../stores';

interface ArchiveTabProps {
    formValidator:  FormValidator;
    documentType: DocumentType;
}

@Component
export default class ArchiveTab extends VueComponentBase<ArchiveTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() documentType: DocumentType;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    //@Inject(SettingsStore) settingsStore: SettingsStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    //enableArchive: boolean = false;
    //loading = true;
    //defaultArchiveUrl: string = '';
    //created() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (settings.archive) {
    //        this.enableArchive = true;
    //    }

    //    this.settingsStore.actions.ensureSettings.dispatch(GlobalSettings).then(() => {
    //        let globalSettings = this.settingsStore.getters.getByModel(GlobalSettings);
    //        if (globalSettings)
    //            this.defaultArchiveUrl = globalSettings.archiveSiteUrl;

    //        this.loading = false;
    //    })
    //}

    //onEnableArchiveChanged() {
    //    let settings = this.documentType.settings as DocumentTypeItemSettings;
    //    if (this.enableArchive) {
    //        settings.archive = ArchiveFactory.createDefault();
    //    }
    //    else {
    //        settings.archive = null;
    //    }
    //}

    //rednerArchiveSettings(h, archive: Archive) {
    //    return (
    //        <v-card>
    //            <v-card-text>
    //                <v-text-field hint={this.loc.ArchiveSiteUrlHint} placeholder={this.defaultArchiveUrl} v-model={archive.url} label={this.loc.ArchiveSiteUrl}></v-text-field>
    //            </v-card-text>
    //        </v-card>
    //    )
    //}

    //render(h) {
    //    if (this.loading) return null;

    //    let settings = this.documentType.settings as DocumentTypeItemSettings;

    //    return (
    //        <div>
    //            <v-checkbox label={this.loc.Archive}
    //                onChange={(val) => { this.enableArchive = val; this.onEnableArchiveChanged() }}
    //                input-value={this.enableArchive}></v-checkbox>
    //            {
    //                this.enableArchive && this.rednerArchiveSettings(h, settings.archive)
    //            }
    //        </div>
    //    );
    //}
}