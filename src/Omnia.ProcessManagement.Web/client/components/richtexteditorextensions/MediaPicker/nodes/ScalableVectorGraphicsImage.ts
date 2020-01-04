import { Node, Plugin } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';

export default class ScalableVectorGraphicsImage extends NodeExtension {

    get name() {
        return 'svgimage'
    }

    get schema() {
        return {
            isLeaf: true,
            attrs: {
                "xlink:href": {
                    default: null
                },
                "href": {
                    default: null
                },
                xmlns: {
                    default: "http://www.w3.org/2000/svg"
                },
                x: {
                    default: "0%"
                },
                y: {
                    default: "0%"
                },
                width: {
                    default: "100%"
                },
                height: {
                    default: "100%"
                },
                preserveAspectRatio: {
                    default: "xMidYMid slice"
                },
                alt: {
                    default: ""
                },
                filter: {
                    default: null
                }
            },
            group: 'block',
            draggable: false,
            selectable: true,
            parseDOM: [{
                tag: 'image',
                getAttrs: dom => {
                    let allowed = {};
                    for (var i = 0; i < dom.attributes.length; i++) {
                        var attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;
                }
            }],
            toDOM: node => ['image', node.attrs],
        } as any;
    }
    //get plugins() {
    //    return [
    //        new Plugin({
    //            props: {
    //                //handleClickOn(view, pos, node, nodePos, event, direct) {
    //                //    if (node.attrs && node.attrs["omfxmpc"]) {
    //                //        //let resolvedPos = view.state.doc.resolve(pos);  
    //                //        //view.state.tr.replaceSelectionWith(node);
    //                //        //view.state.tr.setSelection(new NodeSelection(resolvedPos))
    //                //        //console.log(node.attrs, direct);
    //                //    }
    //                //},
    //                //setSelection() {
    //                //    console.log("set selection Image", this);
    //                //},
    //                //selectNode() {
    //                //    console.log("select node Image", this);
    //                //},
    //                //deselectNode() {
    //                //    console.log("deselect node Image", this);
    //                //}
    //            },
    //        }),
    //    ]
    //}
}