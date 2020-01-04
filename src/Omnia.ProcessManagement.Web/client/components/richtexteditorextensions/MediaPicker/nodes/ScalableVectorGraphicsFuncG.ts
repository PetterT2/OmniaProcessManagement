import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsFuncG extends NodeExtension {

    get name() {
        return 'feFuncG'
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
                tag: 'feFuncG',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['feFuncG', node.attrs, 0],
        } as any
    }

}