import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils } from "@omnia/fx";
import { StyleFlow, VueComponentBase, OmniaTheming, DialogModel, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { IProcessStepPicker } from './IProcessStepPicker';
import { RootProcessStep, ProcessStep, ProcessStepPickerStyles, IdDict, CenterConfigurableHeightDialogStyles } from '../../fx/models';
import { GuidValue } from '@omnia/fx-models';
import { NavigationNodeComponent } from './NavigationNode';
import './ProcessStepPicker.css';
import '../../core/styles/dialog/CenterConfigurableHeightDialogStyles.css';

@Component
export default class ProcessStepPicker extends VueComponentBase implements IWebComponentInstance, IProcessStepPicker {
    @Prop() header: string;
    @Prop() rootProcessStep: RootProcessStep;
    @Prop({ default: {} }) hiddenProcessStepIdsDict: IdDict<boolean>;
    @Prop({ default: {} }) disabledProcessStepIdsDict: IdDict<boolean>;
    @Prop() onSelected: (processStep: ProcessStep) => Promise<void>;
    @Prop() onClose: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private styles = StyleFlow.use(ProcessStepPickerStyles);
    private expandState: { [id: string]: true } = {};
    private selectingProcessStep: ProcessStep = null;
    private renderKey = Utils.generateGuid();
    private isSaving: boolean = false;
    private myCenterDialogStyles = StyleFlow.use(CenterConfigurableHeightDialogStyles);

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);

    }

    saveSelectingProcessStep() {
        this.isSaving = true;
        this.onSelected(this.selectingProcessStep).then(() => {
            this.isSaving = false;
            this.onClose();
        }).catch(() => {
            this.isSaving = false;
        })
    }

    selectProcessStep(processStep: ProcessStep) {
        if (this.selectingProcessStep != processStep) {
            this.selectingProcessStep = processStep;

            this.renderKey = Utils.generateGuid();
        }
    }

    render(h) {
        return (
            <omfx-dialog
                contentClass={this.myCenterDialogStyles.dialogContentClass}
                hideCloseButton
                model={{ visible: true }}
                width="800px"
                position={DialogPositions.Center}
                persistent
                dark={this.theming.body.bg.dark}>
                <v-app-bar dark={this.theming.chrome.bg.dark}
                    color={this.theming.chrome.bg.color.base}
                    absolute
                    scroll-off-screen
                    flat>
                    <v-toolbar-title>{this.header}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon onClick={this.onClose}>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-app-bar>
                <v-card flat class={[this.myCenterDialogStyles.bodyWrapper]}>
                    <v-card-text class={this.myCenterDialogStyles.contentWrapper}>
                        <NavigationNodeComponent
                            key={this.renderKey}
                            hiddenProcessStepIdsDict={this.hiddenProcessStepIdsDict}
                            disabledProcessStepIdsDict={this.disabledProcessStepIdsDict}
                            selectProcessStep={this.selectProcessStep}
                            selectingProcessStep={this.selectingProcessStep}
                            pickerStyles={this.styles}
                            expandState={this.styles}
                            level={0}
                            processStep={this.rootProcessStep}>
                        </NavigationNodeComponent>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            disabled={!this.selectingProcessStep}
                            text
                            dark={this.omniaTheming.promoted.body.dark}
                            color={this.omniaTheming.themes.primary.base}
                            onClick={() => { this.saveSelectingProcessStep() }}
                            loading={this.isSaving}
                        >
                            {this.omniaUxLoc.Common.Buttons.Save}
                        </v-btn>
                        <v-btn
                            text
                            light={!this.omniaTheming.promoted.body.dark}
                            onClick={() => { this.onClose(); }}>
                            {this.omniaUxLoc.Common.Buttons.Cancel}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </omfx-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessStepPicker);
});
