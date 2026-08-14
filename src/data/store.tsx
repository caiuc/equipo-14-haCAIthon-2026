import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import { calculateActionImpact, isSuspiciousAction, recyclingDraftSchema } from '@/domain/rules';
import type { AppState, Community, RecyclingAction, RecyclingDraft } from '@/domain/types';
import { createSeedState } from './seed';

const STORAGE_KEY = 'retorna-demo-state-v3';

type StoreAction =
  | { type: 'hydrate'; payload: AppState }
  | { type: 'record'; payload: { action: RecyclingAction; feedTitle: string; feedDetail: string } }
  | { type: 'update_action'; payload: RecyclingAction }
  | { type: 'delete_action'; payload: { id: string; at: string } }
  | { type: 'join'; payload: { communityId: string; at: string } }
  | { type: 'leave'; payload: { communityId: string } }
  | { type: 'create_community'; payload: Community }
  | { type: 'toggle_follow'; payload: { userId: string; at: string } }
  | { type: 'reset' };

function reducer(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case 'hydrate': return action.payload.version === 3 ? action.payload : state;
    case 'record':
      return {
        ...state,
        actions: [action.payload.action, ...state.actions],
        lastCommunityId: action.payload.action.communityId,
        feed: [{
          id: `feed-${action.payload.action.id}`,
          type: 'recycling_recorded',
          actorId: state.currentUserId,
          communityId: action.payload.action.communityId,
          recyclingActionId: action.payload.action.id,
          title: action.payload.feedTitle,
          detail: action.payload.feedDetail,
          points: action.payload.action.points,
          createdAt: action.payload.action.recordedAt,
        }, ...state.feed],
      };
    case 'update_action':
      return { ...state, actions: state.actions.map((item) => item.id === action.payload.id ? action.payload : item) };
    case 'delete_action':
      return { ...state, actions: state.actions.map((item) => item.id === action.payload.id ? { ...item, deletedAt: action.payload.at, updatedAt: action.payload.at } : item) };
    case 'join': {
      if (state.memberships.some((item) => item.userId === state.currentUserId && item.communityId === action.payload.communityId)) return state;
      const community = state.communities.find((item) => item.id === action.payload.communityId);
      return {
        ...state,
        memberships: [...state.memberships, { id: `membership-${Date.now()}`, communityId: action.payload.communityId, userId: state.currentUserId, role: 'member', joinedAt: action.payload.at }],
        feed: community ? [{ id: `feed-join-${Date.now()}`, type: 'community_joined', actorId: state.currentUserId, communityId: community.id, title: `Martina se unió a ${community.name}`, detail: 'Una nueva comunidad recibirá sus próximos aportes.', createdAt: action.payload.at }, ...state.feed] : state.feed,
      };
    }
    case 'leave':
      return { ...state, memberships: state.memberships.filter((item) => !(item.userId === state.currentUserId && item.communityId === action.payload.communityId && item.role !== 'owner')) };
    case 'create_community':
      return {
        ...state,
        communities: [action.payload, ...state.communities],
        memberships: [{ id: `membership-${Date.now()}`, communityId: action.payload.id, userId: state.currentUserId, role: 'owner', joinedAt: action.payload.createdAt }, ...state.memberships],
        lastCommunityId: action.payload.id,
      };
    case 'toggle_follow': {
      const exists = state.follows.some((item) => item.followerId === state.currentUserId && item.followedId === action.payload.userId);
      return {
        ...state,
        follows: exists
          ? state.follows.filter((item) => !(item.followerId === state.currentUserId && item.followedId === action.payload.userId))
          : [...state.follows, { followerId: state.currentUserId, followedId: action.payload.userId, createdAt: action.payload.at }],
      };
    }
    case 'reset': return createSeedState();
  }
}

interface RetornaStoreValue {
  state: AppState;
  hydrated: boolean;
  joinedCommunities: Community[];
  recordRecycling: (draft: RecyclingDraft) => RecyclingAction;
  updateRecycling: (id: string, draft: RecyclingDraft) => RecyclingAction;
  deleteRecycling: (id: string) => void;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  createCommunity: (input: Pick<Community, 'name' | 'description' | 'visibility' | 'accent'>) => Community;
  toggleFollow: (userId: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<RetornaStoreValue | null>(null);

export function RetornaStoreProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) dispatch({ type: 'hydrate', payload: JSON.parse(value) as AppState });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const joinedCommunities = useMemo(() => {
    const ids = new Set(state.memberships.filter((item) => item.userId === state.currentUserId).map((item) => item.communityId));
    return state.communities.filter((item) => ids.has(item.id));
  }, [state]);

  const recordRecycling = useCallback((unsafeDraft: RecyclingDraft) => {
    const draft = recyclingDraftSchema.parse(unsafeDraft);
    const category = state.categories.find((item) => item.id === draft.categoryId);
    const community = state.communities.find((item) => item.id === draft.communityId);
    if (!category || !community) throw new Error('Selecciona una categoría y una comunidad válidas.');
    if (!state.memberships.some((item) => item.userId === state.currentUserId && item.communityId === community.id)) {
      throw new Error('Debes pertenecer a la comunidad antes de aportarle puntos.');
    }
    const impact = calculateActionImpact(category, draft.quantity);
    const now = new Date();
    const recorded: RecyclingAction = {
      id: `action-${now.getTime()}`,
      userId: state.currentUserId,
      communityId: community.id,
      categoryId: category.id,
      quantity: draft.quantity,
      ...impact,
      note: draft.note,
      source: draft.source ?? 'manual',
      barcode: draft.barcode,
      suspicious: isSuspiciousAction(state, state.currentUserId, draft.quantity, impact.points, now),
      recordedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    dispatch({ type: 'record', payload: { action: recorded, feedTitle: `Martina recicló ${draft.quantity} ${draft.quantity === 1 ? 'objeto' : 'objetos'}`, feedDetail: `Aportó ${impact.points} puntos a ${community.name}` } });
    return recorded;
  }, [state]);

  const updateRecycling = useCallback((id: string, unsafeDraft: RecyclingDraft) => {
    const existing = state.actions.find((item) => item.id === id && item.userId === state.currentUserId && !item.deletedAt);
    if (!existing) throw new Error('No puedes editar esta actividad.');
    const draft = recyclingDraftSchema.parse(unsafeDraft);
    const category = state.categories.find((item) => item.id === draft.categoryId);
    if (!category) throw new Error('Categoría inválida.');
    const impact = calculateActionImpact(category, draft.quantity);
    const updated = { ...existing, ...draft, ...impact, updatedAt: new Date().toISOString() };
    dispatch({ type: 'update_action', payload: updated });
    return updated;
  }, [state]);

  const createCommunity = useCallback((input: Pick<Community, 'name' | 'description' | 'visibility' | 'accent'>) => {
    const now = new Date().toISOString();
    const slug = input.name.toLocaleLowerCase('es-CL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const community: Community = {
      ...input,
      id: `com-${Date.now()}`,
      organizationId: state.organization.id,
      slug,
      initials: input.name.split(/\s+/).slice(0, 3).map((part) => part[0]).join('').toUpperCase(),
      creatorId: state.currentUserId,
      memberCountBaseline: 0,
      pointsBaseline: { week: 0, month: 0, all: 0 },
      itemsBaseline: 0,
      estimatedKgBaseline: 0,
      tags: [input.visibility === 'private' ? 'Privada' : 'Abierta'],
      createdAt: now,
    };
    dispatch({ type: 'create_community', payload: community });
    return community;
  }, [state.currentUserId, state.organization.id]);

  const value = useMemo<RetornaStoreValue>(() => ({
    state,
    hydrated,
    joinedCommunities,
    recordRecycling,
    updateRecycling,
    deleteRecycling: (id) => dispatch({ type: 'delete_action', payload: { id, at: new Date().toISOString() } }),
    joinCommunity: (communityId) => dispatch({ type: 'join', payload: { communityId, at: new Date().toISOString() } }),
    leaveCommunity: (communityId) => dispatch({ type: 'leave', payload: { communityId } }),
    createCommunity,
    toggleFollow: (userId) => dispatch({ type: 'toggle_follow', payload: { userId, at: new Date().toISOString() } }),
    resetDemo: () => dispatch({ type: 'reset' }),
  }), [state, hydrated, joinedCommunities, recordRecycling, updateRecycling, createCommunity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useRetornaStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useRetornaStore debe usarse dentro de RetornaStoreProvider.');
  return value;
}
