# Playbook para agentes

## Inicio de tarea

```bash
git status --short
```

1. Leer `AGENTS.md`, `docs/PROGRESS.md` y el track relevante en `docs/TASKS.md`.
2. Confirmar que la tarea no tenga otro owner activo.
3. Registrar `EN CURSO`, owner y fecha.
4. Inspeccionar sólo los archivos necesarios.
5. Anunciar supuestos que cambien alcance o contratos.

## Durante

- Mantener la tarea acotada.
- Preferir reglas puras en `src/domain` y componentes modulares.
- No duplicar contratos: si cambia un tipo compartido, actualizar consumidores y documentación.
- Registrar una decisión en `DECISIONS.md` si altera stack, seguridad, esquema o contrato transversal.
- Si surge trabajo nuevo, agregar una tarea separada; no expandir silenciosamente el alcance.

## Cierre

Ejecutar lo que corresponda:

```bash
npm run typecheck
npm run lint
npm test
npm run web:export
```

No todos los comandos son obligatorios para cada cambio, pero el agente debe anotar cuáles ejecutó y el resultado real.

Luego:

1. Actualizar estado/evidencia en `docs/TASKS.md`.
2. Actualizar `docs/PROGRESS.md` obligatoriamente.
3. Anotar bloqueos y limitaciones.
4. Revisar `git diff --check` y `git status --short`.
5. Entregar un resumen con archivos, pruebas y siguiente paso seguro.

## Handoff mínimo

El handoff debe responder:

- ¿Qué cambió?
- ¿Qué está verificado?
- ¿Qué no se pudo verificar?
- ¿Qué contratos o variables cambiaron?
- ¿Cuál es la siguiente tarea desbloqueada?
