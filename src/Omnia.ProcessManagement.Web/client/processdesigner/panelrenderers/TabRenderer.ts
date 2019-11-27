
import { ITabRenderer } from '../../models/processdesigner';

export abstract class TabRenderer implements ITabRenderer {
    private element: JSX.Element;
    getElement(h): JSX.Element {
        if (!this.element) {
            this.element = this.generateElement(h)
        }
        return this.element;
    }
    protected abstract generateElement(h);
}