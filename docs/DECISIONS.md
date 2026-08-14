# Registro de decisiones

## ADR-001 — Cliente universal Expo

- **Estado:** aceptada
- **Fecha:** 2026-08-14
- **Decisión:** Expo + React Native + Expo Router para web y Android.
- **Motivo:** maximiza código compartido, velocidad de desarrollo y acceso futuro a cámara/barcode sin cerrar iOS.
- **Consecuencia:** componentes deben respetar React Native Web y evitar dependencias sólo-DOM en lógica compartida.

## ADR-002 — Clerk + Supabase Postgres

- **Estado:** superada parcialmente por ADR-006 para autenticación
- **Fecha:** 2026-08-14
- **Decisión:** Clerk autentica; Supabase aporta Postgres, RLS, Storage y Realtime.
- **Motivo:** el dominio es relacional y necesita transacciones/ledgers auditables; Supabase admite JWT de Clerk.
- **Consecuencia:** se conserva Supabase Postgres; la parte de identidad Clerk ya no aplica al MVP actual.

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

## ADR-006 — Autenticación propia sobre Supabase Auth

- **Estado:** aceptada
- **Fecha:** 2026-08-14
- **Decisión:** usar Supabase Auth con email/contraseña para registro, login, logout y sesión persistente; no ejecutar ni configurar Clerk.
- **Motivo:** Supabase ya forma parte del stack y resuelve credenciales y sesión sin sumar otro proveedor al showcase.
- **Consecuencia:** auth, perfiles y organizaciones requieren Supabase; la confirmación de email queda desactivada y no se agregan recuperación, MFA ni login social en esta etapa.
