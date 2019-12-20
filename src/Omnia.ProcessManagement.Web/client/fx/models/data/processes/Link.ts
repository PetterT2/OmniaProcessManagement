import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { Enums } from '../../Enums';

export interface Link {
    id: GuidValue;
    title: MultilingualString;
    linkType: Enums.LinkType;
    url: string;
    openNewWindow: boolean;

    //client-side
    multilingualTitle?: string
}