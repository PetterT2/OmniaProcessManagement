import { Inject, Localize, Utils } from '@omnia/fx';
import { VueComponentBase } from '@omnia/fx/ux';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { ProcessType, ProcessTypeSettingsTypes, ProcessTypeFactory } from '../../../../fx/models';
import { ProcessTypeNodeStylesInterface } from './ProcessTypeNode.css';
import { ProcessTypeJourneyStore } from '../store';
import { ProcessTypeStore } from '../../../../fx';
import { OPMAdminLocalization } from '../../../loc/localize';
import { setTimeout } from 'timers';

interface ProcessTypeNodeProps {
    processType: ProcessType;
    level: number;
    styles: ProcessTypeNodeStylesInterface<string>;
    siblingsCount: number;
    currentIndexInSiblings: number;
    dark: boolean;
}


@Component
export default class ProcessTypeNode extends VueComponentBase<ProcessTypeNodeProps> {
    @Prop() processType: ProcessType;
    @Prop() level: number;
    @Prop() styles: ProcessTypeNodeStylesInterface<string>;
    @Prop() dark: boolean;
    @Prop() siblingsCount: number;
    @Prop() currentIndexInSiblings: number;
    @Inject(ProcessTypeJourneyStore) processTypeJourneyStore: ProcessTypeJourneyStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    sorting: boolean = false;
    created() {
        //Auto expand the root node if there is children
        if (this.processType.childCount > 0) {
            this.processTypeStore.actions.ensureChildren.dispatch(this.processType.id).then(() => {
                this.processTypeJourneyStore.mutations.setExpand.commit({ [this.processType.id.toString()]: true })
            });
        }

    }

    onArrowClick(e: MouseEvent, isExpanding: boolean) {
        if (this.processType.childCount > 0) {
            e.preventDefault();
            e.stopPropagation();

            if (!isExpanding) {
                this.processTypeStore.actions.ensureChildren.dispatch(this.processType.id).then(() => {
                    this.processTypeJourneyStore.mutations.setExpand.commit({ [this.processType.id.toString()]: true })
                });
            }
            else
                this.processTypeJourneyStore.mutations.setExpand.commit({ [this.processType.id.toString()]: false })
        }
    }

    onProcessTypeClick(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        let cloneProcessType = Utils.clone(this.processType);
        this.processTypeJourneyStore.mutations.setEditingProcessType.commit(cloneProcessType);
        this.processTypeJourneyStore.mutations.setSelectingProcessType.commit(this.processType);
    }

    onCreateProcessTypeClick() {
        setTimeout(() => {
            let newProcessType = ProcessTypeFactory.createDefaultProcessTypeItem(this.processType.id, this.processType.settings.termSetId);;
            this.processTypeJourneyStore.mutations.setEditingProcessType.commit(newProcessType);
        }, 500);
    }

    sort(moveUp: boolean) {
        this.sorting = true;
        this.processTypeJourneyStore.actions.sort.dispatch(this.processType, moveUp).then(() => {
            this.sorting = false;
        })
    }

    render(h) {
        let editingProcessType = this.processTypeJourneyStore.getters.selectingProcessType();
        let isSelected = editingProcessType && editingProcessType.id == this.processType.id;
        let children = this.processTypeStore.getters.children(this.processType.id, true);
        let levelStyle = this.styles[this.level] || '';
        let theme = this.dark ? 'theme--dark' : 'theme--light';
        let expandState = this.processTypeJourneyStore.getters.expandState();
        let isGroup = this.processType.settings.type == ProcessTypeSettingsTypes.Group;
        let isExpanding = expandState[this.processType.id.toString()];
        return (
            <div>
                <div onClick={(e) => { this.onProcessTypeClick(e) }}
                    class={[theme, isSelected ? this.styles.selectedProcessTypeWrapper : this.styles.processTypeWrapper, levelStyle]}>
                    <div class={this.styles.arrowWrapper} style={{ opacity: this.processType.childCount > 0 ? 1 : 0 }}>
                        <v-btn
                            dark={this.dark}
                            icon
                            small
                            class={["ml-0", "mr-0", this.styles.arrowBtnCollapsedDefault, isExpanding ? this.styles.arrowBtnExpanded : '']}
                            onClick={(e) => { this.onArrowClick(e, isExpanding) }}>
                            <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                    </div>
                    <div class={[this.styles.title]}>
                        <v-icon class="mr-2" small>{isGroup ? 'fas fa-folder' : 'fal fa-file'}</v-icon>{this.processType.multilingualTitle}
                    </div>
                    <v-spacer></v-spacer>
                    {
                        isSelected && this.siblingsCount > 1 ? (
                            this.sorting ? <v-progress-circular size="16" width="2" indeterminate></v-progress-circular> :
                                [
                                    <v-btn class="ma-0" onClick={() => { this.sort(true) }}
                                        disabled={this.currentIndexInSiblings == 0}
                                        dark={this.dark} small icon>
                                        <v-icon>arrow_drop_up</v-icon>
                                    </v-btn>,
                                    <v-btn class="ma-0" onClick={() => { this.sort(false) }}
                                        disabled={this.currentIndexInSiblings == this.siblingsCount - 1}
                                        dark={this.dark} small icon>
                                        <v-icon>arrow_drop_down</v-icon>
                                    </v-btn>
                                ]
                        ) : null
                    }
                    {
                        isSelected && isGroup &&
                        <v-btn class="ma-0" small dark={this.dark} icon onClick={() => { this.onCreateProcessTypeClick(); }}>
                            <v-icon>add</v-icon>
                        </v-btn>
                    }
                </div>
                <div class={[this.styles.content, isExpanding ? '' : this.styles.contentHide]}>
                    {
                        children.map((child, index) => <ProcessTypeNode siblingsCount={children.length} currentIndexInSiblings={index} dark={this.dark} styles={this.styles} processType={child} level={this.level + 1}></ProcessTypeNode>)
                    }
                </div>
            </div>
        )
    }
}