import { Inject, Utils, Localize } from '@omnia/fx';
import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { SettingsServiceConstructor, SettingsService, LocalizationService } from '@omnia/fx/services';
import { SharePointContext } from '@omnia/fx-sp';
import { OmniaUxLocalizationNamespace, OmniaUxLocalization, OmniaTheming } from '@omnia/fx/ux';
import { PropertyIndexedType, EnterprisePropertyDefinition } from '@omnia/fx-models';
import { ProcessLibraryBlockData, Enums, ProcessLibraryDisplaySettings } from '../../../fx/models';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { ProcessLibraryConfigurationFactory } from '../../factory/ProcessLibraryConfigurationFactory';
import { OPMCoreLocalization } from '../../../core/loc/localize';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { LibrarySystemFieldsConstants, ProcessLibraryFields } from '../../Constants';

interface DisplayFieldsTabProps {
    isPublished: boolean;
    settingsKey: string;
}

@Component
export class DisplayFieldsTab extends tsx.Component<DisplayFieldsTabProps>
{
    @Prop() settingsKey: string;
    @Prop() isPublished: boolean;

    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessLibraryBlockData>;
    @Inject(SharePointContext) private spContext: SharePointContext;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(EnterprisePropertyStore) private enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(LocalizationService) private localizationService: LocalizationService;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;

    private blockData: ProcessLibraryBlockData = null;
    private libraryDisplaySettings: ProcessLibraryDisplaySettings = null;
    private defaultFields: Array<string> = [];
    private enterpriseProperties: Array<EnterprisePropertyDefinition> = [];
    private enterprisePropertiesSortable: Array<EnterprisePropertyDefinition> = [];
    private addingFieldName: string = "";
    private isLoadingSettings: boolean = false;
    private isLoadingProperties: boolean = false;
    sortBys: Array<{ id: Enums.ProcessViewEnums.OrderDirection, title: string }> = [
        { id: Enums.ProcessViewEnums.OrderDirection.Ascending, title: this.loc.SortText.Ascending },
        { id: Enums.ProcessViewEnums.OrderDirection.Descending, title: this.loc.SortText.Descending },
    ]

    pagingTypes: Array<{ id: number, title: string }> = [
        { id: Enums.ProcessViewEnums.PagingType.NoPaging, title: this.loc.PagingType.NoPaging },
        { id: Enums.ProcessViewEnums.PagingType.Classic, title: this.loc.PagingType.Classic }
    ]

    created() {
        this.init();
    }


    private init() {
        this.loadProperties();

        this.isLoadingSettings = true;
        this.defaultFields = this.isPublished ? ProcessLibraryConfigurationFactory.getDefaultPublishedDisplayFields() : ProcessLibraryConfigurationFactory.getDefaultDraftDisplayFields();

        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData);
                this.libraryDisplaySettings = this.isPublished ? this.blockData.settings.viewSettings.publishedTabDisplaySettings : this.blockData.settings.viewSettings.draftTabDisplaySettings;
            }
            else {
                blockData = ProcessLibraryConfigurationFactory.create();
                this.settingsService.setValue(this.settingsKey, blockData);
            }

            // Ensure required fields are selected
            this.libraryDisplaySettings.selectedFields = this.libraryDisplaySettings.selectedFields ? this.libraryDisplaySettings.selectedFields : [];
            this.defaultFields.forEach(internalName => {
                var foundField = this.libraryDisplaySettings.selectedFields.find(f => f == internalName);
                if (!foundField)
                    this.libraryDisplaySettings.selectedFields.push(internalName);
            })
            this.updateBlockData();
            this.isLoadingSettings = false;
        });
    }

    private loadProperties() {
        this.isLoadingProperties = true;
        this.enterprisePropertyStore.actions.ensureLoadData.dispatch().then(() => {
            this.enterpriseProperties = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions();
            if (this.enterpriseProperties.find(p => p.internalName == LibrarySystemFieldsConstants.Title) == null)
                this.enterpriseProperties.push({
                    internalName: LibrarySystemFieldsConstants.Title,
                    multilingualTitle: this.localizationService.get(this.coreLoc.Columns.Title)
                } as EnterprisePropertyDefinition)
            if (this.isPublished && this.enterpriseProperties.find(p => p.internalName == ProcessLibraryFields.Edition) == null) {
                this.enterpriseProperties.push({
                    internalName: ProcessLibraryFields.Edition,
                    multilingualTitle: this.localizationService.get(this.coreLoc.Columns[ProcessLibraryFields.Edition])
                } as EnterprisePropertyDefinition)
            }
            if (this.isPublished && this.enterpriseProperties.find(p => p.internalName == ProcessLibraryFields.Revision) == null) {
                this.enterpriseProperties.push({
                    internalName: ProcessLibraryFields.Revision,
                    multilingualTitle: this.localizationService.get(this.coreLoc.Columns[ProcessLibraryFields.Revision])
                } as EnterprisePropertyDefinition)
            }
            if (this.isPublished && this.enterpriseProperties.find(p => p.internalName == ProcessLibraryFields.Published) == null) {
                this.enterpriseProperties.push({
                    internalName: ProcessLibraryFields.Published,
                    multilingualTitle: this.localizationService.get(this.coreLoc.Columns[ProcessLibraryFields.Published])
                } as EnterprisePropertyDefinition)
            }
            this.enterpriseProperties = this.enterpriseProperties.sort((a, b) => { return a.multilingualTitle.localeCompare(b.multilingualTitle); });
            this.enterprisePropertiesSortable = Utils.clone(this.enterpriseProperties);

            this.isLoadingProperties = false;
        });

    }

    private updateBlockData() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    private removeField(index: number) {
        this.libraryDisplaySettings.selectedFields.splice(index, 1);
        this.updateBlockData();
    }

    private addField() {
        var foundField = this.libraryDisplaySettings.selectedFields.find(f => f == this.addingFieldName);
        if (!foundField) {
            this.libraryDisplaySettings.selectedFields.push(this.addingFieldName);
            this.addingFieldName = "";
            this.updateBlockData();
        }
        else this.addingFieldName = "";
    }

    private getFieldTitle(internalName: string) {
        switch (internalName) {
            case LibrarySystemFieldsConstants.Menu:
                return this.coreLoc.Columns.ProcessMenu;
            case LibrarySystemFieldsConstants.Status:
                return this.coreLoc.Columns.Status;
            case LibrarySystemFieldsConstants.Title:
                return this.coreLoc.Columns.Title;
            default:
                let field = this.enterpriseProperties.find(p => p.internalName == internalName);
                return field ? field.multilingualTitle : '';
        }
    }

    private renderSelectedColumns(h) {
        return (
            <draggable
                options={{ handle: ".drag-handle", animation: "100" }}
                element="v-list"
                v-model={this.libraryDisplaySettings.selectedFields}>
                {
                    this.libraryDisplaySettings.selectedFields.map((internalName, index) => {
                        return (
                            <v-list-item>
                                <v-list-item-content>{this.getFieldTitle(internalName)}</v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon v-show={internalName != LibrarySystemFieldsConstants.Menu && internalName != LibrarySystemFieldsConstants.Status} onClick={() => { this.removeField(index); }}>
                                        <v-icon size='14'>far fa-trash-alt</v-icon>
                                    </v-btn>
                                </v-list-item-action>

                                <v-list-item-action>
                                    <v-btn icon class="mr-0" onClick={() => { }}>
                                        <v-icon class="drag-handle" size='14'>fas fa-grip-lines</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        )
                    })
                }
            </draggable>
        )
    }

    render(h) {

        return (
            <div>
                {
                    this.isLoadingSettings ?
                        <div class="text-center"><v-progress-circular indeterminate></v-progress-circular></div>
                        :
                        <div>
                            <v-select label={this.loc.ProcessLibrarySettings.Paging} item-value="id" item-text="title" items={this.pagingTypes} v-model={this.libraryDisplaySettings.pagingType} onChange={() => { this.updateBlockData(); }}></v-select>

                            {
                                this.libraryDisplaySettings.pagingType !== Enums.ProcessViewEnums.PagingType.NoPaging ?
                                    <v-text-field onChange={() => { this.updateBlockData(); }} min={1} type="number" v-model={this.libraryDisplaySettings.pageSize} label={this.loc.ProcessLibrarySettings.PageSize} ></v-text-field> :
                                    null
                            }
                            <v-select v-model={this.libraryDisplaySettings.defaultOrderingFieldName}
                                items={this.enterprisePropertiesSortable} item-text="multilingualTitle" item-value="internalName"
                                label={this.loc.ProcessLibrarySettings.DefaultOrderingField} onInput={() => { this.updateBlockData(); }}></v-select>
                            {
                                this.libraryDisplaySettings.defaultOrderingFieldName ?
                                    <v-select label={this.loc.SortText.Direction} items={this.sortBys} item-value="id" item-text="title" v-model={this.libraryDisplaySettings.orderDirection} onChange={() => { this.updateBlockData() }}></v-select> : null
                            }

                            <v-layout align-center>
                                <v-select v-model={this.addingFieldName} loading={this.isLoadingProperties} items={this.enterpriseProperties} item-text="multilingualTitle" item-value="internalName"
                                    label={this.loc.ProcessLibrarySettings.Column} onInput={() => { }}></v-select>
                                <v-btn text class="shrink ml-2" disabled={Utils.isNullOrEmpty(this.addingFieldName)}
                                    onClick={() => { this.addField(); }}>
                                    {this.omniaUxLoc.Common.Buttons.Add}
                                </v-btn>
                            </v-layout>

                            <h4>{this.isPublished ? this.loc.ProcessLibrarySettings.DisplayColumnsInPublishedView : this.loc.ProcessLibrarySettings.DisplayColumnsInDraftView}</h4>
                            {this.renderSelectedColumns(h)}

                        </div>
                }
            </div>
        )
    }
}