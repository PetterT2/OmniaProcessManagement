import MediaPickerToolbar from './MediaPickerToolbar';
import MediaPickerNode from "./nodes/MediaPickerNode";
import ScalableVectorGraphics from "./nodes/ScalableVectorGraphics";
import ScalableVectorGraphicsDefinition from "./nodes/ScalableVectorGraphicsDefinition";
import ScalableVectorGraphicsImage from './nodes/ScalableVectorGraphicsImage';
import ScalableVectorGraphicsFilter from './nodes/ScalableVectorGraphicsFilter';
import ScalableVectorGraphicsColorMatrix from './nodes/ScalableVectorGraphicsColorMatrix';
import ScalableVectorGraphicsComponentTransfer from './nodes/ScalableVectorGraphicsComponentTransfer';
import ScalableVectorGraphicsFuncR from './nodes/ScalableVectorGraphicsFuncR';
import ScalableVectorGraphicsFuncG from './nodes/ScalableVectorGraphicsFuncG';
import ScalableVectorGraphicsFuncB from './nodes/ScalableVectorGraphicsFuncB';
import { RichTextEditorExtension, ToolbarConfiguration, RichTextEditorExtensionDefinition } from '@omnia/fx/ux';
import { MediaPickerEditorExtensionConfiguration } from '../../../fx/models';


export class MediaPickerEditorExtension implements RichTextEditorExtension {
    configuration: Array<ToolbarConfiguration> = [];

    public constructor(config: MediaPickerEditorExtensionConfiguration) {
        this.configuration = [{
            toolbar: MediaPickerToolbar,
            configuration: config
        }];
    }

    getDefition(): RichTextEditorExtensionDefinition {
        let def: RichTextEditorExtensionDefinition = {
            Nodes: [new MediaPickerNode(),
                new ScalableVectorGraphics(),
                new ScalableVectorGraphicsDefinition(),
                new ScalableVectorGraphicsImage(),
                new ScalableVectorGraphicsFilter(),
                new ScalableVectorGraphicsColorMatrix(),
                new ScalableVectorGraphicsComponentTransfer(),
                new ScalableVectorGraphicsFuncR(),
                new ScalableVectorGraphicsFuncG(),
                new ScalableVectorGraphicsFuncB(),
            ],
            ToolbarItems: this.configuration
        }
        return def;
    }
}
