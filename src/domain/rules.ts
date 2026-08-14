import { z } from 'zod';

import type {
  AppState,
  Challenge,
  Community,
  LeaderboardEntry,
  MetricType,
  Mission,
  Period,
  RecyclingAction,
  RecyclingCategory,
  UserStats,
} from './types';

export const CHILE_TIME_ZONE = 'America/Santiago';

export const recyclingDraftSchema = z.object({
  categoryId: z.string().min(1),
  communityId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  note: z.string().trim().max(180).optional(),
  source: z.enum(['manual', 'barcode']).optional(),
  barcode: z.string().trim().max(18).optional(),
});

export function calculateActionImpact(category: RecyclingCategory, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new Error('La cantidad debe estar entre 1 y 50 unidades.');
  }

  return {
    points: category.pointsPerUnit * quantity,
    estimatedKg: round(category.estimatedKgPerUnit * quantity, 2),
    estimatedCo2Kg: round(category.estimatedCo2KgPerUnit * quantity, 2),
  };
}

export function chileDateKey(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CHILE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateKeyParts(key: string) {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return { year, month, day };
}

export function periodStartKey(period: Period, now = new Date()): string | undefined {
  if (period === 'all') return undefined;
  const currentKey = chileDateKey(now);
  const { year, month, day } = dateKeyParts(currentKey);
  if (period === 'month') return `${year}-${String(month).padStart(2, '0')}-01`;
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  const mondayOffset = (noonUtc.getUTCDay() + 6) % 7;
  noonUtc.setUTCDate(noonUtc.getUTCDate() - mondayOffset);
  return noonUtc.toISOString().slice(0, 10);
}

export function actionMatchesPeriod(action: RecyclingAction, period: Period, now = new Date()) {
  if (action.deletedAt) return false;
  const start = periodStartKey(period, now);
  return !start || chileDateKey(action.recordedAt) >= start;
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('es-CL', {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeDate(iso: string, now = new Date()) {
  const diffMinutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

const LEVELS = [
  { floor: 0, name: 'Semilla' },
  { floor: 150, name: 'Impulso' },
  { floor: 400, name: 'Movimiento' },
  { floor: 800, name: 'Catalizador/a' },
  { floor: 1_400, name: 'Referente' },
  { floor: 2_200, name: 'Impacto UC' },
  { floor: 3_400, name: 'Leyenda circular' },
] as const;

export function levelForPoints(points: number) {
  let index = 0;
  for (let cursor = 0; cursor < LEVELS.length; cursor += 1) {
    if (points >= LEVELS[cursor]!.floor) index = cursor;
  }
  const current = LEVELS[index]!;
  const next = LEVELS[index + 1];
  return {
    level: index + 1,
    levelName: current.name,
    currentLevelFloor: current.floor,
    nextLevelAt: next?.floor ?? current.floor + 1_500,
  };
}

export function calculateStreak(actions: RecyclingAction[], userId: string, now = new Date()) {
  const keys = [...new Set(actions.filter((item) => item.userId === userId && !item.deletedAt).map((item) => chileDateKey(item.recordedAt)))].sort();
  if (!keys.length) return { currentStreak: 0, longestStreak: 0 };

  let longest = 1;
  let run = 1;
  for (let index = 1; index < keys.length; index += 1) {
    const previous = new Date(`${keys[index - 1]}T12:00:00Z`);
    const current = new Date(`${keys[index]}T12:00:00Z`);
    const diff = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
    run = diff === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = chileDateKey(now);
  const yesterdayDate = new Date(`${today}T12:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const last = keys[keys.length - 1]!;
  if (last !== today && last !== yesterdayDate.toISOString().slice(0, 10)) {
    return { currentStreak: 0, longestStreak: longest };
  }

  let currentStreak = 1;
  for (let index = keys.length - 1; index > 0; index -= 1) {
    const current = new Date(`${keys[index]}T12:00:00Z`);
    const previous = new Date(`${keys[index - 1]}T12:00:00Z`);
    if (Math.round((current.getTime() - previous.getTime()) / 86_400_000) !== 1) break;
    currentStreak += 1;
  }
  return { currentStreak, longestStreak: longest };
}

export function getUserStats(state: AppState, userId: string): UserStats {
  const ownActions = state.actions.filter((item) => item.userId === userId && !item.deletedAt);
  const points = ownActions.reduce((sum, item) => sum + item.points, 0) + (userId === state.currentUserId ? 312 : profileBaseline(userId));
  const level = levelForPoints(points);
  const streak = calculateStreak(state.actions, userId);
  return {
    points,
    weeklyPoints: ownActions.filter((item) => actionMatchesPeriod(item, 'week')).reduce((sum, item) => sum + item.points, 0) + (userId === state.currentUserId ? 74 : 0),
    monthlyPoints: ownActions.filter((item) => actionMatchesPeriod(item, 'month')).reduce((sum, item) => sum + item.points, 0) + (userId === state.currentUserId ? 198 : 0),
    items: ownActions.reduce((sum, item) => sum + item.quantity, 0) + (userId === state.currentUserId ? 31 : 0),
    estimatedKg: round(ownActions.reduce((sum, item) => sum + item.estimatedKg, 0) + (userId === state.currentUserId ? 5.8 : 0), 1),
    estimatedCo2Kg: round(ownActions.reduce((sum, item) => sum + item.estimatedCo2Kg, 0) + (userId === state.currentUserId ? 9.4 : 0), 1),
    ...level,
    ...streak,
  };
}

function profileBaseline(userId: string) {
  const baselines: Record<string, number> = {
    'user-tomas': 1_245,
    'user-sofia': 1_118,
    'user-benjamin': 976,
    'user-valentina': 884,
    'user-diego': 790,
    'user-antonia': 702,
    'user-nicolas': 645,
  };
  return baselines[userId] ?? 0;
}

function baselineForCommunity(community: Community, period: Period) {
  return community.pointsBaseline[period];
}

export function buildUserLeaderboard(state: AppState, period: Period, communityId?: string): LeaderboardEntry[] {
  const allowedUsers = communityId
    ? new Set(state.memberships.filter((item) => item.communityId === communityId).map((item) => item.userId))
    : undefined;
  const entries = state.profiles
    .filter((profile) => !allowedUsers || allowedUsers.has(profile.id))
    .map((profile) => {
      const matching = state.actions.filter(
        (action) => action.userId === profile.id && (!communityId || action.communityId === communityId) && actionMatchesPeriod(action, period),
      );
      const fallback = period === 'all' ? profileBaseline(profile.id) : period === 'month' ? Math.round(profileBaseline(profile.id) * 0.48) : Math.round(profileBaseline(profile.id) * 0.19);
      const currentFallback = profile.id === state.currentUserId ? (period === 'all' ? 312 : period === 'month' ? 198 : 74) : fallback;
      return {
        id: profile.id,
        name: profile.displayName,
        subtitle: profile.affiliation,
        initials: profile.initials,
        color: profile.avatarColor,
        points: matching.reduce((sum, action) => sum + action.points, 0) + currentFallback,
        items: matching.reduce((sum, action) => sum + action.quantity, 0),
        rank: 0,
        isCurrent: profile.id === state.currentUserId,
      };
    })
    .sort((a, b) => b.points - a.points || b.items - a.items || a.name.localeCompare(b.name));
  return entries.map((entry, index) => ({ ...entry, rank: index + 1, movement: entry.isCurrent ? 2 : index % 3 === 0 ? 1 : 0 }));
}

export function communityTotals(state: AppState, community: Community, period: Period = 'all') {
  const actions = state.actions.filter((item) => item.communityId === community.id && actionMatchesPeriod(item, period));
  return {
    points: baselineForCommunity(community, period) + actions.reduce((sum, item) => sum + item.points, 0),
    items: community.itemsBaseline + actions.reduce((sum, item) => sum + item.quantity, 0),
    estimatedKg: round(community.estimatedKgBaseline + actions.reduce((sum, item) => sum + item.estimatedKg, 0), 1),
  };
}

export function buildCommunityLeaderboard(state: AppState, period: Period): LeaderboardEntry[] {
  return state.communities
    .map((community) => {
      const totals = communityTotals(state, community, period);
      return {
        id: community.id,
        name: community.name,
        subtitle: `${community.memberCountBaseline + state.memberships.filter((item) => item.communityId === community.id).length} integrantes`,
        initials: community.initials,
        color: community.accent,
        points: totals.points,
        items: totals.items,
        rank: 0,
      };
    })
    .sort((a, b) => b.points - a.points || b.items - a.items || a.name.localeCompare(b.name))
    .map((entry, index) => ({ ...entry, rank: index + 1, movement: index === 1 ? 1 : 0 }));
}

function metricValue(actions: RecyclingAction[], metric: MetricType, categoryId?: string) {
  const eligible = actions.filter((item) => !item.deletedAt && (!categoryId || item.categoryId === categoryId));
  switch (metric) {
    case 'points': return eligible.reduce((sum, item) => sum + item.points, 0);
    case 'actions': return eligible.length;
    case 'items':
    case 'category_items': return eligible.reduce((sum, item) => sum + item.quantity, 0);
    case 'estimated_kg': return eligible.reduce((sum, item) => sum + item.estimatedKg, 0);
    case 'participants': return new Set(eligible.map((item) => item.userId)).size;
    case 'communities': return new Set(eligible.map((item) => item.communityId)).size;
  }
}

function inWindow(action: RecyclingAction, startAt: string, endAt: string) {
  return !action.deletedAt && action.recordedAt >= startAt && action.recordedAt <= endAt;
}

export function missionProgress(state: AppState, mission: Mission) {
  const actions = state.actions.filter((item) => inWindow(item, mission.startAt, mission.endAt));
  const added = metricValue(actions, mission.metric, mission.categoryId);
  const value = mission.progressBaseline + added;
  const personalActions = actions.filter((item) => item.userId === state.currentUserId);
  return {
    value,
    percent: Math.min(100, (value / mission.target) * 100),
    remaining: Math.max(0, mission.target - value),
    personal: metricValue(personalActions, mission.metric, mission.categoryId),
    participatingCommunities: mission.participatingCommunitiesBaseline + new Set(actions.map((item) => item.communityId)).size,
  };
}

export function challengeProgress(state: AppState, challenge: Challenge) {
  const actions = state.actions.filter((item) => item.communityId === challenge.communityId && inWindow(item, challenge.startAt, challenge.endAt));
  const added = metricValue(actions, challenge.metric, challenge.categoryId);
  const value = challenge.progressBaseline + added;
  const contributors = new Set(actions.map((item) => item.userId));
  return {
    value,
    percent: Math.min(100, (value / challenge.target) * 100),
    remaining: Math.max(0, challenge.target - value),
    contributors: Math.max(18, contributors.size),
  };
}

export function daysRemaining(endAt: string, now = new Date()) {
  return Math.max(0, Math.ceil((new Date(endAt).getTime() - now.getTime()) / 86_400_000));
}

export function isSuspiciousAction(state: AppState, userId: string, quantity: number, points: number, now = new Date()) {
  const today = chileDateKey(now);
  const hourAgo = now.getTime() - 3_600_000;
  const todayActions = state.actions.filter((item) => item.userId === userId && !item.deletedAt && chileDateKey(item.recordedAt) === today);
  const recentActions = todayActions.filter((item) => new Date(item.recordedAt).getTime() >= hourAgo);
  return (
    todayActions.reduce((sum, item) => sum + item.quantity, 0) + quantity > 80 ||
    todayActions.reduce((sum, item) => sum + item.points, 0) + points > 500 ||
    recentActions.length >= 20
  );
}

export function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
