﻿import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { Inject, ServiceContainer } from '@omnia/fx';
import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes } from './IFabricShape';
import { FabricShape } from './FabricShape';
import { MultilingualString, MultilingualScopes } from '@omnia/fx-models';
import { DrawingShapeDefinition } from '../../models';

export class FabricTextShape extends FabricShapeExtension implements FabricShape {
    private multilingualStore: MultilingualStore;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }, title?: MultilingualString | string) {
        super(definition, properties);
        this.multilingualStore = ServiceContainer.createInstance(MultilingualStore);
        this.initTextProperties(definition, title);
    }

    private initTextProperties(definition: DrawingShapeDefinition, title?: MultilingualString | string) {
        if (definition) {
            this.properties["fontSize"] = definition.fontSize;
            this.properties["fill"] = definition.textColor;
            this.properties["textAlign"] = 'center';
            this.properties["fontFamily"] = 'Roboto,Arial,sans-serif';
            this.properties["fontWeight"] = 'normal';
            this.properties['strokeWidth'] = 0;
        }
        this.properties["hoverCursor"] = "default";
        let text = "Sample Text";
        if (typeof (title) == 'string')
            text = title as string;
        else {
            let languageSetting = this.multilingualStore.getters.languageSetting(MultilingualScopes.BusinessProfile);
            if (languageSetting && title) {
                text = this.multilingualStore.getters.stringValue(title as MultilingualString);
            }
        }
        this.fabricObject = new fabric.Text(text, this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.text;
    }
}