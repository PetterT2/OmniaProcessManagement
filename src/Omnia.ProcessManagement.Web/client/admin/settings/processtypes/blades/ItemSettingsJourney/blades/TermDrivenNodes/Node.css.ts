import { StyleFlow } from '@omnia/fx/ux';
import { NestedCSSProperties } from 'typestyle/lib/types';
import { GenericNodeStyles } from '../../../../../../../models';
type NodeStylesInterfaceType = NestedCSSProperties | string;
export interface NodeStylesInterface<T extends NodeStylesInterfaceType> {
    processTypeWrapper: T;
    selectedProcessTypeWrapper: T;
    arrowBtnCollapsedDefault: T;
    arrowBtnExpanded: T;
    title: T;
    content: T;
    contentHide: T;
    arrowWrapper: T;
    noWrap: T;

    /**
     * Generate static levels to prevent from generating style in each node to improve performance
     */
    ["1"]: T;
    ["2"]: T;
    ["3"]: T;
    ["4"]: T;
    ["5"]: T;
    ["6"]: T;
    ["7"]: T;
    ["8"]: T;
    ["9"]: T;
}

/**
 * Since this component is using internally
 * */
export const NodeStyles = {} as NodeStylesInterface<NestedCSSProperties>;

StyleFlow.define(NodeStyles, {
    processTypeWrapper: GenericNodeStyles.nodeWrapper,
    selectedProcessTypeWrapper: GenericNodeStyles.selectedNodeWrapper,
    /**
      * Generate static levels to prevent from generating style in each node to improve performance 
      * */
    ["1"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 0 },
    ["2"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 1 },
    ["3"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 2 },
    ["4"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 3 },
    ["5"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 4 },
    ["6"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 5 },
    ["7"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 6 },
    ["8"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 7 },
    ["9"]: { paddingLeft: 10 + GenericNodeStyles.indentation * 8 },

    arrowBtnCollapsedDefault: GenericNodeStyles.arrowBtnCollapsedDefault,
    arrowBtnExpanded: GenericNodeStyles.arrowBtnExpanded,
    title: GenericNodeStyles.title,
    content: GenericNodeStyles.content,
    contentHide: GenericNodeStyles.contentHide,
    arrowWrapper: GenericNodeStyles.arrowWrapper,
    noWrap: {
        whiteSpace: 'nowrap'
    }
});

