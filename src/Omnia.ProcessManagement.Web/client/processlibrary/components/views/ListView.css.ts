import { StyleFlow } from "@omnia/fx/ux";
import { ProcessLibraryListViewStyles } from '../../../models';
import { important } from 'csx';

StyleFlow.define(ProcessLibraryListViewStyles,
    {
        menuColumn: {
            textAlign: "center",
            width: "100px",
            minWidth: "100px",
            $nest: {
                '.v-btn': {
                    margin: '0 !important'
                }
            }
        },
        menuHeader: {
            cursor: important('pointer'),
        },
        wrapper: {
            position: 'relative',
            margin: '0 20px 40px 20px'
        },
        mainTab: {
            $nest: {
                '.v-slide-group__wrapper': {
                    paddingLeft: '20px',
                    background: '#f4f4f4',
                },
                '.v-datatable > thead >tr': {
                    borderTop: '1px solid rgba(0,0,0,.12)'
                },
                '.v-datatable > tbody >tr:last-child': {
                    borderBottom: '1px solid rgba(0,0,0,.12)'
                }
            }
        },
        publishDialogErrorFormContent: {
            boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"
        },
        permissionBtn: {
            position: 'absolute !important' as any,
            zIndex: 1,
            right: '12px',
            top: '0',
            marginTop: '6px'
        }
    }
)