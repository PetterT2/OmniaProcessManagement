import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, VueComponentBase, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../loc/localize';
import { ShapeGalleryJourneyStore } from '../store';
import { ShapeGalleryJourneyBladeIds } from '../ShapeGalleryJourneyConstants';
import { ShapeGalleryItem, ShapeGalleryItemFactory } from '../../../../fx/models';
import { ShapeGalleryItemStore } from '../../../../fx';

interface DefaultBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class DefaultBlade extends VueComponentBase<DefaultBladeProps> {

    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ShapeGalleryJourneyStore) shapeGalleryJournayStore: ShapeGalleryJourneyStore;
    @Inject(ShapeGalleryItemStore) shapeGalleryItemStore: ShapeGalleryItemStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = false;
    isProcessing: { [id: string]: boolean } = {};
    errMsg: { [id: string]: string } = {};

    created() {
        this.isLoading = true;
        Promise.all([
            this.shapeGalleryItemStore.actions.ensureLoadShapeGalleryItems.dispatch()
        ]
        ).then(() => {
            this.isLoading = false;
        })
    }

    removeShapeGalleryItem(shapeGalleryItem: ShapeGalleryItem) {
        this.journey().travelBackToFirstBlade();
        this.$set(this.isProcessing, shapeGalleryItem.id.toString(), true);
        this.shapeGalleryItemStore.actions.deleteShapeGalleryItem.dispatch(shapeGalleryItem).then(() => {
            this.$delete(this.isProcessing, shapeGalleryItem.id.toString());
        }).catch((errMsg) => {
            if (errMsg) {
                this.$set(this.errMsg, shapeGalleryItem.id.toString(), errMsg)
                this.$delete(this.isProcessing, shapeGalleryItem.id.toString());
            }
        })
    }

    travelToEdit(shapeGalleryItem: ShapeGalleryItem) {
        this.openSettingBlade(Utils.clone(shapeGalleryItem));
    }

    openSettingBlade(declaration?: ShapeGalleryItem) {
        this.journey().travelBackToFirstBlade();
        this.$nextTick(() => {
            let shapeGalleryItem = declaration || ShapeGalleryItemFactory.createDefaultShapeGalleryItem(this.omniaTheming);
            this.shapeGalleryJournayStore.mutations.setEditingShapeGalleryItem.commit(shapeGalleryItem);
            this.journey().travelToNext(ShapeGalleryJourneyBladeIds.shapeGallerySettingsDefault);
        });
    }

    private renderTableRow(h, shapeGalleryItem: ShapeGalleryItem) {
        return (
            <tr>
                <td>{shapeGalleryItem.multilingualTitle}</td>
                {
                    !shapeGalleryItem.builtIn &&
                    <td class={"text-right px-0"}>
                        {
                            this.isProcessing[shapeGalleryItem.id.toString()] ? <v-btn icon loading></v-btn> : [
                                <v-btn icon class="mr-0" onClick={() => { this.travelToEdit(shapeGalleryItem) }}>
                                    <v-icon size='18'>fal fa-pencil-alt</v-icon>
                                </v-btn>,
                                this.errMsg[shapeGalleryItem.id.toString()] ?
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
                                        <span>{this.errMsg[shapeGalleryItem.id.toString()]}</span>
                                    </v-tooltip> :
                                    <omfx-confirm-dialog
                                        icon="fal fa-trash-alt"
                                        styles={{ icon: { fontSize: "18px !important" }, button: { marginLeft: "0px !important" } }}
                                        type={ConfirmDialogDisplay.Icon}
                                        onClose={(res) => { res == ConfirmDialogResponse.Ok && this.removeShapeGalleryItem(shapeGalleryItem) }}>
                                    </omfx-confirm-dialog>

                            ]
                        }
                    </td>
                }
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
        let shapeGalleryItems = this.shapeGalleryItemStore.getters.shapeGalleryItems();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{this.loc.ShapeGallery.Title}</v-toolbar-title>
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
                                items={shapeGalleryItems}
                                no-data-text={this.loc.ShapeGallery.Messages.NoShapeItem}
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