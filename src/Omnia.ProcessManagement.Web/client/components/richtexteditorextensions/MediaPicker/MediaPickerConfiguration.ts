import { MediaPickerImageTransformerProviderResult, ItransformerConfigs, ImageSvgTransformer } from '@omnia/fx/ux';
import { Inject, ServiceContainer } from '@omnia/fx';
import { MediaPickerVideoProviderResult } from '@omnia/fx-models';
import { ImageService, CurrentProcessStore } from '../../../fx';
import { MediaPickerEditorExtensionConfiguration } from '../../../fx/models';

export class MediaPickerConfiguration {
    imageService: ImageService;
    currentProcessStore: CurrentProcessStore;

    constructor() {
        this.imageService = ServiceContainer.createInstance(ImageService);
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);

    }

    public getConfig(): MediaPickerEditorExtensionConfiguration {
        let mediaPickerConfig: MediaPickerEditorExtensionConfiguration = {
            onMediaPickerSave: this.onImagePickerSave.bind(this),
            onVideoPickerSave: this.onVideoPickerSave.bind(this)
        };

        return mediaPickerConfig;
    }

    private onImagePickerSave(image: MediaPickerImageTransformerProviderResult, dispatchHandler: (eleStr: string, type: "image") => void) {
        if (dispatchHandler) {
            this.uploadImage(image, dispatchHandler);
        }
    }

    private onVideoPickerSave(video: MediaPickerVideoProviderResult, dispatchHandler: (eleStr: string, type: "video") => void) {
        if (dispatchHandler) {
            dispatchHandler(video.html, 'video');
        }
    }

    private uploadImage(
        image: MediaPickerImageTransformerProviderResult,
        dispatchHandler: (eleStr: string, type: "image") => void
    ) {
        var imageResult: any = image;
        let fileName = imageResult.name + '.' + image.format;
        let process = this.currentProcessStore.getters.referenceData().process;
        this.imageService.uploadImage(process, fileName, imageResult.base64)
            .then((imageUrl) => {
                if (dispatchHandler) {
                    let element = this.getImage(imageUrl, image.configuration, image.description);
                    dispatchHandler(element, 'image');
                }
            })
    }

    private getImage(imageUrl: string, configuration?: ItransformerConfigs, descriptions?: string) {
        if (configuration) configuration.elementId = "";

        return new ImageSvgTransformer(imageUrl, configuration, descriptions).getElementString();
    }
}