import { Node } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsDefinition extends NodeExtension {

    get name() {
        return 'defs'
    }

    get schema() {
        return {
            attrs: {
                xmlns: {
                    default: "http://www.w3.org/2000/svg"
                }
            },
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'defs',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['defs', node.attrs, 0],
        } as any
    }

    // return a vue component
    // this can be an object or an imported component 
    get view() {
        return {
            // there are some props available
            // `node` is a Prosemirror Node Object
            // `updateAttrs` is a function to update attributes defined in `schema`
            // `editable` is the global editor prop whether the content can be edited
            // `options` is an array of your extension options
            // `selected`
            props: ['node', 'updateAttrs', 'editable'],
            template: `<defs xmlns="http://www.w3.org/2000/svg"></defs>`,
        } as any
    }
}