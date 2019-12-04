import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, VueComponentBase, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { TermStore } from '@omnia/fx-sp';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypeStore } from '../../../../fx';
import { AdminJourneyStore } from '../../../store';
import { ProcessTypeTermSynchronizationStatusStatuses, ProcessTypeSettingsTypes } from '../../../../fx/models';
import { ProcessTypesJourneyBladeIds } from '../ProcessTypesJourneyConstants';
import ProcessTypeNode from '../processtypenode/ProcessTypeNode';
import { NodeStyles, ProcessTypeNodeStylesInterface } from '../processtypenode/ProcessTypeNode.css';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(AdminJourneyStore) adminJourneyStore: AdminJourneyStore;
    @Inject(TermStore) termStore: TermStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    nodeStyles = StyleFlow.use(NodeStyles) as ProcessTypeNodeStylesInterface<string>;
    messageBusSubscriptionHandler: IMessageBusSubscriptionHandler = null;
    stopPullingSyncStatusHandler: () => void = null;
    triggeredPullDataAfterSyncFromSharePoint: boolean = false;
    isLoading: boolean = false;
    termSetFound: boolean = false;
    isDestroyed: boolean = false;

    beforeDestroy() {
        this.isDestroyed = true;
        this.messageBusSubscriptionHandler.unsubscribe();
        if (this.stopPullingSyncStatusHandler) {
            this.stopPullingSyncStatusHandler();
        }
    }

    created() {
        this.processTypeJourneyStore.mutations.resetExpand.commit();
        this.processTypeJourneyStore.mutations.resetSyncStatus.commit();
        this.processTypeJourneyStore.mutations.setSelectingProcessType.commit(null);
        this.messageBusSubscriptionHandler = this.processTypeJourneyStore.getters.onEditingProcessTypeMutated()(() => {
            let editingDocument = this.processTypeJourneyStore.getters.editingProcessType();
            this.journey().travelBackToFirstBlade();

            if (editingDocument && editingDocument.settings.type == ProcessTypeSettingsTypes.Group) {
                this.$nextTick(() => {
                    this.journey().travelToNext(ProcessTypesJourneyBladeIds.groupSettings)
                })
            }
            else if (editingDocument && editingDocument.settings.type == ProcessTypeSettingsTypes.Item) {
                this.$nextTick(() => {
                    this.journey().travelToNext(ProcessTypesJourneyBladeIds.itemSettings)
                })
            }

        });

        Promise.all([
            this.processTypeStore.actions.ensureRootProcessType.dispatch(),
            this.termStore.actions.ensureAllTermGroups.dispatch(),
            this.termStore.actions.ensureTermStoreWorkingLanguages.dispatch()
        ]).then(() => {
            //If this component is destroyed before the promise finish, then we stop
            if (!this.isDestroyed) {
                this.isLoading = false;
                let rootProcessType = this.processTypeStore.getters.rootProcessTypeInGlobalSettings();
                if (rootProcessType) {
                    this.termSetFound = this.termStore.getters.getTermSetById(rootProcessType.id) && true;
                    if (this.termSetFound) {
                        this.stopPullingSyncStatusHandler = this.processTypeJourneyStore.syncStatusHandler.startPullingSyncStatus(rootProcessType.id);

                        this.messageBusSubscriptionHandler.add(
                            this.processTypeJourneyStore.getters.onSyncStatusMutated()(state => {
                                if (state.newState && state.newState.syncFromSharePoint && state.newState.status == ProcessTypeTermSynchronizationStatusStatuses.Success) {
                                    let rootProcessType = this.processTypeStore.getters.rootProcessTypeInGlobalSettings();
                                    if (rootProcessType.childCount == 0 && (!this.triggeredPullDataAfterSyncFromSharePoint || state.oldState && state.oldState.syncFromSharePoint && state.oldState.status == ProcessTypeTermSynchronizationStatusStatuses.Syncing)) {
                                        this.isLoading = true;
                                        this.triggeredPullDataAfterSyncFromSharePoint = true;
                                        this.processTypeStore.actions.refreshCache.dispatch(state.newState.latestTrackingId).then(() => {
                                            this.processTypeStore.actions.ensureRootProcessType.dispatch().then(() => {
                                                this.isLoading = false;
                                            })
                                        })
                                    }
                                }
                            })
                        )
                    }
                }

            }
        })
    }

    openSyncStatusBlade() {
        this.journey().travelBackToFirstBlade();
        this.journey().travelToNext(ProcessTypesJourneyBladeIds.syncStatus);
    }

    renderProcessTypesTree(h) {
        let rootProcessType = this.processTypeStore.getters.rootProcessTypeInGlobalSettings();
        return <ProcessTypeNode currentIndexInSiblings={0} siblingsCount={1} dark={this.omniaTheming.promoted.body.dark} styles={this.nodeStyles} processType={rootProcessType} level={1}></ProcessTypeNode>
    }

    render(h) {
        let status = this.processTypeJourneyStore.getters.syncStatus();
        let syncingFromSharePoint = status && status.syncFromSharePoint && status.status == ProcessTypeTermSynchronizationStatusStatuses.Syncing;

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessTypes.Title}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    {
                        status ? [
                            <v-btn icon onClick={() => { this.openSyncStatusBlade(); }}>
                                <v-icon color={status.status == ProcessTypeTermSynchronizationStatusStatuses.Failed ? "red" : ""}>fal fa-info-circle</v-icon>
                            </v-btn>
                        ] : null
                    }
                    <v-btn icon onClick={() => { this.adminJourneyStore.mutations.setActiveSubMenuItem.commit(null) }}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {
                        this.isLoading ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                            !this.termSetFound ? this.loc.ProcessTypes.Messages.ProcessTypesTermSetNotFound :
                                syncingFromSharePoint ? <v-skeleton-loader loading={true} height="100%" type="paragraph"></v-skeleton-loader> :
                                    this.renderProcessTypesTree(h)
                    }
                </v-container>
            </div>
        );
    }
}