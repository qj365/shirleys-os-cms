import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { message } from 'antd';
import { Mutex } from 'async-mutex';
import qs from 'qs';
import { REHYDRATE } from 'redux-persist';
import { startLoadingSpinner, stopLoadingSpinner } from 'utils/NProgress';
import type { ObjectType } from 'utils/types';
import type { TQueryConfig } from './types';

const baseURL = import.meta.env.VITE_APP_BASE_URL;

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  prepareHeaders: (headers, { getState, endpoint, arg }) => {
    const auth = (getState() as ObjectType)?.auth;

    const apiEndpoint = (arg as FetchArgs)?.url;

    if (
      auth?.accessToken &&
      apiEndpoint !== '/UserAuth/Refresh' &&
      endpoint !== '/UserAuth/Authenticate'
    ) {
      headers.set('Authorization', `Bearer ${auth?.accessToken}`);
    }

    return headers;
  },
  paramsSerializer: params => qs.stringify(params),
});

const baseQueryWithInterceptor: BaseQueryFn<
  string | (FetchArgs & TQueryConfig),
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const { disableSpinner, manuallyHandlingErrorMsg } = (args ||
    {}) as FetchArgs & TQueryConfig;

  await mutex.waitForUnlock();

  if (!disableSpinner) startLoadingSpinner();

  let result = await baseQuery(args, api, extraOptions);

  stopLoadingSpinner();

  if (result.error) {
    if (result.error.status === 401) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const auth = (api.getState() as ObjectType)?.auth;

          const refreshResult: ObjectType = await baseQuery(
            {
              url: '/UserAuth/Refresh',
              method: 'POST',
              body: { refreshToken: auth?.refreshToken },
            },
            api,
            extraOptions
          );

          const { accessToken, refreshToken, agentUser } =
            refreshResult?.data?.data || {};

          if (accessToken && refreshToken) {
            api.dispatch({
              type: 'auth/updateAuthStore',
              payload: {
                accessToken,
                refreshToken,
                user: agentUser,
              },
            });

            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch({ type: 'auth/logout' });
            window.location.pathname = '/auth/login';
          }
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
    }

    if (!manuallyHandlingErrorMsg) {
      message.error(
        (result?.error?.data as ObjectType)?.message ??
          'An error occurred, please try again later'
      );
    }
  }
  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithInterceptor,
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return (action?.payload as ObjectType)?.[reducerPath];
    }

    return undefined;
  },
  keepUnusedDataFor: 10,
  endpoints: () => ({}),
});
