import type { AppState, RecyclingAction } from '@/domain/types';
import { calculateActionImpact } from '@/domain/rules';

const now = new Date();
const isoAgo = (days: number, hours = 0) => new Date(now.getTime() - (days * 24 + hours) * 3_600_000).toISOString();
const isoAhead = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();

const categories: AppState['categories'] = [
  { id: 'plastic', name: 'Plástico PET y otros', shortName: 'Plástico', icon: 'bottle', color: '#2A7DE1', pointsPerUnit: 10, estimatedKgPerUnit: 0.035, estimatedCo2KgPerUnit: 0.08, guidance: 'Revisa el número del plástico. PET 1 y HDPE 2 suelen tener mejor recepción.', preparation: 'Vacía, enjuaga y aplasta. Separa tapa y etiqueta cuando el punto limpio lo indique.' },
  { id: 'glass', name: 'Vidrio', shortName: 'Vidrio', icon: 'glass', color: '#25A67A', pointsPerUnit: 12, estimatedKgPerUnit: 0.3, estimatedCo2KgPerUnit: 0.11, guidance: 'Botellas y frascos suelen recibirse; loza, espejos y ampolletas requieren manejo distinto.', preparation: 'Vacía y enjuaga. Retira tapas; no es necesario quitar etiquetas si el gestor no lo pide.' },
  { id: 'metal', name: 'Aluminio y metal', shortName: 'Metal', icon: 'can', color: '#E09B2D', pointsPerUnit: 14, estimatedKgPerUnit: 0.018, estimatedCo2KgPerUnit: 0.17, guidance: 'Latas de bebida y conserva limpias son ampliamente valorizables.', preparation: 'Vacía, enjuaga y aplasta con cuidado. Evita bordes cortantes.' },
  { id: 'paper', name: 'Papel', shortName: 'Papel', icon: 'paper', color: '#8F78C6', pointsPerUnit: 6, estimatedKgPerUnit: 0.02, estimatedCo2KgPerUnit: 0.03, guidance: 'Papel limpio y seco sí; papel térmico, plastificado o con grasa normalmente no.', preparation: 'Mantén seco y retira clips grandes o envoltorios plásticos.' },
  { id: 'cardboard', name: 'Cartón', shortName: 'Cartón', icon: 'box', color: '#B87842', pointsPerUnit: 10, estimatedKgPerUnit: 0.16, estimatedCo2KgPerUnit: 0.12, guidance: 'El cartón limpio y seco puede reciclarse. El cartón con grasa no suele aceptarse.', preparation: 'Desarma y aplana las cajas para ahorrar espacio.' },
  { id: 'carton', name: 'Envases tipo Tetra Pak', shortName: 'Tetra Pak', icon: 'carton', color: '#EF6F61', pointsPerUnit: 12, estimatedKgPerUnit: 0.032, estimatedCo2KgPerUnit: 0.06, guidance: 'Su recepción depende del punto limpio; confirma la señalética local.', preparation: 'Abre, enjuaga, seca y aplana. Conserva la tapa sólo si el gestor la acepta.' },
  { id: 'electronics', name: 'Electrónicos', shortName: 'Electrónicos', icon: 'cpu', color: '#50667D', pointsPerUnit: 60, estimatedKgPerUnit: 0.45, estimatedCo2KgPerUnit: 0.7, guidance: 'Los RAEE requieren gestores o campañas autorizadas; no van al reciclaje domiciliario común.', preparation: 'Borra datos personales y entrega el equipo completo en un punto especializado.', specialHandling: true },
  { id: 'batteries', name: 'Pilas y baterías', shortName: 'Pilas', icon: 'battery', color: '#D55064', pointsPerUnit: 20, estimatedKgPerUnit: 0.024, estimatedCo2KgPerUnit: 0.04, guidance: 'Residuo de manejo especial. No lo deposites con basura ni reciclaje común.', preparation: 'Aísla terminales si corresponde y llévalas a un contenedor específico.', specialHandling: true },
  { id: 'other', name: 'Otro material reciclable', shortName: 'Otro', icon: 'recycle', color: '#6E7E8E', pointsPerUnit: 8, estimatedKgPerUnit: 0.08, estimatedCo2KgPerUnit: 0.05, guidance: 'Confirma que el punto de recepción acepte este material.', preparation: 'Entrégalo limpio, seco y separado por material.' },
];

function action(id: string, userId: string, communityId: string, categoryId: string, quantity: number, days: number, hours = 0): RecyclingAction {
  const category = categories.find((item) => item.id === categoryId)!;
  const impact = calculateActionImpact(category, quantity);
  const recordedAt = isoAgo(days, hours);
  return { id, userId, communityId, categoryId, quantity, ...impact, source: 'manual', recordedAt, updatedAt: recordedAt };
}

export function createSeedState(): AppState {
  return {
    version: 3,
    organization: { id: 'org-puc', name: 'Pontificia Universidad Católica de Chile', shortName: 'UC Chile', countryCode: 'CL', timezone: 'America/Santiago' },
    currentUserId: 'user-martina',
    profiles: [
      { id: 'user-martina', username: 'martina.r', displayName: 'Martina Rojas', initials: 'MR', avatarColor: '#FF6B4A', bio: 'Ingeniería, movilidad y economía circular.', affiliation: 'Ingeniería UC', campus: 'San Joaquín', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(92) },
      { id: 'user-tomas', username: 'tomas.v', displayName: 'Tomás Vidal', initials: 'TV', avatarColor: '#2A7DE1', affiliation: 'College UC', campus: 'San Joaquín', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(180) },
      { id: 'user-sofia', username: 'sofia.m', displayName: 'Sofía Muñoz', initials: 'SM', avatarColor: '#25A67A', affiliation: 'Arquitectura UC', campus: 'Lo Contador', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(148) },
      { id: 'user-benjamin', username: 'benja.c', displayName: 'Benjamín Castro', initials: 'BC', avatarColor: '#8F78C6', affiliation: 'Derecho UC', campus: 'Casa Central', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(140) },
      { id: 'user-valentina', username: 'vale.s', displayName: 'Valentina Soto', initials: 'VS', avatarColor: '#D55064', affiliation: 'Medicina UC', campus: 'Casa Central', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(126) },
      { id: 'user-diego', username: 'diego.a', displayName: 'Diego Araya', initials: 'DA', avatarColor: '#E09B2D', affiliation: 'Ingeniería UC', campus: 'San Joaquín', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(110) },
      { id: 'user-antonia', username: 'anto.g', displayName: 'Antonia González', initials: 'AG', avatarColor: '#EF6F61', affiliation: 'Diseño UC', campus: 'Lo Contador', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(105) },
      { id: 'user-nicolas', username: 'nico.p', displayName: 'Nicolás Pérez', initials: 'NP', avatarColor: '#50667D', affiliation: 'Ciencias Biológicas UC', campus: 'Casa Central', isVerifiedUc: true, profileVisibility: 'authenticated', createdAt: isoAgo(99) },
    ],
    communities: [
      { id: 'com-ingenieria', organizationId: 'org-puc', name: 'Ingeniería', slug: 'ingenieria', description: 'La comunidad de Ingeniería UC transformando datos, proyectos y hábitos en impacto real.', visibility: 'public', accent: '#F5B82E', initials: 'ING', creatorId: 'user-diego', memberCountBaseline: 482, pointsBaseline: { week: 4210, month: 14860, all: 48240 }, itemsBaseline: 2840, estimatedKgBaseline: 531.8, tags: ['Facultad', 'San Joaquín'], createdAt: isoAgo(220) },
      { id: 'com-sanjoaquin', organizationId: 'org-puc', name: 'Campus San Joaquín', slug: 'campus-san-joaquin', description: 'Todos los rincones de San Joaquín compitiendo por un campus más circular.', visibility: 'public', accent: '#25C8A0', initials: 'SJ', creatorId: 'user-tomas', memberCountBaseline: 824, pointsBaseline: { week: 4875, month: 16720, all: 52600 }, itemsBaseline: 3412, estimatedKgBaseline: 694.2, tags: ['Campus', 'Abierta'], createdAt: isoAgo(260) },
      { id: 'com-college', organizationId: 'org-puc', name: 'College UC', slug: 'college-uc', description: 'Cruzar disciplinas también sirve para cerrar el ciclo de los materiales.', visibility: 'public', accent: '#2A7DE1', initials: 'C', creatorId: 'user-tomas', memberCountBaseline: 316, pointsBaseline: { week: 3560, month: 12330, all: 39140 }, itemsBaseline: 2110, estimatedKgBaseline: 418.4, tags: ['Facultad', 'San Joaquín'], createdAt: isoAgo(190) },
      { id: 'com-derecho', organizationId: 'org-puc', name: 'Derecho UC', slug: 'derecho-uc', description: 'Comunidad de Casa Central por una cultura de residuos responsable.', visibility: 'public', accent: '#8F78C6', initials: 'D', creatorId: 'user-benjamin', memberCountBaseline: 272, pointsBaseline: { week: 2930, month: 10980, all: 34400 }, itemsBaseline: 1870, estimatedKgBaseline: 365.1, tags: ['Facultad', 'Casa Central'], createdAt: isoAgo(184) },
      { id: 'com-arquitectura', organizationId: 'org-puc', name: 'Arquitectura', slug: 'arquitectura', description: 'Diseñamos espacios; también una forma distinta de relacionarnos con los residuos.', visibility: 'public', accent: '#EF6F61', initials: 'ARQ', creatorId: 'user-sofia', memberCountBaseline: 238, pointsBaseline: { week: 3890, month: 13610, all: 40770 }, itemsBaseline: 2260, estimatedKgBaseline: 489.9, tags: ['Facultad', 'Lo Contador'], createdAt: isoAgo(202) },
      { id: 'com-ciclistas', organizationId: 'org-puc', name: 'Ciclistas UC', slug: 'ciclistas-uc', description: 'Amistades, pedales y reciclaje. Grupo abierto a todos los campus.', visibility: 'public', accent: '#FF6B4A', initials: 'CU', creatorId: 'user-antonia', memberCountBaseline: 94, pointsBaseline: { week: 2610, month: 8190, all: 18520 }, itemsBaseline: 940, estimatedKgBaseline: 188.5, tags: ['Club', 'Intercampus'], createdAt: isoAgo(95) },
      { id: 'com-los-del-302', organizationId: 'org-puc', name: 'Los del 302', slug: 'los-del-302', description: 'El grupo de amigos que decidió convertir la competencia en costumbre.', visibility: 'private', accent: '#D55064', initials: '302', creatorId: 'user-martina', memberCountBaseline: 4, pointsBaseline: { week: 980, month: 2640, all: 6750 }, itemsBaseline: 418, estimatedKgBaseline: 79.4, tags: ['Amistades', 'Privada'], createdAt: isoAgo(60) },
    ],
    memberships: [
      { id: 'm1', communityId: 'com-ingenieria', userId: 'user-martina', role: 'member', joinedAt: isoAgo(82) },
      { id: 'm2', communityId: 'com-sanjoaquin', userId: 'user-martina', role: 'member', joinedAt: isoAgo(75) },
      { id: 'm3', communityId: 'com-los-del-302', userId: 'user-martina', role: 'owner', joinedAt: isoAgo(60) },
      { id: 'm4', communityId: 'com-ingenieria', userId: 'user-diego', role: 'owner', joinedAt: isoAgo(220) },
      { id: 'm5', communityId: 'com-ingenieria', userId: 'user-tomas', role: 'member', joinedAt: isoAgo(110) },
      { id: 'm6', communityId: 'com-ingenieria', userId: 'user-sofia', role: 'member', joinedAt: isoAgo(72) },
      { id: 'm7', communityId: 'com-ingenieria', userId: 'user-valentina', role: 'member', joinedAt: isoAgo(65) },
      { id: 'm8', communityId: 'com-ingenieria', userId: 'user-benjamin', role: 'member', joinedAt: isoAgo(58) },
      { id: 'm9', communityId: 'com-sanjoaquin', userId: 'user-tomas', role: 'owner', joinedAt: isoAgo(260) },
      { id: 'm10', communityId: 'com-sanjoaquin', userId: 'user-diego', role: 'member', joinedAt: isoAgo(170) },
      { id: 'm11', communityId: 'com-college', userId: 'user-tomas', role: 'owner', joinedAt: isoAgo(190) },
      { id: 'm12', communityId: 'com-derecho', userId: 'user-benjamin', role: 'owner', joinedAt: isoAgo(184) },
      { id: 'm13', communityId: 'com-arquitectura', userId: 'user-sofia', role: 'owner', joinedAt: isoAgo(202) },
      { id: 'm14', communityId: 'com-ciclistas', userId: 'user-antonia', role: 'owner', joinedAt: isoAgo(95) },
      { id: 'm15', communityId: 'com-los-del-302', userId: 'user-diego', role: 'member', joinedAt: isoAgo(59) },
      { id: 'm16', communityId: 'com-los-del-302', userId: 'user-antonia', role: 'member', joinedAt: isoAgo(58) },
    ],
    categories,
    actions: [
      action('a1', 'user-martina', 'com-ingenieria', 'metal', 3, 0, 1),
      action('a2', 'user-martina', 'com-sanjoaquin', 'plastic', 4, 1, 2),
      action('a3', 'user-martina', 'com-los-del-302', 'cardboard', 2, 2, 1),
      action('a4', 'user-martina', 'com-ingenieria', 'glass', 3, 3, 2),
      action('a5', 'user-tomas', 'com-ingenieria', 'plastic', 6, 0, 2),
      action('a6', 'user-sofia', 'com-arquitectura', 'cardboard', 5, 0, 4),
      action('a7', 'user-diego', 'com-ingenieria', 'metal', 8, 1, 3),
      action('a8', 'user-valentina', 'com-ingenieria', 'glass', 4, 1, 6),
      action('a9', 'user-benjamin', 'com-derecho', 'paper', 9, 2, 4),
      action('a10', 'user-antonia', 'com-ciclistas', 'plastic', 7, 2, 7),
      action('a11', 'user-nicolas', 'com-sanjoaquin', 'electronics', 1, 3, 3),
      action('a12', 'user-tomas', 'com-college', 'carton', 6, 4, 2),
    ],
    missions: [
      { id: 'mission-bottles', organizationId: 'org-puc', title: 'Misión PUC: 10.000 Botellas', shortTitle: '10.000 Botellas', description: 'Entre toda la comunidad UC, reciclemos 10.000 botellas PET durante este mes.', metric: 'category_items', categoryId: 'plastic', target: 10_000, progressBaseline: 6_127, unitLabel: 'botellas', startAt: isoAgo(14), endAt: isoAhead(17), reward: 'Badge Misión PUC + hito colectivo para todos los campus', artwork: 'bottles', status: 'active', participatingCommunitiesBaseline: 23 },
      { id: 'mission-clean-week', organizationId: 'org-puc', title: 'Semana UC Sin Basura', shortTitle: 'Semana Sin Basura', description: 'Registremos 5.000 acciones de reciclaje entre todos los campus.', metric: 'actions', target: 5_000, progressBaseline: 5_000, unitLabel: 'acciones', startAt: isoAgo(48), endAt: isoAgo(41), reward: 'Hito colectivo completado', artwork: 'clean-week', status: 'completed', participatingCommunitiesBaseline: 31 },
    ],
    challenges: [
      { id: 'challenge-ing', communityId: 'com-ingenieria', title: 'Ingeniería Recicla', description: 'Sumemos 5.000 puntos esta semana.', metric: 'points', target: 5_000, progressBaseline: 4_132, unitLabel: 'puntos', startAt: isoAgo(5), endAt: isoAhead(2), reward: 'Badge Impulso Colectivo', status: 'active' },
      { id: 'challenge-sj', communityId: 'com-sanjoaquin', title: 'PET en San Joaquín', description: 'Reciclemos 750 botellas antes del domingo.', metric: 'category_items', categoryId: 'plastic', target: 750, progressBaseline: 582, unitLabel: 'botellas', startAt: isoAgo(5), endAt: isoAhead(2), status: 'active' },
      { id: 'challenge-302', communityId: 'com-los-del-302', title: 'Cada día cuenta', description: 'Que al menos 4 personas del grupo reciclen esta semana.', metric: 'participants', target: 4, progressBaseline: 2, unitLabel: 'personas', startAt: isoAgo(5), endAt: isoAhead(2), status: 'active' },
    ],
    feed: [
      { id: 'f1', type: 'recycling_recorded', actorId: 'user-tomas', communityId: 'com-ingenieria', recyclingActionId: 'a5', title: 'Tomás recicló 6 botellas', detail: 'Aportó a Ingeniería', points: 60, createdAt: isoAgo(0, 2) },
      { id: 'f2', type: 'ranking_milestone', communityId: 'com-arquitectura', title: 'Arquitectura subió al podio', detail: 'Ahora está #3 entre las comunidades UC esta semana.', createdAt: isoAgo(0, 5) },
      { id: 'f3', type: 'badge_earned', actorId: 'user-sofia', title: 'Sofía obtuvo “7 días seguidos”', detail: 'Una semana convirtiendo intención en hábito.', createdAt: isoAgo(1, 1) },
      { id: 'f4', type: 'recycling_recorded', actorId: 'user-diego', communityId: 'com-ingenieria', recyclingActionId: 'a7', title: 'Diego recicló 8 latas', detail: 'Ingeniería quedó a menos de 800 puntos de su desafío.', points: 112, createdAt: isoAgo(1, 3) },
      { id: 'f5', type: 'community_joined', actorId: 'user-antonia', communityId: 'com-ciclistas', title: 'Antonia se unió a Ciclistas UC', detail: 'La comunidad ya reúne a 95 personas.', createdAt: isoAgo(2, 2) },
    ],
    badges: [
      { id: 'badge-first', name: 'Primer Reciclaje', description: 'El primer aporte que pone todo en movimiento.', icon: 'spark', color: '#FF6B4A' },
      { id: 'badge-streak-7', name: '7 días seguidos', description: 'Una semana completa reciclando con intención.', icon: 'flame', color: '#F5B82E' },
      { id: 'badge-founder', name: 'Comunidad en marcha', description: 'Creaste una comunidad para multiplicar el impacto.', icon: 'users', color: '#25C8A0' },
      { id: 'badge-top10', name: 'Top 10 del equipo', description: 'Entraste al Top 10 de una de tus comunidades.', icon: 'trophy', color: '#8F78C6' },
      { id: 'badge-bottles', name: 'Circuito PET', description: 'Reciclaste 50 botellas PET.', icon: 'bottle', color: '#2A7DE1' },
      { id: 'badge-mission', name: 'Misión PUC', description: 'Contribuiste a una misión colectiva completada.', icon: 'medal', color: '#D55064' },
    ],
    userBadges: [
      { id: 'ub1', userId: 'user-martina', badgeId: 'badge-first', earnedAt: isoAgo(90) },
      { id: 'ub2', userId: 'user-martina', badgeId: 'badge-founder', earnedAt: isoAgo(60) },
      { id: 'ub3', userId: 'user-martina', badgeId: 'badge-top10', earnedAt: isoAgo(8) },
    ],
    follows: [
      { followerId: 'user-martina', followedId: 'user-tomas', createdAt: isoAgo(55) },
      { followerId: 'user-martina', followedId: 'user-sofia', createdAt: isoAgo(44) },
      { followerId: 'user-tomas', followedId: 'user-martina', createdAt: isoAgo(32) },
      { followerId: 'user-diego', followedId: 'user-martina', createdAt: isoAgo(23) },
    ],
    lastCommunityId: 'com-ingenieria',
  };
}
