import { Inject, Localize } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import 'vue-tsx-support/enable-check';
import { VueComponentBase, OmniaTheming } from '@omnia/fx/ux';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { CurrentProcessStore } from '../../../fx';


@Component
export class ActionsMenuComponent extends VueComponentBase<{}>
{
    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private showCreateProcessStepDialog = false;

    private menuModel = {
        showMenu: false
    }

    public mounted() {
    }

    public beforeDestroy() {
    }


    onClickMoveProcessStep(e: Event): any {
        e.stopPropagation();
        this.menuModel.showMenu = false;

    }

    onClickCreateProcessStep(e: Event): any {
        e.stopPropagation();
        this.menuModel.showMenu = false;

        this.showCreateProcessStepDialog = true;

    }

    renderCreateProcessStepDialog(h) {
        return (
            <v-dialog>

            </v-dialog>
        )
    }

    renderDialogs(h) {
        if (this.showCreateProcessStepDialog)
            return this.renderCreateProcessStepDialog(h);
        else
            return null;
    }


    render(h) {
        let currentReferenceData = this.currentProcessStore.getters.referenceData();


        return (
            <div>
                <v-menu
                    dark={this.omniaTheming.promoted.header.dark}
                    light={!this.omniaTheming.promoted.header.dark}
                    bottom right
                    v-model={this.menuModel.showMenu}
                    {
                    ...this.transformVSlot({
                        activator: (ref) => {
                            const toSpread = {
                                on: ref.on
                            }
                            return [
                                <v-btn
                                    {...toSpread}
                                    icon small dark
                                    onClick={(e: Event) => { e.stopPropagation(); this.menuModel.showMenu = true; }}
                                    class={["ml-0", "mr-2"]}>
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                            ]
                        }
                    })}>
                    <v-list
                        color={this.omniaTheming.promoted.body.onComponent.lighten1}
                        dark={this.omniaTheming.promoted.header.dark}
                        class={this.omniaTheming.promoted.header.class}>


                        <v-list-item
                            dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickCreateProcessStep(e)}>
                            <v-list-item-avatar>
                                <v-icon medium color={this.omniaTheming.promoted.header.text.base}>add</v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content class={"mr-2"}>
                                <v-list-item-title>{this.loc.CreateProcessStep}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        {
                            !currentReferenceData.parentProcessStep &&
                            <v-list-item
                                dark={this.omniaTheming.promoted.header.dark} onClick={(e: Event) => this.onClickMoveProcessStep(e)}>
                                <v-list-item-avatar>
                                    <v-icon medium color={this.omniaTheming.promoted.header.text.base}>far fa-arrows-alt</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content class={"mr-2"}>
                                    <v-list-item-title>{this.loc.MoveProcessStep}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        }
                    </v-list>
                </v-menu>
                {
                    this.renderDialogs(h)
                }
            </div>
        )
    }
}




