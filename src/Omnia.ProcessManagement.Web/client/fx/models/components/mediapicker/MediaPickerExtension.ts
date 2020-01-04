import { MediaPickerImageTransformerProviderResult } from '@omnia/fx/ux';
import { MediaPickerVideoProviderResult, EditorCommand, EditorMenuBar, ToolbarProperties } from '@omnia/fx-models';

export interface MediaPickerCommand extends EditorCommand {
    mediaPicker?: (html: string) => void;
}

export interface MediaPickerMenuBar extends EditorMenuBar<MediaPickerCommand> {

}

export interface MediaPickerToolbarProperties extends ToolbarProperties<MediaPickerCommand> {
    onMediaPickerSave: (image: MediaPickerImageTransformerProviderResult, dispatchHandler: (eleString: string, type: "image") => void) => void;
    onVideoPickerSave: (video: MediaPickerVideoProviderResult, dispatchHandler: (eleString: string, type: "video") => void) => void;
}

export interface MediaPickerEditorExtensionConfiguration extends MediaPickerToolbarProperties {

}
