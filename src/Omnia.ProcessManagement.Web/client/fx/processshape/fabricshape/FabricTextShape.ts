import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { Inject, ServiceContainer, Utils } from '@omnia/fx';
import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeDataTypes } from './FabricShapeData';
import { FabricShape } from './FabricShape';
import { MultilingualString, MultilingualScopes } from '@omnia/fx-models';
import { DrawingShapeDefinition, TextAlignment } from '../../models';

export class FabricTextShape extends FabricShapeExtension implements FabricShape {
    private multilingualStore: MultilingualStore;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }, title?: MultilingualString | string) {
        super(definition, properties);
        this.multilingualStore = ServiceContainer.createInstance(MultilingualStore);
        this.initTextProperties(definition, title);
    }

    private initTextProperties(definition: DrawingShapeDefinition, title?: MultilingualString | string, hoverCursor: string = "pointer") {
        if (definition) {
            this.properties["fontSize"] = definition.fontSize;
            this.properties["fill"] = definition.textColor;
            this.properties["textAlign"] = 'center';
            this.properties["fontFamily"] = 'Roboto,Arial,sans-serif';
            this.properties["fontWeight"] = 'normal';
            this.properties['strokeWidth'] = 0;
        }
        this.properties["hoverCursor"] = hoverCursor;

        this.fabricObject = new fabric.Text(this.getTextString(title), this.properties);
    }

    private getTextString(title: string | MultilingualString) {
        let text = "Sample Text";
        if (typeof (title) == 'string') {
            if (!Utils.isNullOrEmpty(title))
                text = title as string;
        }
        else {
            let languageSetting = this.multilingualStore.getters.languageSetting(MultilingualScopes.BusinessProfile);
            if (languageSetting && title) {
                text = this.multilingualStore.getters.stringValue(title as MultilingualString);
            }
        }
        return text;
    }

    updateDefinition(definition: DrawingShapeDefinition, properties: { [k: string]: any; }, title?: string | MultilingualString) {
        properties["text"] = this.getTextString(title);
        properties["fontSize"] = definition.fontSize;
        properties["fill"] = definition.textColor;
        properties["textAlign"] = definition.textAlignment;
        this.fabricObject.set(properties);
    }

    get fabricShapeDataType() {
        return FabricShapeDataTypes.text;
    }
}