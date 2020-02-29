import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize, Utils, OmniaContext, WebUtils } from "@omnia/fx";
import { ProcessLibraryViewSettings, Enums, ProcessVersionType, ProcessListViewComponentKey, Security } from '../../../fx/models';
import { SpacingSettings, LanguageTag, RoleDefinitions, Parameters } from '@omnia/fx-models';
import { ProcessLibraryListViewStyles } from '../../../models';
import { StyleFlow, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessLibraryLocalization } from '../../loc/localize';
import './ListView.css';
import { IListViewComponent } from './IListView';
import { OPMUtils, CurrentProcessStore } from '../../../fx';
import { UrlParameters, ProcessLibraryListViewTabs } from '../../Constants';
import { TasksView } from './tasks/TasksView';
import { BaseListViewItems } from './BaseListViewItems';
import { SecurityService } from '@omnia/fx/services';
import { OPMContext } from '../../../fx/contexts';

@Component
export class ListViewComponent extends Vue implements IWebComponentInstance, IListViewComponent {
    @Prop() styles: typeof ProcessLibraryListViewStyles | any;
    @Prop() viewSettings: ProcessLibraryViewSettings;
    @Prop() SpacingSettings?: SpacingSettings;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(SecurityService) securityService: SecurityService;
    @Inject(OPMContext) opmContext: OPMContext;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private selectingTab = ProcessLibraryListViewTabs.Draft;
    
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
        this.securityService.hasPermissionForRoles([RoleDefinitions.AppInstanceAdmin, Security.OPMRoleDefinitions.Author], {
            [Parameters.AppInstanceId]: this.opmContext.teamAppId.toString(),
            [Security.Parameters.SecurityResourceId]: this.opmContext.teamAppId.toString()
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
                this.selectingTab = ProcessLibraryListViewTabs.Draft
            }
            else if (displayTabParamValue == UrlParameters.Tasks && !this.viewSettings.hideTasksTab) {
                this.selectingTab = ProcessLibraryListViewTabs.Task
            }
            else {
                this.selectingTab = ProcessLibraryListViewTabs.Published
            }
        }
        else {
            switch (this.viewSettings.defaultTab) {
                case Enums.ProcessViewEnums.StartPageTab.Drafts:
                    OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Drafts));
                    this.selectingTab = ProcessLibraryListViewTabs.Draft
                    break;
                case Enums.ProcessViewEnums.StartPageTab.Tasks:
                    if (!this.viewSettings.hideTasksTab) {
                        OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Tasks));
                        this.selectingTab = ProcessLibraryListViewTabs.Task
                    }

                    else {
                        OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Published));
                        this.selectingTab = ProcessLibraryListViewTabs.Published
                    }

                    break;
                default:
                    OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Published));
                    this.selectingTab = ProcessLibraryListViewTabs.Published
            }
        }
    }

    private getUrlWithTabRouter(tab: string): string {
        return '?' + UrlParameters.DisplayTab + "=" + tab;
    }

    private changeTab(tab: ProcessLibraryListViewTabs) {
        this.selectingTab = tab;
        switch (this.selectingTab) {
            case ProcessLibraryListViewTabs.Draft:
                OPMUtils.navigateToNewState(this.getUrlWithTabRouter(UrlParameters.Drafts));
                break;
            case ProcessLibraryListViewTabs.Task:
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
                    <v-btn text dark={this.omniaTheming.promoted.header.dark} class={[this.listViewClasses.permissionBtn, 'mb-0']} onClick={() => { this.openPermissionDialog = true; }}>{this.omniaUxLoc.Common.Permission}</v-btn>
                }
                <v-tabs ripple class={this.listViewClasses.mainTab} v-model={this.selectingTab}
                    dark={this.omniaTheming.promoted.header.dark}
                    background-color={this.omniaTheming.promoted.header.background.base}
                    slider-color={this.omniaTheming.promoted.header.text.base}
                    onChange={this.changeTab}>
                    <v-tab href={`#${ProcessLibraryListViewTabs.Draft}`}>
                        {this.loc.ViewTabs.Drafts}
                    </v-tab>
                    <v-tab href={`#${ProcessLibraryListViewTabs.Task}`} v-show={this.viewSettings ? !this.viewSettings.hideTasksTab : true}>
                        {this.loc.ViewTabs.Tasks}
                    </v-tab>
                    <v-tab href={`#${ProcessLibraryListViewTabs.Published}`}>
                        {this.loc.ViewTabs.Published}
                    </v-tab>
                    <v-tab-item id={`${ProcessLibraryListViewTabs.Draft}`}>
                        {this.selectingTab == ProcessLibraryListViewTabs.Draft ?
                            <BaseListViewItems previewPageUrl={this.viewSettings.previewPageUrl} changeTab={this.changeTab} displaySettings={this.viewSettings.draftTabDisplaySettings} versionType={ProcessVersionType.Draft} processListViewComponentKey={this.draftsViewComponentKey}></BaseListViewItems>
                            : null}
                    </v-tab-item>
                    <v-tab-item id={`${ProcessLibraryListViewTabs.Task}`} v-show={this.viewSettings ? !this.viewSettings.hideTasksTab : true}>
                        {this.selectingTab == ProcessLibraryListViewTabs.Task ? <TasksView previewPageUrl={this.viewSettings.previewPageUrl}></TasksView> : null}
                    </v-tab-item>
                    <v-tab-item id={`${ProcessLibraryListViewTabs.Published}`}>
                        {this.selectingTab == ProcessLibraryListViewTabs.Published ?
                            <BaseListViewItems previewPageUrl={this.viewSettings.previewPageUrl} changeTab={this.changeTab} displaySettings={this.viewSettings.publishedTabDisplaySettings} versionType={ProcessVersionType.Published} processListViewComponentKey={this.publishedViewComponentKey}></BaseListViewItems>
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

