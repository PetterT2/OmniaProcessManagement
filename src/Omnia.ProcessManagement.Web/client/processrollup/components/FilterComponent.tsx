import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Utils, Inject } from '@omnia/fx';
import { ProcessRollupFilter } from '../../fx/models';
import { EnterprisePropertyDefinition } from '@omnia/fx-models';
import { ProcessRollupLocalization } from '../loc/localize';
import { EnterprisePropertyStore, MultilingualStore } from '@omnia/fx/store';
import { UserService } from '@omnia/fx/services';

declare var moment: any;

export interface FilterExtension extends ProcessRollupFilter {
    hidden?: boolean;
}

export interface SearchBoxFilterExtension extends FilterExtension {
    othersManagedProperties: Array<string>
}

interface FilterComponentProps {
    isLoadingData: boolean;
    filters: Array<FilterExtension>
    updateUIQueryFilters: () => void;
}

@Component
export class FilterComponent extends tsx.Component<FilterComponentProps>
{
    @Prop() isLoadingData: boolean;
    @Prop() filters: Array<ProcessRollupFilter>;
    @Prop() updateUIQueryFilters: () => void;

    @Localize(ProcessRollupLocalization.namespace) loc: ProcessRollupLocalization.locInterface;
    @Inject(EnterprisePropertyStore) propertyStore: EnterprisePropertyStore;
    @Inject(UserService) userService: UserService;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;

    // -------------------------------------------------------------------------
    // Life Cycle Hooks
    // -------------------------------------------------------------------------

    beforeDestroy() {

    }

    mounted() {
    }

    created() {
        this.init();
    }

    init() { }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    render(h) {
        
    }
}