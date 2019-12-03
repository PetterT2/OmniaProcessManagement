import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Inject, Localize, Utils } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, JourneyInstance, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { SettingsStore } from '../../../../fx';
import { Setting } from '../../../../fx/models';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SettingsStore) settingsStore: SettingsStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isSaving = false;
    isLoading = true;
    globalSettings: Setting = new Setting();

    created() {
        Promise.all([
            this.settingsStore.actions.ensureSettings.dispatch().then(() => {
                let globalSettings = this.settingsStore.getters.getByModel();
                if (globalSettings)
                    this.globalSettings = Object.assign(this.globalSettings, globalSettings);
            })
        ]).then(() => {
            this.isLoading = false;
        })
    }

    addOrUpdate() {
        this.isSaving = true;
        this.settingsStore.actions.addOrUpdateSettings.dispatch(this.globalSettings).then(() => {
            this.isSaving = false;
        })
    }

    render(h) {
        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.Settings}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {
                        this.isLoading ?
                            <v-skeleton-loader loading={true} height="100%" type="table"></v-skeleton-loader>
                            :
                            <div>
                                <v-text-field dark={this.omniaTheming.promoted.body.dark} label={this.loc.ArchiveSiteUrl} v-model={this.globalSettings.archiveSiteUrl}></v-text-field>
                                <div class='text-right'>
                                    <v-btn dark={this.omniaTheming.promoted.body.dark} loading={this.isSaving} text onClick={() => { this.addOrUpdate() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                                </div>
                            </div>
                    }
                </v-container>
            </div>
        );
    }
}

