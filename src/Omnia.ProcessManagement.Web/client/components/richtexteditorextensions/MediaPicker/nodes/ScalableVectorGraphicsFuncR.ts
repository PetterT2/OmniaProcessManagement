import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsFuncR extends NodeExtension {

    get name() {
        return 'feFuncR'
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
                tag: 'feFuncR',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['feFuncR', node.attrs, 0],
        } as any
    }

}