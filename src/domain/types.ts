export type ID = string;
export type Period = 'week' | 'month' | 'all';
export type CommunityRole = 'owner' | 'admin' | 'member';
export type CommunityVisibility = 'public' | 'private';
export type RecyclingSource = 'manual' | 'barcode';
export type MetricType =
  | 'points'
  | 'actions'
  | 'items'
  | 'category_items'
  | 'estimated_kg'
  | 'participants'
  | 'communities';

export interface UserProfile {
  id: ID;
  clerkUserId?: string;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  bio?: string;
  affiliation?: string;
  campus?: string;
  isVerifiedUc?: boolean;
  profileVisibility: 'authenticated' | 'private';
  createdAt: string;
}

export interface Community {
  id: ID;
  organizationId: ID;
  name: string;
  slug: string;
  description: string;
  visibility: CommunityVisibility;
  accent: string;
  initials: string;
  imageUrl?: string;
  coverUrl?: string;
  creatorId: ID;
  memberCountBaseline: number;
  pointsBaseline: Record<Period, number>;
  itemsBaseline: number;
  estimatedKgBaseline: number;
  tags: string[];
  createdAt: string;
}

export interface CommunityMembership {
  id: ID;
  communityId: ID;
  userId: ID;
  role: CommunityRole;
  joinedAt: string;
}

export interface RecyclingCategory {
  id: ID;
  name: string;
  shortName: string;
  icon: 'bottle' | 'glass' | 'can' | 'paper' | 'box' | 'carton' | 'cpu' | 'battery' | 'recycle';
  color: string;
  pointsPerUnit: number;
  estimatedKgPerUnit: number;
  estimatedCo2KgPerUnit: number;
  guidance: string;
  preparation: string;
  specialHandling?: boolean;
}

export interface RecyclingAction {
  id: ID;
  userId: ID;
  communityId: ID;
  categoryId: ID;
  quantity: number;
  points: number;
  estimatedKg: number;
  estimatedCo2Kg: number;
  note?: string;
  source: RecyclingSource;
  barcode?: string;
  recordedAt: string;
  updatedAt: string;
  deletedAt?: string;
  suspicious?: boolean;
}

export interface Mission {
  id: ID;
  organizationId: ID;
  title: string;
  shortTitle: string;
  description: string;
  metric: MetricType;
  categoryId?: ID;
  target: number;
  progressBaseline: number;
  unitLabel: string;
  startAt: string;
  endAt: string;
  reward: string;
  artwork: 'bottles' | 'campus' | 'clean-week';
  status: 'draft' | 'active' | 'completed';
  participatingCommunitiesBaseline: number;
}

export interface Challenge {
  id: ID;
  communityId: ID;
  title: string;
  description: string;
  metric: MetricType;
  categoryId?: ID;
  target: number;
  progressBaseline: number;
  unitLabel: string;
  startAt: string;
  endAt: string;
  reward?: string;
  status: 'draft' | 'active' | 'completed';
}

export type ActivityEventType =
  | 'recycling_recorded'
  | 'challenge_completed'
  | 'badge_earned'
  | 'level_reached'
  | 'community_joined'
  | 'mission_completed'
  | 'ranking_milestone';

export interface ActivityEvent {
  id: ID;
  type: ActivityEventType;
  actorId?: ID;
  communityId?: ID;
  recyclingActionId?: ID;
  title: string;
  detail: string;
  points?: number;
  createdAt: string;
}

export interface Badge {
  id: ID;
  name: string;
  description: string;
  icon: 'spark' | 'flame' | 'trophy' | 'users' | 'bottle' | 'medal';
  color: string;
}

export interface UserBadge {
  id: ID;
  userId: ID;
  badgeId: ID;
  earnedAt: string;
}

export interface Follow {
  followerId: ID;
  followedId: ID;
  createdAt: string;
}

export interface Organization {
  id: ID;
  name: string;
  shortName: string;
  countryCode: 'CL';
  timezone: 'America/Santiago';
}

export interface AppState {
  version: number;
  organization: Organization;
  currentUserId: ID;
  profiles: UserProfile[];
  communities: Community[];
  memberships: CommunityMembership[];
  categories: RecyclingCategory[];
  actions: RecyclingAction[];
  missions: Mission[];
  challenges: Challenge[];
  feed: ActivityEvent[];
  badges: Badge[];
  userBadges: UserBadge[];
  follows: Follow[];
  lastCommunityId?: ID;
}

export interface RecyclingDraft {
  categoryId: ID;
  communityId: ID;
  quantity: number;
  note?: string;
  source?: RecyclingSource;
  barcode?: string;
}

export interface LeaderboardEntry {
  id: ID;
  name: string;
  subtitle?: string;
  initials: string;
  color: string;
  points: number;
  items: number;
  rank: number;
  isCurrent?: boolean;
  movement?: number;
}

export interface UserStats {
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  items: number;
  estimatedKg: number;
  estimatedCo2Kg: number;
  level: number;
  levelName: string;
  currentLevelFloor: number;
  nextLevelAt: number;
  currentStreak: number;
  longestStreak: number;
}
