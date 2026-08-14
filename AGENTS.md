# Retorna — instrucciones obligatorias para agentes

Este archivo aplica a **todo el repositorio**. Cualquier agente humano o de IA que cambie código, configuración, documentación, datos o assets debe seguir estas reglas.

## Protocolo obligatorio de trabajo

Antes de modificar archivos:

1. Leer [`docs/README.md`](docs/README.md).
2. Leer [`docs/PROGRESS.md`](docs/PROGRESS.md) y [`docs/TASKS.md`](docs/TASKS.md).
3. Identificar un ID de tarea existente. Si no existe, agregarlo antes de implementar.
4. Cambiar la tarea a `EN CURSO`, anotar agente/owner y fecha en `docs/TASKS.md`.
5. Revisar `git status` y no sobrescribir trabajo ajeno.

Antes de terminar una intervención:

1. Ejecutar las verificaciones proporcionales al cambio.
2. Actualizar el estado y la evidencia de la tarea en `docs/TASKS.md`.
3. **Actualizar obligatoriamente `docs/PROGRESS.md` en el mismo cambio**, incluso si la tarea quedó parcial o bloqueada.
4. Registrar archivos relevantes, verificaciones ejecutadas y cualquier deuda o bloqueo.
5. No declarar `COMPLETADA` una tarea sin cumplir sus criterios de aceptación.

Un cambio que no actualiza `docs/PROGRESS.md` se considera incompleto.

## Coordinación entre agentes

- No tomar una tarea `EN CURSO` asignada a otro agente sin coordinar primero.
- Una tarea debe tener un único owner activo. Colaboradores adicionales se anotan en su fila.
- Evitar que dos agentes editen simultáneamente archivos de alta colisión: `package.json`, migraciones, `docs/TASKS.md`, `docs/PROGRESS.md` y layouts raíz.
- Mantener cambios pequeños y vinculados a un ID de tarea.
- No reformatear, renombrar ni reorganizar archivos fuera del alcance de la tarea.
- Nunca descartar cambios no reconocidos del working tree.
- Si aparece un bloqueo, documentarlo con una acción concreta para desbloquear; no ocultarlo con mocks silenciosos.

## Git y commits

- Seguir [`docs/GITFLOW.md`](docs/GITFLOW.md).
- Seguir [`docs/CONVENTIONAL_COMMITS.md`](docs/CONVENTIONAL_COMMITS.md).
- Nombre de rama: `<tipo>/RTN-<número>-<slug>`; ejemplo: `feat/RTN-201-community-join`.
- Todo commit debe incluir un único propósito coherente y el ID de tarea en el footer o scope descriptivo.
- No hacer push, merge, rebase o commit salvo que el usuario o flujo de trabajo lo autorice.

## Calidad mínima

- TypeScript estricto; no introducir `any` sin justificarlo.
- Reglas de negocio críticas viven en `src/domain`, no en componentes.
- El cliente nunca decide puntos, permisos o completitud de desafíos en producción.
- Todo dato enviado por cliente se valida también en servidor.
- UI y copy principal en español de Chile.
- Todo estado interactivo requiere loading, error o recuperación cuando corresponda.
- No afirmar precisión científica para estimaciones ambientales.
- Mantener accesibilidad: contraste, labels semánticos, teclado web y targets táctiles.

## Definición global de terminado

Una tarea sólo está terminada cuando:

- cumple sus criterios de aceptación;
- tiene pruebas o verificación documentada;
- no deja errores conocidos sin registrar;
- actualiza `docs/TASKS.md` y `docs/PROGRESS.md`;
- incluye documentación de configuración si agregó variables, servicios o comandos.
