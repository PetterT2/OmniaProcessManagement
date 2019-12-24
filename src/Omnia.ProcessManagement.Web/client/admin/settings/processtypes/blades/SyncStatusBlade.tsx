import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { OmniaTheming, VueComponentBase, JourneyInstance } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { Prop } from 'vue-property-decorator';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypeTermSynchronizationTrackingService } from '../service';
import { SettingsStore, ProcessTypeStore } from '../../../../fx';
import { ProcessTypeTermSynchronizationStatusStatuses, ProcessTypeTermSynchronizationStatus, ProcessType } from '../../../../fx/models';
import { Language } from '@omnia/fx-models';
import { TermStore } from '@omnia/fx-sp';

declare var moment: any;

interface SyncStatusBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class SyncStatusBlade extends VueComponentBase<SyncStatusBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(ProcessTypeTermSynchronizationTrackingService) trackingService: ProcessTypeTermSynchronizationTrackingService;
    @Inject(SettingsStore) settingsStore: SettingsStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(TermStore) termStore: TermStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    retriedWithTrackId = -1;
    rootProcessType: ProcessType = null;
    created() {
        this.rootProcessType = this.processTypeStore.getters.rootProcessTypeInGlobalSettings();
    }

    getTimes(totalSeconds: number) {
        let hours = 0;
        let minutes = 0;
        let seconds = totalSeconds || 1;

        if (seconds > 3600) {
            hours = Math.floor(seconds / 3600);
            seconds = seconds - hours * 3600;
        }

        if (seconds > 60) {
            minutes = Math.floor(seconds / 60);
            seconds = seconds - hours * 3600;
        }

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }

    }

    triggerSync() {
        let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
        if (syncStatus && (syncStatus.status == ProcessTypeTermSynchronizationStatusStatuses.Failed || syncStatus.status == ProcessTypeTermSynchronizationStatusStatuses.SkippedNotAvailableWorkingLanguages) && this.retriedWithTrackId != syncStatus.latestTrackingId) {
            this.retriedWithTrackId = syncStatus.latestTrackingId;
            this.trackingService.triggerSync(this.rootProcessType.id)
        }
    }

    triggerSyncFromSharePoint() {
        let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
        if (syncStatus) {
            this.retriedWithTrackId = syncStatus.latestTrackingId;
            this.trackingService.triggerSyncFromSharePoint(this.rootProcessType.id);
        }
    }

    renderSyncing(h) {
        return (
            <div>
                <v-progress-circular size="16" width="2" indeterminate></v-progress-circular><span class="ml-2">{this.loc.ProcessTypes.SyncJob.WaitingForSyncing}</span>
            </div>
        )
    }

    renderSyncFromTermSet(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        return (
            <div>
                <div class="mb-4">{this.loc.ProcessTypes.SyncJob.SyncProcessTypeFromTermSetMessage}</div>
                <v-btn text loading={this.retriedWithTrackId == syncStatus.latestTrackingId} onClick={() => { this.triggerSyncFromSharePoint() }}>
                    {this.loc.ProcessTypes.SyncJob.Sync}
                </v-btn>
            </div>
        )
    }

    renderSuccess(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        let notWorkingLanguages: Array<Language> = this.termStore.getters.getOmniaTenantLanguageNotWorkingInTermStore();
        let notWorkingLanguageDisplayNames = notWorkingLanguages ? notWorkingLanguages.map(l => l.displayName).join(', ') : null;
        let allowRetry = syncStatus.status == ProcessTypeTermSynchronizationStatusStatuses.SkippedNotAvailableWorkingLanguages;
        return (
            <div>
                <div class="mb-4">{this.loc.ProcessTypes.SyncJob.SyncSuccessful}</div>

                <v-card>
                    <v-card-text>
                        <v-layout>
                            <v-flex grow>
                                {this.renderTime(h, syncStatus)}
                            </v-flex>
                            {
                                allowRetry &&
                                <v-flex shrink>
                                    <v-btn text loading={this.retriedWithTrackId == syncStatus.latestTrackingId} onClick={() => { syncStatus.syncFromSharePoint ? this.triggerSyncFromSharePoint() : this.triggerSync() }}>
                                        {this.loc.ProcessTypes.SyncJob.Retry}
                                    </v-btn>
                                </v-flex>
                            }
                        </v-layout>
                        {
                            allowRetry &&
                            <div class="mt-3" style={{ wordBreak: 'break-word' }}>
                                {
                                    notWorkingLanguageDisplayNames ? [
                                        <p>{this.loc.ProcessTypes.SyncJob.WarningTermStoreWorkingLanguageNotMatchMessageWithDetails}</p>,
                                        <p>{notWorkingLanguageDisplayNames}</p>
                                    ] :
                                        <p>{this.loc.ProcessTypes.SyncJob.WarningTermStoreWorkingLanguageNotMatchMessage}</p>
                                }
                            </div>
                        }
                    </v-card-text>
                </v-card>
            </div>
        )

    }

    renderFailed(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        return (
            <div>
                <div class="mb-4">{this.loc.ProcessTypes.SyncJob.SyncFailed}</div>

                <v-card>
                    <v-card-text>
                        <v-layout>
                            <v-flex grow>
                                {this.renderTime(h, syncStatus)}
                            </v-flex>
                            <v-flex shrink>
                                <v-btn text loading={this.retriedWithTrackId == syncStatus.latestTrackingId} onClick={() => { syncStatus.syncFromSharePoint ? this.triggerSyncFromSharePoint() : this.triggerSync() }}>
                                    {this.loc.ProcessTypes.SyncJob.Retry}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                        <div class="mt-3" style={{ wordBreak: 'break-word' }}>
                            {syncStatus.message}
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        )
    }

    renderTime(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        return [
            this.renderStartedTime(h, syncStatus),
            this.renderRunTime(h, syncStatus)
        ]
    }

    renderStartedTime(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        let times = this.getTimes(syncStatus.totalSeconds);
        return (
            <div class="mb-1">
                <v-icon small class="mr-2">fal fa-clock</v-icon>
                <span>{moment(syncStatus.latestTrackingRunTime).format('LLL')}</span>
            </div>
        )
    }

    renderRunTime(h, syncStatus: ProcessTypeTermSynchronizationStatus) {
        let times = this.getTimes(syncStatus.totalSeconds);
        return (
            <div>
                <v-icon small class="mr-2">fal fa-clock</v-icon>
                {times.hours > 0 && <span>{times.hours + ' ' + this.loc.ProcessTypes.SyncJob.Hours + ' '}</span>}
                {times.minutes > 0 && <span>{times.minutes + ' ' + this.loc.ProcessTypes.SyncJob.Minutes + ' '}</span>}
                {times.seconds > 0 && <span>{times.seconds + ' ' + this.loc.ProcessTypes.SyncJob.Seconds}</span>}
            </div>
        )
    }

    render(h) {
        let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
        let processTypes = this.processTypeStore.getters.children(this.rootProcessType.id, true);

        return (
            <v-row no-gutters width="100%">
                <v-card width="100%" dark={this.omniaTheming.promoted.body.dark}>
                    <v-app-bar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
                        <v-toolbar-title>{syncStatus.syncFromSharePoint || processTypes.length == 0 ? this.loc.ProcessTypes.SyncJob.SyncProcessTypeFromTermSet :
                            this.loc.ProcessTypes.SyncJob.SyncProcessTypeToTermSet}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={() => { this.journey().travelBack() }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-app-bar>
                    <v-divider></v-divider>
                    <v-card-text>
                        {
                            syncStatus.status == ProcessTypeTermSynchronizationStatusStatuses.Syncing ? this.renderSyncing(h) :
                                processTypes.length == 0 && !syncStatus.syncFromSharePoint ? this.renderSyncFromTermSet(h, syncStatus) :
                                    syncStatus.status == ProcessTypeTermSynchronizationStatusStatuses.Failed ? this.renderFailed(h, syncStatus) :
                                        this.renderSuccess(h, syncStatus)
                        }
                    </v-card-text>
                </v-card>
            </v-row>
        )
    }
}