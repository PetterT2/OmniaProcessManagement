import { Enums,  } from '../../fx/models';
import { BuiltInEnterprisePropertyInternalNames } from '@omnia/fx-models';

/**
 * Factory for Process Rollup settings
 * */
export const ProcessRollupConfigurationFactory = {
    //create(): DocumentRollupBlockData {
    //    let newSettings: DocumentRollupBlockData = {
    //        data: {},
    //        settings: {
    //            title: '',
    //            sortDescending: false,
    //            pagingType: Enums.DocumentViewEnums.PagingType.NoPaging,
    //            itemLimit: 50,
    //            refiners: [],
    //            filters: [],
    //            query: '',
    //            searchScope: Enums.DocumentViewEnums.QueryScope.AllDocuments,
    //            refinerPosition: Enums.DocumentViewEnums.Positions.Top,
    //            filterPosition: Enums.DocumentViewEnums.Positions.Top,
    //            viewSettings: {
    //                selectProperties: []
    //            },
    //            dayLimitProperty: ''
    //        } as any
    //    };

    //    return newSettings;
    //},
    //applyArchivedDocumentSettingsToBlockData(data: DocumentRollupBlockData, loc: DocumentRollupLocalization.locInterface) {
    //    data.settings.searchScope = Enums.DocumentViewEnums.QueryScope.ArchivedDocuments;
    //    data.settings.pagingType = Enums.DocumentViewEnums.PagingType.Classic;
    //    data.settings.filters = [{ property: DocumentRollupConstants.searchBoxInternalName, valueObj: {}, type: null }];
    //    data.settings.selectedViewId = DocumentRollupConstants.defaultViewId;
    //    data.settings.query = "IsDocument: true";
    //    (data.settings.viewSettings as DocumentRollupListViewSettings).columns = [
    //        { internalName: DocumentRollupConstants.documentIconNameLink, multilingualTitle: `[${loc.ListView.IconNameLink}]` } as any,
    //        { internalName: DocumentRollupConstants.infoIcon, multilingualTitle: `[${loc.ListView.InfoIcon}]` } as any,
    //        { internalName: DocumentRollupConstants.appendiceIcon, multilingualTitle: `[${loc.ListView.AppendicesIcon}]` } as any
    //    ];
    //    data.settings.viewSettings.selectProperties.push(BuiltInEnterprisePropertyInternalNames.Title);
    //    data.settings.viewSettings.selectProperties.push(SharePointFieldsConstants.FileName);
    //    data.settings.viewSettings.selectProperties.push(ODMFieldNameConstants.ODMAppendices);
    //},
    //applyBreakPointSettingsToBlockData(data: DocumentRollupBlockData, breakPoint: string) {
    //    if (data.settings.breakPointSettings && data.settings.breakPointSettings[breakPoint]) {
    //        let breakPointSettings = data.settings.breakPointSettings[breakPoint];
    //        data.settings.selectedViewId = breakPointSettings.selectedViewId;
    //        data.settings.viewSettings = breakPointSettings.viewSettings;
    //        data.settings.leftZoneMaxWidth = breakPointSettings.leftZoneMaxWidth;
    //        data.settings.rightZoneMaxWidth = breakPointSettings.rightZoneMaxWidth;
    //        data.settings.spacing = breakPointSettings.spacing;
    //        data.settings.title = breakPointSettings.title;
    //        data.settings.itemLimit = breakPointSettings.itemLimit;

    //        data.settings.refinerPosition = breakPointSettings.refinerPosition;
    //        data.settings.refiners = breakPointSettings.refiners;
    //        data.settings.filterPosition = breakPointSettings.filterPosition;
    //        data.settings.filters = breakPointSettings.filters;

    //        data.settings.pagingType = data.settings.trimByFollowingSites ? Enums.DocumentViewEnums.PagingType.NoPaging : breakPointSettings.pagingType;
    //    }
    //},
    //saveBreakPointSettingsToBlockData(data: DocumentRollupBlockData, originalData: DocumentRollupBlockData, breakPoint: string) {
    //    if (!originalData.settings.breakPointSettings)
    //        originalData.settings.breakPointSettings = {};

    //    originalData.settings.breakPointSettings[breakPoint] = {
    //        selectedViewId: data.settings.selectedViewId,
    //        spacing: data.settings.spacing,
    //        title: data.settings.title,
    //        leftZoneMaxWidth: data.settings.leftZoneMaxWidth,
    //        rightZoneMaxWidth: data.settings.rightZoneMaxWidth,
    //        viewSettings: data.settings.viewSettings,
    //        itemLimit: data.settings.itemLimit,
    //        refiners: data.settings.refiners,
    //        refinerPosition: data.settings.refinerPosition,
    //        filters: data.settings.filters,
    //        filterPosition: data.settings.filterPosition,
    //        pagingType: originalData.settings.trimByFollowingSites ? Enums.DocumentViewEnums.PagingType.NoPaging : data.settings.pagingType
    //    }
    //},
    //copySettingToBeakPoint(blockData: DocumentRollupBlockData, cloneData: DocumentRollupBlockData, breakPoint: string) {
    //    if (!blockData.settings.breakPointSettings)
    //        blockData.settings.breakPointSettings = {};
    //    blockData.settings.breakPointSettings[breakPoint] = {
    //        selectedViewId: cloneData.settings.selectedViewId,
    //        spacing: cloneData.settings.spacing,
    //        title: cloneData.settings.title,
    //        leftZoneMaxWidth: cloneData.settings.leftZoneMaxWidth,
    //        rightZoneMaxWidth: cloneData.settings.rightZoneMaxWidth,
    //        viewSettings: cloneData.settings.viewSettings,
    //        itemLimit: cloneData.settings.itemLimit,
    //        refiners: cloneData.settings.refiners,
    //        refinerPosition: cloneData.settings.refinerPosition,
    //        filters: cloneData.settings.filters,
    //        filterPosition: cloneData.settings.filterPosition,
    //        pagingType: cloneData.settings.trimByFollowingSites ? Enums.DocumentViewEnums.PagingType.NoPaging : cloneData.settings.pagingType
    //    }
    //}
}

