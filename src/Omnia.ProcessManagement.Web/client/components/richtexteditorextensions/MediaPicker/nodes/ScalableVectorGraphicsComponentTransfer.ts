import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsComponentTransfer extends NodeExtension {

    get name() {
        return 'feComponentTransfer'
    }

    get schema() {
        return {
            attrs: {
            },
            atom: true,
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'feComponentTransfer',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['feComponentTransfer', node.attrs, 0],
        } as any
    }

}