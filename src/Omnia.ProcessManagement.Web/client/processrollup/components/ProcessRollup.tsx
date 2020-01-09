import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, ScrollPagingUtils, Utils, WebUtils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessRollupBlockStyles } from '../../models';
import { ProcessRollupLocalization } from '../loc/localize';
import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { ProcessRollupBlockData, Enums, ProcessRollupUISearchboxFilterValue, ProcessRollupFilter, RollupProcess, ProcessRollupViewRegistration } from '../../fx/models';
import { PropertyIndexedType, SpacingSetting, IMessageBusSubscriptionHandler, OmniaUserContext, Guid } from '@omnia/fx-models';
import { FilterExtension, SearchBoxFilterExtension, FilterComponent } from './FilterComponent';
import { SharePointFieldsConstants, ProcessRollupConstants, ProcessRollupService } from '../../fx';
import { classes } from 'typestyle';
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupConfigurationFactory } from '../factory/ProcessRollupConfigurationFactory';
import { OPMPublicTopics } from '../../fx/messaging';

@Component
export class ProcessRollupComponent extends Vue implements IWebComponentInstance {
    @Prop({ default: "" }) settingsKey: string;
    @Prop() styles: typeof ProcessRollupBlockStyles | any;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;

    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(ProcessRollupService) processRollupService: ProcessRollupService;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------
    timewatchUniqueKey: string = Utils.generateGuid();
    componentUniqueKey: string = Utils.generateGuid();

    blockData: ProcessRollupBlockData = null;
    subscriptionHandler: IMessageBusSubscriptionHandler = null;
    userContext: OmniaUserContext = null;

    processes: Array<RollupProcess> = [];
    currentPage: number = 1;
    isLoading: boolean = false;
    uiFilters: Array<ProcessRollupFilter> = [];
    registeredViewElemMsg: { [id: string]: string } = {};

    errorMsg: string = '';
    total = 0;

    processRollupClasses = StyleFlow.use(ProcessRollupBlockStyles, this.styles);

    created() {
        this.init();
    }

    init() {
        let promises: Array<Promise<any>> = [
            this.propertyStore.actions.ensureLoadData.dispatch(),
            this.omniaContext.user.then(user => { this.userContext = user })
        ]

        Promise.all(promises).then(() => {
            this.subscriptionHandler = OPMPublicTopics.registerProcessRollupView.subscribe(this.registerProcessRollupView);

            this.settingsService.suggestKeyRenderer(this.settingsKey, "opm-process-rollup-settings");
            this.settingsService.getValue(this.settingsKey).then((blockData) => {
                this.subscriptionHandler.add(this.settingsService
                    .onKeyValueUpdated(this.settingsKey)
                    .subscribe(this.setBlockData));

                if (blockData) {
                    this.setBlockData(blockData)
                }
                else {
                    this.settingsService.setValue(this.settingsKey, ProcessRollupConfigurationFactory.create());
                }
            });
        })
    }

    setBlockData(blockData: ProcessRollupBlockData) {
        this.blockData = blockData;
        this.$forceUpdate();
    }

    registerProcessRollupView(msg: ProcessRollupViewRegistration) {
        if (msg) {
            msg.id = new Guid(msg.id.toString().toLowerCase());
            this.registeredViewElemMsg[msg.id.toString()] = msg.viewElement;

            //force update if the processes already loaded
            if (this.processes) this.$forceUpdate();
        }
    }

    isComponentEmtpy() {
        return !this.blockData ||
            !this.blockData.settings.resources ||
            this.blockData.settings.resources.length == 0;
    }

    pagingNumberChanged(pageNumber: number) {
        if (this.isLoading) return;
        this.getData(pageNumber);
    }

    getData(pageNumber: number) {
        ScrollPagingUtils.removeScrollPaging(this.$el as HTMLElement);

        //this.noNextPage = false;

        //let query = this.getQuery();
        //query.includeTotal = true;

        //let hasPaging = this.model.blockData.settings.pagingType !== TeamCollaborationRollupEnums.PagingType.NoPaging;
        //if (hasPaging) {
        //    query.skip = !pageNumber ? 0 : (pageNumber - 1) * this.model.blockData.settings.itemLimit;
        //} else query.skip = 0;

        //this.isLoading = true;
        //this.teamCollaborationService.queryTeams(query).then((result) => {
        //    this.processes = result.items as Array<TeamCollaborationRollupResultItem>;
        //    this.total = result.total;
        //    this.isLoading = false;
        //    if (this.model.blockData.settings.pagingType === TeamCollaborationRollupEnums.PagingType.Scroll && this.total > 0) {
        //        ScrollPagingUtils.registerScrollPaging(this.$el as HTMLElement, `.${PublishingAppDefaultScrollElementClass}`, this.nextPage);
        //    }
        //    this.$forceUpdate();
        //}).catch((msg) => {
        //    this.errorMsg = msg;
        //    this.isLoading = false;
        //    ScrollPagingUtils.removeScrollPaging(this.$el as HTMLElement);
        //    this.$forceUpdate();
        //});

    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderProcessRollup(h) {

        if (this.isLoading || this.blockData.settings.selectedViewId && !this.registeredViewElemMsg[this.blockData.settings.selectedViewId])
            return (<v-skeleton-loader loading={true} height="100%" type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"></v-skeleton-loader>)


        if (!Utils.isArrayNullOrEmpty(this.errorMsg)) {
            return <div class={[this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing), this.processRollupClasses.queryFailMsgWrapper]}>{this.loc.Common.QueryFailedMsg} - {this.errorMsg}</div>
        }

        if (!this.blockData.settings.selectedViewId)
            return <div class={this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing)}>{this.loc.Common.NoViewToRender}</div>

        let renderFilterComponent = this.uiFilters.length > 0;

        return [
            <div class={renderFilterComponent ? this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing, { bottom: true }) : ''}>
                {
                    renderFilterComponent ? <FilterComponent isLoadingData={this.isLoading} filters={this.uiFilters}
                        updateUIQueryFilters={() => { this.getData(1); }}></FilterComponent> : null
                }
            </div>,
            h(this.registeredViewElemMsg[this.blockData.settings.selectedViewId], {
                domProps: {
                    items: this.processes,
                    viewSettings: Utils.clone(this.blockData.settings.viewSettings),
                    spacingSetting: this.blockData.settings.spacing,
                    styles: this.styles,
                    settingsKey: this.settingsKey
                }
            }),
            this.blockData.settings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging ? <div class={[this.isLoading ? "" : this.processRollupClasses.transparent]}><v-progress-linear height="2" indeterminate></v-progress-linear></div> : null,
            this.blockData.settings.pagingType === Enums.ProcessViewEnums.PagingType.Classic && this.total && this.total > (this.blockData.settings.itemLimit > 0 ? this.blockData.settings.itemLimit : 50) ?
                <div class={["text-center", this.processRollupClasses.getPaddingStyle(this.blockData.settings.spacing, { top: true, left: true, right: true })]}>
                    <v-pagination
                        disabled={this.isLoading}
                        v-model={this.currentPage}
                        length={Math.ceil(this.total / (this.blockData.settings.itemLimit > 0 ? this.blockData.settings.itemLimit : 50))}
                        onInput={(pageNumber) => { this.pagingNumberChanged(pageNumber); }}>
                    </v-pagination></div> : null
        ];
    }

    render(h) {
        let isEmpty = this.isComponentEmtpy();
        return (
            <div>
                {
                    !this.blockData ? <v-skeleton-loader loading={true} height="100%" type="list-item-avatar-two-line,list-item-avatar-two-line"></v-skeleton-loader>
                        :
                        isEmpty ?
                            <wcm-empty-block-view dark={false} icon={"fal fa-file-alt"} title={this.loc.BlockTitle} description={this.loc.BlockDescription}></wcm-empty-block-view>
                            :
                            <div key={this.componentUniqueKey}>
                                {
                                    this.multilingualStore.getters.stringValue(this.blockData.settings.title) ?
                                        <wcm-block-title title="" settingsKey={this.settingsKey} alternativeContent={
                                            <v-layout row align-center>
                                                <v-flex>{this.multilingualStore.getters.stringValue(this.blockData.settings.title)}</v-flex>
                                            </v-layout>
                                        }></wcm-block-title> : null
                                }
                                {this.renderProcessRollup(h)}
                            </div>
                }
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessRollupComponent);
});