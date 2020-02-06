import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { IMessageBusSubscriptionHandler, GuidValue } from '@omnia/fx/models';
import './LinksBlock.css';
import { LinksBlockStyles } from '../../models';
import { LinksBlockLocalization } from './loc/localize';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { StyleFlow, VueComponentBase } from '@omnia/fx/ux';
import { LinksBlockData, ProcessReferenceData, Link, Enums, RouteOptions } from '../../fx/models';
import { CurrentProcessStore, OPMRouter } from '../../fx';
import { MultilingualStore } from '@omnia/fx/store';
import { classes } from 'typestyle';

@Component
export class LinksBlockComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() settingsKey: string;
    @Prop() styles: typeof LinksBlockStyles | any;

    @Localize(LinksBlockLocalization.namespace) loc: LinksBlockLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) corLoc: OPMCoreLocalization.locInterface;

    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<LinksBlockData>;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(CurrentProcessStore) private currentProcessStore: CurrentProcessStore;
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    componentUniqueKey: string = Utils.generateGuid();
    blockData: LinksBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    links: Array<Link> = [];
    linksClasses = StyleFlow.use(LinksBlockStyles, this.styles);
    target: string;

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

        this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-links-block-settings");
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            this.setBlockData(blockData || {
                data: {},
                settings: { title: { isMultilingualString: true } }
            });
        });
        this.initLinks();
        this.subscriptionHandler.add(this.currentProcessStore.getters.onCurrentProcessReferenceDataMutated()((args) => {
            this.initLinks();
        }));
        if (OPMRouter.routeContext && OPMRouter.routeContext.route) {
            let preview = OPMRouter.routeContext.route.routeOption == RouteOptions.previewInBlockRenderer ||
                OPMRouter.routeContext.route.routeOption == RouteOptions.previewInGlobalRenderer ? true : false;
            this.target = preview ? "_parent" : "";
        }
    }

    initLinks() {
        this.links = [];
        let currentReferenceData = this.currentProcessStore.getters.referenceData();
        if (currentReferenceData && currentReferenceData.current.processData.links) {
            this.links = currentReferenceData.current.processData.links;
            this.links.forEach(t => t.multilingualTitle = this.multilingualStore.getters.stringValue(t.title));
        }
    }

    setBlockData(blockData: LinksBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    renderLink(ele: Link): JSX.Element {
        let h: CreateElement = this.$createElement;

        return (
            <v-list-item class={this.linksClasses.linkItemHover}>
                {
                    ele.linkType == Enums.LinkType.CustomLink ?
                        <v-list-item-action class="mr-2">
                            <i class={"ms-Icon ms-Icon--Link pl-1"}></i>
                        </v-list-item-action>
                        : null
                }
                <v-list-item-content>
                    <v-list-item-title class={classes(this.linksClasses.linkItemTitle, ele.linkType == Enums.LinkType.CustomLink ? 'pa-1' : '')}>
                        {
                            ele.linkType == Enums.LinkType.CustomLink ?
                                <a
                                    class={this.linksClasses.linkItemTitleText}
                                    target={ele.openNewWindow ? "_blank" : this.target}
                                    href={ele.url}>
                                    {ele.multilingualTitle}
                                </a>
                                : <div class={this.linksClasses.subHeader}>{ele.multilingualTitle}</div>
                        }
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        );
    }

    renderLinks(h) {
        return (
            <div>
                {this.links.map(ele => this.renderLink(ele))}
            </div>
        )
    }

    render(h) {
        return (
            <aside>
                {
                    !this.blockData ? <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div> :
                        Utils.isArrayNullOrEmpty(this.links) ?
                            <wcm-empty-block-view dark={false} icon={"fal fa-link"} text={this.corLoc.Blocks.Links.Title}></wcm-empty-block-view>
                            :
                            <div class={this.linksClasses.blockPadding(this.blockData.settings.spacing)}>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                <div key={this.componentUniqueKey}>{this.renderLinks(h)}</div>
                            </div>
                }
            </aside>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, LinksBlockComponent);
});

