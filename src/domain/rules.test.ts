import { describe, expect, it } from 'vitest';

import type { RecyclingAction, RecyclingCategory } from './types';
import { calculateActionImpact, calculateStreak, levelForPoints, periodStartKey } from './rules';

const metal: RecyclingCategory = {
  id: 'metal',
  name: 'Aluminio y metal',
  shortName: 'Metal',
  icon: 'can',
  color: '#E09B2D',
  pointsPerUnit: 14,
  estimatedKgPerUnit: 0.018,
  estimatedCo2KgPerUnit: 0.17,
  guidance: 'Guía',
  preparation: 'Preparación',
};

function action(id: string, recordedAt: string): RecyclingAction {
  return {
    id,
    userId: 'user-1',
    communityId: 'community-1',
    categoryId: 'metal',
    quantity: 1,
    points: 14,
    estimatedKg: 0.02,
    estimatedCo2Kg: 0.17,
    source: 'manual',
    recordedAt,
    updatedAt: recordedAt,
  };
}

describe('calculateActionImpact', () => {
  it('calcula puntos e impacto desde configuración central', () => {
    expect(calculateActionImpact(metal, 3)).toEqual({
      points: 42,
      estimatedKg: 0.05,
      estimatedCo2Kg: 0.51,
    });
  });

  it('rechaza cantidades fuera del límite del MVP', () => {
    expect(() => calculateActionImpact(metal, 0)).toThrow();
    expect(() => calculateActionImpact(metal, 51)).toThrow();
  });
});

describe('periodos Chile', () => {
  it('inicia la semana el lunes y el mes el día uno', () => {
    const friday = new Date('2026-08-14T16:00:00.000Z');
    expect(periodStartKey('week', friday)).toBe('2026-08-10');
    expect(periodStartKey('month', friday)).toBe('2026-08-01');
    expect(periodStartKey('all', friday)).toBeUndefined();
  });
});

describe('gamificación base', () => {
  it('deriva niveles desde puntaje acumulado', () => {
    expect(levelForPoints(0).levelName).toBe('Semilla');
    expect(levelForPoints(800)).toMatchObject({ level: 4, levelName: 'Catalizador/a' });
  });

  it('cuenta una acción diaria como racha', () => {
    const actions = [
      action('a1', '2026-08-12T15:00:00.000Z'),
      action('a2', '2026-08-13T15:00:00.000Z'),
      action('a3', '2026-08-14T15:00:00.000Z'),
    ];
    expect(calculateStreak(actions, 'user-1', new Date('2026-08-14T18:00:00.000Z'))).toEqual({ currentStreak: 3, longestStreak: 3 });
  });
});
