import { Inject, Localize, Utils } from '@omnia/fx';
import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { GuidValue, UserIdentity, UserPrincipalType } from '@omnia/fx-models';
import { NodeStylesInterface } from './Node.css';
import { TermBase, TermStore } from '@omnia/fx-sp';
import { InternalStore } from './InternalStore';
import { ProcessTypeJourneyStore } from '../../../../store';
import { ProcessTypeItemSettings, TermDrivenPublishingApprovalSettings } from '../../../../../../../fx/models';
import { UserService } from '@omnia/fx/services';
import { OPMAdminLocalization } from '../../../../../../loc/localize';

export interface TermDrivenComponentProps {
    dark: boolean;
    level: number;
    termNode: TermBase;
    termSetId: GuidValue; //since we using TermBase model for term node to support both term/termset input, so we need this termSetId as seperated prop
    styles: NodeStylesInterface<string>;

    //This is an object to keep track expandation status, it is not supposed to use with reactive, just a backup expand status when a node is re-created
    expandStatus: { [id: string]: boolean }
}


@Component
export class TermDrivenNodeComponent extends tsx.Component<TermDrivenComponentProps>
{
    @Prop() dark: boolean;
    @Prop() level: number;
    @Prop() termNode: TermBase;
    @Prop() termSetId: GuidValue;
    @Prop() styles: NodeStylesInterface<string>;
    @Prop() expandStatus: { [id: string]: boolean };

    @Inject(UserService) userService: UserService;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(InternalStore) internalStore: InternalStore;
    @Inject(TermStore) termStore: TermStore;

    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isExpanded = false;
    isInherit = false;
    termDrivenMap: { [id: string]: Array<UserIdentity> }
    userNames: string = "";
    rootNode: boolean = false;
    created() {
        //Auto expand the first level
        this.rootNode = this.termNode.id == this.termSetId;
        if (this.rootNode) {
            this.isExpanded = true;
        }
        else if (this.expandStatus[this.termNode.id]) {
            this.isExpanded = true;
        }

        this.termDrivenMap = ((this.processTypeJourneyStore.getters.editingProcessType()
            .settings as ProcessTypeItemSettings)
            .publishingApprovalSettings as TermDrivenPublishingApprovalSettings).settings;

        if (!this.termDrivenMap[this.termNode.id] && !this.rootNode)
            this.isInherit = true;
        else {
            this.ensureUserNameForDisplayAsync()
        }
    }

    onArrowIconClick(e: Event, hasChildren: boolean) {
        if (hasChildren) {
            e.stopPropagation();
            this.isExpanded = !this.isExpanded;
            this.expandStatus[this.termNode.id] = this.isExpanded;
        }
    }

    onIsInheritChanged() {
        if (this.isInherit) {
            this.termDrivenMap[this.termNode.id] = null;
            this.userNames = '';
        } else {
            this.termDrivenMap[this.termNode.id] = [];
        }
    }

    onTermClick(e: Event) {
        e.stopPropagation();
        this.internalStore.mutations.setSelectingTerm.commit(this.termNode);
    }

    /**
     * in display mode, we don't use people-picker to render people to prevent from rendering lots of unnecessary DOM on UI
     * don't need to wait this process, just render other stuffs first
     * */
    ensureUserNameForDisplayAsync() {
        let users = this.termDrivenMap[this.termNode.id];
        if (users && users.length > 0) {
            let userIds = users.map(u => u.uid);
            this.userService.resolveUsersByPrincipalNames(userIds).then((users) => {
                this.userNames = users.map(u => u.displayName).join(', ');
            })
        } else {
            this.userNames = '';
        }

    }

    public renderEdit(h) {
        return (
            <v-layout wrap class={[this.styles.noWrap, 'pr-1']}>
                {
                    !this.rootNode &&
                    <v-checkbox label={this.loc.ProcessTypes.Settings.InheritParentSettings}
                        input-value={this.isInherit}
                        onChange={(val) => { this.isInherit = val; this.onIsInheritChanged() }}>
                    </v-checkbox>
                }
                {!this.isInherit &&
                    <v-flex>
                        <omfx-people-picker
                            multiple
                            dark={this.dark}
                            label=" "
                            principalType={UserPrincipalType.Member}
                            model={this.termDrivenMap[this.termNode.id]}
                            onModelChange={(model) => { this.termDrivenMap[this.termNode.id] = model; this.ensureUserNameForDisplayAsync() }}></omfx-people-picker>
                    </v-flex>
                }
            </v-layout>)

    }

    public renderDisplay(h) {
        return !this.isInherit && <div class={this.styles.noWrap}>{this.userNames || this.loc.ProcessTypes.Settings.NoApproverFound}</div>
    }


    /**
     * Render 
     * @param h
     */
    public render(h) {
        let selectingTerm = this.internalStore.getters.selectingTerm();
        let isSelected = selectingTerm && selectingTerm.id == this.termNode.id;
        let children = this.termStore.getters.getChildrenTerms(this.termSetId, this.termNode.id);
        let levelStyle = this.styles[this.level] || '';
        let theme = this.dark ? 'theme--dark' : 'theme--light';

        return (
            <div>
                <div onClick={(e) => { this.onTermClick(e) }}
                    class={[theme, isSelected ? this.styles.selectedProcessTypeWrapper : this.styles.processTypeWrapper, levelStyle]}>
                    <div class={this.styles.arrowWrapper} style={{ opacity: children.length > 0 ? 1 : 0 }}>
                        <v-btn
                            dark={this.dark}
                            icon
                            small
                            class={["ml-0", "mr-0", this.styles.arrowBtnCollapsedDefault, this.isExpanded ? this.styles.arrowBtnExpanded : '']}
                            onClick={(e) => { this.onArrowIconClick(e, children.length > 0) }}>
                            <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                    </div>
                    <div class={[this.styles.title]}>
                        {this.termNode.name}
                    </div>

                    {
                        isSelected ? this.renderEdit(h) : this.renderDisplay(h)
                    }
                </div>
                {
                    children.length && this.isExpanded ?
                        <div>
                            {
                                children.map(child =>
                                    <TermDrivenNodeComponent expandStatus={this.expandStatus}
                                        termSetId={this.termSetId}
                                        dark={this.dark}
                                        styles={this.styles}
                                        termNode={child}
                                        level={this.level + 1}></TermDrivenNodeComponent>
                                )
                            }
                        </div> : null
                }
            </div>
        )
    }
}




