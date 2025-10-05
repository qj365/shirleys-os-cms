import type { RootState } from 'lib/stores';

export const sidebarCollapsedStateSelector = (state: RootState) =>
  state.appInfo.isSidebarCollapsed;

export const selectedMenuKeysSelector = (state: RootState) =>
  state.appInfo.selectedMenuKeys;

export const appPrimaryColorSelector = (state: RootState) =>
  state.appInfo.appPrimaryColor;
