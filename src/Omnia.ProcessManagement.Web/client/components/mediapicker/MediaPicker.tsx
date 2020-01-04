import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch, Emit } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { StyleFlow, DialogModel, VueComponentBase, DialogPositions, MediaPickerImageTransformerProviderResult, ImageTransformerProviderComponent, YouTubeProviderRegister, MyComputerProviderRegister, BingProviderComponentRegister, MicrosoftStreamProviderRegister, CentralImageLocationProviderComponentRegister, ItransformerConfigs, ImageSvgTransformer, MediaPickerProvider, MediaPickerProviderMediaTypes } from "@omnia/fx/ux";
import { IOmniaContext, BusinessProfileCentralImageLocation, MediaPickerVideoProviderResult, MediaPickerProviderResult, MediaPickerImageProviderResult } from "@omnia/fx-models";
import { MediaPickerContent, MediaPickerImageContent, MediaPickerVideoContent, MediaPickerStyles } from '../../fx/models';
import { ImageService, CurrentProcessStore } from '../../fx';
import './MediaPicker.css';

@Component
export class MediaPickerComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() onImageSaved: (imageUrl: string) => void;
    @Prop() onClosed: () => void;

    @Inject(ImageService) imageService: ImageService;
    @Inject(OmniaContext) private omniaContext: IOmniaContext;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private content: MediaPickerContent;
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
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
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

    onInternalSaved() {
        let imageSrc = (this.content.value as MediaPickerImageContent).imageSrc;
        this.onImageSaved(imageSrc);
    }

    onInternalClosed() {
        this.dialogModel.visible = false;
        if (this.onClosed) {
            this.onClosed();
        }
    }

    onSaveImage(image: MediaPickerImageTransformerProviderResult) {
        this.content = this.content || { value: null };
        this.uploadImage(image);
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

    uploadImage(image: MediaPickerImageProviderResult) {
        let fileName = (image as any).name + '.' + image.format;//TODO: why the name property not exisit in the interface ?!

        this.imageService.uploadImage(this.currentProcessStore.getters.referenceData().process, fileName, image.base64)
            .then((imageUrl) => {
                this.content = this.content || { value: null };
                this.content.value = {
                    imageSrc: imageUrl,
                    description: image.description
                }
                this.onInternalSaved();
                this.onInternalClosed();
            });
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

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, MediaPickerComponent);
});