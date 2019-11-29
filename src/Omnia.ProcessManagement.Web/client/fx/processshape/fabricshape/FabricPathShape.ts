import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';
import { SimplifyPath } from '../shapes/SimplifyPath';

export class FabricPathShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        this.fabricObject = new fabric.Path(this.getSimplifyPaths(this.properties['path']), this.properties);
    }

    private getSimplifyPaths(path: Array<any>) {
        if (path) {
            let newPath: Array<any> = [];
            let simplifyPath: SimplifyPath = new SimplifyPath();
            let points: Array<{ x: number, y: number }> = [];
            path.forEach(p => {
                points.push({ x: p[1], y: p[2] });
                if (p.length > 4)
                    points.push({ x: p[3], y: p[4] });
            })
            points = simplifyPath.simplify(points, 2, true);
            newPath.push(path[0]);
            for (var i = 1; i < points.length - 2; i++) {
                newPath.push(['Q', points[i].x, points[i].y, points[i + 1].x, points[i + 1].y]);
            }
            newPath.push(path[path.length - 1]);
            return newPath;
        }
        return [];
    }

    protected getSpecificProperties(): { [k: string]: any } {
        let prop = {};
        if (this.fabricObject) {
            let options = this.fabricObject.toJSON();
            prop["path"] = options["path"];
        }
        return prop;
    }

    get shapeNodeType() {
        return FabricShapeTypes.path;
    }
}