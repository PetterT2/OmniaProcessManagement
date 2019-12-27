import * as tsx from 'vue-tsx-support';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import { Inject } from '@omnia/fx';
import 'vue-tsx-support/enable-check';
import { Guid } from '@omnia/fx-models';
import { DisplayBreakPointFactory } from '../factory/BreakPointFactory';
import { DisplayBreakPoint, ProcessDesignerUrlParameters } from '../../models/processdesigner';
import { DevicePreviewerStyles } from './DevicePreviewer.css';
import { OmniaTheming } from '@omnia/fx/ux';
import { CurrentProcessStore } from '../../fx/stores';
import { ProcessDesignerStore } from '../stores';

export interface DevicePreviewerProps {
}

@Component
export default class DevicePreviewerComponent extends tsx.Component<DevicePreviewerProps>
{
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    private iFrameId = Guid.newGuid().toString();
    private model = {
        currentDisplayBreakPoint: DisplayBreakPointFactory.breakPoints()[DisplayBreakPointFactory.breakPoints().length - 1],
        iFrame: {
            element: null,
            height: window.innerHeight + "px"
        }
    }

    public mounted() {
        document.body.className += "  opm-processdesigner-preview-mode";
    }

    beforeDestroy() {
        document.body.className = document.body.className.replace(/opm-processdesigner-preview-mode/g, "");
    }

    private createIframeUrl() {
        var currentProcess = this.currentProcessStore.getters.referenceData();
        var previewPageUrl = this.currentProcessStore.getters.previewPageUrl();
        let url = previewPageUrl + "?" + ProcessDesignerUrlParameters.previewMode + "=true";
        if (currentProcess) {
            url += `&${ProcessDesignerUrlParameters.processId}=${currentProcess.process.id}`;
        }
        return url;
    }

    private onSetDevice(displayBreakPoint: DisplayBreakPoint) {
        this.model.currentDisplayBreakPoint = displayBreakPoint;
    }

    private resizeIframeToContent() {
        if (!this.model.iFrame.element) {
            this.model.iFrame.element = document.getElementById(this.iFrameId) as HTMLIFrameElement;
        }
        let window = (this.model.iFrame.element as HTMLIFrameElement).contentWindow;
        let height = Math.max(window.document.body.scrollHeight, window.document.body.offsetHeight, window.document.documentElement.clientHeight, window.document.documentElement.scrollHeight, window.document.documentElement.offsetHeight);
        this.model.iFrame.height = height + "px";
    }

    /**
     * Gets the initial active class for the items. It is not working setting v-bottom-nav component directly somehow. 
     * @param editorMode
     */
    public getActiveClass(displayBreakPoint: DisplayBreakPoint) {
        if (displayBreakPoint.id === this.model.currentDisplayBreakPoint.id) {
            return "v-btn--active"
        }
        return "";
    }

    public renderDisplayBreakPoints(h) {
        let result: Array<JSX.Element> = []
        let breakPointsArray = DisplayBreakPointFactory.breakPoints();
        /* To get the corret display ordering*/
        for (let i = breakPointsArray.length - 1; i >= 0; i--) {
            result.push(
                <v-btn icon onClick={() => this.onSetDevice(breakPointsArray[i])} class={this.getActiveClass(breakPointsArray[i])}>
                    <v-icon small >{breakPointsArray[i].icon}</v-icon>
                </v-btn>
            )
        }
        return result;
    }


    /**
     * Render 
     * @param h
     */
    public render(h) {
        window.setTimeout(this.resizeIframeToContent, 700);
        return <v-content column>
            <v-layout align-center column class={DevicePreviewerStyles.fullScreen}>
                <div class={DevicePreviewerStyles.deviceToolbarWrapper}>
                    <v-toolbar
                        flat
                        dense
                        class={DevicePreviewerStyles.deviceToolbar}>
                        {this.renderDisplayBreakPoints(h)}
                    </v-toolbar>
                </div>
                <div class={DevicePreviewerStyles.deviceWrapper(this.model.currentDisplayBreakPoint, this.model.iFrame.height)}>
                    <iframe id={this.iFrameId} src={this.createIframeUrl()} scrolling="no" height={this.model.iFrame.height} sandbox="allow-same-origin allow-scripts" class={DevicePreviewerStyles.iFrame}></iframe>
                </div>
            </v-layout>
        </v-content>
    }
}

