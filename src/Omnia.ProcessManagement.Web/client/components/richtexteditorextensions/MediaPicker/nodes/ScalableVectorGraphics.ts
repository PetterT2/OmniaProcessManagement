import { Node, Plugin } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';
export default class ScalableVectorGraphics extends NodeExtension {

    get name() {
        return 'scalablevectorgraphics'
    }
    
    get schema() {
        return {
            attrs: {
                "xmlns:xlink": {
                    default: "http://www.w3.org/1999/xlink"
                },
                viewBox: {
                    default: "0 0 150 100"
                },
                id: {
                    default: "16a2b11690b"
                },
                xmlns: {
                    default: "http://www.w3.org/2000/svg"
                },
                style: {
                    default: "position: absolute; top: 0; left: 0; width: 100%;"
                },
                class: {
                    default: null
                }
            },
            content: 'block*',
            group: 'block',
            draggable: false,
            parseDOM: [{
                tag: 'svg',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['svg', node.attrs, 0],
        } as any
    } 

    //setSelection() {
    //    console.log("set selection SVG", this);
    //}
    //selectNode() {
    //    console.log("select node SVG", this);
    //}
    //deselectNode() {
    //    console.log("deselect node SVG", this);
    //}
}