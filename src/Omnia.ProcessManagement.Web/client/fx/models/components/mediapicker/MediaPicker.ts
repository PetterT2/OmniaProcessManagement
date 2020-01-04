import { MediaPickerVideoProviderResult } from '@omnia/fx-models';
import { MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';

export interface MediaPickerImageContent extends MediaPickerImageTransformerProviderResult {
    imageSrc: string;
}

export interface MediaPickerVideoContent extends MediaPickerVideoProviderResult {

}

export interface MediaPickerContent {
    value?: MediaPickerImageContent | MediaPickerVideoContent;
}