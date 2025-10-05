import { QueryTags } from 'lib/rtkQuery/constants';

export type QueryTagValue = (typeof QueryTags)[keyof typeof QueryTags];
export type QueryTagArray = QueryTagValue[];

export const invalidatesTags = (tags: QueryTagArray) => (result: unknown) => {
  return result ? tags : [];
};
