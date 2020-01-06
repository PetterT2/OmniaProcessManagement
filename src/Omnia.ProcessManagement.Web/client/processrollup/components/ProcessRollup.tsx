import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Topics, ScrollPagingUtils, Utils, WebUtils, OmniaContext } from "@omnia/fx";
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessRollupStyles } from '../../models';
import { ProcessRollupLocalization } from '../loc/localize';
import { MultilingualStore, EnterprisePropertyStore } from '@omnia/fx/store';
import { ProcessRollupBlockData, Enums, ProcessRollupUISearchboxFilterValue, ProcessRollupFilter, RollupProcess } from '../../fx/models';
import { PropertyIndexedType, SpacingSetting } from '@omnia/fx-models';
import { FilterExtension, SearchBoxFilterExtension, FilterComponent } from './FilterComponent';
import { SharePointFieldsConstants, ProcessRollupConstants } from '../../fx';
import { classes } from 'typestyle';
import { StyleFlow } from '@omnia/fx/ux';

@Component
export class ProcessRollupComponent extends Vue implements IWebComponentInstance {
    @Prop({ default: "" }) settingsKey: string;
    @Prop() styles: typeof ProcessRollupStyles | any;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;

    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject<SettingsServiceConstructor>(SettingsService) settingsService: SettingsService<ProcessRollupBlockData>;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;

    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------
    timewatchUniqueKey: string = Utils.generateGuid();
    componentUniqueKey: string = Utils.generateGuid();

    blockData: ProcessRollupBlockData = null;

    processes: Array<RollupProcess> = [];
    currentPage: number = 1;
    isLoading: boolean = false;
    uiFilters: Array<ProcessRollupFilter> = [];
    registeredViewElemMsg: { [id: string]: string } = {};

    errorMsg: string = '';
    total = 0;

    processRollupClasses = StyleFlow.use(ProcessRollupStyles, this.styles);

    isComponentEmtpy() {
        let query = '';
        let title = '';
        if (this.blockData && this.blockData.settings) {
            if (this.blockData.settings.title) {
                title = this.multilingualStore.getters.stringValue(this.blockData.settings.title);
                title = title.trim();
            }
            query = this.blockData.settings.query;
        }
        return !query && !title;
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
            return (<v-skeleton-loader
                loading={true}
                height="100%"
                type="list-item-avatar,list-item-avatar,list-item-avatar,list-item-avatar"
            >
            </v-skeleton-loader>)


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
                    !this.blockData ? <v-skeleton-loader
                        loading={true}
                        height="100%"
                        type="list-item-avatar-two-line,list-item-avatar-two-line"
                    >
                    </v-skeleton-loader> :
                        isEmpty ?
                            <wcm-empty-block-view dark={false} icon={"fal fa-file-alt"} title={this.loc.BlockTitle} description={this.loc.BlockDescription}></wcm-empty-block-view>
                            :
                            <div>
                                <wcm-block-title domProps-multilingualtitle={this.blockData.settings.title} settingsKey={this.settingsKey}></wcm-block-title>
                                {this.blockData.settings.query && <div key={this.componentUniqueKey}>{this.renderProcessRollup(h)}</div>}
                            </div>
                }
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessRollupComponent);
});