export type CircularActionKind = 'prevention' | 'reuse' | 'recycling';

export type CircularActionDefinition = {
  id: string;
  kind: CircularActionKind;
  title: string;
  description: string;
  guidance: string;
  icon: 'cup' | 'package' | 'recycle' | 'battery';
};

export type CircularEvidenceStatus = 'declared' | 'photo-attached';

export type CircularChallengeProgress = {
  xp: number;
  participationCount: number;
  missionTarget: number;
};

export type CircularActionRegistration = CircularChallengeProgress & {
  actionId: string;
  awardedXp: number;
  evidenceStatus: CircularEvidenceStatus;
  materialImpact: {
    status: 'unconfirmed';
    label: 'Sin dato confirmado';
  };
};

const XP_BY_KIND: Record<CircularActionKind, number> = {
  prevention: 40,
  reuse: 30,
  recycling: 20,
};

export function pointsForCircularAction(kind: CircularActionKind) {
  return XP_BY_KIND[kind];
}

export function registerCircularAction(
  action: CircularActionDefinition,
  hasPhotoEvidence: boolean,
  current: CircularChallengeProgress,
): CircularActionRegistration {
  if (current.xp < 0 || current.participationCount < 0 || current.missionTarget < 1) {
    throw new Error('El progreso actual del reto no es válido.');
  }

  const awardedXp = pointsForCircularAction(action.kind);

  return {
    actionId: action.id,
    awardedXp,
    xp: current.xp + awardedXp,
    participationCount: current.participationCount + 1,
    missionTarget: current.missionTarget,
    evidenceStatus: hasPhotoEvidence ? 'photo-attached' : 'declared',
    materialImpact: {
      status: 'unconfirmed',
      label: 'Sin dato confirmado',
    },
  };
}

export function circularMissionProgress(progress: CircularChallengeProgress) {
  return Math.min(100, (progress.participationCount / progress.missionTarget) * 100);
}
