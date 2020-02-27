import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore, DocumentRollupSettingsProvider, DocumentsBlockDataSettingsKey} from '../../../fx';
import { ProcessDesignerStyles } from '../../../fx/models';
import { OmniaTheming, VueComponentBase, StyleFlow } from '@omnia/fx/ux';
import { TabRenderer } from '../../core';
import { Prop } from 'vue-property-decorator';
import { SettingsServiceConstructor, SettingsService, ISettingsKeyProvider } from '@omnia/fx/services';
import '../../core/styles/PanelStyles.css';
import '../../core/styles/BlockStyles.css';
import { DocumentRollupBlockData } from '@omnia/dm/models';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { ProcessDesignerStore } from '../../stores';


export class ProcessDocumentsTabRenderer extends TabRenderer {
    private isProcessStepShortcut: boolean = false;
    constructor(isProcessStepShortcut: boolean = false) {
        super();
        this.isProcessStepShortcut = isProcessStepShortcut;
    }
    generateElement(h): JSX.Element {
        return (<ProcessDocumentsComponent key={Guid.newGuid().toString()} isProcessStepShortcut={this.isProcessStepShortcut}></ProcessDocumentsComponent>);
    }
}

export interface ProcessDocumentsProps {
    isProcessStepShortcut: boolean;
}

@Component
export class ProcessDocumentsComponent extends VueComponentBase<ProcessDocumentsProps, {}, {}>
{
    @Prop() isProcessStepShortcut: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) protected settingsService: SettingsService<DocumentRollupBlockData>;
    @Inject<SettingsServiceConstructor>(DocumentRollupSettingsProvider) private documentSettingsProvider: DocumentRollupSettingsProvider;


    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private documentRollupSettingsKey = '';
    private panelStyles = StyleFlow.use(ProcessDesignerStyles.PanelStyles);
    private blockWithToolbarStyles = StyleFlow.use(ProcessDesignerStyles.BlockWithToolbarStyles);
    private settingPanelWidth: number = 500;
    private blockWidth: number = 700;
    
    created() {
        this.documentRollupSettingsKey = this.isProcessStepShortcut ? DocumentsBlockDataSettingsKey.ShortcutProcess : DocumentsBlockDataSettingsKey.CurrentProcess;
        this.settingsService.registerKeyProvider(this.documentRollupSettingsKey, this.documentSettingsProvider);

        if (this.isProcessStepShortcut) {
            this.settingPanelWidth = 350;
        }

        this.init();
    }

    init() {
        this.settingsService.getValue(this.documentRollupSettingsKey).then((blockData) => {
            this.subscriptionHandler = this.settingsService
                .onKeyValueUpdated(this.documentRollupSettingsKey)
                .subscribe(this.onProcessDataChanged);
            if (!(blockData.settings.pickedDocuments && blockData.settings.pickedDocuments.length > 0)) {
                this.openSettingsPanel();
            }
        });
    }

    mounted() {
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    onProcessDataChanged() {
        this.processDesignerStore.actions.saveState.dispatch();
    }
    openSettingsPanel() {
        this.processDesignerStore.panels.mutations.toggleDocumentsSettingsPanel.commit(true);
    }
    closeSettingsPanel() {
        this.processDesignerStore.panels.mutations.toggleDocumentsSettingsPanel.commit(false);
    }
    private renderPanels(h) {
        let components: Array<JSX.Element> = [];
        /* Right panel drawer */
        let backgroundColor = this.omniaTheming.promoted.body.background.base;
        if (this.omniaTheming.promoted.body.dark) {//todo
            //backgroundColor = this.editorStore.canvas.selectedLayoutItem.state
            //    && this.editorStore.canvas.selectedLayoutItem.state.itemtype === LayoutItemType.section ?
            //    backgroundColor = this.omniaTheming.promoted.body.secondary.base :
            //    backgroundColor = this.omniaTheming.promoted.body.primary.base
        }
        components.push(this.renderDocumentSettingsPanel(h, backgroundColor));
        return components;
    }
    private renderDocumentSettingsPanel(h, backgroundColor: string) {
        return <v-navigation-drawer
            app
            float
            right
            clipped
            dark={this.omniaTheming.promoted.body.dark}
            width={this.settingPanelWidth}
            temporary={false}
            disable-resize-watcher
            hide-overlay
            class={this.panelStyles.settingsPanel(backgroundColor)}
            v-model={this.processDesignerStore.panels.documentsSettingsPanel.state.show}>
            {this.processDesignerStore.panels.documentsSettingsPanel.state.show ?
                <div>
                    <v-toolbar color={this.omniaTheming.promoted.body.primary.base} flat dark tabs>
                        <v-toolbar-title>{this.pdLoc.DocumentSettings}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={this.closeSettingsPanel}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-container>
                        <odm-document-rollup-settings settingsKey={this.documentRollupSettingsKey}></odm-document-rollup-settings>
                    </v-container>
                </div>
                : null}
        </v-navigation-drawer>;
    }
    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <div class={this.blockWithToolbarStyles.blockWrapper(this.omniaTheming, this.blockWidth)}>
                    <div class={this.blockWithToolbarStyles.blockOverflowWrapper}>
                        <odm-document-rollup settingsKey={this.documentRollupSettingsKey}></odm-document-rollup>
                    </div>
                    <div class={this.blockWithToolbarStyles.toolbarWrapper(this.omniaTheming)}>
                        <v-btn
                            small
                            icon
                            onClick={this.openSettingsPanel}>
                            <v-icon small color={this.omniaTheming.system.grey.lighten5}>settings</v-icon>
                        </v-btn>
                    </div>
                </div>                
            </v-card-text>
            {this.renderPanels(h)}
        </v-card>)
    }
}

