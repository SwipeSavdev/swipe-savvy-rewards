import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData, KYCVerificationResult, KYCTier, KYCStatus } from '../types/kyc';
import { dataService } from '../../../services/DataService';

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

interface LoginResult {
  verification_required: boolean;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<LoginResult | undefined>;
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
          // Call the real backend API
          // EXPO_PUBLIC_API_URL already includes /api/v1, so just append the endpoint
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || data.message || 'Invalid email or password');
          }

          // Extract user from response
          const user: User = {
            id: data.user?.id || data.user_id || 'user_' + Date.now(),
            email: data.user?.email || email,
            name: data.user?.name || email.split('@')[0],
            phone: data.user?.phone,
            dateOfBirth: data.user?.date_of_birth,
            address: data.user?.address,
            kycTier: data.user?.kyc_tier || 'tier1',
            kycStatus: data.user?.kyc_status || 'pending',
            createdAt: data.user?.created_at || new Date().toISOString(),
          };

          // Check if OTP verification is required (always required for login)
          if (data.verification_required || data.otp_required) {
            // Store user but don't authenticate yet - OTP verification needed
            set({
              user,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
            // Return data so caller can navigate to OTP screen
            return { verification_required: true, user };
          }

          // Set user context in DataService for API calls
          dataService.setUserId(user.id);
          if (data.access_token || data.token) {
            dataService.setAuthToken(data.access_token || data.token);
          }

          set({
            user,
            accessToken: data.access_token || data.token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { verification_required: false, user };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid email or password';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (data: SignupData, kycResult: KYCVerificationResult) => {
        set({ isLoading: true, error: null });

        try {
          // Call the real backend API for signup
          // EXPO_PUBLIC_API_URL already includes /api/v1, so just append the endpoint
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

          // Convert date from MM/DD/YYYY to YYYY-MM-DD format
          const convertDateFormat = (dateStr: string): string => {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const [month, day, year] = parts;
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return dateStr; // Return as-is if not in expected format
          };

          // Format phone number - remove non-digits and ensure it starts with country code
          const formatPhone = (phone: string): string => {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
              return `+1${digits}`;
            }
            return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
          };

          const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.personal.email,
              password: data.password,
              first_name: data.personal.firstName,
              last_name: data.personal.lastName,
              phone: formatPhone(data.personal.phone),
              date_of_birth: convertDateFormat(data.personal.dateOfBirth),
              street_address: data.address.street,
              city: data.address.city,
              state: data.address.state,
              zip_code: data.address.zipCode,
              ssn_last4: data.identity?.ssn,
              terms_accepted: data.acceptedTerms,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            // Handle FastAPI validation errors (array of error objects)
            let errorMessage = 'Signup failed';
            if (Array.isArray(responseData.detail)) {
              // Extract first validation error message
              const firstError = responseData.detail[0];
              errorMessage = firstError?.msg || firstError?.message || 'Validation error';
            } else if (typeof responseData.detail === 'string') {
              errorMessage = responseData.detail;
            } else if (responseData.message) {
              errorMessage = responseData.message;
            }
            throw new Error(errorMessage);
          }

          // Check if verification is required (don't auto-login)
          if (responseData.verification_required) {
            // Store pending user data but don't authenticate yet
            const pendingUser: User = {
              id: responseData.user_id || kycResult.userId || `user_${Date.now()}`,
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
              kycStatus: 'pending',
              createdAt: new Date().toISOString(),
            };

            set({
              user: pendingUser,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false, // Not authenticated until verified
              isLoading: false,
            });

            // Return early - caller should navigate to verification screen
            return;
          }

          // Create user from response or signup data (for cases where verification is not required)
          const newUser: User = {
            id: responseData.user_id || kycResult.userId || `user_${Date.now()}`,
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

          // Use tokens from response
          const accessToken = responseData.access_token;
          const refreshToken = responseData.refresh_token;

          if (accessToken) {
            // Set user context in DataService for API calls
            dataService.setUserId(newUser.id);
            dataService.setAuthToken(accessToken);

            set({
              user: newUser,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // No tokens - user needs to verify first
            set({
              user: newUser,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
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
