import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes, IFabricShape } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';
import { SimplifyPath } from '../shapes/SimplifyPath';

export class FabricPathShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }, notSimplify?: boolean) {
        super(definition, properties);
        this.fabricObject = new fabric.Path(!notSimplify ? this.getSimplifyPaths(this.properties['path']) : this.properties['path'], this.properties);
    }

    private getSimplifyPaths(path: Array<any>) {
        if (path) {
            if (path.length < 20)
                return path;
            let newPath: Array<any> = [];
            let simplifyPath: SimplifyPath = new SimplifyPath();
            let points: Array<{ x: number, y: number }> = [];
            path.forEach(p => {
                points.push({ x: p[1], y: p[2] });
                if (p.length > 4)
                    points.push({ x: p[3], y: p[4] });
            })
            points = simplifyPath.simplify(points, 1, true);
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

    scalePointsToDefinition(scaleX: number, scaleY: number) {
        let matrix = [scaleX, 0, 0, scaleY, 0, 0];
        let newPath: Array<any> = [];
        let points: Array<fabric.Point> = [];
        let path = (this.fabricObject as fabric.Path).path;
        path.forEach(p => {
            points.push(new fabric.Point(p[1], p[2]));
            if ((p as any).length > 4)
                points.push(new fabric.Point(p[3], p[4]));
        })
        points = points.map(p => { return fabric.util.transformPoint(p, matrix); })
        newPath.push([path[0][0], points[0].x, points[0].y]);
        for (var i = 1; i < points.length - 2; i++) {
            newPath.push(['Q', points[i].x, points[i].y, points[i + 1].x, points[i + 1].y]);
        }
        newPath.push([path[path.length - 1][0], points[points.length - 1].x, points[points.length - 1].y]);
        (this.fabricObject as fabric.Path).path = newPath;

        let position = fabric.util.transformPoint(new fabric.Point(this.fabricObject.left, this.fabricObject.top), matrix);
        this.fabricObject.left = position.x;
        this.fabricObject.top = position.y;
    }
}