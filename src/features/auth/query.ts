import { baseApi } from 'lib/rtkQuery/baseApi';
import { QueryTags } from 'lib/rtkQuery/constants';
import type { QueryResponse } from 'lib/rtkQuery/types';
import type {
  TUserInfo,
  TUserSignInPayload,
  TUserSignInSuccessResponse,
} from './types';
import { retry } from '@reduxjs/toolkit/query';

const endpoint = '/UserAuth';

export const authQueryApi = baseApi
  .enhanceEndpoints({
    addTagTypes: [QueryTags.UserDetail],
  })
  .injectEndpoints({
    endpoints: builder => ({
      signInUser: builder.mutation<
        QueryResponse<TUserSignInSuccessResponse>,
        TUserSignInPayload
      >({
        query: payload => ({
          url: `${endpoint}/Authenticate`,
          method: 'POST',
          body: payload,
        }),
      }),

      getCurrentUser: builder.query<QueryResponse<TUserInfo>, void>({
        query: () => ({
          url: `${endpoint}/Me`,
          method: 'GET',
        }),
        providesTags: [QueryTags.UserDetail],
      }),

      refreshAuth: builder.mutation<
        { accessToken: string; refreshToken: string },
        string
      >({
        query: refreshToken => ({
          url: '/Refresh',
          method: 'POST',
          body: { token: refreshToken },
        }),
        extraOptions: {
          backoff: () => {
            retry.fail({ fake: 'error' });
          },
        },
      }),
    }),
  });

export const {
  useSignInUserMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authQueryApi;
