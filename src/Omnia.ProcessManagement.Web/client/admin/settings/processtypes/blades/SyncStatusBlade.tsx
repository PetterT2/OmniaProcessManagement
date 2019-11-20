import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { OmniaTheming, VueComponentBase, JourneyInstance } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { Prop } from 'vue-property-decorator';
import { ProcessTypeJourneyStore } from '../store';
//import { DocumentTypeTermSynchronizationTrackingService } from '../service';
//import { SettingsStore, DocumentTypeStore } from '../../../../stores';
//import { DocumentTypeTermSynchronizationStatusStatuses, DocumentTypeTermSynchronizationStatus, GlobalSettings, DocumentType } from '../../../../fx/models';

declare var moment: any;

interface SyncStatusBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class SyncStatusBlade extends VueComponentBase<SyncStatusBladeProps> {
    @Prop() journey: () => JourneyInstance;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    //@Inject(DocumentTypeTermSynchronizationTrackingService) trackingService: DocumentTypeTermSynchronizationTrackingService;
    //@Inject(SettingsStore) settingsStore: SettingsStore;
    //@Inject(DocumentTypeStore) documentTypeStore: DocumentTypeStore;

    //@Localize(ODMAdminLocalization.namespace) loc: ODMAdminLocalization.locInterface;

    //retriedWithTrackId = -1;
    //rootDocumentType: DocumentType = null;
    //created() {
    //    this.rootDocumentType = this.documentTypeStore.getters.rootDocumentTypeInGlobalSettings();
    //}

    //getTimes(totalSeconds: number) {
    //    let hours = 0;
    //    let minutes = 0;
    //    let seconds = totalSeconds || 1;

    //    if (seconds > 3600) {
    //        hours = Math.floor(seconds / 3600);
    //        seconds = seconds - hours * 3600;
    //    }

    //    if (seconds > 60) {
    //        minutes = Math.floor(seconds / 60);
    //        seconds = seconds - hours * 3600;
    //    }

    //    return {
    //        hours: hours,
    //        minutes: minutes,
    //        seconds: seconds
    //    }

    //}

    //triggerSync() {
    //    let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
    //    if (syncStatus && syncStatus.status == DocumentTypeTermSynchronizationStatusStatuses.Failed && this.retriedWithTrackId != syncStatus.latestTrackingId) {
    //        this.retriedWithTrackId = syncStatus.latestTrackingId;
    //        this.trackingService.triggerSync(this.rootDocumentType.id)
    //    }
    //}

    //triggerSyncFromSharePoint() {
    //    let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
    //    if (syncStatus) {
    //        this.retriedWithTrackId = syncStatus.latestTrackingId;
    //        this.trackingService.triggerSyncFromSharePoint(this.rootDocumentType.id);
    //    }
    //}

    //renderSyncing(h) {
    //    return (
    //        <div>
    //            <v-progress-circular size="16" width="2" indeterminate></v-progress-circular><span class="ml-2">{this.loc.WaitingForSyncing}</span>
    //        </div>
    //    )
    //}

    //renderSyncFromTermSet(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    return (
    //        <div>
    //            <div class="mb-4">{this.loc.SyncDocumentTypeFromTermSetMessage}</div>
    //            <v-btn text loading={this.retriedWithTrackId == syncStatus.latestTrackingId} onClick={() => { this.triggerSyncFromSharePoint() }}>
    //                {this.loc.Sync}
    //            </v-btn>
    //        </div>
    //    )
    //}

    //renderSuccess(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    return (
    //        <div>
    //            <div class="mb-4">{this.loc.SyncSuccessful}</div>
    //            <v-card>
    //                <v-card-text>
    //                    {this.renderTime(h, syncStatus)}
    //                </v-card-text>
    //            </v-card>
    //        </div>
    //    )

    //}

    //renderFailed(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    return (
    //        <div>
    //            <div class="mb-4">{this.loc.SyncFailed}</div>

    //            <v-card>
    //                <v-card-text>
    //                    <v-layout>
    //                        <v-flex grow>
    //                            {this.renderTime(h, syncStatus)}
    //                        </v-flex>
    //                        <v-flex shrink>
    //                            <v-btn text loading={this.retriedWithTrackId == syncStatus.latestTrackingId} onClick={() => { syncStatus.syncFromSharePoint ? this.triggerSyncFromSharePoint() : this.triggerSync() }}>
    //                                {this.loc.Retry}
    //                            </v-btn>
    //                        </v-flex>
    //                    </v-layout>
    //                    <div class="mt-3" style={{ wordBreak: 'break-word' }}>
    //                        {syncStatus.message}
    //                    </div>
    //                </v-card-text>
    //            </v-card>
    //        </div>
    //    )
    //}

    //renderTime(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    return [
    //        this.renderStartedTime(h, syncStatus),
    //        this.renderRunTime(h, syncStatus)
    //    ]
    //}

    //renderStartedTime(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    let times = this.getTimes(syncStatus.totalSeconds);
    //    return (
    //        <div class="mb-1">
    //            <v-icon small class="mr-2">fal fa-clock</v-icon>
    //            <span>{moment(syncStatus.latestTrackingRunTime).format('LLL')}</span>
    //        </div>
    //    )
    //}

    //renderRunTime(h, syncStatus: DocumentTypeTermSynchronizationStatus) {
    //    let times = this.getTimes(syncStatus.totalSeconds);
    //    return (
    //        <div>
    //            <v-icon small class="mr-2">fal fa-clock</v-icon>
    //            {times.hours > 0 && <span>{times.hours + ' ' + this.loc.Hours + ' '}</span>}
    //            {times.minutes > 0 && <span>{times.minutes + ' ' + this.loc.Minutes + ' '}</span>}
    //            {times.seconds > 0 && <span>{times.seconds + ' ' + this.loc.Seconds}</span>}
    //        </div>
    //    )
    //}

    //render(h) {
    //    let syncStatus = this.processTypeJourneyStore.getters.syncStatus();
    //    let documentTypes = this.documentTypeStore.getters.children(this.rootDocumentType.id, true);

    //    return (
    //        <div>
    //            <v-toolbar prominent dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.promoted.header.background.base}>
    //                <v-toolbar-title>{syncStatus.syncFromSharePoint || documentTypes.length == 0 ? this.loc.SyncDocumentTypeFromTermSet : this.loc.SyncDocumentTypeToTermSet}</v-toolbar-title>
    //                <v-spacer></v-spacer>
    //                <v-btn icon onClick={() => { this.journey().travelBack() }}>
    //                    <v-icon>close</v-icon>
    //                </v-btn>
    //            </v-toolbar>
    //            <v-divider></v-divider>
    //            <v-container>
    //                {
    //                    syncStatus.status == DocumentTypeTermSynchronizationStatusStatuses.Syncing ? this.renderSyncing(h) :
    //                        documentTypes.length == 0 && !syncStatus.syncFromSharePoint ? this.renderSyncFromTermSet(h, syncStatus) :
    //                            syncStatus.status == DocumentTypeTermSynchronizationStatusStatuses.Success ? this.renderSuccess(h, syncStatus) :
    //                                this.renderFailed(h, syncStatus)
    //                }
    //            </v-container>
    //        </div>
    //    )
    //}
}