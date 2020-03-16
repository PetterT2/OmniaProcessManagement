import { StyleFlow } from "@omnia/fx/ux";
import { ProcessDesignerStyles } from "../../../fx/models";
import { important } from 'csx';
import { ProcessDesignerZIndexConstants } from '..';

var processDesigner
StyleFlow.define(ProcessDesignerStyles.PanelStyles, {
    settingsPanel: (backgroundColor: string) => {
        return {
            backgroundColor: important(backgroundColor),
            height: important("calc(100vh - 98px)"),
            zIndex: ProcessDesignerZIndexConstants.WrapperZIndex + '!important' as any,//Required this to fix v-menu z-index incorrect issue
            /*Selectors will be global if they are grouped into one nested selector. Instead they are splitted into multiple nested selectors*/
            $nest: {
                '.v-expansion-panel .v-expansion-panel__container ': {
                    backgroundColor: important(backgroundColor)
                },
                'table.v-datatable.v-table.theme--dark': {
                    backgroundColor: important(backgroundColor)
                },
                '.v-card.theme--dark': {
                    backgroundColor: important(backgroundColor)
                },
                '.v-list.theme--dark': {
                    backgroundColor: important(backgroundColor)
                },
                '&.v-navigation-drawer--is-mobile': {
                    zIndex: 11 + '!important' as any
                }
            }
        }
    }
});