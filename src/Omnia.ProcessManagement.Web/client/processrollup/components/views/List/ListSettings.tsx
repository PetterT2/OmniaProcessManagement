import { Console, HttpClient, Inject, Localize, OmniaContext, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Topics } from '@omnia/fx';
import Vue from 'vue';
import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Prop } from 'vue-property-decorator';
import { EnterprisePropertyDefinition, PropertyIndexedType } from '@omnia/fx/models';
import './ListSettings.css';
import { OmniaTheming, StyleFlow } from '@omnia/fx/ux';
import { ProcessRollupLocalization } from '../../../loc/localize';
import { ProcessRollupListViewSettings, IProcessRollupViewSettingsInterface, ProcessRollupBlockListViewSettingsStyles, ProcessRollupListViewColumn } from '../../../../models';
import { Enums } from '../../../../fx/models';
import { ProcessRollupConstants } from '../../../../fx';
import { ProcessRollupListViewDateTimeColumn } from '../../../../models/processrollup/ProcessRollupListViewDateTimeColumn';

interface ListViewPropertyExtension extends ProcessRollupListViewColumn {
    removed?: boolean;
}

@Component
export class ListSettings extends Vue implements IWebComponentInstance, IProcessRollupViewSettingsInterface<ProcessRollupListViewSettings> {
    @Prop() viewSettings: ProcessRollupListViewSettings;
    @Prop() availableProperties: Array<EnterprisePropertyDefinition>;
    @Prop() onUpdatedViewSettings: (viewSettings: ProcessRollupListViewSettings) => void;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    @Localize(ProcessRollupLocalization.namespace) private loc: ProcessRollupLocalization.locInterface;

    private listViewSettingsClasses = StyleFlow.use(ProcessRollupBlockListViewSettingsStyles);


    dateModes: Array<{ id: Enums.ProcessViewEnums.DateTimeMode, title: string }> = [
        { id: Enums.ProcessViewEnums.DateTimeMode.Normal, title: this.loc.ListView.DateTimeMode.Normal },
        { id: Enums.ProcessViewEnums.DateTimeMode.Social, title: this.loc.ListView.DateTimeMode.Social }
    ]
    properityTitleAsHash: { [internalName: string]: string } = {}

    modifyColumnMode: boolean = false;

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
    }

    created() {
        this.init();
    }

    init() {
        if (!this.viewSettings.columns) {
            this.viewSettings.columns = [];
            this.updateSelectProperties();
        }

        this.availablePropertiesWithTitleAndSocial.forEach(p => this.properityTitleAsHash[p.internalName] = p.multilingualTitle);
    }

    switchIndex(index1: number, index2: number) {
        let property1 = this.viewSettings.columns[index1];
        this.viewSettings.columns[index1] = this.viewSettings.columns[index2];
        this.viewSettings.columns[index2] = property1;

        this.updateSettings();

        this.$forceUpdate();
    }


    updateSettings() {
        this.onUpdatedViewSettings(this.viewSettings);
    }

    get availablePropertiesWithTitleAndSocial(): Array<EnterprisePropertyDefinition> {
        return [
            { internalName: ProcessRollupConstants.processTitleAndLinkInternalName, multilingualTitle: `[${this.loc.ListView.TitleAndLink}]` } as any,
            ...this.availableProperties
        ];

    }

    updateSelectProperties() {

        let selectedProperties: { [internalName: string]: boolean } = {};
        this.viewSettings.selectProperties = [];

        //each type has different settings so after editing for a while, there could be lots of no meanning data for selected type
        //We keep only the neccessary data
        let columns: Array<ProcessRollupListViewColumn> = [];
        this.viewSettings.columns.filter(prop => prop.internalName && !(prop as ListViewPropertyExtension).removed).forEach(prop => {
            if (prop.internalName === ProcessRollupConstants.processTitleAndLinkInternalName) {
                columns.push({
                    internalName: prop.internalName, width: prop.width,
                    showHeading: prop.showHeading === undefined ? true : prop.showHeading
                } as ProcessRollupListViewColumn)
            }
            else if (prop.type === PropertyIndexedType.DateTime) {
                let dateTimeProperty: ProcessRollupListViewDateTimeColumn = {
                    internalName: prop.internalName,
                    format: (prop as ProcessRollupListViewDateTimeColumn).format,
                    mode: (prop as ProcessRollupListViewDateTimeColumn).mode,
                    type: PropertyIndexedType.DateTime,
                    width: prop.width,
                    showHeading: prop.showHeading === undefined ? true : prop.showHeading
                } as any

                if (dateTimeProperty.mode === Enums.ProcessViewEnums.DateTimeMode.Social)
                    delete dateTimeProperty.format;

                columns.push(dateTimeProperty)
            }
            else
                columns.push({ internalName: prop.internalName, type: prop.type, width: prop.width, showHeading: prop.showHeading === undefined ? true : prop.showHeading })

            if (!selectedProperties[prop.internalName] && prop.internalName !== ProcessRollupConstants.processTitleAndLinkInternalName) {
                this.viewSettings.selectProperties.push(prop.internalName);
                selectedProperties[prop.internalName] = true;
            }
        });

        this.viewSettings.columns = columns;

        this.updateSettings();
    }

    selectProperty(property: ProcessRollupListViewColumn) {
        let contentProperty = this.availableProperties.filter(a => a.internalName === property.internalName)[0];
        if (contentProperty) {
            property.type = contentProperty.enterprisePropertyDataType.indexedType;

            if (property.type === PropertyIndexedType.DateTime && !(property as ProcessRollupListViewDateTimeColumn).mode) {
                (property as ProcessRollupListViewDateTimeColumn).mode = Enums.ProcessViewEnums.DateTimeMode.Social
            }
        }

        this.updateSelectProperties();
        this.$forceUpdate();
    }

    addColumns() {
        if (!this.viewSettings.columns.filter(c => !c.internalName)[0]) {
            this.viewSettings.columns.push({ showHeading: true } as ProcessRollupListViewColumn);
            this.$forceUpdate();
        }
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    renderOrderUI(property: ProcessRollupListViewColumn, index: number) {
        let h = this.$createElement;
        let showDownDisabled = index === this.viewSettings.columns.length - 1;
        let showUpDisabled = index === 0;
        // support old setting data have not showHeading
        property.showHeading = property.showHeading === undefined ? true : property.showHeading
        return [
            <v-flex>{this.properityTitleAsHash[property.internalName]}</v-flex>,
            <v-btn disabled={showUpDisabled} class="ma-0" icon onClick={() => { !showUpDisabled && this.switchIndex(index, index - 1) }}>
                <v-icon small>fa fa-chevron-up</v-icon>
            </v-btn>,
            <v-btn disabled={showDownDisabled} class="ma-0" icon onClick={() => { !showDownDisabled && this.switchIndex(index, index + 1) }}>
                <v-icon small>fa fa-chevron-down</v-icon>
            </v-btn>,
            <v-text-field class={this.listViewSettingsClasses.widthInput} placeholder={this.loc.ListView.WidthPlaceholder} v-model={property.width} onChange={() => { this.updateSettings() }} />,
            <v-tooltip top close-delay="50">
                <div slot="activator">
                    <v-checkbox class={this.listViewSettingsClasses.showHeadingCheckbox} dark={this.omniaTheming.promoted.body.dark} input-value={property.showHeading} onChange={(isShowHeading) => { property.showHeading = isShowHeading; this.updateSettings(); }}></v-checkbox>
                </div>
                <span>{this.loc.ListView.ShowHeading}</span>
            </v-tooltip>
        ]

    }

    renderDateTimeProperty(property: ProcessRollupListViewDateTimeColumn) {
        let h = this.$createElement;

        return (
            [
                this.renderPropertySelection(property),
                property.mode === Enums.ProcessViewEnums.DateTimeMode.Social ?
                    <v-select class="ml-2" items={this.dateModes} item-value="id" item-text="title" v-model={property.mode} onChange={() => { this.updateSelectProperties(); this.$forceUpdate(); }}></v-select> :
                    <v-layout class="ml-2" row wrap>
                        <v-select items={this.dateModes} item-value="id" item-text="title" v-model={property.mode} onChange={() => { this.updateSelectProperties(); this.$forceUpdate(); }}></v-select>
                        <v-text-field v-model={property.format} onChange={() => { this.updateSelectProperties() }} label={this.loc.ListView.Format} placeholder="MM/DD/YYYY"></v-text-field>
                    </v-layout>
            ]
        )

    }

    renderPropertySelection(property: ProcessRollupListViewColumn) {
        let h = this.$createElement;
        return [
            <v-btn class="ma-0" icon onClick={() => { (property as ListViewPropertyExtension).removed = true; this.$forceUpdate(); this.updateSelectProperties() }}>
                <v-icon small>fa fa-times</v-icon>
            </v-btn>,
            <v-select items={this.availablePropertiesWithTitleAndSocial} item-value="internalName" item-text="multilingualTitle" v-model={property.internalName} onChange={() => { this.selectProperty(property); }}></v-select>
        ]
    }

    render(h) {
        return (
            <div class="pb-12">
                {
                    this.viewSettings.columns.map((property, index) =>
                        <v-layout align-center>
                            {
                                this.modifyColumnMode ? this.renderOrderUI(property, index) :
                                    property.type === PropertyIndexedType.DateTime ? this.renderDateTimeProperty(property as ProcessRollupListViewDateTimeColumn) :
                                        this.renderPropertySelection(property)
                            }
                        </v-layout>
                    )
                }
                {
                    !this.modifyColumnMode ?
                        <a onClick={() => { this.addColumns() }}>{this.loc.ListView.AddColumn}</a> : null
                }
                {
                    this.viewSettings.columns.length > 1 ?
                        <a class={this.listViewSettingsClasses.orderAction} onClick={() => { this.modifyColumnMode = !this.modifyColumnMode; this.$forceUpdate() }}>{this.modifyColumnMode ? this.loc.Common.Done : this.loc.ListView.AdjustColumns}</a> : null
                }
            </div>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ListSettings);
});

