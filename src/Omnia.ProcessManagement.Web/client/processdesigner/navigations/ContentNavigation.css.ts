import { style, cssRule, cssRaw } from "typestyle";
import { green, important } from 'csx';
import { OmniaTheming } from '@omnia/fx/ux';

//todo: using StyleFlow
/**
 * Styles for the Navigation Panel component
 */
export const ContentNavigationStyles = {
    container: style({
        width: "100%",
        $nest: {
            '&hover': {
                borderWidth: "5px",
                borderStyle: "solid",
                borderColor: "grey",
            }
        }
    }),
    settings: {
        container: style({
            height: "48px",
        }),
        button: style({
            height: important("48px")
        }),
    },
    scrollContainer: style({
        height: important("calc(100vh - 98px)"),
        overflowY: important("auto"),
        //** Fix scroll for iphone */
        '-webkit-overflow-scrolling': 'touch'
    }),
    actionHeader: {
        icon: style({
            justifyContent: "flex-end!important" as any
        })
    },
    action: {
        wrapper: (theme: OmniaTheming) => {
            let hoverColorStr = theme.promoted.body.primary.lighten1;

            return style({
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                height: "50px",
                paddingTop: "14px",
                $nest: {
                    '&:hover': {
                        background: hoverColorStr,
                        cursor: "pointer",
                        color: important('white'),
                        $nest:
                        {
                            'i': { color: important('white') }
                        }
                    },
                    'i.v-icon': {
                        paddingLeft: '12px',
                        marginTop: '-12px !important'
                    }
                }
            })
        },
        title: style({
            paddingLeft: "10px",
            flex: "10 0 100px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
        })
    }
}


