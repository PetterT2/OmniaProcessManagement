//import { Inject, MD5Util, Utils } from '@omnia/fx';
//import { CurrentProcessStore } from '../../fx';

//export class SaveProcessStateManager {
//    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
//    private intervalId;
//    private stateHash: string;
//    private versionId: VersionId;

//    /**
//     * Starts the save state timer
//     */
//    public start() {
//        this.stop();
//        if (this.currentProcessStore.getters.referenceData()) {
//            this.intervalId = setInterval(this.savePageStateIfChanged.bind(this), 2000);
//            this.stateHash = this.versionHashString();
//            this.versionId = this.currentPageStore.getters.state.currentVersion.versionData.id;
//        }
//    }

//    /**
//     * Starts the save state timer
//     */
//    public stop() {
//        if (this.intervalId) {
//            clearInterval(this.intervalId);
//        }
//    }

//    private savePageStateIfChanged() {
//        if (!this.hasStateChanged()) {
//            return;
//        }
//        this.currentPageStore.actions.saveState.dispatch().then(() => {
//        });
//    }

//    private hasStateChanged(): boolean {
//        if (!this.currentProcessStore.getters.referenceData()) {
//            return false;
//        }
//        if (this.currentProcessStore.getters.referenceData().currentProcessStep.id !== this.versionId) {
//            this.stop();
//            return false;
//        }
//        let currentStateHash = this.versionHashString();
//        if (currentStateHash === this.stateHash){
//            return false;
//        }
//        this.stateHash = currentStateHash;
//        return true;
//    }

//    private versionHashString(): string {
//        if (this.currentProcessStore.getters.referenceData()) {
//            return new MD5Util().md5(JSON.stringify(this.currentProcessStore.getters.referenceData()));
//        }
//        return null;
//    }
//}