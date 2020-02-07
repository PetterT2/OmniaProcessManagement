import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './ContentBlock.css';
import { ContentBlockStyles } from '../../models';
import { ContentBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { ContentBlockData, ProcessReferenceData } from '../../fx/models';
import { CurrentProcessStore } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class ContentBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof ContentBlockStyles | any;

    @Localize(ContentBlockLocalization.namespace) loc: ContentBlockLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ContentBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: ContentBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    content: string = "";
    contentClasses = StyleFlow.use(ContentBlockStyles, this.styles);

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    init() {
        this.subscriptionHandler = this.settingsService
            .onKeyValueUpdated(this.settingsKey)
            .subscribe(this.setBlockData);

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-content-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: { title: { isMultilingualString: true } }
            });
        });

        this.initContent();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initContent();
        }));
    }

    initContent() {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (currentReferenceData && currentReferenceData.current.processData.content) {
            this.content = this.multilingualStore.getters.stringValue(currentReferenceData.current.processData.content);
        }
    }

    setBlockData(blockData: ContentBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    private hasContentValue() {
        if (!this.content || this.content.trim() == "")
            return false;
        if (this.content === "<p></p>")
            return false;
        return true;
    }

    renderContent(h) {
        return (
            <div domProps-innerHTML={this.content}></div>
        )
    }

    render(h) {
        if (!this.blockData) {
            return (
                <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
            )
        }

        if (!this.hasContentValue()) {
            return (
                <aside>
                    <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                    <wcm-empty-block-view dark={false} icon={"fa fa-font"} text={this.corLoc.Blocks.Content.Title}></wcm-empty-block-view>
                </aside>
            )
        }
        return (
            <aside>
                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                <div class={this.contentClasses.blockPadding(this.blockData.settings.spacing)}>
                    <div key={this.componentUniqueKey}>{this.renderContent(h)}</div>
                </div>
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ContentBlockComponent);
});

