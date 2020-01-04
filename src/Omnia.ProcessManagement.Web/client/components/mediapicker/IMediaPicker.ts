import { TsxAllowUnknowProperties, ImageRatio } from '@omnia/fx/ux';
import { MediaPickerImageContent, MediaPickerVideoContent } from '../../fx/models';


/*@WebComponentInterface("opm-media-picker")*/
export interface IMediaPickerComponent {
    /*@DomProperty*/
    onImageSaved: (imageUrl: string) => void;

    /*@DomProperty*/
    onClosed: () => void;
}

declare global {
    namespace JSX {
        interface Element { }
        interface ElementClass { }
        interface IntrinsicElements {
            /*@WebComponent*/
            "opm-media-picker": TsxAllowUnknowProperties<IMediaPickerComponent>
        }
    }
}