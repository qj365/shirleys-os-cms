import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { UiState } from 'features/appInfo/types';

const initialState: UiState = {
  isSidebarCollapsed: false,
  selectedMenuKeys: [],
  appPrimaryColor: '#cb9408',
};

const appUISlice = createSlice({
  name: 'appInfo',
  initialState,
  reducers: {
    changeSidebarCollapsedState(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload;
    },

    setSelectedMenuKeys(state, action: PayloadAction<string[]>) {
      state.selectedMenuKeys = action.payload;
    },
  },
});

export const { changeSidebarCollapsedState, setSelectedMenuKeys } =
  appUISlice.actions;

export default appUISlice.reducer;
