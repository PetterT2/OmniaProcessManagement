import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { TitleBlockData, ProcessReferenceData, Enums } from '../../fx/models';
import { CurrentProcessStore } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';

@Component
export class TitleBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    //@Prop() styles: typeof TitleBlockStyles | any;

    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<TitleBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    blockData: TitleBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    content: string = "";

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

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-title-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: {
                    title: { isMultilingualString: true },
                    formatting: Enums.ProcessViewEnums.HeadingFormatting.Heading1
                }
            });
        });

        this.initContent();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initContent();
        }));
    }

    initContent() {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (currentReferenceData && currentReferenceData.current.processStep.title) {
            this.content = this.multilingualStore.getters.stringValue(currentReferenceData.current.processStep.title);
        }
    }

    setBlockData(blockData: TitleBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    private hasContentValue() {
        if (!this.content || this.content.trim() == "")
            return false;
        return true;
    }

    renderContent(h) {
        let result: JSX.Element = null;
        switch (this.blockData.settings.formatting) {
            case Enums.ProcessViewEnums.HeadingFormatting.Normal:
                result = <div>{this.content}</div>;
                break;
            case Enums.ProcessViewEnums.HeadingFormatting.Heading1:
                result = <h1>{this.content}</h1>;
                break;
            case Enums.ProcessViewEnums.HeadingFormatting.Heading2:
                result = <h2>{this.content}</h2>;
                break;
            case Enums.ProcessViewEnums.HeadingFormatting.Heading3:
                result = <h3>{this.content}</h3>;
                break;
        }
        return result;
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
                    <wcm-empty-block-view dark={false} icon={"fa fa-font"} text={this.corLoc.BlockDefinitions.Title.Title}></wcm-empty-block-view>
                </aside>
            )
        }
        return (
            <aside>
                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                {this.renderContent(h)}
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, TitleBlockComponent);
});

