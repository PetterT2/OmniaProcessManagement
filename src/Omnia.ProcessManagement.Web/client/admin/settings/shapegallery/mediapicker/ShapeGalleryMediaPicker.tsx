import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance, OmniaContext } from '@omnia/fx';
import { Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import {
    VueComponentBase, MediaPickerImageTransformerProviderResult, DialogModel, StyleFlow, MediaPickerProvider, MediaPickerProviderMediaTypes,
    CentralImageLocationProviderComponentRegister, ItransformerConfigs, ImageSvgTransformer, DialogPositions
} from '@omnia/fx/ux';
import { MediaPickerContent, MediaPickerStyles } from '../../../../fx/models';
import { BusinessProfileCentralImageLocation, IOmniaContext } from '@omnia/fx-models';
import './ShapeGalleryMediaPicker.css';

export interface ShapeGalleryMediaPickerProps {
    imageSaved: (image: MediaPickerImageTransformerProviderResult) => void;
    closed: () => void;
}

@Component
export class ShapeGalleryMediaPickerComponent extends VueComponentBase<ShapeGalleryMediaPickerProps> implements IWebComponentInstance {
    @Prop() imageSaved: (image: MediaPickerImageTransformerProviderResult) => void;
    @Prop() closed: () => void;

    @Inject(OmniaContext) private omniaContext: IOmniaContext;

    private businessProfileCentralImageLocation: BusinessProfileCentralImageLocation = null;
    private dialogModel: DialogModel = { visible: false };
    private classes = StyleFlow.use(MediaPickerStyles);
    private additionalProviders: Array<MediaPickerProvider> = [];
    private isLoadingCentralImageLocation = false;

    created() {
        this.getCentralImageLocationFromProfile(this.omniaContext);
        this.loadAdditionalProviders();
    }

    mounted() {
        this.dialogModel.visible = true;
    }

    onConfigureProviders(providers: Array<MediaPickerProvider>) {
        providers = providers.filter((item) => {
            return item.mediaType === MediaPickerProviderMediaTypes.image
        });
        providers.map((provider) => {
            let tmpProvider = provider as any
            if (!tmpProvider.onSaved && provider.mediaType === MediaPickerProviderMediaTypes.image) {
                tmpProvider.onSaved = this.onSaveImage;
            }
        })
        return providers;
    }

    onInternalClosed() {
        this.dialogModel.visible = false;
        if (this.closed) {
            this.closed();
        }
    }

    onSaveImage(image: MediaPickerImageTransformerProviderResult) {
        this.imageSaved(image);
    }

    createCentralImageLocationsProvider() {
        if (this.businessProfileCentralImageLocation &&
            this.businessProfileCentralImageLocation.centralImageLocationSettings &&
            this.businessProfileCentralImageLocation.centralImageLocationSettings.length > 0) {
            this.businessProfileCentralImageLocation.centralImageLocationSettings.forEach((setting) => {
                this.additionalProviders.push(CentralImageLocationProviderComponentRegister.create({
                    onSaved: this.onSaveImage,
                    centralImageLocationSetting: setting
                }));
            })
        }
    }

    loadAdditionalProviders() {
        this.additionalProviders = [];
        this.createCentralImageLocationsProvider();
    }

    getCentralImageLocationFromProfile(context: IOmniaContext) {
        this.isLoadingCentralImageLocation = true;
        let centralImageLocation = context.businessProfile.propertyBag.getModel(BusinessProfileCentralImageLocation)
        if (centralImageLocation != null) {
            this.businessProfileCentralImageLocation = centralImageLocation;
        }
        this.isLoadingCentralImageLocation = false;
    }

    handleImageMediaDataConfiguration(image: MediaPickerImageTransformerProviderResult) {
        if (image.configuration) {
            delete image.configuration["elementId"];
        }
        return image.configuration;
    }

    getImage(imageUrl: string, configuration?: ItransformerConfigs, descriptions?: string) {
        if (configuration) {
            configuration.elementId = "";
        }
        return new ImageSvgTransformer(imageUrl, configuration, descriptions).getElementString();
    }

    render(h) {
        if (this.isLoadingCentralImageLocation) return null;
        return (
            <omfx-dialog contentClass={this.classes.pickerDialog} model={this.dialogModel} position={DialogPositions.Center}>
                <div class={this.classes.pickerDialogContent}>
                    {
                        this.dialogModel && this.dialogModel.visible &&
                        <omfx-media-picker providers={this.additionalProviders} onClose={this.onInternalClosed} domProps-onConfigureProviders={this.onConfigureProviders} ></omfx-media-picker>
                    }
                </div>
            </omfx-dialog>
        );
    }
}