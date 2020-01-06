import { Node, Plugin, NodeSelection, TextSelection } from 'tiptap'
import { NodeExtension } from '@omnia/fx/ux';
import { Utils } from '@omnia/fx';

export default class MediaPicker extends NodeExtension {

    static content: { [key: string]: MediaPickerHtml; } = {};

    get name() {
        return 'mediaPicker'
    }

    get schema() {
        return {
            attrs: {
                style: {
                    default: null
                },
                omfxmpc: {
                    default: ""
                },
                contenteditable: {
                    default: "false"
                },
                id: {
                    default: null
                },
                class: {
                    default: null
                }
            },
            content: 'block*',
            group: 'block',
            isolating: true,
            draggable: false,
            atom: true, 
            //selectable: true, 
            parseDOM: [{
                tag: 'div[omfxmpc]',
                getAttrs: dom => {
                    //Get the unique id of the svg
                    let elId = "";
                    let elType: "image" | "video" = "image";
                    let svgElements = dom.getElementsByTagName("svg");
                    if (svgElements.length > 0) {
                        //Media Picker Image
                        elId = svgElements[0].getAttribute("id");
                    }
                    else {
                        //Video Iframe
                        if (!dom.hasAttribute("id")) {
                            dom.setAttribute("id", Math.random().toString(36).substr(2, 9))
                        }
                        elType = "video";
                        elId = dom.getAttribute("id")
                    }

                    MediaPicker.content[elId] = {
                        target: elType,
                        html: dom.innerHTML
                    };

                    let allowed = {};
                    for (let i = 0; i < dom.attributes.length; i++) {
                        let attrib = dom.attributes[i];
                        allowed[attrib.name] = attrib.value
                    }
                    return allowed;

                    //let svgElements = dom.getElementsByTagName("svg");
                    //if (svgElements.length === 0) {
                    //    if (!dom.hasAttribute("id")) {
                    //        dom.setAttribute("id", Math.random().toString(36).substr(2, 9))
                    //    }
                    //}

                    //let allowed = {};
                    //for (let i = 0; i < dom.attributes.length; i++) {
                    //    let attrib = dom.attributes[i];
                    //    allowed[attrib.name] = attrib.value
                    //}
                    //return allowed;
                }
            }],
            toDOM: node => ['div', node.attrs, 0],

        } as any
    }

    commands({ type }) {
        return html => (state, dispatch) => {
            let { selection } = state
            let position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos

            let domNode = document.createElement("div");
            domNode.innerHTML = html;

            let node = state.config.schema.cached.domParser.parse(domNode);

            let transaction = state.tr.insert(position, node)
            dispatch(transaction)
        }
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
            methods: {
                handleDelete() {
                    let tr = this.view.state.tr;
                    let resolvedPos = tr.doc.resolve(this.getPos());
                    let nodeSelection = new NodeSelection(resolvedPos);
                    // ignore set selection in Egde becuase have issue flicking
                    if (!isEdgeBrowser()){
                        this.view.dispatch(
                            tr.setSelection(nodeSelection)
                        );

                        this.view.focus();
                    }
                    // need to async to make current transaction complete
                    window.setTimeout(() => {
                        this.view.dispatch(
                            tr.deleteRange(nodeSelection.$from.pos, nodeSelection.$to.pos)
                        );
                    }, 0);

                },
            },
            computed: { 
                content: {
                    get() {
                        if (this.node.__mediapickernodedata) {
                            return this.node.__mediapickernodedata;
                        }
                        return MediaPicker.content[this.id];
                    }
                },
                id: {
                    get() {
                        return this.node.attrs.id || this.node.firstChild.attrs.id
                    }
                }
            },
            created: function () {
                if (!this.node.__mediapickernodedata) {
                    this.node.__mediapickernodedata = this.content;
                    // clean up mediapicker data
                    MediaPicker.content[this.id] = undefined
                }
            },
            beforeDestroy: function () { // we will append media picker data to node view to prevent issue with undo on menu.
            },
            props: ['node', 'updateAttrs', 'view', 'getPos'],
            //omfxmpc
            //template: `<div><button class="removemediapicker" v-on:click="handleDelete">Greet</button><div v-if="content.target === 'image'" omfxmpc="image" :style="node.attrs.style" v-html="content.html"></div></div>
            //           <div v-else omfxmpc="video" :style="node.attrs.style" v-html="content.html" ></div>
            //          `
            template: `<div style="position:relative;">
                            <div v-if="content.target === 'image'" omfxmpc="image" :style="node.attrs.style" v-html="content.html"></div>
                            <v-btn
                                style="position:absolute; left:0; top:0; z-index:1;"
                                class="ml-0"
                                dark
                                small
                                depressed
                                fab
                                color="rgba(0,0,0,0.5)"
                                v-on:click="handleDelete">
                                <v-icon>delete</v-icon>
                            </v-btn>
                            <div v-if="content.target === 'video'" omfxmpc="video" :style="node.attrs.style" v-html="content.html"></div>
                        </div>
                      `

        } as any
    }
}

function isEdgeBrowser() {
    if (typeof navigator != "undefined" && typeof document != "undefined") {
        return !Utils.isNullOrEmpty(/Edge\/(\d+)/.exec(navigator.userAgent));
    }
    return false;
}

interface MediaPickerHtml {
    target: "image" | "video";
    html: string
}