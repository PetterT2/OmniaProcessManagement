import { StyleFlow } from "@omnia/fx/ux";
import { ProcessNavigationBlockStyles } from '../../models';
import { SpacingSetting, Theming } from '@omnia/fx-models';
import { important } from 'csx';

const getColorsFromTheming = (theming: Theming) => {
    return {
        bgColor: 'transparent',
        textColor: '#000',
        activeBgColor: theming.secondary || '#F5F5F5',
        activeTextColor: '#fff',
        hoverBgColor: theming.primary || '#F5F5F5',
        hoverTextColor: '#fff'
    }
}

StyleFlow.define(ProcessNavigationBlockStyles,
    {
        blockPadding: (spacing: SpacingSetting) => {
            let paddingLeft = spacing && (spacing.left || 0)
            let paddingRight = spacing && (spacing.right || 0)
            let paddingTop = spacing && (spacing.top || 0)
            let paddingBottom = spacing && (spacing.bottom || 0)

            return {
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }
        },
        levelIndentationIconWrapper: {
            width: '25px'
        },
        wrapper: {
            width: "100%",
            padding: "3px"
        },
        headerWrapper: (level: number, indentation: number, isRoutePath: boolean, theming: Theming, padding: SpacingSetting) => {
            let colors = getColorsFromTheming(theming);
            let top = (padding && padding.top || 0);
            let bottom = (padding && padding.bottom || 0);
            let right = (padding && padding.right || 0);
            let left = (padding && padding.left || 0);
            let indentationLeft = ((level - 1) * indentation);

            let bgColorStr = isRoutePath ? colors.activeBgColor : colors.bgColor;
            let textColor = isRoutePath ? colors.activeTextColor : colors.textColor;

            return {
                width: "100%",
                backgroundColor: important(bgColorStr),
                display: "flex",
                lineHeight: '50px',
                alignItems: "center",
                paddingTop: top,
                paddingRight: right,
                paddingBottom: bottom,
                paddingLeft: indentationLeft + left,
                color: important(textColor),
                textDecoration: 'none',
                $nest: {
                    '&:hover': {
                        background: important(colors.hoverBgColor),
                        cursor: "pointer",
                        color: important(colors.hoverTextColor),
                        $nest:
                        {
                            'i': { color: important(colors.hoverTextColor) }
                        }
                    }
                }
            };
        },
        rightIcon: {
            flex: "0 0 30px",
            transformOrigin: "center center",
            transition: "transform .3s ease-in-out"
        },
        arrowBtnCollapsedDefault: {
            transform: "rotate(-0deg)"
        },
        arrowBtnExpanded: {
            transform: important("rotate(-180deg)")
        },
        title: {
            lineHeight: "18px",
            height: "54px",
            wordBreak: "break-word",
            fontSize: '16px',
            paddingRight: '15px',
            width: 'inherit',
            display: 'flex',
            alignItems: 'center'
        },
        textOverflow: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        content: {
            transition: "max-height 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)",
            overflow: "hidden",
        },
        contentHide: {
            maxHeight: "0px",
            display: "none"
        }
    }
)