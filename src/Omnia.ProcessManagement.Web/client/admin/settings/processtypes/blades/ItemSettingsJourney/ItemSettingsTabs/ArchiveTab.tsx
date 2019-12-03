import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { OmniaTheming, FormValidator, VueComponentBase, StyleFlow } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessType, ProcessTypeItemSettings, Setting, ArchiveFactory, Archive } from '../../../../../../fx/models';
import { SettingsStore } from '../../../../../../fx';

interface ArchiveTabProps {
    formValidator:  FormValidator;
    processType: ProcessType;
}

@Component
export default class ArchiveTab extends VueComponentBase<ArchiveTabProps> {
    @Prop() formValidator: FormValidator;
    @Prop() processType: ProcessType;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Inject(SettingsStore) settingsStore: SettingsStore;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    enableArchive: boolean = false;
    loading = true;
    defaultArchiveUrl: string = '';
    created() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        if (settings.archive) {
            this.enableArchive = true;
        }

        this.settingsStore.actions.ensureSettings.dispatch().then(() => {
            let settings = this.settingsStore.getters.getByModel();
            if (settings)
                this.defaultArchiveUrl = settings.archiveSiteUrl;

            this.loading = false;
        })
    }

    onEnableArchiveChanged() {
        let settings = this.processType.settings as ProcessTypeItemSettings;
        if (this.enableArchive) {
            settings.archive = ArchiveFactory.createDefault();
        }
        else {
            settings.archive = null;
        }
    }

    rednerArchiveSettings(h, archive: Archive) {
        return (
            <v-card>
                <v-card-text>
                    <v-text-field hint={this.loc.ProcessTypes.Settings.ArchiveSiteUrlHint} placeholder={this.defaultArchiveUrl} v-model={archive.url} label={this.loc.ArchiveSiteUrl}></v-text-field>
                </v-card-text>
            </v-card>
        )
    }

    render(h) {
        if (this.loading) return null;

        let settings = this.processType.settings as ProcessTypeItemSettings;

        return (
            <div>
                <v-checkbox label={this.loc.ProcessTypes.Settings.Tabs.Archive}
                    onChange={(val) => { this.enableArchive = val; this.onEnableArchiveChanged() }}
                    input-value={this.enableArchive}></v-checkbox>
                {
                    this.enableArchive && this.rednerArchiveSettings(h, settings.archive)
                }
            </div>
        );
    }
}