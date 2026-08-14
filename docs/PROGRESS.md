# Progreso vivo — Retorna

> **Obligatorio:** todo agente que cambie el repositorio debe actualizar este archivo en el mismo cambio. Ver [`../AGENTS.md`](../AGENTS.md).

Última actualización: **2026-08-14 17:04 America/Santiago — Codex**

## Resumen ejecutivo

El repositorio partió sólo con las bases del hackathon. La entrega actual deja un setup Expo universal verificable, gobernanza obligatoria para agentes y trabajo separado por tracks. La aplicación funcional completa **no está terminada**; las features iniciadas quedan marcadas `PARCIAL` y libres para el siguiente agente.

## Trabajo activo

No hay claims activos. Antes de implementar una tarea, reservarla mediante el protocolo de [`claims/README.md`](claims/README.md).

## Completado

- Análisis y plan de producto/técnico inicial.
- Selección documentada de Expo universal + Supabase Auth/Postgres.
- Estructura base `app/` y `src/`.
- Primer borrador de tipos y reglas puras de dominio.
- Fixtures realistas en español de Chile.
- Primer borrador de tokens, temas, logo SVG y componentes base.
- Auth propia Supabase, perfil y organizaciones implementados en código.
- Identidad visual unificada en verde lima sobre blanco/negro puros: tokens light/dark, componentes, formularios y navegación de reciclaje.
- Home simplificado a feed vertical, con “Registrar reciclaje” como primer CTA dominante.
- Lenguaje visual angular: logo transparente, tarjetas/controles sin radios ni sombras, auth escalonado y acceso demo local con Martina.
- Logo Retorna ampliado y frase “El cambio empieza contigo” agregada sobre Tú→Planeta en login/registro.
- Control inerte de notificaciones retirado del encabezado de Inicio.
- Landing de acceso liberada de su marco exterior y ampliada con contenido vertical sobre registro, comunidades, desafíos y progreso.
- Hero y formulario de acceso integrados sobre la fotografía de campus entregada, a ancho completo y con overlay oscuro de alto contraste.
- Navegación iniciada simplificada: sidebar sin Ranking, logo enlazado a Inicio y Home sin Configuración ni CTA de exportación semanal.
- `origin/develop` reintegrado en la branch visual; conflicto documental resuelto conservando tanto RTN-509–511 como RTN-802/803.
- Último `origin/develop` reintegrado de urgencia; conflicto de progreso resuelto conservando las evidencias de RTN-512/513 y RTN-302/701/702/703.
- Hero de acceso reproducido sobre video local en loop automático, silencioso y sin controles; superficies fuertes blancas con bordes en light mode y negras en dark mode.
- Autoplay del hero reafirmado al recibir el primer frame para Firefox, donde la llamada inicial ocurría antes del montaje del elemento de video.
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
- Proyecto Supabase remoto `retorna` creado (`bhjplveltcqocbhfmbhn`, sa-east-1) y migración de usuarios/organizaciones aplicada; trigger `handle_new_user` verificado con una inserción SQL directa.
- Fix de SSR en `src/data/supabase.ts` (el export estático fallaba con `window is not defined` al pre-renderizar rutas en Node) y `public/vercel.json` con `cleanUrls`/rewrites para que las rutas dinámicas no devuelvan 404 en Vercel.
- Deploy de producción publicado en Vercel: `https://dist-five-pearl-95.vercel.app` (proyecto `retorna`, cuenta personal `benjamintaito-7391`).
- PWA instalable/offline: `app/+html.tsx` inyecta manifest, `theme-color` e íconos; `public/sw.js` cachea el app shell y sirve `offline.html` sin red; verificado sirviendo `dist/` y con Lighthouse (performance/accesibilidad/best-practices).
- `app.json` corregido contra el esquema Expo SDK 57 (`newArchEnabled`, `splash` top-level y `android.edgeToEdgeEnabled` retirados; `android.versionCode` agregado) y `eas.json` con `cli.appVersionSource` para builds reproducibles; `expo-doctor` 21/21.

“Completado” aquí significa que el artefacto fue escrito; las capacidades marcadas `EN CURSO` en `TASKS.md` aún requieren aceptación/verificación antes de considerarse listas.

## En curso

| ID | Trabajo | Estado real |
| --- | --- | --- |
| RTN-101–106 | Auth/datos/organizaciones | Código listo: Supabase Auth, perfiles, organizaciones, membresías, solicitudes, roles y UI. Falta levantar Supabase local y recorrer el flujo completo |
| RTN-302/701/702/703 | Reciclaje y barcode | PR #4/local en revisión: scanner/manual, lookup local/Open Food Facts, confirmación contra store demo y bypass de preview sin cuenta implementados; falta prueba manual cámara real/Android |
| RTN-201–203 | Comunidades | UI/fixtures parciales; backend, errores y aceptación pendientes |
| RTN-301/306/401 | Dominio | Reglas iniciales y 5 tests base; cobertura crítica todavía incompleta |
| RTN-502/504 | Navegación/accesibilidad | Shell funcional e icono de reciclaje actualizado; revisión visual web/Android y auditoría integral pendientes |
| RTN-601–604 | Misiones/social/gamificación | Modelos/UI iniciales; backend y pruebas pendientes |
| RTN-803 | EAS web + Android | Config reproducible (`app.json`/`eas.json`) lista; falta proyecto EAS real y ejecutar `eas build --platform android` |

## No iniciado

- Migraciones de reciclaje, comunidades y resto del dominio fuera de usuarios/organizaciones.
- Prueba integrada de la migración/RLS de usuarios y organizaciones.
- Verificación manual de cámara real en Android y navegador para PR #4.
- Pantallas completas de ranking, actividad, misión, settings y sharing.
- Exportación PNG.
- CI y suite completa de tests.
- Deploy web (hosting real) y build Android en la nube (falta proyecto EAS y `eas build`); preview web y config reproducible ya verificados localmente.

## Bloqueos y riesgos conocidos

1. El resultado previo de `npm audit --omit=dev` quedó obsoleto tras retirar Clerk; RTN-006 debe repetir el triage sin usar `--force`.
2. Supabase Auth, migración y seed SQL quedaron implementados pero no se ejecutaron contra una instancia local. El acceso general sí ofrece modo demo con fixtures; operaciones reales de organizaciones todavía requieren Supabase.
3. Las rutas pendientes existen como placeholders intencionales, pero sus capacidades aún no están implementadas.
4. Los totales base en fixtures sirven para demo visual; no representan el ledger productivo futuro.
5. No hubo verificación visual en Android ni auditoría de accesibilidad/Lighthouse.
6. El proyecto Supabase Cloud exige confirmación de correo por defecto (a diferencia de `supabase/config.toml`, que sólo aplica a `supabase start` local); no hay herramienta MCP para cambiar la config de Auth. Falta desactivar manualmente "Confirm email" en `https://supabase.com/dashboard/project/bhjplveltcqocbhfmbhn/auth/providers` antes de que el registro real funcione end-to-end en producción.
5. No hubo verificación visual en Android (sin SDK/emulador en este entorno) ni auditoría de accesibilidad dedicada (RTN-504 sigue pendiente).
6. No hay proyecto EAS real conectado (`extra.eas.projectId` es placeholder) ni cuenta Expo autenticada con permiso de build; `eas build --platform android` no se ejecutó. Acción concreta: crear el proyecto EAS con el usuario/organización real (`eas init`) y correr `eas build --platform android --profile preview`.
7. Lighthouse CLI ≥10 ya no incluye la categoría PWA (instalabilidad/service worker se movieron a Chrome DevTools). Se corrió Lighthouse (`performance` 0.53, `accessibility` 0.95, `best-practices` 1.0 sobre `dist/` servido localmente) y se verificó instalabilidad a mano: manifest enlazado, íconos 192/512, `theme-color`, `display: standalone` y service worker registrado y sirviendo `offline.html` sin red.

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
| `npm run typecheck` (RTN-501) | OK |
| `npm run lint` (RTN-501) | OK, sin warnings |
| `npm test` (RTN-501) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-501) | OK |
| Cálculo de contraste (RTN-501) | OK; 6.69:1 o superior en combinaciones principales |
| `npm run typecheck` (RTN-505) | OK |
| `npm run lint` (RTN-505) | OK, sin warnings |
| `npm test` (RTN-505) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-505) | OK |
| `npm run typecheck` (RTN-506) | OK |
| `npm run lint` (RTN-506) | OK, sin warnings |
| `npm test` (RTN-506) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-506) | OK |
| `npm run typecheck` (RTN-507) | OK |
| `npm run lint` (RTN-507) | OK, sin warnings |
| `git diff --check` (RTN-507) | OK |
| `npm run typecheck` (RTN-508) | OK |
| `npm run lint` (RTN-508) | OK, sin warnings |
| `git diff --check` (RTN-508) | OK |
| `npm run typecheck` (RTN-509) | OK |
| `npm run lint` (RTN-509) | OK, sin warnings |
| `npm test` (RTN-509) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-509) | OK |
| `npm run typecheck` (RTN-510) | OK |
| `npm run lint` (RTN-510) | OK, sin warnings |
| `npm test` (RTN-510) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-510) | OK |
| `npm run typecheck` (RTN-511) | OK |
| `npm run lint` (RTN-511) | OK, sin warnings |
| `npm test` (RTN-511) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-511) | OK |
| `npx expo-doctor` (RTN-802/803) | OK; 21/21 checks (antes 20/21, esquema `app.json` corregido) |
| `npm run typecheck` (RTN-802/803) | OK |
| `npm run lint` (RTN-802/803) | OK, sin warnings |
| `npm test` (RTN-802/803) | OK; 5/5 tests |
| `npm run web:export` (RTN-802/803) | OK; 19 rutas exportadas; `manifest.json`, `sw.js`, `offline.html` presentes en `dist/` |
| Servir `dist/` y verificar HTML (RTN-802/803) | OK; `<link rel="manifest">`, `<meta name="theme-color">` y registro de `/sw.js` presentes; `sw.js`/`manifest.json`/`offline.html` responden 200 |
| Lighthouse sobre `dist/` servido (RTN-802/803) | performance 0.53, accessibility 0.95, best-practices 1.0; categoría PWA no existe en Lighthouse ≥10, instalabilidad verificada a mano |
| `git diff --check` (RTN-802/803) | OK |
| Ausencia de archivos sin resolver (RTN-009) | OK; `git diff --diff-filter=U --name-only` vacío |
| `npm run typecheck` (RTN-009) | OK |
| `npm run lint` (RTN-009) | OK, sin warnings |
| `npm test` (RTN-009) | OK; 5/5 tests existentes |
| `git diff --check` (RTN-009) | OK |
| Conversión de video (RTN-512) | OK; MOV/HEVC 22 MB → MP4/H.264 1280×726, 30 fps, 15,8 s, 3,7 MB, sin audio y `faststart` |
| `npx expo install --check` (RTN-512) | OK; dependencias actualizadas |
| `npx expo-doctor` (RTN-512) | OK; 21/21 checks |
| `npm run typecheck` (RTN-512) | OK |
| `npm run lint` (RTN-512) | OK, sin warnings |
| `npm test` (RTN-512) | OK; 5/5 tests existentes |
| `npm run web:export` (RTN-512) | OK; 19 rutas y MP4 versionado de 3,7 MB presentes en `dist/` |
| `git diff --check` (RTN-512) | OK |
| `npm run typecheck` (post-merge RTN-302 + `origin/develop`) | OK |
| `npm run lint` (post-merge RTN-302 + `origin/develop`) | OK, sin warnings |
| `npm test` (post-merge RTN-302 + `origin/develop`) | OK; 10/10 tests |
| `npm run web:export` (post-merge RTN-302 + `origin/develop`) | OK; 19 rutas estáticas exportadas a `dist/` |
| `EXPO_PUBLIC_SKIP_AUTH_FOR_RECYCLE=true npm run web:export` | OK; `/recycle` exportado con bypass local |
| `curl -I http://localhost:8090/recycle.html` | OK; `200 OK` desde servidor estático local |
| Ausencia de archivos sin resolver (RTN-010) | OK; `git diff --diff-filter=U --name-only` vacío |

## Registro de cambios de agentes

| Fecha | Agente | Tareas | Cambio | Verificación |
| --- | --- | --- | --- | --- |
| 2026-08-14 | Codex | RTN-001, 004, 101, 201–203, 301, 306, 401, 501–502, 601–604, 802 | Inició arquitectura y scaffold visual/dominio antes de que el alcance se redujera | No verificado; instalación falló por timeout |
| 2026-08-14 | Codex | RTN-002 | Agregó reglas obligatorias, Gitflow, Conventional Commits, backlog y tracking | Pendiente revisión final de enlaces |
| 2026-08-14 | Codex | RTN-001, 002, 004, 005, 801, 802 | Estabilizó dependencias/assets/rutas, agregó tests y cerró setup/documentación | Expo check, typecheck, lint, 5 tests, export web y diff-check OK |
| 2026-08-14 | Codex | RTN-007 | Publicó `develop`, 4 commits convencionales y draft PR #1 desde `chore/RTN-001-initial-setup` | Push remoto y PR contra `develop` confirmados |
| 2026-08-14 | Codex | RTN-101–106 | Retiró Clerk; agregó Supabase Auth, perfil real, organizaciones, membresías, solicitudes, roles, migración, seed y UI | Typecheck, lint, 5 tests y diff-check OK; Supabase local no ejecutado; sin verificación web adicional por indicación del usuario |
| 2026-08-14 | Codex | RTN-008 | Publicó el plan en PR #2 y completó el protocolo de claims en PR #3 tras un merge temprano del plan | Enlaces Markdown locales y `git diff --check` OK; claim liberado |
| 2026-08-14 | Codex | RTN-501/502 | Unificó acentos en verde lima, superficies naturales y sombras bosque; retiró selectores multicolor y cambió el `+` central por flechas de reciclaje | Typecheck, lint, 5 tests, diff-check y contraste principal 6.69:1+ OK; revisión visual local queda a cargo del usuario |
| 2026-08-14 | Codex | RTN-505 | Eliminó placas/radios/sombras, liberó el logo, reconstruyó login y registro con escala Tú→Planeta y agregó acceso seed sin Supabase | Typecheck, lint, 5 tests y diff-check OK; revisión visual local queda a cargo del usuario |
| 2026-08-14 | Claude | RTN-806 | Creó el proyecto Supabase remoto y aplicó la migración; corrigió el SSR de `src/data/supabase.ts` y agregó `public/vercel.json`; desplegó producción en Vercel | Typecheck, lint, 5 tests, `web:export` y verificación en navegador (sin 404, sin errores de consola) OK; registro real bloqueado por confirmación de correo del proyecto Supabase Cloud, ver bloqueo 6 |
| 2026-08-14 | Codex | RTN-506 | Redujo la UI a blanco/negro/lima y convirtió Home en una columna con CTA de reciclaje primero | Typecheck, lint, 5 tests y diff-check OK; revisión visual local queda a cargo del usuario |
| 2026-08-14 | Codex | RTN-508 | Retiró campana, indicador y estilos de notificaciones de Inicio; preservó Configuración | Typecheck, lint y diff-check OK |
| 2026-08-14 | Codex | RTN-507 | Amplió el logo Retorna y agregó “El cambio empieza contigo” sobre el hero Tú→Planeta | Typecheck, lint y diff-check OK |
| 2026-08-14 | Codex | RTN-509 | Quitó el marco exterior del acceso y sumó una landing vertical responsive con explicación del flujo, capacidades y CTA demo | Typecheck, lint, 5 tests y diff-check OK; revisión visual local queda a cargo del usuario |
| 2026-08-14 | Codex | RTN-510 | Llevó la fotografía provista a todo el ancho del hero de acceso, oscureció el fondo y adaptó formulario/textos a blanco y lima | Typecheck, lint, 5 tests y diff-check OK; revisión visual local queda a cargo del usuario |
| 2026-08-14 | Codex | RTN-511 | Retiró Ranking del sidebar de escritorio y los controles de Configuración/export semanal de Home; convirtió el logo en enlace a Inicio | Typecheck, lint, 5 tests y diff-check OK |
| 2026-08-14 | Claude | RTN-802, RTN-803 | Agregó service worker/offline shell (`app/+html.tsx`, `public/sw.js`), corrigió esquema `app.json`, completó `eas.json` para build reproducible y conectó el proyecto EAS real (`@jupster/retorna-uc`); publicó plan en draft PR #7 y cerró en el mismo PR | expo-doctor 21/21, typecheck, lint, 5/5 tests, web:export, export servido y verificado, Lighthouse ejecutado; `eas build --platform android --profile preview` en curso; claim liberado |
| 2026-08-14 | Codex | RTN-009 | Fusionó `origin/develop` en la branch visual y resolvió `docs/PROGRESS.md` combinando ambos historiales y evidencias | Sin archivos sin resolver; typecheck, lint, 5 tests y diff-check OK |
| 2026-08-14 | Codex | RTN-512 | Reemplazó fotografía por video full-bleed en loop/mute sin controles y corrigió superficies fuertes según light/dark mode | Expo 21/21, dependencias compatibles, typecheck, lint, 5 tests, export web con MP4 y diff-check OK |
| 2026-08-14 | Codex | RTN-513 | Reintentó `play()` al render del primer frame para evitar el video estático en Firefox | Fix puntual solicitado; sin suite de lint/tests por indicación del usuario |
| 2026-08-14 | Codex | RTN-302/701/702/703 | Implementó flujo de reciclaje con modo cámara/manual, lookup local/Open Food Facts, fallback de categoría, preview de impacto, confirmación contra store demo y bypass local sin cuenta | Typecheck, lint, 10 tests, export web y `curl` a `recycle.html` OK; falta prueba manual con cámara real/Android |
| 2026-08-14 | Codex | RTN-010 | Reintegró de urgencia `origin/develop` y combinó ambos historiales del único conflicto documental | Sin archivos sin resolver; sin lint/tests por indicación de urgencia del usuario |
