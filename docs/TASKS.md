# Backlog coordinado

Última actualización: **2026-08-14**

## Leyenda

- `PENDIENTE`: no iniciado.
- `RESERVADA`: plan commit pusheado, lease activo e implementación aún no iniciada.
- `EN CURSO`: tiene owner activo; no tomar sin coordinación.
- `EN REVISIÓN`: criterios cumplidos y PR esperando integración.
- `PARCIAL`: existe trabajo previo, pero no tiene owner activo y puede retomarse.
- `BLOQUEADA`: requiere dependencia o decisión externa documentada.
- `COMPLETADA`: cumple aceptación y tiene evidencia.

Todos los agentes deben actualizar este archivo al tomar/cerrar una tarea y también actualizar [`PROGRESS.md`](PROGRESS.md).

## Reserva obligatoria

Antes de implementar, el owner crea un claim desde [`claims/TEMPLATE.md`](claims/TEMPLATE.md), declara rama/lease/write set, hace un plan commit, lo pushea y abre un draft PR. La fila debe enlazar el claim mientras esté `RESERVADA`, `EN CURSO`, `BLOQUEADA` o `EN REVISIÓN`.

El owner se expresa como `Agente · [claim](claims/RTN-###.md)`. Claims vencidos siguen bloqueados hasta completar el protocolo de takeover.

## Orden y tracks

```text
T0 Foundation ─┬─> T1 Auth/Data ─> T2 Communities ─> T3 Recycling ─> T4 Competition
               ├─> T5 Design ───────────────────────────────┘
               └─> T8 Quality/Deploy (transversal)
T3 + T4 ─> T6 Missions/Social/Sharing ─> T7 Barcode
```

### T0 — Foundation y gobernanza

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-001 | Scaffold Expo universal y tooling base | COMPLETADA | Codex | — | Install, Expo check, typecheck, lint, tests y export web exitosos; assets generados |
| RTN-002 | Gobernanza multiagente y documentación | COMPLETADA | Codex | — | `AGENTS.md`, Gitflow, commits, tasks y progress enlazados y consistentes |
| RTN-003 | CI inicial | PENDIENTE | — | RTN-001 | PR ejecuta typecheck, lint y tests |
| RTN-004 | Gestión de environment y secretos | COMPLETADA | Codex | RTN-001 | `.env.example` completo, sin secretos, setup documentado |
| RTN-005 | README principal de Retorna | COMPLETADA | Codex | RTN-002 | Inicio rápido y docs al comienzo; bases del hackathon preservadas debajo |
| RTN-006 | Triage de vulnerabilidades transitivas | PENDIENTE | — | RTN-001 | auditar advisories sin downgrades incompatibles; decisión y mitigación documentadas |
| RTN-007 | Publicar setup inicial con Gitflow | COMPLETADA | Codex | RTN-001, RTN-002 | `develop` y rama de trabajo publicadas; commits convencionales; draft PR #1 |
| RTN-008 | Protocolo de reserva de tareas y archivos | COMPLETADA | Codex | RTN-002 | plan PR #2; implementación y liberación del claim en PR #3; lease, write set, heartbeat y conflictos documentados |
| RTN-009 | Reintegrar `develop` en branch visual | COMPLETADA | — | RTN-008 | `origin/develop` integrado; conflicto de `PROGRESS` resuelto preservando RTN-509–511 y RTN-802/803; typecheck/lint/5 tests/diff OK; [evidencia](claims/RTN-009.md) |

### T1 — Auth y datos

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-101 | Auth propia con Supabase Auth | PARCIAL | — | RTN-001 | Registro/login/logout, sesión persistente y protección listos; typecheck/lint OK. Falta probar contra Supabase local |
| RTN-102 | Proyecto Supabase y tipos generados | PARCIAL | — | RTN-001 | Config, cliente y tipos escritos; falta ejecutar la conexión local |
| RTN-103 | Esquema relacional de usuarios y organizaciones | PARCIAL | — | RTN-102 | Migración escrita con perfiles, organizaciones, membresías y solicitudes; falta aplicarla localmente |
| RTN-104 | RLS y permisos base | PARCIAL | — | RTN-103 | Políticas y funciones owner/admin/member escritas; sin prueba integrada por alcance de showcase |
| RTN-105 | Seed SQL de desarrollo | PARCIAL | — | RTN-103 | Usuarios de desarrollo, organizaciones, roles y solicitud escritos; falta ejecutar `db reset` |
| RTN-106 | Perfil y organizaciones funcionales | PARCIAL | — | RTN-101, RTN-104 | UI conectada al repositorio real; typecheck/lint OK. Falta prueba con base local |

### T2 — Comunidades

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-201 | Descubrimiento/búsqueda UI | PARCIAL | — | RTN-001, RTN-501 | estados loading/empty/error y responsive verificados |
| RTN-202 | Detalle de comunidad UI | PARCIAL | — | RTN-201 | header, stats, ranking, desafío y feed con datos tipados |
| RTN-203 | Crear comunidad | PARCIAL | — | RTN-103 | validación servidor, owner automático y flujo UI completo |
| RTN-204 | Unirse/salir de públicas | PENDIENTE | — | RTN-104, RTN-202 | permisos, optimismo y rollback |
| RTN-205 | Invitaciones/comunidades privadas | PENDIENTE | — | RTN-204 | código/link expirable y errores intencionales |
| RTN-206 | Roles owner/admin/member | PENDIENTE | — | RTN-104 | matriz de permisos testeada |

### T3 — Reciclaje y ledger

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-301 | Catálogo y reglas de puntos | PARCIAL | — | RTN-001 | cálculo puro documentado y testeado |
| RTN-302 | Flujo manual de reciclaje | PENDIENTE | — | RTN-204, RTN-301 | categoría, cantidad, una comunidad, preview y confirmación |
| RTN-303 | RPC transaccional + ledgers | PENDIENTE | — | RTN-103, RTN-301 | cliente no controla puntos; ambos ledgers atómicos |
| RTN-304 | Historial y detalle | PENDIENTE | — | RTN-303 | filtros y detalle auditables |
| RTN-305 | Editar/eliminar con reversión | PENDIENTE | — | RTN-303 | user/community/misiones/rankings consistentes tras mutación |
| RTN-306 | Señales antiabuso de buena fe | PARCIAL | — | RTN-301 | límites suaves definidos; persistencia/admin pendientes |

### T4 — Competencia

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-401 | Reglas de periodos y ranking | PARCIAL | — | RTN-301 | semana Chile/mes/all-time y desempate testeados |
| RTN-402 | Ranking de usuarios | PENDIENTE | — | RTN-303, RTN-401 | query indexada + UI |
| RTN-403 | Ranking de comunidades | PENDIENTE | — | RTN-303, RTN-401 | query indexada + UI |
| RTN-404 | Ranking interno | PENDIENTE | — | RTN-204, RTN-402 | sólo miembros y contexto de comunidad |
| RTN-405 | Snapshots/movimiento | PENDIENTE | — | RTN-402, RTN-403 | sólo si medición justifica cache |

### T5 — Design system y navegación

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-501 | Tokens, logo y componentes base | COMPLETADA | — | RTN-001 | paleta lime/natural light-dark unificada; contraste principal 6.69:1 o superior; typecheck, lint, 5 tests y diff-check OK; [evidencia](claims/RTN-501.md) |
| RTN-502 | Shell mobile/desktop | PARCIAL | — | RTN-501 | bottom nav móvil y rail desktop sin rutas rotas |
| RTN-503 | Estados loading/empty/error | PENDIENTE | — | RTN-501 | catálogo reutilizable y aplicado a flows críticos |
| RTN-504 | Auditoría de accesibilidad | PENDIENTE | — | RTN-502 | teclado web, labels, contraste, targets y lector |
| RTN-505 | Interfaz angular y acceso demo | COMPLETADA | — | RTN-101, RTN-501 | logo sin placa, radios globales en cero, auth “Tú → Planeta” responsive y botón demo con Martina; typecheck/lint/tests/diff OK; [evidencia](claims/RTN-505.md) |
| RTN-506 | Paleta binaria y Home vertical | COMPLETADA | — | RTN-501, RTN-505 | negro/blanco/lima sin tonos soft; CTA reciclaje dominante y Home en una columna; typecheck/lint/tests/diff OK; [evidencia](claims/RTN-506.md) |
| RTN-507 | Logo ampliado y frase de acceso | COMPLETADA | — | RTN-505 | wordmark 32 px, símbolo 50 px y frase sobre Tú→Planeta; typecheck/lint/diff OK; [evidencia](claims/RTN-507.md) |
| RTN-508 | Retirar notificaciones de Inicio | COMPLETADA | — | RTN-506 | botón, indicador, import y estilos retirados; Configuración preservada; typecheck/lint/diff OK; [evidencia](claims/RTN-508.md) |
| RTN-509 | Landing pública extendida | COMPLETADA | — | RTN-505, RTN-507 | acceso sin marco exterior; narrativa vertical responsive sobre registro, comunidad y progreso; modo demo preservado; typecheck/lint/5 tests/diff OK; [evidencia](claims/RTN-509.md) |
| RTN-510 | Hero de acceso sobre fotografía | COMPLETADA | — | RTN-509 | fotografía provista a ancho completo cubre hero y formulario; overlay y controles de alto contraste; acceso responsive y funcional; typecheck/lint/5 tests/diff OK; [evidencia](claims/RTN-510.md) |
| RTN-511 | Simplificar navegación e Inicio | COMPLETADA | — | RTN-502, RTN-506 | sidebar sin Ranking; Inicio sin Configuración ni export semanal; logo enlaza a Inicio; ranking de Home preservado; typecheck/lint/5 tests/diff OK; [evidencia](claims/RTN-511.md) |
| RTN-512 | Video hero y contraste por tema | COMPLETADA | — | RTN-510, RTN-511 | MP4 hero autoplay/loop/mute sin controles; overlay legible; light mode blanco delimitado y dark mode negro; Expo 21/21, typecheck/lint/5 tests/export/diff OK; [evidencia](claims/RTN-512.md) |
| RTN-513 | Autoplay del hero en Firefox | COMPLETADA | — | RTN-512 | reproducción reafirmada al renderizar el primer frame, después del montaje del elemento web; [evidencia](claims/RTN-513.md) |

### T6 — Misiones, social y sharing

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-601 | Modelo/progreso de misiones | PARCIAL | — | RTN-303 | métricas y progreso puro definidos; persistencia pendiente |
| RTN-602 | Desafíos de comunidad | PARCIAL | — | RTN-303, RTN-206 | UI inicial existe; CRUD/permisos pendientes |
| RTN-603 | Feed/follows | PARCIAL | — | RTN-303 | UI/fixtures iniciales; backend y privacidad pendientes |
| RTN-604 | Niveles/badges/rachas | PARCIAL | — | RTN-303 | reglas iniciales; pruebas y persistencia pendientes |
| RTN-605 | Builder/export de share cards | PENDIENTE | — | RTN-402, RTN-501 | Story + cuadrado exportan PNG real |
| RTN-606 | Administración de misiones | PENDIENTE | — | RTN-104, RTN-601 | ruta protegida y CRUD mínimo |

### T7 — Barcode y reglas Chile (post-core)

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-701 | Contrato `ProductLookupProvider` | PENDIENTE | — | RTN-302 | proveedor reemplazable + fallback manual |
| RTN-702 | Adaptador Open Food Facts | PENDIENTE | — | RTN-701 | fields mínimos, User-Agent y errores tratados |
| RTN-703 | Scanner Expo Camera | PENDIENTE | — | RTN-701 | permisos, web/Android y barcode único |
| RTN-704 | Reglas estructuradas Chile | PENDIENTE | — | RTN-103 | incertidumbre, limpieza y manejo especial modelados |

### T8 — Calidad, PWA y deploy

| ID | Tarea | Estado | Owner | Depende de | Criterio de aceptación / evidencia |
| --- | --- | --- | --- | --- | --- |
| RTN-801 | Tests de dominio críticos | PARCIAL | — | RTN-301, RTN-401, RTN-601 | 5 tests base pasan; faltan ledger, ranking, misión y permisos |
| RTN-802 | PWA instalable/offline shell | COMPLETADA | Claude · [claim](claims/RTN-802.md) | RTN-001 | manifest, assets, export, service worker y verificación (export servido + Lighthouse) listos |
| RTN-803 | EAS web + Android | PARCIAL | — | RTN-001, RTN-004 | preview web reproducible; `app.json`/`eas.json` corregidos para build reproducible; falta proyecto EAS real y ejecutar `eas build --platform android` |
| RTN-804 | Analítica con privacidad | PENDIENTE | — | RTN-001 | contrato + eventos críticos; no bloquea core |
| RTN-805 | Performance mid-range Android | PENDIENTE | — | flujo core | listas/imágenes medidos y sin regresiones obvias |
