import { ProcessType, ProcessTypeItemSettings, PublishingApprovalSettingsTypes, TermDrivenPublishingApprovalSettings, PersonPropertyPublishingApprovalSettings, ApproverId, ReviewReminderScheduleTypes, PropertySchedule, PropertySetItemSettings, PropertySetBooleanItemSettings, PropertySetDateTimeItemSettings, PropertySetNumberItemSettings, PropertySetPersonItemSettings, PropertySetTaxonomyItemSettings, PropertySetRichTextItemSettings, PropertySetTextItemSettings, LimitedUsersPublishingApprovalSettings, ProcessTemplate } from '../../../../fx/models';
import { EnterprisePropertyDefinition, EnterprisePropertySet, PropertyIndexedType, GuidValue, EnterprisePropertySetItem, PropertySetPersonItem, PropertySetTaxonomyItem, PropertySetDateTimeItem, MultilingualScopes, LanguageTag } from '@omnia/fx-models';
import { TermData } from '@omnia/fx-sp';

export const TabNames = {
    general: 0,
    publish: 1,
    review: 2,
    archive: 3
}

export module ProcessTypeHelper {
    var _setDict: { [id: string]: EnterprisePropertySet } = {};
    var _propertyDict: { [id: string]: EnterprisePropertyDefinition } = {};
    var _settings: ProcessTypeItemSettings = null;
    var _processType: ProcessType = null;
    var _defaultLanguage: LanguageTag = "en-us";

    var _availablePropertiesInSelectedSet: {
        propertySetId: GuidValue,
        [propertyIndexedType: number]: Array<EnterprisePropertyDefinition>
    } = null;

    var _setPropertyDictInSelectedSet: {
        propertySetId: GuidValue,
        propertydict: {
            [id: string]: EnterprisePropertyDefinition
        },
        setItemDict: {
            [id: string]: EnterprisePropertySetItem
        }
    }

    export function isMultiple(id: GuidValue) {
        ensureSetPropertyDictInSelectedSet();
        let isMultiple = false;
        let setItem = _setPropertyDictInSelectedSet.setItemDict[id.toString()];
        if (setItem.type == PropertyIndexedType.Person) {
            isMultiple = (setItem as PropertySetPersonItem).multiple;

        } else if (setItem.type == PropertyIndexedType.Taxonomy) {
            isMultiple = (setItem as PropertySetTaxonomyItem).multiple;
        }
        else {
            console.warn(`There is no multiple settings for property with id ${id}`)
        }


        return isMultiple
    }

    export function isDateOnly(id: GuidValue) {
        ensureSetPropertyDictInSelectedSet();
        let isDateOnly = false;
        let setItem = _setPropertyDictInSelectedSet.setItemDict[id.toString()];
        if (setItem.type == PropertyIndexedType.DateTime) {
            isDateOnly = (setItem as PropertySetDateTimeItem).dateOnly;
        }
        else {
            console.warn(`There is no date-only settings for property with id ${id}`)
        }

        return isDateOnly
    }

    export function initCheckerData(processType: ProcessType, properties: Array<EnterprisePropertyDefinition>, sets: Array<EnterprisePropertySet>, defaultLanguage: LanguageTag) {
        _processType = processType;
        _settings = processType.settings as ProcessTypeItemSettings;
        _defaultLanguage = defaultLanguage;

        _setDict = {};
        sets.forEach(s => _setDict[s.id.toString()] = s);

        _propertyDict = {};
        properties.forEach(p => _propertyDict[p.id.toString()] = p);

        _availablePropertiesInSelectedSet = null;
        _setPropertyDictInSelectedSet = null;
    }

    export function disposeCheckerData() {
        _setDict = {};
        _propertyDict = {};
        _settings = null;
        _availablePropertiesInSelectedSet = null;
        _setPropertyDictInSelectedSet = null;
    }

    /**
     * Ensure all valid data relate to selected term set for term-driven approval
     * @param termSetId
     * @param terms
     */
    export function ensureValidTermDriven(termSetId: GuidValue, terms: Array<TermData>) {
        let validIds: { [id: string]: boolean } = {};
        validIds[termSetId.toString()] = true;

        terms.forEach(term => {
            validIds[term.id] = true;
        })

        if (_settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.TermDriven) {
            let termDrivenPublishingApprovalSettings = (_settings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings).settings;
            Object.keys(termDrivenPublishingApprovalSettings).forEach(id => {
                if (!validIds[id]) {
                    delete termDrivenPublishingApprovalSettings[id]
                }
            })
        }
        else {
            console.warn(`The publishing approval setitings is not term-driven type`);
        }
    }


    export function validateProcessTypeItem() {
        let invalidTab = null;

        if (!_settings.enterprisePropertySetId || !_processType.title[_defaultLanguage] || !_processType.title[_defaultLanguage].trim()) {
            invalidTab = TabNames.general;
        }
        else if (_settings.publishingApprovalSettings && (
            _settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.LimitedUsers && (_settings.publishingApprovalSettings as LimitedUsersPublishingApprovalSettings).users.length == 0 ||
            _settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.TermDriven && !(_settings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings).taxonomyEnterprisePropertyDefinitionId ||
            _settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.PersonProperty && !(_settings.publishingApprovalSettings as PersonPropertyPublishingApprovalSettings).personEnterprisePropertyDefinitionId)) {

            invalidTab = TabNames.publish;
        }
        else if (_settings.reviewReminder && (
            _settings.reviewReminder.schedule.type == ReviewReminderScheduleTypes.Property && !(_settings.reviewReminder.schedule as PropertySchedule).dateTimeEnterprisePropertyDefinitionId ||
            _settings.reviewReminder.task && !_settings.reviewReminder.task.personEnterprisePropertyDefinitionId)) {
            invalidTab = TabNames.review;
        }

        return invalidTab;
    }

    /**
     * ensure all valid data relate to selected property set
     * */
    export function ensureValidData() {
        if (!_settings) {
            throw 'Init checker data is required';
        }

        ensureValidProcessTemplates();
        ensureSetPropertyDictInSelectedSet();
        ensureValidRelatedSettingsUsingPropertySet();
    }

    export function getAvailableProperties(type?: PropertyIndexedType) {
        if (!_settings) {
            throw 'Init checker data is required';
        }

        if (!type)
            type = 0; //All type

        ensureAvailablePropertiesInSelectedSet(type);

        return _availablePropertiesInSelectedSet[type as any] || []
    }

    function ensureValidProcessTemplates() {
        if (_settings.defaultProcessTemplateId && !_settings.processTemplateIds.find(d => d == _settings.defaultProcessTemplateId)) {
            _settings.defaultProcessTemplateId = null;
        }
    }

    function ensureAvailablePropertiesInSelectedSet(type: PropertyIndexedType) {

        if (!_availablePropertiesInSelectedSet || _availablePropertiesInSelectedSet.propertySetId != _settings.enterprisePropertySetId) {
            _availablePropertiesInSelectedSet = {
                propertySetId: _settings.enterprisePropertySetId
            }
        }

        if (_availablePropertiesInSelectedSet.propertySetId && !_availablePropertiesInSelectedSet[type as any]) {
            let set = _setDict[_availablePropertiesInSelectedSet.propertySetId.toString()];
            var availableTypeProperties = set.settings.items
                .filter(i => type == 0 || i.type == type)
                .map(i => _propertyDict[i.enterprisePropertyDefinitionId.toString()])
                .filter(i => i);

            _availablePropertiesInSelectedSet[type as any] = availableTypeProperties;
        }

    }

    function ensureSetPropertyDictInSelectedSet() {
        if (!_setPropertyDictInSelectedSet || _setPropertyDictInSelectedSet.propertySetId != _settings.enterprisePropertySetId) {

            let propertyDictInSelectedSet: { [id: string]: EnterprisePropertyDefinition } = {}
            let setItemDict: { [id: string]: EnterprisePropertySetItem } = {};
            if (_settings.enterprisePropertySetId && _setDict[_settings.enterprisePropertySetId.toString()]) {
                let set = _setDict[_settings.enterprisePropertySetId.toString()];
                set.settings.items.forEach(item => {
                    propertyDictInSelectedSet[item.enterprisePropertyDefinitionId.toString()] = _propertyDict[item.enterprisePropertyDefinitionId.toString()];
                    setItemDict[item.enterprisePropertyDefinitionId.toString()] = item;
                })
            }
            else {
                _settings.enterprisePropertySetId = null;
            }

            _setPropertyDictInSelectedSet = {
                propertySetId: _settings.enterprisePropertySetId,
                propertydict: propertyDictInSelectedSet,
                setItemDict: setItemDict
            }
        }
    }

    function ensureValidRelatedSettingsUsingPropertySet() {
        Object.keys(_settings.propertySetItemSettings).forEach(key => {
            if (!_setPropertyDictInSelectedSet.propertydict[key] ||
                _setPropertyDictInSelectedSet.propertydict[key].enterprisePropertyDataType.indexedType != _settings.propertySetItemSettings[key].type) {
                delete _settings.propertySetItemSettings[key];
            }
            else {
                let propertySetItemSettings = _settings.propertySetItemSettings[key]

                //ensure selected property for default value is exisiting
                if (propertySetItemSettings.defaultValueFromAppPropertyDefinitionId) {
                    let propertyId = propertySetItemSettings.defaultValueFromAppPropertyDefinitionId;
                    let type = propertySetItemSettings.type;

                    if (!_propertyDict[propertyId.toString()] || _propertyDict[propertyId.toString()].enterprisePropertyDataType.indexedType != type) {
                        propertySetItemSettings.defaultValueFromAppPropertyDefinitionId = null;
                    }
                }

                //ensure fixed value to match with multiple/single settings in property set
                let setItem = _setPropertyDictInSelectedSet.setItemDict[key];
                if (propertySetItemSettings.type == PropertyIndexedType.Person) {
                    let multiple = (setItem as PropertySetPersonItem).multiple;
                    if (!multiple && (propertySetItemSettings as PropertySetPersonItemSettings).fixedDefaultValues
                        && (propertySetItemSettings as PropertySetPersonItemSettings).fixedDefaultValues.length > 1)
                        (propertySetItemSettings as PropertySetPersonItemSettings).fixedDefaultValues.length = 1;;
                }
                else if (propertySetItemSettings.type == PropertyIndexedType.Taxonomy) {
                    let multiple = (setItem as PropertySetTaxonomyItem).multiple;
                    if (!multiple && (propertySetItemSettings as PropertySetTaxonomyItemSettings).fixedDefaultValues
                        && (propertySetItemSettings as PropertySetTaxonomyItemSettings).fixedDefaultValues.length > 1)
                        (propertySetItemSettings as PropertySetTaxonomyItemSettings).fixedDefaultValues.length = 1;;
                }

                //TODO: ensure date-only/datetime for datetime property
            }
        })

        let newPropertySetItemSettings: { [id: string]: PropertySetItemSettings } = {};
        Object.keys(_setPropertyDictInSelectedSet.propertydict).forEach(key => {
            if (!_settings.propertySetItemSettings[key]) {
                let property = _setPropertyDictInSelectedSet.propertydict[key];
                let propertySettings: PropertySetItemSettings = {
                    type: property.enterprisePropertyDataType.indexedType,
                    defaultValueFromAppPropertyDefinitionId: null
                }
                let acceptedType = ensurePropertySetItemDefaultValue(propertySettings);
                if (acceptedType) {
                    newPropertySetItemSettings[key] = propertySettings;
                }
            }
        })

        if (Object.keys(newPropertySetItemSettings).length > 0) {
            _settings.propertySetItemSettings = Object.assign(_settings.propertySetItemSettings, newPropertySetItemSettings)
        }


        if (_settings.publishingApprovalSettings) {
            if (_settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.TermDriven) {
                let termDriveSettings = _settings.publishingApprovalSettings as TermDrivenPublishingApprovalSettings;
                if (!validateProperty(termDriveSettings.taxonomyEnterprisePropertyDefinitionId, PropertyIndexedType.Taxonomy)) {
                    termDriveSettings.settings = {};
                    termDriveSettings.taxonomyEnterprisePropertyDefinitionId = null;
                }
            }
            else if (_settings.publishingApprovalSettings.type == PublishingApprovalSettingsTypes.PersonProperty) {
                let personSettigns = _settings.publishingApprovalSettings as PersonPropertyPublishingApprovalSettings;

                if (!validateProperty(personSettigns.personEnterprisePropertyDefinitionId, PropertyIndexedType.Person)) {
                    personSettigns.personEnterprisePropertyDefinitionId = null;
                }
            }
        }

        _settings.feedbackRecipientsPropertyDefinitionIds = _settings.feedbackRecipientsPropertyDefinitionIds.filter(
            i => i == ApproverId || validateProperty(i, PropertyIndexedType.Person))

        if (_settings.reviewReminder) {

            _settings.reviewReminder.personEnterprisePropertyDefinitionIds.filter(
                i => i == ApproverId || validateProperty(i, PropertyIndexedType.Person))

            if (_settings.reviewReminder.schedule.type == ReviewReminderScheduleTypes.Property) {
                let propertySchedule = _settings.reviewReminder.schedule as PropertySchedule;
                if (!validateProperty(propertySchedule.dateTimeEnterprisePropertyDefinitionId, PropertyIndexedType.DateTime)) {
                    propertySchedule.dateTimeEnterprisePropertyDefinitionId = null;
                }
            }

            if (_settings.reviewReminder.task && !validateProperty(_settings.reviewReminder.task.personEnterprisePropertyDefinitionId, PropertyIndexedType.Person)) {
                _settings.reviewReminder.task.personEnterprisePropertyDefinitionId = null;
            }
        }
    }

    function validateProperty(id: GuidValue, type: PropertyIndexedType) {
        return id && _setPropertyDictInSelectedSet.propertydict[id.toString()] && _setPropertyDictInSelectedSet.propertydict[id.toString()].enterprisePropertyDataType.indexedType == type;
    }

    function ensurePropertySetItemDefaultValue(propertySettings: PropertySetItemSettings) {

        let acceptedType = false;
        if (propertySettings.type == PropertyIndexedType.Boolean) {
            acceptedType = true;
            (propertySettings as PropertySetBooleanItemSettings).fixedDefaultValue = false;
        }
        else if (propertySettings.type == PropertyIndexedType.DateTime) {
            acceptedType = true;
            (propertySettings as PropertySetDateTimeItemSettings).fixedDefaultValue = null;
        }
        else if (propertySettings.type == PropertyIndexedType.Number) {
            acceptedType = true;
            (propertySettings as PropertySetNumberItemSettings).fixedDefaultValue = 0;
        }
        else if (propertySettings.type == PropertyIndexedType.Person) {
            acceptedType = true;
            (propertySettings as PropertySetPersonItemSettings).fixedDefaultValues = [];
        }
        else if (propertySettings.type == PropertyIndexedType.Taxonomy) {
            acceptedType = true;
            (propertySettings as PropertySetTaxonomyItemSettings).fixedDefaultValues = [];
        }
        else if (propertySettings.type == PropertyIndexedType.RichText) {
            acceptedType = true;
            (propertySettings as PropertySetRichTextItemSettings).fixedDefaultValue = '';
        }
        else if (propertySettings.type == PropertyIndexedType.Text) {
            acceptedType = true;
            (propertySettings as PropertySetTextItemSettings).fixedDefaultValue = '';
        }

        return acceptedType;
    }
}