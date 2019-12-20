import { style } from 'typestyle';
import { important } from 'csx';
import colors from 'vuetify/es5/util/colors';
import { IColor } from '../models/styles';

export interface ITheme {
    system: {
        grey: IColor,
    }
}


const systemColors = {
    grey: colors.grey as IColor,
}

export const ProcessDesignerStyleSettings = {

    get theme() {


        /** base theme admin*/
        let theme: ITheme = {
            system: systemColors
        }
        return theme;
    },

    get layerIndex() {
        return {
            blade: 100,
            contentNavigation: 4,
            itemselector: 90,
            actionToolbar: 2,
            informationIcon: 3,
        }
    },
}

/**
 * Styles for the Editor component
 */
export const ProcessDesignerStyles = {
    rootWrapper: style({
        position: 'fixed',
        top: '0',
        right: '0',
        left: '0',
        bottom: '0',
        zIndex: 300
    }),
    canvasContainer: style({
        height: "calc(100vh - 97px)",
        overflowY: "auto",
        $nest: {
            '.notdragging.v-list-item:hover': {
                backgroundColor: 'rgba(0,0,0,.04)'
            }
        }
    }),
    container: style({
        marginTop: "-20px",
        width: "100%"
    }),
    editorRow: style({
        width: "calc(100% - 260px)"
    }),
    editorCanvas: style({
        flexGrow: 1,
    }),
    debugPanel: style({
        marginRight: "100px"
    }),
    panelRightActions: style({
        width: "260px",
        position: "fixed",
        top: "30px",
        marginTop: "40px",
        right: "0px",
        height: "100%"

    }),
    panelTopActions: style({
        padding: "0",
        width: "100 %",
        display: "flex",
        position: "initial",
        justifyContent: 'space-between'
    }),
    panelDevices: style({
        width: '50px',
        marginLeft: 'calc(50% - 50px)'
    }),
    leftActions: style({
        float: 'left',
        position: 'relative',
        backgroundColor: 'transparent',
        paddingTop: '4px'
    }),
    panelSwitcher: style({
        width: "50x",
        float: 'right',
        position: 'relative',
        backgroundColor: 'transparent'
    }),
    canvasBackGround: style({
        paddingTop: important("48px"),
        zIndex: important('auto')
    }),
    panelToolbar: style({
        width: "100%"
    }),
    title: (panelWidth: number) => {
        panelWidth = panelWidth / 2 + 60;
        return style({
            overflow: important("hidden"),
            width: `calc(50% - ${panelWidth}px)`
        });

    },
    tabs: {
        position: style({
            display: "flex",
            width: "100%",
            height: "0px",
            zIndex: 6,
            justifyContent: "center",
            transition: "padding 0.3s"
        }),
    },
    compensateDrawerLeft: style({
        paddingLeft: "256px",
    }),
    compensateDrawerRight: style({
        paddingRight: "256px",
    }),


    fullScreen: style({
        width: "100%",
        height: "100%"
    }),
    drawerRight: {
        closeButton: style({
            top: "5px"
        })
    },
    contentnavigation: (background: IColor) => {
        return style({
            //zIndex: ProcessDesignerStyleSettings.layerIndex.contentNavigation + "!important" as any,
            zIndex: important('auto'),
            background: important(background.base),
            $nest: {
                ".v-navigation-drawer__content": {
                    overflowY: "hidden"
                }
            }
        })
    },
    vList: (background: IColor) => {
        return style({
            background: important(background.base),
            $nest: {
                '.v-list': {
                    background: important(background.base),
                },
                'button, input, select, textarea': {
                    backgroundColor: important('transparent')
                }
            }
        })
    }
}