import { create } from 'zustand'

export interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  enabled: boolean
  rollout_percentage: number
  created_at: string
  updated_at: string
}

interface FeatureFlagStore {
  flags: FeatureFlag[]
  loading: boolean
  error: string | null
  fetchFlags: () => Promise<void>
  createFlag: (data: Partial<FeatureFlag>) => Promise<void>
  updateFlag: (id: string, data: Partial<FeatureFlag>) => Promise<void>
  deleteFlag: (id: string) => Promise<void>
}

const mockFlags: FeatureFlag[] = [
  {
    id: 'flag_1',
    name: 'New Dashboard',
    key: 'NEW_DASHBOARD',
    description: 'New dashboard redesign',
    enabled: true,
    rollout_percentage: 50,
    created_at: '2025-12-20T10:00:00Z',
    updated_at: '2025-12-25T14:30:00Z',
  },
  {
    id: 'flag_2',
    name: 'Dark Mode',
    key: 'DARK_MODE',
    description: 'Enable dark mode for all users',
    enabled: false,
    rollout_percentage: 0,
    created_at: '2025-12-21T09:00:00Z',
    updated_at: '2025-12-21T09:00:00Z',
  },
  {
    id: 'flag_3',
    name: 'Advanced Analytics',
    key: 'ADVANCED_ANALYTICS',
    description: 'Advanced analytics features',
    enabled: true,
    rollout_percentage: 75,
    created_at: '2025-12-19T08:00:00Z',
    updated_at: '2025-12-25T11:00:00Z',
  },
]

export const useFeatureFlagStore = create<FeatureFlagStore>((set) => ({
  flags: mockFlags,
  loading: false,
  error: null,

  fetchFlags: async () => {
    set({ loading: true, error: null })
    try {
      // Mock API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ flags: mockFlags, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch flags', loading: false })
    }
  },

  createFlag: async (data) => {
    try {
      const newFlag: FeatureFlag = {
        id: `flag_${Date.now()}`,
        name: data.name || '',
        key: data.key || '',
        description: data.description || '',
        enabled: data.enabled || false,
        rollout_percentage: data.rollout_percentage || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set(state => ({ flags: [...state.flags, newFlag] }))
    } catch (error) {
      set({ error: 'Failed to create flag' })
    }
  },

  updateFlag: async (id, data) => {
    try {
      set(state => ({
        flags: state.flags.map(flag =>
          flag.id === id
            ? { ...flag, ...data, updated_at: new Date().toISOString() }
            : flag
        ),
      }))
    } catch (error) {
      set({ error: 'Failed to update flag' })
    }
  },

  deleteFlag: async (id) => {
    try {
      set(state => ({
        flags: state.flags.filter(flag => flag.id !== id),
      }))
    } catch (error) {
      set({ error: 'Failed to delete flag' })
    }
  },
}))
