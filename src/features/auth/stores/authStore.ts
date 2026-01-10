import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData, KYCVerificationResult, KYCTier, KYCStatus } from '../types/kyc';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  kycTier: KYCTier;
  kycStatus: KYCStatus;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData, kycResult: KYCVerificationResult) => Promise<void>;
  logout: () => void;
  updateKYCStatus: (tier: KYCTier, status: KYCStatus) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          // const response = await authApi.login(email, password);

          // Simulated login - in production, verify against backend
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: 'user_123',
            email,
            name: 'Demo User',
            kycTier: 'tier1',
            kycStatus: 'approved',
            createdAt: new Date().toISOString(),
          };
          const mockToken = 'mock_jwt_token_' + Date.now();
          const mockRefreshToken = 'mock_refresh_token_' + Date.now();

          set({
            user: mockUser,
            accessToken: mockToken,
            refreshToken: mockRefreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: 'Invalid email or password',
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (data: SignupData, kycResult: KYCVerificationResult) => {
        set({ isLoading: true, error: null });

        try {
          // Create user from signup data and KYC result
          const newUser: User = {
            id: kycResult.userId || `user_${Date.now()}`,
            email: data.personal.email,
            name: `${data.personal.firstName} ${data.personal.lastName}`,
            phone: data.personal.phone,
            dateOfBirth: data.personal.dateOfBirth,
            address: {
              street: data.address.street,
              unit: data.address.unit,
              city: data.address.city,
              state: data.address.state,
              zipCode: data.address.zipCode,
            },
            kycTier: kycResult.tier,
            kycStatus: kycResult.status,
            createdAt: new Date().toISOString(),
          };

          // Generate tokens (in production, these come from backend)
          const accessToken = 'jwt_' + Date.now() + '_' + Math.random().toString(36).slice(2);
          const refreshToken = 'refresh_' + Date.now() + '_' + Math.random().toString(36).slice(2);

          set({
            user: newUser,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // TODO: In production, call backend API to create user
          // await authApi.signup({
          //   ...data,
          //   kycTier: kycResult.tier,
          //   kycStatus: kycResult.status,
          // });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateKYCStatus: (tier: KYCTier, status: KYCStatus) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              kycTier: tier,
              kycStatus: status,
            },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
