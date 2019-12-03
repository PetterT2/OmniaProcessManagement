import { important } from 'csx';
import { NestedCSSProperties } from 'typestyle/lib/types';

const darkColors = {
    activeTextColor: '#fff',
    activeBgColor: 'rgba(255,255,255,0.08)',
    hoverTextColor: '#fff',
    hoverBgColor: 'rgba(255,255,255,0.08)',

    componentLabel: 'rgba(255,255,255,.7)',
    disabledComponentLabel: 'rgba(255,255,255,.5)'
}

const lightColors = {
    activeTextColor: 'rgba(0, 0, 0, 0.87)',
    activeBgColor: 'rgba(0,0,0,0.04)',
    hoverTextColor: 'rgba(0, 0, 0, 0.87)',
    hoverBgColor: 'rgba(0,0,0,0.04)',

    componentLabel: 'rgba(0,0,0,.54)',
    disabledComponentLabel: 'rgba(0,0,0,0.38)'
}

const genericWrapper: NestedCSSProperties = {
    width: "100%",
    display: "flex",
    lineHeight: '40px',
    alignItems: "center",
    paddingTop: 0,
    paddingRight: 10,
    paddingBottom: 0,
    textDecoration: 'none',
    cursor: "pointer",
    $nest: {
        '&.theme--dark': {
            $nest: {
                '&:hover': {
                    background: important(darkColors.hoverBgColor),
                    color: darkColors.hoverTextColor,
                    $nest:
                    {
                        'i.v-icon': { color: important(darkColors.hoverTextColor) }
                    }
                },
                'i.v-icon': {
                    transition: 'none'
                }
            }
        },
        '&.theme--light': {
            $nest: {
                '&:hover': {
                    background: important(lightColors.hoverBgColor),
                    color: lightColors.hoverTextColor,
                    $nest:
                    {
                        'i.v-icon': { color: important(lightColors.hoverTextColor) }
                    }
                },
                'i.v-icon': {
                    transition: 'none'
                }
            }
        }
    }
}



const nodeWrapper: NestedCSSProperties = {
    ...genericWrapper
}

const selectedNodeWrapper: NestedCSSProperties = {
    ...genericWrapper,
    $nest: {
        '&.theme--dark': {
            backgroundColor: important(darkColors.activeBgColor),
            color: darkColors.activeTextColor,
            $nest: {
                'i.v-icon': {
                    color: important(darkColors.activeTextColor)
                }
            }
        },
        '&.theme--light': {
            backgroundColor: important(lightColors.activeBgColor),
            color: lightColors.activeTextColor,
            $nest: {
                'i.v-icon': {
                    color: important(lightColors.activeTextColor)
                }
            }
        }
    }
}

export const GenericNodeStyles = {
    nodeWrapper: nodeWrapper,
    selectedNodeWrapper: selectedNodeWrapper,
    indentation: 16,
    arrowBtnCollapsedDefault: {
        transform: "rotate(-0deg)"
    },
    arrowBtnExpanded: {
        transform: important("rotate(-180deg)")
    },
    title: {
        flex: "10 10 100%",
        overflow: "hidden",
        whiteSpace: "nowrap" as any,
        textOverflow: "ellipsis",
        fontSize: '12px'
    },
    content: {
        overflow: "hidden",
    },
    contentHide: {
        display: "none"
    },
    arrowWrapper: {
        flex: "0 0 0px",
        transformOrigin: "center center",
        transition: "transform .3s ease-in-out",
        paddingRight: '5px',
        display: 'inline-table'
    }
}