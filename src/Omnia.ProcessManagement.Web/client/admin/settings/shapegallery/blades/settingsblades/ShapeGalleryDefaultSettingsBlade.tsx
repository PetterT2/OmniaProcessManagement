import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ImageSource, IconSize, VueComponentBase, FormValidator } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../loc/localize';
import { ShapeGalleryItemStore } from '../../../../../fx';
import { ShapeGalleryJourneyStore } from '../../store';
import { ShapeGalleryItem } from '../../../../../fx/models';

interface ShapeGalleryDefaultSettingsBladeProps {
    journey: () => JourneyInstance;
}

@Component
export default class ShapeGalleryDefaultSettingsBlade extends VueComponentBase<ShapeGalleryDefaultSettingsBladeProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ShapeGalleryJourneyStore) shapeGalleryJournayStore: ShapeGalleryJourneyStore;
    @Inject(ShapeGalleryItemStore) shapeGalleryStore: ShapeGalleryItemStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    editingShapeGalleryItem: ShapeGalleryItem = null;
    internalValidator: FormValidator = new FormValidator(this);
    isSaving: boolean = false;

    created() {

    }

    save() {
        if (this.internalValidator.validateAll()) {
            this.isSaving = true;
            this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();
            this.shapeGalleryStore.actions.addOrUpdateShapeGalleryItem.dispatch(this.editingShapeGalleryItem).then(() => {
                this.isSaving = false;
                this.journey().travelBackToFirstBlade();
            })
        }
    }

    render(h) {
        this.editingShapeGalleryItem = this.shapeGalleryJournayStore.getters.editingShapeGalleryItem();

        return (
            <div>
                <v-toolbar flat dark={this.omniaTheming.promoted.header.dark}
                    color={this.omniaTheming.promoted.header.background.base}>
                    <v-toolbar-title>{(this.editingShapeGalleryItem && this.editingShapeGalleryItem.id) ? this.editingShapeGalleryItem.multilingualTitle : this.loc.ShapeGallery.CreateShape}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-container>


                    <div class='text-right'>
                        <v-btn dark={this.omniaTheming.promoted.body.dark} text loading={this.isSaving} onClick={() => { this.save() }}>{this.omniaUxLoc.Common.Buttons.Save}</v-btn>
                    </div>
                </v-container>
            </div>
        );
    }
}