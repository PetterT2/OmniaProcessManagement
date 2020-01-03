import { StyleFlow } from "@omnia/fx/ux";
import { LinksBlockStyles } from '../../models';
import { important } from 'csx';
import { SpacingSetting } from '@omnia/fx-models';

StyleFlow.define(LinksBlockStyles,
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
        linkItemHover: {
            $nest: {
                '&:hover': {
                    backgroundColor: 'rgba(0,0,0,.04)'
                }
            }
        },
        linkItemTitle: {
            color: '#333',
            fontSize: '14px',
        },
        linkItemTitleText: {
            textDecoration: 'none',
            color: 'inherit'
        },
        subHeader: {
            alignItems: 'center',
            display: 'flex',
            fontSize: '18px',
            lineHeight: '1.2'
        }
    }
)