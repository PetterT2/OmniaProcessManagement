import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, VueComponentBase, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ProcessTemplateJourneyStore } from '../store';
import { ProcessTemplatesJourneyBladeIds } from '../ProcessTemplatesJourneyConstants';
import { ProcessTemplate, ProcessTemplateFactory } from '../../../../fx/models';
import { ProcessTemplateStore, ShapeTemplateStore } from '../../../../fx';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;
    @Inject(ShapeTemplateStore) shapeGalleryItemStore: ShapeTemplateStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = false;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};

    created() {
        this.isLoading = true;
        Promise.all([
            this.processTemplateStore.actions.ensureLoadProcessTemplates.dispatch(),
            this.shapeGalleryItemStore.actions.ensureLoadShapeTemplates.dispatch()]
        ).then(() => {
            this.isLoading = false;
        })
    }

    removeTemplate(template: ProcessTemplate) {
        this.journey().travelBackToFirstBlade();
        this.$set(this.isProcessing, template.id.toString(), true);
        this.processTemplateStore.actions.deleteProcessTemplate.dispatch(template).then(() => {
            this.$delete(this.isProcessing, template.id.toString());
        }).catch((errMsg) => {
            if (errMsg) {
                this.$set(this.errMsg, template.id.toString(), errMsg)
                this.$delete(this.isProcessing, template.id.toString());
            }
        })
    }

    travelToEdit(template: ProcessTemplate) {
        this.openSettingBlade(Utils.clone(template));
    }

    openSettingBlade(template?: ProcessTemplate) {
        this.journey().travelBackToFirstBlade();
        this.$nextTick(() => {
            let processTemplate = template || ProcessTemplateFactory.createDefaultProcessTemplate();
            this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(processTemplate);
            this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
        });
    }

    private renderTableRow(h, template: ProcessTemplate) {
        return (
            <tr>
                <td>{template.multilingualTitle}</td>
                <td class={"text-right px-0"}>
                    {
                        this.isProcessing[template.id.toString()] ? <v-btn icon loading></v-btn> : [
                            <v-btn icon class="mr-0" onClick={() => { this.travelToEdit(template) }}>
                                <v-icon size='18'>fal fa-pencil-alt</v-icon>
                            </v-btn>,
                            this.errMsg[template.id.toString()] ?
                                <v-tooltip top {
                                    ...this.transformVSlot({
                                        activator: (ref) => {
                                            const toSpread = {
                                                on: ref.on
                                            }
                                            return [
                                                <v-btn class='ma-0' disabled icon {...toSpread}><v-icon size='18'>fal fa-exclamation-circle</v-icon></v-btn>
                                            ]
                                        }
                                    })}>
                                    <span>{this.errMsg[template.id.toString()]}</span>
                                </v-tooltip> :
                                <omfx-confirm-dialog
                                    icon="fal fa-trash-alt"
                                    styles={{ icon: { fontSize: "18px !important" }, button: { marginLeft: "0px !important" } }}
                                    type={ConfirmDialogDisplay.Icon}
                                    onClose={(res) => { res == ConfirmDialogResponse.Ok && this.removeTemplate(template) }}>
                                </omfx-confirm-dialog>

                        ]
                    }
                </td>
            </tr>
        )
    }

    private renderTableHeader(h) {
        return (
            <thead>
                <tr>
                    <th class="text-left">{this.omniaUxLoc.Common.Title}</th>
                    <th class={["text-right", "px-0"]}>
                        <v-btn icon onClick={() => { this.openSettingBlade() }}>
                            <v-icon>add</v-icon>
                        </v-btn>
                    </th>
                </tr>
            </thead>
        )
    }

    render(h) {
        let processTemplates = this.processTemplateStore.getters.processTemplates();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ProcessTemplates.Title}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>
                    {
                        this.isLoading ?
                            <v-skeleton-loader loading={true} height="100%" type="table"></v-skeleton-loader>
                            :
                            <v-data-table
                                items-per-page={Number.MAX_SAFE_INTEGER}
                                hide-default-footer
                                hide-default-header
                                headers={[]}
                                items={processTemplates}
                                no-data-text={this.loc.ProcessTemplates.Messages.NoProcessTemplate}
                                scopedSlots={{
                                    item: p => this.renderTableRow(h, p.item),
                                    header: p => this.renderTableHeader(h)
                                }}>
                            </v-data-table>
                    }
                </v-container>
            </div>
        );
    }
}