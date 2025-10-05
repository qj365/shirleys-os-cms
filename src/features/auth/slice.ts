import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { authQueryApi } from './query';
import type { TAuthSliceState } from './types';

const initialState: TAuthSliceState = {
  user: null,
  accessToken: undefined,
  refreshToken: undefined,
};
//test
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state = initialState;

      return state;
    },

    updateUserInfoStore: (state, { payload }) => {
      const stateUser = state.user;

      const payloadUser = payload;

      state.user = {
        ...stateUser,
        ...payloadUser,
      };

      return state;
    },

    updateAuthStore: (state, { payload }) => {
      state.refreshToken = payload?.refreshToken;
      state.accessToken = payload?.accessToken;
      state.user = payload?.user;
    },
  },

  extraReducers: builder => {
    const { getCurrentUser } = authQueryApi.endpoints;

    builder
      .addMatcher(
        isAnyOf(getCurrentUser.matchPending, getCurrentUser.matchRejected),
        () => {}
      )
      .addMatcher(getCurrentUser.matchFulfilled, (state, { payload }) => {
        state.user = payload?.data ?? null;
      });
  },
});

export const { logout, updateUserInfoStore, updateAuthStore } =
  authSlice.actions;

const authReducer = authSlice.reducer;

export default authReducer;
