import { create } from 'zustand';

interface AppInfoState {
  isSidebarCollapsed: boolean;
  selectedMenuKeys: string[];
  appPrimaryColor: string;
  setSidebarCollapse: (isCollapsed: boolean) => void;
  setSelectedMenuKeys: (keys: string[]) => void;
}

const isMobileDevice = () => {
  return window?.matchMedia('(max-width: 1024px)')?.matches ?? true;
};

export const useAppInfoStore = create<AppInfoState>(set => ({
  isSidebarCollapsed: isMobileDevice(),
  selectedMenuKeys: [],
  appPrimaryColor: '#cb9408',
  setSidebarCollapse: isCollapsed => set({ isSidebarCollapsed: isCollapsed }),
  setSelectedMenuKeys: keys => set({ selectedMenuKeys: keys }),
}));
