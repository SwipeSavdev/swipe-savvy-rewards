/**
 * FIS Card Store - Zustand State Management
 *
 * Manages FIS card state for the SwipeSavvy mobile app:
 * - Card list and details
 * - Card controls
 * - Transactions
 * - Alerts
 * - Digital wallet tokens
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fisCardService, {
  FISCard,
  FISCardControls,
  FISTransaction,
  FISAlert,
  FISWalletToken,
  TravelNotice,
  SpendingLimits,
  ChannelControls,
  IssueVirtualCardRequest,
  IssuePhysicalCardRequest,
} from '../../../services/FISCardService';

// =============================================================================
// TYPES
// =============================================================================

interface FISCardState {
  // Card data
  cards: FISCard[];
  selectedCardId: string | null;
  cardControls: Record<string, FISCardControls>;

  // Transactions
  transactions: Record<string, FISTransaction[]>;
  pendingTransactions: Record<string, FISTransaction[]>;

  // Alerts
  alerts: FISAlert[];
  unreadAlertCount: number;

  // Wallet tokens
  walletTokens: Record<string, FISWalletToken[]>;

  // Travel notices
  travelNotices: Record<string, TravelNotice[]>;

  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions - Cards
  fetchCards: () => Promise<void>;
  fetchCard: (cardId: string) => Promise<FISCard | null>;
  issueVirtualCard: (request: IssueVirtualCardRequest) => Promise<FISCard | null>;
  issuePhysicalCard: (request: IssuePhysicalCardRequest) => Promise<FISCard | null>;
  activateCard: (cardId: string, lastFour: string, activationCode?: string) => Promise<boolean>;
  replaceCard: (cardId: string, reason: 'lost' | 'stolen' | 'damaged' | 'expired') => Promise<FISCard | null>;
  cancelCard: (cardId: string, reason: string) => Promise<boolean>;
  selectCard: (cardId: string | null) => void;

  // Actions - Card Controls
  lockCard: (cardId: string, reason?: string) => Promise<boolean>;
  unlockCard: (cardId: string) => Promise<boolean>;
  freezeCard: (cardId: string, reason?: string) => Promise<boolean>;
  unfreezeCard: (cardId: string) => Promise<boolean>;
  fetchCardControls: (cardId: string) => Promise<void>;
  setSpendingLimits: (cardId: string, limits: SpendingLimits) => Promise<boolean>;
  setChannelControls: (cardId: string, controls: ChannelControls) => Promise<boolean>;
  toggleInternational: (cardId: string, enabled: boolean) => Promise<boolean>;

  // Actions - PIN
  setPin: (cardId: string, pin: string) => Promise<boolean>;
  changePin: (cardId: string, currentPin: string, newPin: string) => Promise<boolean>;
  requestPinResetOtp: (cardId: string) => Promise<boolean>;
  resetPin: (cardId: string, otp: string, newPin: string) => Promise<boolean>;

  // Actions - Transactions
  fetchTransactions: (cardId: string, options?: { page?: number; pageSize?: number }) => Promise<void>;
  fetchRecentTransactions: (cardId: string, limit?: number) => Promise<void>;
  fetchPendingTransactions: (cardId: string) => Promise<void>;
  initiateDispute: (cardId: string, transactionId: string, reason: string, description: string) => Promise<boolean>;

  // Actions - Alerts
  fetchAlerts: (cardId?: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  resolveAlert: (alertId: string, resolution: string) => Promise<boolean>;

  // Actions - Fraud & Security
  reportFraud: (cardId: string, fraudType: string, description: string, transactionId?: string) => Promise<boolean>;
  setTravelNotice: (cardId: string, startDate: string, endDate: string, destinations: string[]) => Promise<boolean>;
  fetchTravelNotices: (cardId: string) => Promise<void>;
  cancelTravelNotice: (cardId: string, noticeId: string) => Promise<boolean>;

  // Actions - Digital Wallets
  fetchWalletTokens: (cardId: string) => Promise<void>;
  suspendWalletToken: (cardId: string, tokenId: string) => Promise<boolean>;
  resumeWalletToken: (cardId: string, tokenId: string) => Promise<boolean>;
  deleteWalletToken: (cardId: string, tokenId: string) => Promise<boolean>;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  cards: [],
  selectedCardId: null,
  cardControls: {},
  transactions: {},
  pendingTransactions: {},
  alerts: [],
  unreadAlertCount: 0,
  walletTokens: {},
  travelNotices: {},
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,
};

// =============================================================================
// STORE
// =============================================================================

export const useFISCardStore = create<FISCardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // =========================================================================
      // CARD ACTIONS
      // =========================================================================

      fetchCards: async () => {
        set({ isLoading: true, error: null });
        try {
          const cards = await fisCardService.getCards();
          set({
            cards,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch cards',
          });
        }
      },

      fetchCard: async (cardId: string) => {
        try {
          const card = await fisCardService.getCard(cardId);
          const { cards } = get();
          const updatedCards = cards.map(c => (c.id === cardId ? card : c));
          if (!cards.find(c => c.id === cardId)) {
            updatedCards.push(card);
          }
          set({ cards: updatedCards });
          return card;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch card' });
          return null;
        }
      },

      issueVirtualCard: async (request: IssueVirtualCardRequest) => {
        set({ isLoading: true, error: null });
        try {
          const card = await fisCardService.issueVirtualCard(request);
          const { cards } = get();
          set({ cards: [...cards, card], isLoading: false });
          return card;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to issue virtual card',
          });
          return null;
        }
      },

      issuePhysicalCard: async (request: IssuePhysicalCardRequest) => {
        set({ isLoading: true, error: null });
        try {
          const card = await fisCardService.issuePhysicalCard(request);
          const { cards } = get();
          set({ cards: [...cards, card], isLoading: false });
          return card;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to order physical card',
          });
          return null;
        }
      },

      activateCard: async (cardId: string, lastFour: string, activationCode?: string) => {
        set({ isLoading: true, error: null });
        try {
          await fisCardService.activateCard(cardId, lastFour, activationCode);
          // Refresh the card
          await get().fetchCard(cardId);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to activate card',
          });
          return false;
        }
      },

      replaceCard: async (cardId: string, reason: 'lost' | 'stolen' | 'damaged' | 'expired') => {
        set({ isLoading: true, error: null });
        try {
          const newCard = await fisCardService.replaceCard(cardId, reason);
          const { cards } = get();
          // Mark old card as cancelled, add new card
          const updatedCards = cards.map(c =>
            c.id === cardId ? { ...c, status: 'cancelled' as const } : c
          );
          set({ cards: [...updatedCards, newCard], isLoading: false });
          return newCard;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to replace card',
          });
          return null;
        }
      },

      cancelCard: async (cardId: string, reason: string) => {
        set({ isLoading: true, error: null });
        try {
          await fisCardService.cancelCard(cardId, reason);
          const { cards } = get();
          set({
            cards: cards.filter(c => c.id !== cardId),
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to cancel card',
          });
          return false;
        }
      },

      selectCard: (cardId: string | null) => {
        set({ selectedCardId: cardId });
      },

      // =========================================================================
      // CARD CONTROLS ACTIONS
      // =========================================================================

      lockCard: async (cardId: string, reason?: string) => {
        try {
          await fisCardService.lockCard(cardId, reason);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, status: 'locked' as const } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to lock card' });
          return false;
        }
      },

      unlockCard: async (cardId: string) => {
        try {
          await fisCardService.unlockCard(cardId);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, status: 'active' as const } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to unlock card' });
          return false;
        }
      },

      freezeCard: async (cardId: string, reason?: string) => {
        try {
          await fisCardService.freezeCard(cardId, reason);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, status: 'frozen' as const } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to freeze card' });
          return false;
        }
      },

      unfreezeCard: async (cardId: string) => {
        try {
          await fisCardService.unfreezeCard(cardId);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, status: 'active' as const } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to unfreeze card' });
          return false;
        }
      },

      fetchCardControls: async (cardId: string) => {
        try {
          const controls = await fisCardService.getCardControls(cardId);
          const { cardControls } = get();
          set({ cardControls: { ...cardControls, [cardId]: controls } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch card controls' });
        }
      },

      setSpendingLimits: async (cardId: string, limits: SpendingLimits) => {
        try {
          await fisCardService.setSpendingLimits(cardId, limits);
          await get().fetchCardControls(cardId);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set spending limits' });
          return false;
        }
      },

      setChannelControls: async (cardId: string, controls: ChannelControls) => {
        try {
          await fisCardService.setChannelControls(cardId, controls);
          await get().fetchCardControls(cardId);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set channel controls' });
          return false;
        }
      },

      toggleInternational: async (cardId: string, enabled: boolean) => {
        try {
          if (enabled) {
            await fisCardService.enableInternational(cardId);
          } else {
            await fisCardService.disableInternational(cardId);
          }
          await get().fetchCardControls(cardId);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to toggle international' });
          return false;
        }
      },

      // =========================================================================
      // PIN ACTIONS
      // =========================================================================

      setPin: async (cardId: string, pin: string) => {
        try {
          await fisCardService.setPin(cardId, pin);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, pinSet: true } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set PIN' });
          return false;
        }
      },

      changePin: async (cardId: string, currentPin: string, newPin: string) => {
        try {
          await fisCardService.changePin(cardId, currentPin, newPin);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to change PIN' });
          return false;
        }
      },

      requestPinResetOtp: async (cardId: string) => {
        try {
          await fisCardService.requestPinResetOtp(cardId);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to send OTP' });
          return false;
        }
      },

      resetPin: async (cardId: string, otp: string, newPin: string) => {
        try {
          await fisCardService.resetPin(cardId, otp, newPin);
          const { cards } = get();
          set({
            cards: cards.map(c =>
              c.id === cardId ? { ...c, pinSet: true, pinLocked: false } : c
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reset PIN' });
          return false;
        }
      },

      // =========================================================================
      // TRANSACTION ACTIONS
      // =========================================================================

      fetchTransactions: async (cardId: string, options?: { page?: number; pageSize?: number }) => {
        try {
          const response = await fisCardService.getTransactions(cardId, options);
          const { transactions } = get();
          set({
            transactions: {
              ...transactions,
              [cardId]: response.transactions,
            },
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' });
        }
      },

      fetchRecentTransactions: async (cardId: string, limit: number = 10) => {
        try {
          const txns = await fisCardService.getRecentTransactions(cardId, limit);
          const { transactions } = get();
          set({
            transactions: {
              ...transactions,
              [cardId]: txns,
            },
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch recent transactions' });
        }
      },

      fetchPendingTransactions: async (cardId: string) => {
        try {
          const txns = await fisCardService.getPendingTransactions(cardId);
          const { pendingTransactions } = get();
          set({
            pendingTransactions: {
              ...pendingTransactions,
              [cardId]: txns,
            },
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch pending transactions' });
        }
      },

      initiateDispute: async (cardId: string, transactionId: string, reason: string, description: string) => {
        try {
          await fisCardService.initiateDispute(cardId, transactionId, reason, description);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initiate dispute' });
          return false;
        }
      },

      // =========================================================================
      // ALERT ACTIONS
      // =========================================================================

      fetchAlerts: async (cardId?: string) => {
        try {
          const alerts = await fisCardService.getAlerts(cardId ? { cardId } : undefined);
          const unreadCount = await fisCardService.getUnreadAlertCount(cardId);
          set({ alerts, unreadAlertCount: unreadCount });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch alerts' });
        }
      },

      acknowledgeAlert: async (alertId: string) => {
        try {
          await fisCardService.acknowledgeAlert(alertId);
          const { alerts } = get();
          set({
            alerts: alerts.map(a =>
              a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
            ),
            unreadAlertCount: Math.max(0, get().unreadAlertCount - 1),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to acknowledge alert' });
          return false;
        }
      },

      resolveAlert: async (alertId: string, resolution: string) => {
        try {
          await fisCardService.resolveAlert(alertId, resolution);
          const { alerts } = get();
          set({
            alerts: alerts.map(a =>
              a.id === alertId ? { ...a, status: 'resolved' as const } : a
            ),
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to resolve alert' });
          return false;
        }
      },

      // =========================================================================
      // FRAUD & SECURITY ACTIONS
      // =========================================================================

      reportFraud: async (cardId: string, fraudType: string, description: string, transactionId?: string) => {
        try {
          await fisCardService.reportFraud(cardId, fraudType, description, transactionId);
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to report fraud' });
          return false;
        }
      },

      setTravelNotice: async (cardId: string, startDate: string, endDate: string, destinations: string[]) => {
        try {
          const notice = await fisCardService.setTravelNotice(cardId, startDate, endDate, destinations);
          const { travelNotices } = get();
          const existing = travelNotices[cardId] || [];
          set({
            travelNotices: {
              ...travelNotices,
              [cardId]: [...existing, notice],
            },
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set travel notice' });
          return false;
        }
      },

      fetchTravelNotices: async (cardId: string) => {
        try {
          const notices = await fisCardService.getTravelNotices(cardId);
          const { travelNotices } = get();
          set({
            travelNotices: {
              ...travelNotices,
              [cardId]: notices,
            },
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch travel notices' });
        }
      },

      cancelTravelNotice: async (cardId: string, noticeId: string) => {
        try {
          await fisCardService.cancelTravelNotice(cardId, noticeId);
          const { travelNotices } = get();
          set({
            travelNotices: {
              ...travelNotices,
              [cardId]: (travelNotices[cardId] || []).filter(n => n.id !== noticeId),
            },
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to cancel travel notice' });
          return false;
        }
      },

      // =========================================================================
      // DIGITAL WALLET ACTIONS
      // =========================================================================

      fetchWalletTokens: async (cardId: string) => {
        try {
          const tokens = await fisCardService.getWalletTokens(cardId);
          const { walletTokens } = get();
          set({
            walletTokens: {
              ...walletTokens,
              [cardId]: tokens,
            },
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch wallet tokens' });
        }
      },

      suspendWalletToken: async (cardId: string, tokenId: string) => {
        try {
          await fisCardService.suspendWalletToken(cardId, tokenId);
          const { walletTokens } = get();
          set({
            walletTokens: {
              ...walletTokens,
              [cardId]: (walletTokens[cardId] || []).map(t =>
                t.id === tokenId ? { ...t, status: 'suspended' as const } : t
              ),
            },
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to suspend wallet token' });
          return false;
        }
      },

      resumeWalletToken: async (cardId: string, tokenId: string) => {
        try {
          await fisCardService.resumeWalletToken(cardId, tokenId);
          const { walletTokens } = get();
          set({
            walletTokens: {
              ...walletTokens,
              [cardId]: (walletTokens[cardId] || []).map(t =>
                t.id === tokenId ? { ...t, status: 'active' as const } : t
              ),
            },
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to resume wallet token' });
          return false;
        }
      },

      deleteWalletToken: async (cardId: string, tokenId: string) => {
        try {
          await fisCardService.deleteWalletToken(cardId, tokenId);
          const { walletTokens } = get();
          set({
            walletTokens: {
              ...walletTokens,
              [cardId]: (walletTokens[cardId] || []).filter(t => t.id !== tokenId),
            },
          });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete wallet token' });
          return false;
        }
      },

      // =========================================================================
      // UTILITY ACTIONS
      // =========================================================================

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'fis-card-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cards: state.cards,
        selectedCardId: state.selectedCardId,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useFISCardStore;
