import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface UiState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  openNavGroups: Record<string, boolean>
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleNavGroup: (groupKey: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      openNavGroups: {
        main: true,
        support: true,
        administration: true,
        business: true,
        tools: true,
      },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
      toggleNavGroup: (groupKey) =>
        set({
          openNavGroups: {
            ...get().openNavGroups,
            [groupKey]: !get().openNavGroups[groupKey],
          },
        }),
    }),
    {
      name: 'ss_ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        openNavGroups: state.openNavGroups,
      }),
    },
  ),
)
