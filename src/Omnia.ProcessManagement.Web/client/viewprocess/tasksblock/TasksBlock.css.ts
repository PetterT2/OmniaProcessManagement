import { StyleFlow } from "@omnia/fx/ux";
import { TasksBlockStyles } from '../../models';
import { SpacingSetting } from '@omnia/fx-models';

StyleFlow.define(TasksBlockStyles,
    {
        blockPadding: (spacing: SpacingSetting) => {
            let paddingLeft = spacing && (spacing.left || 0)
            let paddingRight = spacing && (spacing.right || 0)
            let paddingTop = spacing && (spacing.top || 0)
            let paddingBottom = spacing && (spacing.bottom || 0)

            return {
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }
        }
    }
)