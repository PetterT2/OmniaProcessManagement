import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Inject, Localize, Utils } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, JourneyInstance, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { SettingsStore } from '../../../../fx';
import { Setting, GlobalSettings } from '../../../../fx/models';
import { GuidValue, Guid } from '@omnia/fx-models';

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
    globalSettings: GlobalSettings = new GlobalSettings();
    originalSettings: GlobalSettings = new GlobalSettings();

    created() {
        Promise.all([
            this.settingsStore.actions.ensureSettings.dispatch(GlobalSettings).then(() => {
                let globalSettings = this.settingsStore.getters.getByModel(GlobalSettings);
                if (globalSettings) {
                    this.globalSettings = Object.assign(this.globalSettings, globalSettings);
                    this.originalSettings = Object.assign(this.originalSettings, globalSettings);
                }
                    
            })
        ]).then(() => {
            this.isLoading = false;
        })
    }

    onTermSetChanged(termSetId: GuidValue) {
        this.globalSettings.processTermSetId = termSetId ? termSetId.toString() : null
    }

    addOrUpdate() {
        this.isSaving = true;
        this.settingsStore.actions.addOrUpdateSettings.dispatch(this.globalSettings).then(() => {
            this.isSaving = false;
        })
    }

    render(h) {
        let disabled = this.originalSettings && this.originalSettings.processTermSetId != null && this.originalSettings.processTermSetId != Guid.empty;

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
                                <omfx-termset-picker
                                    scrollableMaxHeight={300}
                                    label={this.loc.ProcessTermSetId}
                                    disabled={disabled}
                                    termSetId={this.globalSettings && this.globalSettings.processTermSetId && this.originalSettings.processTermSetId != Guid.empty ? this.globalSettings.processTermSetId : null}
                                    onChanged={(termSetId) => { this.onTermSetChanged(termSetId); }}></omfx-termset-picker>
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

