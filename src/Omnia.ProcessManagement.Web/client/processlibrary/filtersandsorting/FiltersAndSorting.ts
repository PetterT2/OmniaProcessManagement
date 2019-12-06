import { Process } from '../../fx/models';
import { Utils, Injectable, Inject, Localize } from '@omnia/fx';
import { InstanceLifetimes, PropertyIndexedType, EnterprisePropertyDefinition, User, TaxonomyPropertySettings } from '@omnia/fx-models';
import { EnterprisePropertyStore } from '@omnia/fx/store';
import { LibrarySystemFieldsConstants } from '../Constants';
import { TermStore } from '@omnia/fx-sp';
import { ProcessLibraryLocalization } from '../loc/localize';
import { FilterOption, DraftProcess, FilterAndSortInfo, FilterAndSortResponse } from '../../models';
declare var moment;

@Injectable({ lifetime: InstanceLifetimes.Transient })
export class FiltersAndSorting {
    @Inject(EnterprisePropertyStore) private enterprisePropertyStore: EnterprisePropertyStore;
    @Inject(TermStore) private termStore: TermStore;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;

    private users: Array<User> = [];
    private lcid: number;
    private dateFormat: string;

    constructor() {
    }

    public setInformation(users: Array<User>, lcid: number, dateFormat: string) {
        this.users = users;
        this.lcid = lcid;
        this.dateFormat = dateFormat;
    }

    public parseProcessValue(item: Process, internalName: string): string {
        let value = item.rootProcessStep.enterpriseProperties[internalName];
        let field: EnterprisePropertyDefinition = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions().find(p => p.internalName == internalName);
        if (field && value) {
            switch (field.enterprisePropertyDataType.indexedType) {
                case PropertyIndexedType.Text:
                case PropertyIndexedType.Number:
                    return value;
                case PropertyIndexedType.Person:
                    let label = '';
                    value.forEach((identity, index) => {
                        let separate = index == 0 ? '' : ', ';
                        let person = this.users.find(us => us.uid == identity.uid)
                        label += person ? separate + person.displayName : '';
                    });
                    return label;
                case PropertyIndexedType.Taxonomy:
                    let taxonomyValue = '';
                    this.termStore.getters.getTermByIds((field.settings as TaxonomyPropertySettings).termSetId, value, this.lcid)
                        .forEach((term, index) => {
                            let separate = index == 0 ? '' : ', ';
                            taxonomyValue += term ? separate + term.labels[this.lcid].label : '';
                        });
                    return taxonomyValue;
                case PropertyIndexedType.Boolean:
                    return value == 1 || value == true ? this.loc.Common.Yes : this.loc.Common.No;
                case PropertyIndexedType.DateTime:
                    return moment(value).format(this.dateFormat);
            }
        }
        return '';
    }

    public ensurePersonField(processes: Array<Process>, personFields: Array<string>) {
        let allIdentities: Array<string> = [];
        processes.forEach(p => {
            personFields.forEach(f => {
                let value = p.rootProcessStep.enterpriseProperties[f];
                if (value) {
                    value.forEach(i => { if (allIdentities.findIndex(uid => uid == i.uid) == -1) allIdentities.push(i.uid) });
                }
            })
        })
        return allIdentities;
    }

    public ensureTaxonomyField(processes: Array<Process>, taxonomyFields: Array<string>) {
        let allTerms: Array<string> = [];
        processes.forEach(p => {
            taxonomyFields.forEach(f => {
                let value = p.rootProcessStep.enterpriseProperties[f];
                if (value) {
                    value.forEach(i => { if (allTerms.findIndex(uid => uid == i) == -1) allTerms.push(i) });
                }
            })
        })
        return allTerms;
    }

    public applyFiltersAndSort(processes: Array<DraftProcess>, request: FilterAndSortInfo, pageSize: number): FilterAndSortResponse {
        let result: FilterAndSortResponse = {
            total: processes.length,
            processes: Utils.clone(processes)
        };
        if (request.filters) {
            Object.getOwnPropertyNames(request.filters).forEach(key => {
                result.processes = result.processes.filter(p => !Utils.isNullOrEmpty(p.sortValues[key])
                    && p.sortValues[key].toString().split(',').filter(f => request.filters[key].find(v => v.trim() == f.trim()) != null).length > 0)
            });
        }
        result.processes = this.applySorting(result.processes, request.sortBy, request.sortAsc);
        result.total = result.processes.length;
        if (pageSize > 0) {
            result.total = result.processes.length;
            result.processes = result.processes.splice((request.pageNum - 1) * pageSize, request.pageNum * pageSize);
        }
        return result;
    }

    public getFilterOptions(processes: Array<DraftProcess>, internalName: string, filters: { [key: string]: Array<string> }) {
        let tempProcesses: Array<DraftProcess> = Utils.clone(processes);
        tempProcesses = this.applySorting(tempProcesses, internalName, true);
        let filterOptions: Array<FilterOption> = [];
        let hasEmpty: boolean = false;
        tempProcesses.forEach(d => {
            if (Utils.isNullOrEmpty(d.sortValues[internalName]))
                hasEmpty = true;
            else {
                let values = d.sortValues[internalName].toString().split(',');
                values.forEach(value => {
                    value = value.trim();
                    if (filterOptions.findIndex(o => o.value == value) == -1)
                        filterOptions.push({
                            value: value,
                            selected: filters && filters[internalName] && filters[internalName].findIndex(v => v == value) > -1
                        });
                });
            }
        });
        filterOptions = filterOptions.sort((a, b) => {
            return a.value.localeCompare(b.value);
        });
        if (hasEmpty)
            filterOptions.unshift({ value: this.loc.Filter.Empty, selected: filters && filters[internalName] && filters[internalName].findIndex(v => v == this.loc.Filter.Empty) > -1 });
        processes.forEach(p => {
            let process = tempProcesses.find(tp => tp.id == p.id);
            p.sortValues[internalName] = process != null ? process.sortValues[internalName] : "";
        });
        return filterOptions;
    }

    private applySorting(processes: Array<DraftProcess>, sortBy: string, sortAsc: boolean) {
        if (!Utils.isNullOrEmpty(sortBy) && !Utils.isNullOrEmpty(sortAsc)) {
            if (sortBy == LibrarySystemFieldsConstants.Title) {
                processes.forEach(p => p.sortValues[sortBy] = p.rootProcessStep.multilingualTitle);
                return processes.sort((a, b) => {
                    var comparer = a.rootProcessStep.multilingualTitle.localeCompare(b.rootProcessStep.multilingualTitle);
                    return sortAsc ? comparer : (comparer == 1 ? -1 : comparer == 1 ? -1 : 0);
                });
            }

            let sortField = this.enterprisePropertyStore.getters.enterprisePropertyDefinitions().find(f => f.internalName == sortBy);
            if (sortField) {
                processes.forEach(p => p.sortValues[sortBy] = Utils.isNullOrEmpty(p.sortValues[sortBy]) ? this.parseProcessValue(p, sortBy) : p.sortValues[sortBy]);

                return processes.sort((a, b) => {
                    let comparer = 0;
                    let aValue = a.rootProcessStep.enterpriseProperties[sortBy];
                    let bValue = b.rootProcessStep.enterpriseProperties[sortBy];
                    if (Utils.isNullOrEmpty(aValue) || Utils.isNullOrEmpty(bValue)) {
                        comparer = Utils.isNullOrEmpty(aValue) && Utils.isNullOrEmpty(bValue) ? 0 :
                            Utils.isNullOrEmpty(aValue) ? -1 : 1;
                    }
                    else if (sortField.enterprisePropertyDataType.indexedType == PropertyIndexedType.Person ||
                        sortField.enterprisePropertyDataType.indexedType == PropertyIndexedType.Taxonomy) {
                        if (Utils.isNullOrEmpty(a.sortValues[sortBy]) || Utils.isNullOrEmpty(b.sortValues[sortBy]))
                            comparer = Utils.isNullOrEmpty(a.sortValues[sortBy]) && Utils.isNullOrEmpty(b.sortValues[sortBy]) ? 0 :
                                Utils.isNullOrEmpty(a.sortValues[sortBy]) ? -1 : 1;
                        else
                            comparer = a.sortValues[sortBy].localeCompare(b.sortValues[sortBy]);
                    }
                    else {
                        switch (sortField.enterprisePropertyDataType.indexedType) {
                            case PropertyIndexedType.Boolean:
                                comparer = (aValue === bValue) ? 0 : aValue ? 1 : -1;
                                break;
                            case PropertyIndexedType.DateTime:
                                comparer = this.dateComparer(aValue, bValue);
                                break;
                            case PropertyIndexedType.Number:
                                comparer = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                                break;
                            default:
                                comparer = aValue.localeCompare(bValue);
                                break;

                        }
                    }
                    return sortAsc ? comparer : (comparer == 1 ? -1 : comparer == 1 ? -1 : 0);
                })
            }
        }
        return processes;
    }

    private dateComparer(dateA, dateB) {
        var a = new Date(dateA);
        var b = new Date(dateB);

        var msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate()).toString();
        var msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate()).toString();

        if (parseFloat(msDateA) < parseFloat(msDateB))
            return -1;
        else if (parseFloat(msDateA) == parseFloat(msDateB))
            return 0;
        else if (parseFloat(msDateA) > parseFloat(msDateB))
            return 1;
        else
            return null;
    }
}
