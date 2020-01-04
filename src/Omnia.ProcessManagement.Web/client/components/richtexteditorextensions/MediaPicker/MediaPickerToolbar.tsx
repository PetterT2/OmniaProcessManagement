import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import {
    DialogPositions, CentralImageLocationProviderComponentRegister, MediaPickerImageTransformerProviderResult, ToolbarExtension, MediaPickerProvider, MediaPickerProviderMediaTypes, OmniaUxLocalizationNamespace, OmniaUxLocalization
} from '@omnia/fx/ux';
import { Localize, OmniaContext, Inject } from '@omnia/fx';
import { BusinessProfileCentralImageLocation, IOmniaContext, MediaPickerVideoProviderResult, MediaPickerImageProviderResult, TipTapEditor } from '@omnia/fx-models';
import { MediaPickerToolbarStyles } from "./MediaPickerToolbar.css";
import { MediaPickerMenuBar, MediaPickerToolbarProperties } from '../../../fx/models';

@Component
export default class MediaPickerToolbar extends ToolbarExtension implements MediaPickerToolbarProperties {
    @Prop() menubar: MediaPickerMenuBar;
    @Prop() onMediaPickerSave: (image: MediaPickerImageTransformerProviderResult, dispatchHandler: (eleString: string, type: "image") => void) => void;
    @Prop() onVideoPickerSave: (video: MediaPickerVideoProviderResult, dispatchHandler: (eleString: string, type: "video") => void) => void;
    @Prop() onContentChanged?: (content: string) => void;
    @Prop() editor: TipTapEditor;

    //service
    @Inject(OmniaContext) private omniaContext: OmniaContext;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------
    dispatchHandler: (eleString: string, type: "video" | "image") => void;
    showAddMedia = false;
    isLoadingCentralImageLocation = false;
    businessProfileCentralImageLocation: BusinessProfileCentralImageLocation = null;
    //private additionalProviders: Array<MediaPickerProvider> = [];
    transformcomp: any = {
        imageRatios: [
            {
                xRatio: 16,
                yRatio: 9,
                ratioDisplayName: 'Landscape'
            },
            {
                xRatio: 1,
                yRatio: 1,
                ratioDisplayName: 'Square',
            },
            {
                xRatio: 2,
                yRatio: 3,
                ratioDisplayName: 'Portrait'
            }
        ],
        model: {
            configuration: {
                cropRatio: {
                    x: 16,
                    y: 9
                }
            }
        }
    };
    private imageTransformElement = {
        elementNameToRender: "omfx-image-transformer",
        elementProps: this.transformcomp
    };

    // -------------------------------------------------------------------------
    // Lifecycle Hook
    // -------------------------------------------------------------------------

    created() {
        this.getCentralImageLocationFromProfile(this.omniaContext);
    }

    mounted() {

    }

    // -------------------------------------------------------------------------
    // Event and Method
    // -------------------------------------------------------------------------

    getCentralImageLocationFromProfile(context: IOmniaContext) {
        //this.additionalProviders = [];
        this.isLoadingCentralImageLocation = true;
        let centralImageLocation = context.businessProfile.propertyBag.getModel(BusinessProfileCentralImageLocation)
        if (centralImageLocation != null) {
            this.businessProfileCentralImageLocation = centralImageLocation;
        }
        this.isLoadingCentralImageLocation = false;
    }

    insertMediaCmd(commands) {
        this.showAddMedia = true;
        this.dispatchHandler = (html: string, type: "video" | "image") => {
            if (type === 'image') {
                commands.mediaPicker(html);
            }
            else {
                let el = document.createElement('div');
                el.innerHTML = html;
                let vc = el.firstChild as HTMLDivElement;
                vc.setAttribute("omfxmpc", "video")
                vc.style.position = "relative";
                commands.mediaPicker(el.innerHTML);
            }
            if (this.onContentChanged) {
                this.onContentChanged(this.editor.getHTML());
            }
        }
    }

    onCloseMediaPicker() {
        this.showAddMedia = false;
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    public render(h) {
        return (
            <span>
                <v-tooltip bottom
                    {...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <v-btn {...toSpread} class="ma-0" icon onClick={() => { this.insertMediaCmd(this.menubar.commands); }}>
                                    <v-icon>insert_photo</v-icon>
                                </v-btn>
                            ]
                        }
                    })}>
                    {
                        /* TODO - localization */
                    }
                    <span>Image</span>
                </v-tooltip>
                {this.showAddMedia ? this.renderMediaLinkDialog() : null}
            </span>
        )
    }

    public renderMediaLinkDialog() {
        let h = this.$createElement;
        let providers: Array<MediaPickerProvider> = []
        if (this.businessProfileCentralImageLocation && this.businessProfileCentralImageLocation.centralImageLocationSettings &&
            this.businessProfileCentralImageLocation.centralImageLocationSettings.length > 0) {
            this.businessProfileCentralImageLocation.centralImageLocationSettings.forEach((setting) => {
                providers.push(CentralImageLocationProviderComponentRegister.create({
                    onSaved: this.onSaveImage,
                    transformComponent: this.imageTransformElement,
                    centralImageLocationSetting: setting
                }));
            })
        }

        return (
            <omfx-dialog contentClass={MediaPickerToolbarStyles.pickerDialog} domProps-lazy={false} onClose={this.onCloseMediaPicker} model={{ visible: this.showAddMedia }} position={DialogPositions.Center}>
                <div class={MediaPickerToolbarStyles.pickerDialogContent}>
                    {this.showAddMedia && <omfx-media-picker
                        providers={providers}
                        domProps-onConfigureProviders={this.onConfigureProviders}
                        onClose={this.onCloseMediaPicker}></omfx-media-picker>}
                </div>
            </omfx-dialog>
        )
    }

    onConfigureProviders(providers: Array<MediaPickerProvider>) {
        providers.map((provider) => {
            let tmpProvider = provider as any
            if (!tmpProvider.onSaved && provider.mediaType === MediaPickerProviderMediaTypes.image) {
                tmpProvider.onSaved = this.onSaveImage;
            } else if (!tmpProvider.onSaved && provider.mediaType === MediaPickerProviderMediaTypes.video) {
                tmpProvider.onSaved = this.onSaveVideo;
            }
            if (provider.mediaType === MediaPickerProviderMediaTypes.image && !tmpProvider.transformComponent) {
                tmpProvider.transformComponent = this.imageTransformElement;
            }
        })
        return providers;
    }

    onSaveImage(data: MediaPickerImageTransformerProviderResult) {
        this.onMediaPickerSave(data, this.dispatchHandler);
    }
    onSaveVideo(data: MediaPickerVideoProviderResult) {
        this.onVideoPickerSave(data, this.dispatchHandler);
    }
}