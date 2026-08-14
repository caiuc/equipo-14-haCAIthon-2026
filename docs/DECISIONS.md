# Registro de decisiones

## ADR-001 — Cliente universal Expo

- **Estado:** aceptada
- **Fecha:** 2026-08-14
- **Decisión:** Expo + React Native + Expo Router para web y Android.
- **Motivo:** maximiza código compartido, velocidad de desarrollo y acceso futuro a cámara/barcode sin cerrar iOS.
- **Consecuencia:** componentes deben respetar React Native Web y evitar dependencias sólo-DOM en lógica compartida.

## ADR-002 — Clerk + Supabase Postgres

- **Estado:** aceptada como arquitectura objetivo; integración pendiente
- **Fecha:** 2026-08-14
- **Decisión:** Clerk autentica; Supabase aporta Postgres, RLS, Storage y Realtime.
- **Motivo:** el dominio es relacional y necesita transacciones/ledgers auditables; Supabase admite JWT de Clerk.
- **Consecuencia:** perfiles de producto se separan de identidades Clerk. Puntos y permisos se calculan en servidor.

## ADR-003 — Modo demo detrás de contrato

- **Estado:** aceptada
- **Fecha:** 2026-08-14
- **Decisión:** permitir ejecución local con fixtures cuando falten credenciales.
- **Motivo:** la feria no debe depender de conectividad o servicios recién configurados.
- **Consecuencia:** el modo demo debe estar claramente marcado y nunca confundirse con seguridad productiva.

## ADR-004 — Ledger para puntajes

- **Estado:** aceptada como diseño; backend pendiente
- **Fecha:** 2026-08-14
- **Decisión:** mantener ledgers personales y comunitarios vinculados a cada acción.
- **Motivo:** edición, eliminación, auditoría y reconstrucción de rankings necesitan historia trazable.
- **Consecuencia:** no se aceptan totales ni puntos arbitrarios desde el cliente.

## ADR-005 — Identidad code-native

- **Estado:** aceptada
- **Fecha:** 2026-08-14
- **Decisión:** logo y sistema visual se definen con tokens/SVG/componentes.
- **Motivo:** nitidez y consistencia entre web y Android, sin depender de bitmaps generados.
