import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'lib/stores';

export const authSelector = (state: RootState) => state.auth;

export const currentUserSelector = (state: RootState) => state.auth.currentUser;

export const isAuthenticatedSelector = createSelector(
  authSelector,
  auth => !!auth?.accessToken
);
