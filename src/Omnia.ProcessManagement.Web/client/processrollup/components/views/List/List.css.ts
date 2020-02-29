import { SpacingSettings } from '@omnia/fx-models';
import { StyleFlow } from '@omnia/fx/ux';
import { important } from 'csx';
import { ProcessRollupBlockListViewStyles } from '../../../../models';

StyleFlow.define(ProcessRollupBlockListViewStyles,
    {
        tableWrapper: {
            background: important('transparent'),
            $nest: {
                'tr:hover': {
                    background: important('transparent')
                }
            }
        },
        titleLayout: {
            lineHeight: '30px'
        },
        logoIcon: {
            float: 'left',
            marginRight: '8px',
            height: '30px'
        },
        socialIcon: {
            height: important('30px'),
            width: important('30px'),
            margin: important('0 8px')
        },
        customOmfxPeoplePicker: {
            $nest: {
                '.v-input__append-inner': {
                    display: 'none !important'
                },
                '.v-input__slot': {
                    $nest: {
                        '&::before': {
                            borderImage: 'none !important',
                            border: 'none !important'
                        }
                    }
                }
            }
        },
        titleLink: {
            color: 'inherit',
            display: 'inline-block',
            textDecoration: 'none !important'
        },
        clickableLink: {
            display: 'inline-block'
        },
        getPaddingStyle: (spacing: SpacingSettings, skip?: { top?: boolean, right?: boolean, left?: boolean, bottom?: boolean }) => {
            if (spacing) {
                return {
                    paddingTop: skip && skip.top ? '' : `${spacing.top}px`,
                    paddingRight: skip && skip.right ? '' : `${spacing.right}px`,
                    paddingLeft: skip && skip.left ? '' : `${spacing.left}px`,
                    paddingBottom: skip && skip.bottom ? '' : `${spacing.bottom}px`,
                }
            }
            return {};
        }
    }
);
