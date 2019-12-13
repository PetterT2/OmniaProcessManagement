import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { Inject, ServiceContainer } from '@omnia/fx';
import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes } from './IFabricShape';
import { FabricShape } from './FabricShape';
import { MultilingualString, MultilingualScopes } from '@omnia/fx-models';
import { DrawingShapeDefinition } from '../../models';

export class FabricTextShape extends FabricShapeExtension implements FabricShape {
    private multilingualStore: MultilingualStore;

    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }, title?: MultilingualString) {
        super(definition, isActive, properties);
        this.multilingualStore = ServiceContainer.createInstance(MultilingualStore);
        this.initTextProperties(definition, isActive, title);
    }

    private initTextProperties(definition: DrawingShapeDefinition, isActive: boolean, title?: MultilingualString) {
        if (definition) {
            this.properties["fontSize"] = definition.fontSize;
            this.properties["fill"] = isActive ? definition.activeTextColor : definition.textColor;
            this.properties["textAlign"] = 'center';
            this.properties["fontFamily"] = 'Roboto,Arial,sans-serif';
        }
        this.properties["hoverCursor"] = "default";
        let text = "Sample Text";
        let languageSetting = this.multilingualStore.getters.languageSetting(MultilingualScopes.BusinessProfile);
        if (languageSetting && title) {
            text = this.multilingualStore.getters.stringValue(title);
        }
        this.fabricObject = new fabric.Text(text, this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.text;
    }
}