import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext, WebUtils } from "@omnia/fx";
import { ProcessLibraryViewSettings, Enums, ProcessVersionType, ProcessListViewComponentKey } from '../../../fx/models';
import { SpacingSetting, LanguageTag, RoleDefinitions, Parameters } from '@omnia/fx-models';
import { ProcessLibraryListViewStyles } from '../../../models';
import { StyleFlow, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../loc/localize';
import './ListView.css';
import { IListViewComponent } from './IListView';
import { OPMUtils } from '../../../fx';
import { UrlParameters } from '../../Constants';
import { TasksView } from './tasks/TasksView';
import { BaseListViewItems } from './BaseListViewItems';
import { SecurityService } from '@omnia/fx/services';
import { OPMContext } from '../../../fx/contexts';

@Component
export class ListViewComponent extends Vue implements IWebComponentInstance, IListViewComponent {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() viewSettings: ProcessLibraryViewSettings;
    @Prop() spacingSetting?: SpacingSetting;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SecurityService) securityService: SecurityService;
    @Inject(OPMContext) opmContext: OPMContext;
    private selectingTab = 'tab-drafts';
    private tabPrefix = 'tab-';
    listViewClasses = StyleFlow.use(ProcessLibraryListViewStyles, this.styles);
    openPermissionDialog: boolean = false;
    hasPermission: boolean = false;

    draftsViewComponentKey: ProcessListViewComponentKey = {
        actionButtonComponent: "opm-process-library-drafts-buttons",
        processMenuComponent: "opm-process-library-drafts-menu",
        processingStatusComponent: "opm-process-library-drafts-processingstatus"
    };
    publishedViewComponentKey: ProcessListViewComponentKey = {
        actionButtonComponent: "",
        processMenuComponent: "opm-process-library-published-menu",
        processingStatusComponent: "opm-process-library-published-processingstatus"
    };

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.redirectOnStart();
    }

    beforeDestroy() {

    }

    created() {
        this.securityService.hasWritePermissionForRoles([RoleDefinitions.AppInstanceAdmin, Enums.Security.OPMRoleDefinitions.Author], {
            [Parameters.AppInstanceId]: this.opmContext.teamAppId.toString(),
            [Enums.Security.Parameters.SecurityResourceId]: this.opmContext.teamAppId.toString()
        }).then((hasPermission) => {
            this.hasPermission = hasPermission;
        })
    }

    redirectOnStart() {
        var displayTabParamValue = WebUtils.getQs(UrlParameters.DisplayTab);
        if (displayTabParamValue) {
            if (displayTabParamValue.endsWith('/')) {
                displayTabParamValue = displayTabParamValue.substr(0, displayTabParamValue.length - 1)
            }

            if (displayTabParamValue == UrlParameters.Drafts) {
                this.selectingTab = this.tabPrefix + UrlParameters.Drafts;
            }
            else if (displayTabParamValue == UrlParameters.Tasks && !this.viewSettings.hideTasksTab) {
                this.selectingTab = this.tabPrefix + UrlParameters.Tasks;
            }
            else {
                this.selectingTab = this.tabPrefix + UrlParameters.Published;
            }
        }
        else {
            switch (this.viewSettings.defaultTab) {
                case Enums.ProcessViewEnums.StartPageTab.Drafts:
                    OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Drafts));
                    this.selectingTab = this.tabPrefix + UrlParameters.Drafts;
                    break;
                case Enums.ProcessViewEnums.StartPageTab.Tasks:
                    if (!this.viewSettings.hideTasksTab) {
                        OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Tasks));
                        this.selectingTab = this.tabPrefix + UrlParameters.Tasks;
                    }

                    else {
                        OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Published));
                        this.selectingTab = this.tabPrefix + UrlParameters.Published;
                    }

                    break;
                default:
                    OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Published));
                    this.selectingTab = this.tabPrefix + UrlParameters.Published;
            }
        }
    }

    private getUrlWithTabRouter(tab: string): string {
        return '?' + UrlParameters.DisplayTab + "=" + tab;
    }

    private changeTabOnClick(tab) {
        this.selectingTab = tab;
        let viewMode = this.selectingTab.replace(this.tabPrefix, '');
        switch (viewMode) {
            case UrlParameters.Drafts:
                OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Drafts));
                break;
            case UrlParameters.Tasks:
                OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Tasks));
                break;
            default:
                OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Published));
                break;
        }
    }

    render(h) {
        return (
            <div class={this.listViewClasses.wrapper}>
                {
                    this.hasPermission &&
                    <v-btn text class={[this.listViewClasses.permissionBtn, 'mb-0']} onClick={() => { this.openPermissionDialog = true; }}>{this.omniaUxLoc.Common.Permission}</v-btn>
                }
                <v-tabs ripple class={this.listViewClasses.mainTab} v-model={this.selectingTab}
                    background-color={this.omniaTheming.promoted.header.primary.base}
                    color={this.omniaTheming.promoted.header.text.base}
                    slider-color={this.omniaTheming.promoted.header.text.base}
                    onChange={this.changeTabOnClick}>
                    <v-tab href="#tab-drafts">
                        {this.loc.ViewTabs.Drafts}
                    </v-tab>
                    <v-tab href="#tab-tasks" v-show={this.viewSettings ? !this.viewSettings.hideTasksTab : true}>
                        {this.loc.ViewTabs.Tasks}
                    </v-tab>
                    <v-tab href="#tab-published">
                        {this.loc.ViewTabs.Published}
                    </v-tab>
                    <v-tab-item id="tab-drafts">
                        {this.selectingTab == "tab-drafts" ?
                            <BaseListViewItems displaySettings={this.viewSettings.draftTabDisplaySettings} versionType={ProcessVersionType.Draft} processListViewComponentKey={this.draftsViewComponentKey}></BaseListViewItems>
                            : null}
                    </v-tab-item>
                    <v-tab-item id="tab-tasks" v-show={this.viewSettings ? !this.viewSettings.hideTasksTab : true}>
                        {this.selectingTab == "tab-tasks" ? <TasksView></TasksView> : null}
                    </v-tab-item>
                    <v-tab-item id="tab-published">
                        {this.selectingTab == "tab-published" ?
                            <BaseListViewItems displaySettings={this.viewSettings.publishedTabDisplaySettings} versionType={ProcessVersionType.LatestPublished} processListViewComponentKey={this.publishedViewComponentKey}></BaseListViewItems>
                            : null}
                    </v-tab-item>
                </v-tabs>

                {
                    this.openPermissionDialog && <opm-permission-dialog close={() => { this.openPermissionDialog = false; }}></opm-permission-dialog>
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ListViewComponent);
});

