import type { CircularActionDefinition } from '@/domain/circularAction';

export const circularActions: CircularActionDefinition[] = [
  {
    id: 'avoid-disposable',
    kind: 'prevention',
    title: 'Evita un desechable',
    description: 'Usa botella, taza o cubiertos reutilizables en vez de pedir uno nuevo.',
    guidance: 'Elige esta opción cuando la acción evitó que el residuo existiera.',
    icon: 'cup',
  },
  {
    id: 'reuse-container',
    kind: 'reuse',
    title: 'Reutiliza un envase',
    description: 'Dale un nuevo uso a un frasco, caja, bolsa o material que ya tenías.',
    guidance: 'El objeto debe seguir cumpliendo una función, no sólo quedar almacenado.',
    icon: 'package',
  },
  {
    id: 'sort-recycling',
    kind: 'recycling',
    title: 'Separa para reciclar',
    description: 'Limpia, seca y separa correctamente un residuo reciclable.',
    guidance: 'Revisa las reglas del punto limpio antes de llevar el material.',
    icon: 'recycle',
  },
  {
    id: 'special-waste',
    kind: 'recycling',
    title: 'Gestiona un residuo especial',
    description: 'Prepara pilas o electrónicos para entregarlos en un punto autorizado.',
    guidance: 'No los mezcles con residuos domiciliarios ni los abras o manipules.',
    icon: 'battery',
  },
];
