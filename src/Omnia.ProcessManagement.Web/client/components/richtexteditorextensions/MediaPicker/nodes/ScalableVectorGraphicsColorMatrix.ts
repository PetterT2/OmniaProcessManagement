import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsColorMatrix extends NodeExtension {

    get name() {
        return 'feColorMatrix'
    }

    get schema() {
        return {
            attrs: {
                type: {
                    default: null
                },
                values: {
                    default: null
                }
            },
            atom: true,
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'feColorMatrix',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['feColorMatrix', node.attrs, 0],
        } as any
    }

}