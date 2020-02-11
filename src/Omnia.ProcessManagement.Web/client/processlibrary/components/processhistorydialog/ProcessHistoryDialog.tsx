import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { OmniaTheming, StyleFlow, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, VueComponentBase, FormValidator, FieldValueValidation, DialogModel, IValidator } from '@omnia/fx/ux';
import { ProcessLibraryStyles } from '../../../models';
import { MultilingualStore } from '@omnia/fx/store';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { IProcessHistoryDialog } from './IProcessHistoryDialog';
import { ProcessData, Process } from '../../../fx/models';
import { OPMCoreLocalization } from '../../../core/loc/localize';
import { ProcessLibraryFields, DefaultDateFormat } from '../../Constants';
import { TenantRegionalSettings, GuidValue, User } from '@omnia/fx-models';
import { ProcessService } from '../../../fx';
import { UserService } from '@omnia/fx/services';
declare var moment;

@Component
export class ProcessHistoryDialog extends VueComponentBase<{}, {}, {}> implements IWebComponentInstance, IProcessHistoryDialog {
    @Prop() styles: typeof ProcessLibraryStyles | any;
    @Prop() opmProcessId: GuidValue;
    @Prop() closeCallback: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(OmniaContext) omniaContext: OmniaContext;
    @Inject(ProcessService) processService: ProcessService;
    @Inject(UserService) userService: UserService;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private classes = StyleFlow.use(ProcessLibraryStyles);
    private isLoading: boolean = false;
    private userDisplayNameDic: { [uid: string]: User } = {};

    dateFormat: string = DefaultDateFormat;
    errMessage: string = "";
    publishedHeaders = [
        { text: this.coreLoc.Columns.Edition, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Revision, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Title, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Published, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.Comment, align: 'left', sortable: false },
        { text: this.coreLoc.Columns.ApprovedBy, align: 'left', sortable: false }
    ];
    processHistories: Array<Process> = [];

    created() {
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.init();
    }

    private init() {
        if (this.styles) {
            this.classes = StyleFlow.use(ProcessLibraryStyles, this.styles);
        }
        let regionalSettings = this.omniaContext.tenant.propertyBag.getModel(TenantRegionalSettings);
        if (regionalSettings && regionalSettings.dateFormat) {
            this.dateFormat = regionalSettings.dateFormat;
        }

        this.isLoading = true;
        this.processService.getProcessHistory(this.opmProcessId).then((processes) => {
            this.processHistories = processes;
            this.processHistories.sort((a, b) => {
                var aEdition = a.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Edition];
                var bEdition = b.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Edition];
                var aRevision = a.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Revision] || 0;
                var bRevision = b.rootProcessStep.enterpriseProperties[ProcessLibraryFields.Revision] || 0;
                if (aEdition == bEdition) {
                    return aRevision == bRevision ? 0 : (aRevision < bRevision ? 1 : -1);
                }
                else return aEdition < bEdition ? 1 : -1;
            })
            var usersUIDS = [];
            processes.forEach(f => {
                if (usersUIDS.indexOf(f.publishedBy) == -1)
                    usersUIDS.push(f.publishedBy);
            });
            if (usersUIDS.length > 0) {
                this.userService.resolveUsersByUIDs(usersUIDS).then(users => {
                    users.users.forEach(u => {
                        this.userDisplayNameDic[u.uid] = u;
                    })
                    this.isLoading = false;
                })
            }
            else
                this.isLoading = false;
        }).catch((err) => {
            this.errMessage = err;
            this.isLoading = false;
        })
    }

    renderItems(h, item: Process) {
        let enterpriseProperties = item.rootProcessStep.enterpriseProperties;
        return (
            <tr>
                {
                    this.publishedHeaders.map(header => {
                        switch (header.text) {
                            case this.coreLoc.Columns.Edition:
                                return (
                                    <td>
                                        {enterpriseProperties[ProcessLibraryFields.Edition]}
                                    </td>
                                );
                            case this.coreLoc.Columns.Revision:
                                return (
                                    <td>
                                        {enterpriseProperties[ProcessLibraryFields.Revision] && enterpriseProperties[ProcessLibraryFields.Revision] > 0 ? enterpriseProperties[ProcessLibraryFields.Revision] : ''}
                                    </td>
                                );
                            case this.coreLoc.Columns.Title:
                                return (
                                    <td>
                                        <a onClick={() => { }}>{item.rootProcessStep.multilingualTitle}</a>
                                    </td>
                                );

                            case this.coreLoc.Columns.Published:
                                return (
                                    <td>
                                        {moment(item.publishedAt).isValid() ? moment(item.publishedAt).format(this.dateFormat) : ""}
                                    </td>
                                );
                            case this.coreLoc.Columns.Comment:
                                return (
                                    <td>
                                        {item.rootProcessStep.comment}
                                    </td>
                                );
                            case this.coreLoc.Columns.ApprovedBy:
                                return (
                                    <td>
                                        {
                                            Utils.isNullOrEmpty(this.userDisplayNameDic[item.publishedBy]) ? ""
                                                : this.userDisplayNameDic[item.publishedBy].displayName
                                        }
                                    </td>
                                );
                            default:
                                return (
                                    <td>
                                        <a onClick={() => { }}></a>
                                    </td>
                                )
                        }
                    })
                }
            </tr>
        )
    }

    renderBody(h) {
        return (
            <v-data-table headers={this.publishedHeaders}
                items={this.processHistories}
                hide-default-footer
                items-per-page={Number.MAX_SAFE_INTEGER}
                scopedSlots={{
                    item: p => this.renderItems(h, p.item)
                }}>
                <div slot="no-data">
                    {this.loc.Messages.MessageNoItem}
                </div>
            </v-data-table>
        )
    }

    render(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.closeCallback(); }}
                model={{ visible: true }}
                hideCloseButton
                width="1200px"
                position={DialogPositions.Center}>
                <div>
                    <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                        <v-toolbar-title>{this.loc.ProcessHistory}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={() => { this.closeCallback(); }}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                        <div data-omfx>
                            {
                                this.isLoading ?
                                    <v-skeleton-loader loading={true} height="100%" type="table"></v-skeleton-loader>
                                    : this.renderBody(h)
                            }
                        </div>
                        <v-card-actions class={this.classes.dialogFooter}>
                            <v-spacer></v-spacer>
                            <span class={[this.classes.error, 'mr-2']}>{this.errMessage}</span>
                            <v-btn
                                text
                                light={!this.omniaTheming.promoted.body.dark}
                                onClick={() => { this.closeCallback(); }}>
                                {this.omniaUxLoc.Common.Buttons.Close}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </omfx-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ProcessHistoryDialog);
});

