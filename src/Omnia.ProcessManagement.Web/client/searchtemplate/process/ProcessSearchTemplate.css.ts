import { StyleFlow } from '@omnia/fx/ux';
import { important } from 'csx';
import { cssRule, style, types } from 'typestyle';
import { SearchTemplateProcessStyles } from '../../models';


export const SearchTemplateProcessStylesClasses = StyleFlow.define(SearchTemplateProcessStyles,
    {
        container:
        {
            position: 'relative',
            backgroundColor: important('transparent'),
            $nest:
            {
                '&:hover':
                    {
                        '.btn-block': { display: important('block') },
                    } as any,
            },
        },
        image: (imageUrl?: string) => {
            return {
                display: 'flex',
                justifyContent: 'flex-start',
                marginRight: '15px',
            };
        },
        contentWapper:
        {
            padding: important('10px'),
            display: important('flex'),
            position: 'relative',
        },
        content:
        {
            display: 'flex',
            justifyContent: 'flex-end',
            flex: '1 1 auto',
            flexDirection: 'column',
            textAlign: 'left',
            lineHeight: '25px',
        },
        longContent:
        {
            position: 'relative',
            height: '25px',
        },
        trimTextBox:
        {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
        },
        title: (textColor: string) => {
            return {
                fontWeight: 'bold' as any,
                color: textColor ? textColor : 'rgba(0,0,0,0.87)',
                textDecoration: 'none' as any
            }
        },
        collapsePreviewButtonContainer: {
            position: 'absolute',
            left: 'calc(50% - 18px)',
            marginTop: '-25px'
        },
        collapsePreviewButton:
        {
            boxShadow: important("0 2px 4px 1px rgba(0,0,0,0.1)"),
            backgroundColor: "#fff !important"
        },
        expandButton: {
            display: "none !important",
            position: important('absolute'),
            right: '0',
            zIndex: 2
        },
        previewBlock:
        {
            overflow: 'hidden'
        },
        previewWapper: (width: number = 445) => {
            return {
                width: width - 22 + "px",
                height: (width - 20) * 2 / 3 + 'px',
                background: '#f8f8f8',
                margin: '0px 10px 10px 10px',
                border: '4px solid #ffffff',
                borderRadius: '4px',
                paddingRight: '0',
                paddingLeft: '0',

                display: "flex",
                flex: "1 1 auto",
                flexWrap: "wrap" as any,
                flexDirection: "row" as any
            };
        },
        previewIframe: (width: number = 870) => {
            let scale = (width - 30) / window.innerWidth;

            if (scale < 0.5) { scale = 0.5; }

            const iframeWidth = (width - 30) / scale;
            const iframeHeight = ((width - 20) * 2 / 3 - 8) / scale;

            return {
                flex: "1 1 auto",
                flexGrow: 1,
                flexShrink: 0,

                'width': iframeWidth + 'px',
                'height': iframeHeight + 'px',
                '-moz-transform-origin': '0 0',
                '-o-transform-origin': '0 0',
                '-webkit-transform': `scale(${scale})` as any,
                '-webkit-transform-origin': '0 0' as any,
                'transform': `scale(${scale})`,
                'transformOrigin': '0 0',
                'border': 'none',
            };
        },
    }, 'opm-process-search-template');
