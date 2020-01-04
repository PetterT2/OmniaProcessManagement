import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsFilter extends NodeExtension {

    get name() {
        return 'svgfilter'
    }

    get schema() {
        return {
            attrs: {
                xmlns: {
                    default: "http://www.w3.org/2000/svg"
                },
                id: {
                    default: null
                }
            },
            atom: true,
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'filter',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['filter', node.attrs, 0],
        } as any
    }

}