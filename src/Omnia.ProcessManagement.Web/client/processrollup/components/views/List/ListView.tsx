import { Console, HttpClient, Inject, Localize, OmniaContext, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Topics, Utils } from '@omnia/fx';
import Vue from 'vue';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Prop } from 'vue-property-decorator';
import { IconSize, StyleFlow, OmniaTheming } from '@omnia/fx/ux';
import { PropertyIndexedType, BuiltInEnterprisePropertyInternalNames, EnterprisePropertyDefinition, SpacingSetting, UserIdentity, IMessageBusSubscriptionHandler, Guid, TenantRegionalSettings } from '@omnia/fx-models';
import { EnterprisePropertyStore, FeatureStore } from '@omnia/fx/store';
import { ContentProperty } from 'csstype';
import {
    ProcessRollupListViewSettings, ProcessRollupListViewColumn, ProcessRollupBlockListViewStyles, IProcessRollupViewInterface
} from '../../../../models';
import { ProcessRollupLocalization } from '../../../loc/localize';
import { classes } from 'typestyle';
import { DefaultDateFormat, ProcessRollupConstants, OPMRouter, OPMUtils, ProcessRendererOptions } from '../../../../fx';
import { RollupProcess, Enums } from '../../../../fx/models';
import './List.css';
import { ProcessRollupListViewDateTimeColumn } from '../../../../models/processrollup/ProcessRollupListViewDateTimeColumn';

declare var moment: any;

@Component
export class ListView extends Vue implements IWebComponentInstance, IProcessRollupViewInterface<ProcessRollupListViewSettings> {

    @Prop() styles: typeof ProcessRollupBlockListViewStyles | any;
    @Prop() viewPageUrl: string;
    @Prop() processes: Array<RollupProcess>;
    @Prop() viewSettings: ProcessRollupListViewSettings;
    @Prop() spacingSetting: SpacingSetting;
    @Prop() openInNewWindow: boolean;
    @Prop() sortByCallback?: (sortKey: string, descending: boolean) => void;
    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;

    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(FeatureStore) featureStore: FeatureStore;

    formatDate: string = DefaultDateFormat;

    listViewClasses = StyleFlow.use(ProcessRollupBlockListViewStyles, this.styles);
    uniqueId: string = Utils.generateGuid();
    headers: Array<{ align: string, width: string, sortable: boolean }> = [];

    taxonomyProperties: { [internalName: string]: ContentProperty } = {};
    readyToShow = false;

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {

    }


    created() {
        this.init();
    }

    init() {
        let oneColumn = this.columns && this.columns.length == 1;

        let props = this.getPropertyDisplayName();

        this.headers = this.columns.map<{ align: string, width: string, sortable: boolean }>(c => {
            return {
                text: c.showHeading === false ? '' : props[c.internalName].replace('[', '').replace(']', ''),
                align: 'left',
                width: oneColumn ? '100%' : c.width,
                sortable: false
            }
        });

        let taxonomyProperties = this.propertyStore.getters.enterprisePropertyDefinitionsByIndexedTypes([PropertyIndexedType.Taxonomy]);
        taxonomyProperties.forEach(p => {
            this.$set(this.taxonomyProperties, p.internalName, p)
        })

    }

    get columns(): Array<ProcessRollupListViewColumn> {
        return this.viewSettings.columns ? this.viewSettings.columns.filter(c => c.internalName) : [];
    }

    getPropertyDisplayName(): { [internalName: string]: string } {
        let result: { [internalName: string]: string } = {};
        let contentProperties = this.propertyStore.getters.enterprisePropertyDefinitions();
        if (contentProperties) {
            contentProperties = [
                { internalName: ProcessRollupConstants.processTitleAndLinkInternalName, multilingualTitle: `[${this.loc.ListView.ProcessTitle}]` } as any,
                ...contentProperties
            ];
            contentProperties.forEach(p => result[p.internalName] = p.multilingualTitle)
        }
        return result;
    }

    openProcess(rollupProcess: RollupProcess) {
        if (this.viewPageUrl) {
            var win = window.open(OPMUtils.createProcessNavigationUrl(rollupProcess.process, rollupProcess.process.rootProcessStep, this.viewPageUrl, true), this.openInNewWindow ? '_blank' : '_self');
            win.focus();
        }
        else {
            OPMRouter.navigate(rollupProcess.process, rollupProcess.process.rootProcessStep, ProcessRendererOptions.ForceToGlobalRenderer);
        }
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderTitleAndLink(process: RollupProcess) {
        let h = this.$createElement;
        let title = process.properties[BuiltInEnterprisePropertyInternalNames.Title];
        return <div class={this.listViewClasses.titleLayout}>
            <omfx-letter-avatar class={this.listViewClasses.logoIcon} name={title} size={30}></omfx-letter-avatar>
            <a class={classes(this.listViewClasses.titleLink)} onClick={() => { this.openProcess(process); }}>{title}</a>
        </div>
    }

    renderDateTime(process: RollupProcess, property: ProcessRollupListViewDateTimeColumn) {
        let h = this.$createElement;

        let date = '';
        if (process.properties[property.internalName]) {
            if (property.mode === Enums.ProcessViewEnums.DateTimeMode.Social) {
                date = Utils.getSocialDate(process.properties[property.internalName]);
            }
            else {
                let format = 'MM/DD/YYYY';
                if (property.format)
                    format = property.format;
                try {
                    date = moment(process.properties[property.internalName].toString()).format(format);
                } catch (e) { }
            }
        }
        return date
    }

    renderBoolean(process: RollupProcess, internalName: string, label: string) {
        let h = this.$createElement;

        return process.properties[internalName] ? label : null
    }

    renderText(process: RollupProcess, internalName: string) {
        let h = this.$createElement;

        return <div domProps-innerHTML={process.properties[internalName]}></div>
    }

    renderPerson(process: RollupProcess, internalName: string) {
        let h = this.$createElement;
        let users: Array<UserIdentity> = [];
        if (process.properties[internalName]) {
            users = typeof process.properties[internalName] === 'string' ?
                [{ uid: process.properties[internalName] }]
                : process.properties[internalName];
        } else {
            users = null;
        }
        if (!users || users.length == 0)
            return null;

        return h("omfx-enterpriseproperties-personfield-display", {
            domProps: {
                model: users
            }
        });

    }

    renderTaxonomy(process: RollupProcess, internalName: string) {
        let h = this.$createElement;
        let termIds: Array<string> = [];

        let value = process.properties[internalName];
        //For process type, the value is single
        if (typeof value === 'string') {
            value = [value]
        }

        if (value) {
            termIds = value;
        }


        let property = this.taxonomyProperties[internalName];
        if (!termIds || termIds.length == 0)
            return null;
        return <omfx-enterpriseproperties-taxonomy-display domProps-model={termIds} domProps-property={property}></omfx-enterpriseproperties-taxonomy-display>
    }

    renderColumns(columns: ProcessRollupListViewColumn[], process: RollupProcess) {
        let h = this.$createElement;
        let propertiesTitle = this.getPropertyDisplayName();

        return (
            <tr>
                {
                    columns.map(p => {
                        return (
                            <td>
                                {
                                    p.internalName === ProcessRollupConstants.processTitleAndLinkInternalName ? this.renderTitleAndLink(process) :
                                        p.type === PropertyIndexedType.DateTime ? this.renderDateTime(process, p as ProcessRollupListViewDateTimeColumn) :
                                            p.type === PropertyIndexedType.Boolean ? this.renderBoolean(process, p.internalName, propertiesTitle[p.internalName]) :
                                                p.type === PropertyIndexedType.Text || p.type === PropertyIndexedType.RichText || p.type === PropertyIndexedType.Number ? this.renderText(process, p.internalName) :
                                                    p.type === PropertyIndexedType.Person ? this.renderPerson(process, p.internalName) :
                                                        p.type === PropertyIndexedType.Taxonomy ? this.renderTaxonomy(process, p.internalName) :
                                                            "Not supported yet"

                                }
                            </td>
                        )
                    })
                }
            </tr>
        )
    }

    render(h) {
        return (
            <div class={this.listViewClasses.getPaddingStyle(this.spacingSetting)}>
                {
                    !this.processes || this.processes.length == 0 ?
                        <div>{this.loc.Common.NoProcessToShow}</div> :
                        this.columns.length == 0 ?
                            <div>{this.loc.ListView.NoColumnsMsg}</div> :
                            <v-data-table
                                class={this.listViewClasses.tableWrapper}
                                items-per-page={Number.MAX_SAFE_INTEGER}
                                hide-default-footer
                                headers={this.headers}
                                items={this.processes}
                                scopedSlots={{
                                    item: (props: { item: RollupProcess }) =>
                                        this.renderColumns(this.columns, props.item)
                                }}
                            >
                            </v-data-table>
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ListView);
});

