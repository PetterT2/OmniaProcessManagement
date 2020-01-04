import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.MediaPicker, "opm.mediapicker")
    .registerWebComponent({
        elementName: "opm-media-picker",
        entryPoint: "./MediaPicker.jsx",
        typings: ["./IMediaPicker.ts"]
    });


