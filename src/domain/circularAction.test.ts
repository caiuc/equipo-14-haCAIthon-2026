import { describe, expect, it } from 'vitest';

import type { CircularActionDefinition } from './circularAction';
import { circularMissionProgress, pointsForCircularAction, registerCircularAction } from './circularAction';

const preventionAction: CircularActionDefinition = {
  id: 'avoid-disposable',
  kind: 'prevention',
  title: 'Evita un desechable',
  description: 'Usa una alternativa reutilizable.',
  guidance: 'Cuéntanos qué evitaste.',
  icon: 'cup',
};

describe('Reto Acción Circular', () => {
  it('prioriza prevenir y reutilizar por sobre reciclar', () => {
    expect(pointsForCircularAction('prevention')).toBeGreaterThan(pointsForCircularAction('reuse'));
    expect(pointsForCircularAction('reuse')).toBeGreaterThan(pointsForCircularAction('recycling'));
  });

  it('registra participación sin inventar impacto material', () => {
    expect(registerCircularAction(preventionAction, false, { xp: 20, participationCount: 1, missionTarget: 4 })).toEqual({
      actionId: 'avoid-disposable',
      awardedXp: 40,
      xp: 60,
      participationCount: 2,
      missionTarget: 4,
      evidenceStatus: 'declared',
      materialImpact: { status: 'unconfirmed', label: 'Sin dato confirmado' },
    });
  });

  it('distingue una foto adjunta de una acción sólo declarada', () => {
    const result = registerCircularAction(preventionAction, true, { xp: 0, participationCount: 0, missionTarget: 4 });
    expect(result.evidenceStatus).toBe('photo-attached');
    expect(result.materialImpact.status).toBe('unconfirmed');
  });

  it('limita el progreso visual de la misión a cien por ciento', () => {
    expect(circularMissionProgress({ xp: 200, participationCount: 6, missionTarget: 4 })).toBe(100);
  });
});
