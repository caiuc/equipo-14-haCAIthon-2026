# Progreso vivo — Retorna

> **Obligatorio:** todo agente que cambie el repositorio debe actualizar este archivo en el mismo cambio. Ver [`../AGENTS.md`](../AGENTS.md).

Última actualización: **2026-08-14 15:11 America/Santiago — Codex**

## Resumen ejecutivo

El repositorio partió sólo con las bases del hackathon. La entrega actual deja un setup Expo universal verificable, gobernanza obligatoria para agentes y trabajo separado por tracks. La aplicación funcional completa **no está terminada**; las features iniciadas quedan marcadas `PARCIAL` y libres para el siguiente agente.

## Trabajo activo

| Tarea | Owner | Rama | Lease hasta | Write set |
| --- | --- | --- | --- | --- |
| RTN-501 | Codex | `feat/RTN-501-lime-visual-refresh` | 2026-08-15T03:26:14Z | Tokens, componentes, navegación y pantallas de creación; ver [`claims/RTN-501.md`](claims/RTN-501.md) |

## Completado

- Análisis y plan de producto/técnico inicial.
- Selección documentada de Expo universal + Supabase Auth/Postgres.
- Estructura base `app/` y `src/`.
- Primer borrador de tipos y reglas puras de dominio.
- Fixtures realistas en español de Chile.
- Primer borrador de tokens, temas, logo SVG y componentes base.
- Auth propia Supabase, perfil y organizaciones implementados en código.
- Primer borrador de shell responsive.
- Primer borrador visual de onboarding, Home y Comunidades.
- Gobernanza multiagente: `AGENTS.md` y documentación `/docs`.
- Backlog separado por tracks, IDs y dependencias.
- Dependencias alineadas con Expo SDK 57 y `package-lock.json` generado.
- Assets PNG de app/PWA derivados del SVG fuente.
- Rutas explícitas para las capacidades pendientes, evitando navegación a páginas inexistentes.
- TypeScript, lint, 5 tests de dominio y export web verificados.
- README y `CONTRIBUTING.md` preparados para onboarding del repositorio.
- Rama de integración `develop` y rama `chore/RTN-001-initial-setup` publicadas.
- Setup inicial fusionado en `develop`: `https://github.com/caiuc/equipo-14-haCAIthon-2026/pull/1`.
- Protocolo de task leases: plan remoto, write set, heartbeat, expiración, takeover y liberación documentados en [`claims/README.md`](claims/README.md).

“Completado” aquí significa que el artefacto fue escrito; las capacidades marcadas `EN CURSO` en `TASKS.md` aún requieren aceptación/verificación antes de considerarse listas.

## En curso

| ID | Trabajo | Estado real |
| --- | --- | --- |
| RTN-101–106 | Auth/datos/organizaciones | Código listo: Supabase Auth, perfiles, organizaciones, membresías, solicitudes, roles y UI. Falta levantar Supabase local y recorrer el flujo completo |
| RTN-201–203 | Comunidades | UI/fixtures parciales; backend, errores y aceptación pendientes |
| RTN-301/306/401 | Dominio | Reglas iniciales y 5 tests base; cobertura crítica todavía incompleta |
| RTN-501/502 | Diseño/nav | Componentes iniciales; revisión web/Android pendiente |
| RTN-601–604 | Misiones/social/gamificación | Modelos/UI iniciales; backend y pruebas pendientes |
| RTN-802 | PWA | Manifest, assets y export listos; service worker/Lighthouse pendientes |

## No iniciado

- Migraciones de reciclaje, comunidades y resto del dominio fuera de usuarios/organizaciones.
- Prueba integrada de la migración/RLS de usuarios y organizaciones.
- Flujo manual de reciclaje completo.
- Pantallas completas de ranking, actividad, misión, settings y sharing.
- Exportación PNG.
- Scanner barcode y proveedor Open Food Facts.
- CI y suite completa de tests.
- Deploy web o build Android.

## Bloqueos y riesgos conocidos

1. El resultado previo de `npm audit --omit=dev` quedó obsoleto tras retirar Clerk; RTN-006 debe repetir el triage sin usar `--force`.
2. Supabase Auth, migración y seed quedaron implementados pero no se ejecutaron contra una instancia local en esta intervención. Auth y organizaciones no ofrecen fallback demo intencionalmente.
3. Las rutas pendientes existen como placeholders intencionales, pero sus capacidades aún no están implementadas.
4. Los totales base en fixtures sirven para demo visual; no representan el ledger productivo futuro.
5. No hubo verificación visual en Android ni auditoría de accesibilidad/Lighthouse.

## Próximo paso recomendado

Para cerrar RTN-101–106, levantar Supabase, ejecutar `supabase db reset`, copiar URL/key a `.env` y recorrer registro → organizaciones → solicitud/aprobación. Mantener esa validación breve y orientada al showcase.

## Verificación del setup

Ejecutado el 2026-08-14:

| Comando | Resultado |
| --- | --- |
| `npm install` | OK; 1.130 paquetes auditados y lockfile generado |
| `npx expo install --check` | OK; dependencias compatibles con Expo SDK 57 |
| `npm run typecheck` | OK |
| `npm run lint` | OK, sin warnings |
| `npm test` | OK; 5/5 tests |
| `npm run web:export` | OK; 17 rutas estáticas exportadas a `dist/` |
| `CI=1 npx expo start --web --port 8089` + `curl` | OK; servidor Metro respondió HTML en `/` |
| `git diff --check` | OK |
| `npm run typecheck` (RTN-101–106) | OK |
| `npm run lint` (RTN-101–106) | OK, sin warnings |
| `npm test` (RTN-101–106) | OK; 5/5 tests existentes |

## Registro de cambios de agentes

| Fecha | Agente | Tareas | Cambio | Verificación |
| --- | --- | --- | --- | --- |
| 2026-08-14 | Codex | RTN-001, 004, 101, 201–203, 301, 306, 401, 501–502, 601–604, 802 | Inició arquitectura y scaffold visual/dominio antes de que el alcance se redujera | No verificado; instalación falló por timeout |
| 2026-08-14 | Codex | RTN-002 | Agregó reglas obligatorias, Gitflow, Conventional Commits, backlog y tracking | Pendiente revisión final de enlaces |
| 2026-08-14 | Codex | RTN-001, 002, 004, 005, 801, 802 | Estabilizó dependencias/assets/rutas, agregó tests y cerró setup/documentación | Expo check, typecheck, lint, 5 tests, export web y diff-check OK |
| 2026-08-14 | Codex | RTN-007 | Publicó `develop`, 4 commits convencionales y draft PR #1 desde `chore/RTN-001-initial-setup` | Push remoto y PR contra `develop` confirmados |
| 2026-08-14 | Codex | RTN-101–106 | Retiró Clerk; agregó Supabase Auth, perfil real, organizaciones, membresías, solicitudes, roles, migración, seed y UI | Typecheck, lint, 5 tests y diff-check OK; Supabase local no ejecutado; sin verificación web adicional por indicación del usuario |
| 2026-08-14 | Codex | RTN-008 | Publicó el plan en PR #2 y completó el protocolo de claims en PR #3 tras un merge temprano del plan | Enlaces Markdown locales y `git diff --check` OK; claim liberado |
