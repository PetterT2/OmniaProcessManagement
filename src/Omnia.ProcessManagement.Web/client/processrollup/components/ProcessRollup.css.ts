import { StyleFlow } from "@omnia/fx/ux";
import { ProcessRollupBlockStyles, ProcessRollupBlockSettingsStyles } from '../../models';
import { SpacingSettings } from '@omnia/fx-models';

StyleFlow.define(ProcessRollupBlockStyles,
    {
        queryFailMsgWrapper: {
            color: 'red'
        },
        transparent: {
            opacity: '0' as any
        },
        uiFilterItem: {
            display: 'inline-block',
            width: '300px',
        },
        uiFilterDateTimeItem: {
            display: 'inline-block',
            width: '400px'
        },
        uiFilterDateTimePicker: {
            width: '50%'
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
    })

StyleFlow.define(ProcessRollupBlockSettingsStyles,
    {
        alignSelfCenter: {
            alignSelf: 'center'
        },
        filterSettings: {
            paddingLeft: '40px'
        },
        filterActionWrapper: {
            minHeight: '20px'
        },
        floatRight: {
            float: 'right'
        },
        filterItemWrapper: {
            display: 'flex',
            position: 'relative',
            alignItems: 'center'
        },
        checkboxFilter: {
            $nest: {
                '.v-input--selection-controls__input': {
                    margin: 0 //There is marginRight 8 that not good for the small space UI
                }
            }
        },
        taxonomyFilterMargin: {
            marginLeft: '40px'
        },
        pointer: {
            cursor: 'pointer'
        },
        limitWidthInputWrapper: {
            maxWidth: '400px'
        },
        expansionHeaderWrapper: {
            display: 'flex',
            alignItems: 'center'
        },
        hiddenCheckBox: {
            marginLeft: '36px',
            height: '15px',
            alignItems: 'center'
        }
    })