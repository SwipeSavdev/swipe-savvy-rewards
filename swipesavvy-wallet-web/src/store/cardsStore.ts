import { create } from 'zustand'
import { cardsApi, type CardSettings, type CardSpendingLimits } from '../services/api'
import type { Card } from '../types/api'

interface CardsState {
  cards: Card[]
  selectedCard: Card | null
  cardSettings: CardSettings | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCards: () => Promise<void>
  fetchCard: (cardId: string) => Promise<void>
  fetchCardSettings: (cardId: string) => Promise<void>
  lockCard: (cardId: string) => Promise<void>
  unlockCard: (cardId: string) => Promise<void>
  freezeCard: (cardId: string, reason?: string) => Promise<void>
  unfreezeCard: (cardId: string) => Promise<void>
  reportLostStolen: (cardId: string, type: 'lost' | 'stolen') => Promise<void>
  requestReplacement: (cardId: string, options?: { expedited?: boolean }) => Promise<{ newCardId: string; estimatedDelivery: string }>
  updateSettings: (cardId: string, settings: Partial<CardSettings>) => Promise<void>
  updatePin: (cardId: string, newPin: string) => Promise<void>
  activateCard: (cardId: string, last4Digits: string) => Promise<void>
  createVirtualCard: (options?: { nickname?: string; spendingLimits?: CardSpendingLimits }) => Promise<Card>
  selectCard: (card: Card | null) => void
  updateCardLockStatus: (cardId: string, isLocked: boolean) => void
  clearError: () => void
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  selectedCard: null,
  cardSettings: null,
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null })
    try {
      const cards = await cardsApi.getCards()
      set({ cards, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch cards'
      set({ error: message, isLoading: false })
    }
  },

  fetchCard: async (cardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const card = await cardsApi.getCard(cardId)
      set({ selectedCard: card, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch card'
      set({ error: message, isLoading: false })
    }
  },

  fetchCardSettings: async (cardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const cardSettings = await cardsApi.getSettings(cardId)
      set({ cardSettings, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch settings'
      set({ error: message, isLoading: false })
    }
  },

  lockCard: async (cardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await cardsApi.lockCard(cardId)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? updatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? updatedCard : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to lock card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  unlockCard: async (cardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await cardsApi.unlockCard(cardId)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? updatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? updatedCard : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unlock card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  freezeCard: async (cardId: string, reason?: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await cardsApi.freezeCard(cardId, reason)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? updatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? updatedCard : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to freeze card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  unfreezeCard: async (cardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await cardsApi.unfreezeCard(cardId)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? updatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? updatedCard : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unfreeze card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  reportLostStolen: async (cardId: string, type: 'lost' | 'stolen') => {
    set({ isLoading: true, error: null })
    try {
      const { card } = await cardsApi.reportLostStolen(cardId, type)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? card : c)),
        selectedCard: get().selectedCard?.id === cardId ? card : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to report card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  requestReplacement: async (cardId: string, options) => {
    set({ isLoading: true, error: null })
    try {
      const result = await cardsApi.requestReplacement(cardId, options)
      set({ isLoading: false })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request replacement'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateSettings: async (cardId: string, settings: Partial<CardSettings>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await cardsApi.updateSettings(cardId, settings)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? updatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? updatedCard : get().selectedCard,
        cardSettings: get().cardSettings ? { ...get().cardSettings!, ...settings } : null,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updatePin: async (cardId: string, newPin: string) => {
    set({ isLoading: true, error: null })
    try {
      await cardsApi.updatePin(cardId, newPin)
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update PIN'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  activateCard: async (cardId: string, last4Digits: string) => {
    set({ isLoading: true, error: null })
    try {
      const activatedCard = await cardsApi.activateCard(cardId, last4Digits)
      set({
        cards: get().cards.map((c) => (c.id === cardId ? activatedCard : c)),
        selectedCard: get().selectedCard?.id === cardId ? activatedCard : get().selectedCard,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  createVirtualCard: async (options) => {
    set({ isLoading: true, error: null })
    try {
      const newCard = await cardsApi.createVirtualCard(options)
      set({
        cards: [...get().cards, newCard],
        isLoading: false,
      })
      return newCard
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create virtual card'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  selectCard: (card: Card | null) => {
    set({ selectedCard: card, cardSettings: null })
  },

  updateCardLockStatus: (cardId: string, isLocked: boolean) => {
    set({
      cards: get().cards.map((c) =>
        c.id === cardId ? { ...c, isLocked } : c
      ),
      selectedCard:
        get().selectedCard?.id === cardId
          ? { ...get().selectedCard!, isLocked }
          : get().selectedCard,
    })
  },

  clearError: () => set({ error: null }),
}))
