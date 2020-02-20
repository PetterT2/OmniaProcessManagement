import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { classes, style } from "typestyle";

import { WorkPlaceUtils } from '@omnia/workplace';
import { OmniaTheming, StyleFlow, VueComponentBase } from "@omnia/fx/ux";
import { vueCustomElement, Topics, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Console, HttpClient, OmniaContext, Utils } from '@omnia/fx';
import { ISearchTemplate, SearchResultItem } from '@omnia/workplace/models';

import { SearchTemplateProcessStyles } from '../../models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import './ProcessSearchTemplate.css';
import { ProcessActionModel } from '../../fx/models';
import { Guid } from '@omnia/fx-models';
import { setTimeout } from 'timers';


interface ProcessItem {
    title?: string;
    person?: string;
    date?: string;
    previewIframeUrl?: string;
}

@Component
export class ProcessSearchTemplate extends VueComponentBase implements IWebComponentInstance, ISearchTemplate {
    @Prop() dataRow: SearchResultItem;

    @Localize(OPMCoreLocalization.namespace) loc: OPMCoreLocalization.locInterface;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(OmniaContext) private omniaCtx: OmniaContext;

    cssClasses = StyleFlow.use(SearchTemplateProcessStyles);
    isExpandPreview: boolean = false;
    isIframeLoaded: boolean = false;
    processItem: ProcessItem = null;
    containerWitdh: number = null;

    created() {
        this.getProcessItem();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    @Watch("dataRow", { deep: true })
    getProcessItem() {
        let processData = this.dataRow.customPropertiesResult["OPMProcessDataOWSMTXT"];
        let processActionModel: ProcessActionModel = processData ? JSON.parse(processData) : null;
        let url = this.getPreviewUrl(processActionModel);
        this.processItem =
        {
            title: this.dataRow.customPropertiesResult["Title"],
            person: this.dataRow.customPropertiesResult["Person"],
            date: this.dataRow.customPropertiesResult["Date"],
            previewIframeUrl: `${url}?preview=true`
        }
    }

    getPreviewUrl(processActionModel: ProcessActionModel) {
        return location.protocol + '//' + location.host + location.pathname + `/@pm/${processActionModel.process.rootProcessStep.id}/g`;
    }

    getDateStr(strValue) {
        let dateStr = '';
        if (strValue) {
            let datePropTime: Date = new Date(strValue);

            if (datePropTime.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) // today
            {
                datePropTime = new Date(strValue);
                let now = new Date();
                if (datePropTime.getTime() > now.getTime())
                    datePropTime = now;
            }

            dateStr = Utils.getSocialDate(datePropTime.toUTCString(), this.omniaCtx.language);
        }

        return dateStr;
    }


    getImageSize(totalFlexNumber: number) {
        return Math.ceil(totalFlexNumber / 12) * 25;
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    render(h) {
        let totalFlexNumber: { value: number } = { value: 12 };
        let rows = this.renderRow(h, 12, totalFlexNumber, this.processItem.person, this.getDateStr(this.processItem.date));

        return (
            <div ref={"templateDiv"}>
                <v-card dark={this.omniaTheming.promoted.body.dark} flat class={this.cssClasses.container}>
                    <v-row dense no-gutters>
                        <v-col cols="12" class={[this.cssClasses.contentWapper]}>
                            <div class={[this.cssClasses.image()]}>
                                {this.renderImage(h, totalFlexNumber.value)}
                            </div>
                            <div class={[this.cssClasses.content]}>
                                <v-row dense no-gutters>
                                    <v-col cols="12">
                                        <a
                                            class={this.cssClasses.title(this.omniaTheming.promoted.body.text.base)}
                                            href={this.processItem.previewIframeUrl}
                                            target="_blank"
                                            domProps-innerHTML={this.processItem.title}>
                                        </a>
                                    </v-col>
                                    {rows}
                                </v-row>
                            </div>
                            {!this.isExpandPreview && this.processItem.previewIframeUrl &&
                                <v-tooltip left {
                                    ...this.transformVSlot({
                                        activator: (ref) => {
                                            const toSpread = {
                                                on: ref.on
                                            }
                                            return [
                                                <v-btn text icon
                                                    class={["btn-block", this.cssClasses.expandButton]}
                                                    {...toSpread}
                                                    onClick={() => { this.isExpandPreview = true }}>
                                                    <v-icon small>fal fa-expand-alt</v-icon>
                                                </v-btn>
                                            ]
                                        }
                                    })}>
                                    <span>{this.loc.SearchTemplates.ProcessSearchTemplate.Preview}</span>
                                </v-tooltip>
                            }
                        </v-col>
                    </v-row>
                    {
                        this.processItem.previewIframeUrl && this.isExpandPreview &&
                        [
                            <v-row dense no-gutters v-show={this.isIframeLoaded} class={this.cssClasses.previewBlock}>
                                {this.renderPreviewIframe(h, this.processItem.previewIframeUrl)}
                            </v-row>,
                            <div class={this.cssClasses.collapsePreviewButtonContainer}>
                                <v-tooltip top {
                                    ...this.transformVSlot({
                                        activator: (ref) => {
                                            const toSpread = {
                                                on: ref.on
                                            }
                                            return [
                                                <v-btn
                                                    {...toSpread}
                                                    text
                                                    icon
                                                    class={[this.cssClasses.collapsePreviewButton, "btn-block"]}
                                                    onClick={() => { this.isExpandPreview = false }}>
                                                    <v-icon small>fal fa-chevron-up</v-icon>
                                                </v-btn>
                                            ]
                                        }
                                    })}>
                                    <span>{this.loc.SearchTemplates.ProcessSearchTemplate.ClosePreview}</span>
                                </v-tooltip>
                            </div>
                        ]
                    }
                </v-card>
            </div>)
    }


    renderRow(h, flexNumber: number, totalFlexNumber: { value: number }, propertyData1: string, propertyData2: string) {
        let haveProperty1 = !Utils.isNullOrEmpty(propertyData1);
        let haveProperty2 = !Utils.isNullOrEmpty(propertyData2);

        if (haveProperty1 || haveProperty2) {
            totalFlexNumber.value += flexNumber;

            return (
                <v-flex class={["xs" + flexNumber, this.cssClasses.longContent]}>
                    {haveProperty1 && <span class={this.cssClasses.trimTextBox}>{propertyData1}</span>}
                    {haveProperty1 && haveProperty2 && ", "}
                    {haveProperty2 && <span class={this.cssClasses.trimTextBox}>{propertyData2}</span>}
                </v-flex>)
        }
        else
            return null;
    }

    renderPreviewIframe(h, src) {
        if (this.isExpandPreview || this.isIframeLoaded) {
            this.isIframeLoaded = true;
            this.containerWitdh = (this.$refs.templateDiv as Element).clientWidth;

            return (
                <v-col class={[this.cssClasses.previewWapper(this.containerWitdh), "elevation-3"]}>
                    <iframe class={this.cssClasses.previewIframe(this.containerWitdh)} src={src}></iframe>
                </v-col>);
        }
        else
            return null;
    }

    renderImage(h, totalFlexNumber: number) {
        let imageSize: number = this.getImageSize(totalFlexNumber)

        return <v-icon dark={this.omniaTheming.promoted.body.dark} size={imageSize}>far fa-angle-double-right</v-icon>;
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessSearchTemplate);
});
