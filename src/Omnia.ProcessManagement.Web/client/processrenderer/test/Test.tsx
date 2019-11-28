import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, ServiceContainer, OmniaContext } from "@omnia/fx";
import { IOmniaContext } from '@omnia/fx-models';
import { OPMRouter, CurrentProcessStore } from '../../fx';
import { ViewOptions, Process, ProcessVersionType } from '../../fx/models';

@Component
export class TestComponent extends Vue implements IWebComponentInstance {
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    process: Array<Process> = [
        {
            id: '0E640669-D998-4A2A-9749-54B0B789B8D3',
            opmProcessId: '8A347C21-D9D6-4B50-9D3A-6F9FA6DFC411',
            versionType: ProcessVersionType.Published,
            rootProcessStep: {
                id: '566A7148-C98F-44A6-A21C-E45DDF089D9E',
                enterpriseProperties: {},
                processDataHash: '4CB9AFF9F563FC505CC558B45AE2BCAC',
                processTypeId: null,
                processSteps: [],
                processTemplateId: null,
                title: { "en-us": "Process A", isMultilingualString: true }
            },
            checkedOutBy: null,
            siteId: null,
            webId: null
        },
        {
            id: 'BF05E85B-0F51-4A0C-BADA-A63849EEEABC',
            opmProcessId: '451E4A10-08EE-41FD-AED0-39484D8BCADE',
            versionType: ProcessVersionType.Published,
            rootProcessStep: {
                id: 'C0B223E2-A4FB-433B-88BB-E333AAEAB2E3',
                enterpriseProperties: {},
                processDataHash: '4CB9AFF9F563FC505CC558B45AE2BCAC',
                processTypeId: null,
                processSteps: [],
                processTemplateId: null,
                title: { "en-us": "Process B", isMultilingualString: true }
            },
            checkedOutBy: null,
            siteId: null,
            webId: null
        }
    ]

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }


    render(h) {
        return (
            <div>
                {
                    this.process.map(process => {
                        return (
                            <div>
                                <h2>{process.rootProcessStep.title['en-us']}</h2>
                                <v-btn onClick={() => { OPMRouter.navigate(process, process.rootProcessStep, ViewOptions.viewLatestPublishedInBlock) }}>Show in block view</v-btn>
                                <v-btn onClick={() => { OPMRouter.navigate(process, process.rootProcessStep, ViewOptions.viewLatestPublishedInGlobal) }}>Show in global view</v-btn>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TestComponent);
});

