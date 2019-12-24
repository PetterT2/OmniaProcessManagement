import { UserIdentity, GuidValue } from '@omnia/fx-models';

export interface AuthorAndDefaultReaderUpdateInput {
    teamAppId: GuidValue;
    authors: Array<UserIdentity>;
    defaultReaders: Array<UserIdentity>;
}