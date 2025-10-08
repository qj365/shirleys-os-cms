import { create } from 'zustand';

interface AppInfoState {
  isSidebarCollapsed: boolean;
  selectedMenuKeys: string[];
  appPrimaryColor: string;
  setSidebarCollapse: (isCollapsed: boolean) => void;
  setSelectedMenuKeys: (keys: string[]) => void;
}

export const useAppInfoStore = create<AppInfoState>(set => ({
  isSidebarCollapsed: true,
  selectedMenuKeys: [],
  appPrimaryColor: '#cb9408',
  setSidebarCollapse: isCollapsed => set({ isSidebarCollapsed: isCollapsed }),
  setSelectedMenuKeys: keys => set({ selectedMenuKeys: keys }),
}));
