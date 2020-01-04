import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsFuncB extends NodeExtension {

    get name() {
        return 'feFuncB'
    }

    get schema() {
        return {
            attrs: {
                type: {
                    default: null
                },
                slope: {
                    default: null
                },
                intercept: {
                    default: null
                }
            },
            atom: true,
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'feFuncB',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['feFuncB', node.attrs, 0],
        } as any
    }

}