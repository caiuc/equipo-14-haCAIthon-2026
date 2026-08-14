# Arquitectura

## Estado

Este documento describe la arquitectura objetivo. El estado implementado y verificable vive en [`PROGRESS.md`](PROGRESS.md); no se debe asumir que toda sección aquí ya existe.

## Cliente universal

- TypeScript estricto.
- React Native + Expo SDK 57.
- Expo Router para Android y web.
- React Native Web para compartir UI y lógica.
- TanStack Query para estado remoto; Context/reducer sólo para preferencias y modo demo.
- Zod para validación de fronteras y reglas puras en `src/domain`.

Estructura inicial:

```text
app/                    rutas Expo Router
src/auth/               adaptación Clerk / demo
src/data/               datos, repositorios y fixtures
src/design/             tokens y componentes base
src/domain/             tipos y reglas sin React
src/features/           componentes por capacidad
src/navigation/         shell responsive
src/services/           integraciones externas futuras
supabase/               migraciones, seed y funciones SQL
docs/                   gobernanza y arquitectura
```

## Backend objetivo

- Supabase Postgres como fuente de verdad relacional.
- Clerk como proveedor de identidad externo.
- RLS para lecturas/escrituras directas permitidas.
- Funciones RPC transaccionales para registrar, editar y eliminar reciclajes.
- Storage para avatares, comunidades y arte de misiones.
- Realtime sólo donde mejora rankings/feed sin complejidad excesiva.

El cliente nunca envía un puntaje confiable. Envía categoría, cantidad y comunidad; Postgres calcula y registra:

```text
recycling_action
  ├── user_points_ledger
  ├── community_points_ledger
  ├── mission/challenge contribution
  ├── activity_feed_event
  └── audit/abuse signal
```

## Autenticación

- Clerk maneja email, Google y sesión persistente.
- `profiles` mantiene identidad de producto separada del usuario Clerk.
- Supabase valida JWT de Clerk mediante Third-Party Auth.
- El modo demo existe para desarrollo y feria; no reemplaza autorización productiva.

## Datos y consistencia

- Una acción de reciclaje referencia exactamente una comunidad.
- Los puntos personales y comunitarios usan ledgers independientes y auditables.
- Totales y rankings se derivan del ledger; caches/snapshots son optimizaciones reconstruibles.
- Semana comienza lunes en `America/Santiago`; mes usa calendario chileno.
- Editar/eliminar una acción revierte y vuelve a aplicar sus efectos dentro de una transacción.

## Límites entre tracks

- `src/domain`: contratos compartidos; cambios requieren revisión de tracks frontend y backend.
- `supabase/migrations`: un solo owner activo para evitar migraciones divergentes.
- `src/design`: UI base; features consumen componentes sin duplicar tokens.
- `app`: composición de rutas; la lógica de negocio no debe vivir aquí.

## Setup local esperado

```bash
npm install
cp .env.example .env
npm run web
```

Sin credenciales y con `EXPO_PUBLIC_DEMO_MODE=true`, la app debe usar fixtures locales. El modo productivo requerirá Clerk y Supabase configurados.
