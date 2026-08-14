# Playbook para agentes

## Inicio de tarea

```bash
git status --short
git fetch --all --prune
gh pr list --state open --json number,title,headRefName,isDraft,url
```

1. Leer `AGENTS.md`, `docs/PROGRESS.md`, `docs/claims/` y el track relevante en `docs/TASKS.md`.
2. Confirmar que la tarea y los archivos previstos no tengan otro lease activo.
3. Crear rama desde `develop`.
4. Copiar `docs/claims/TEMPLATE.md` a `docs/claims/RTN-###.md` y completar plan/write set.
5. Registrar `RESERVADA`, owner, rama y lease en tablero/progreso.
6. Commitear sólo la reserva: `chore(tasks): claim RTN-### slug`.
7. Pushear inmediatamente y abrir un draft PR contra `develop`.
8. Recién entonces marcar `EN CURSO` e implementar.
9. Anunciar supuestos que cambien alcance o contratos.

Una consulta read-only termina sin claim. En cuanto una revisión derive en cambios, se debe ejecutar este inicio antes de editar.

## Durante

- Mantener la tarea acotada.
- Preferir reglas puras en `src/domain` y componentes modulares.
- No duplicar contratos: si cambia un tipo compartido, actualizar consumidores y documentación.
- Registrar una decisión en `DECISIONS.md` si altera stack, seguridad, esquema o contrato transversal.
- Si surge trabajo nuevo, agregar una tarea separada; no expandir silenciosamente el alcance.
- Si se necesita escribir fuera del write set, actualizar claim, heartbeat y draft PR antes de hacerlo.
- Renovar el lease cada 4 horas como máximo. Un checkpoint de implementación puede incluir el heartbeat para evitar commits vacíos.
- Los archivos compartidos de alta colisión requieren coordinación explícita en el claim.

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
4. Cambiar el claim a `RELEASED`, retirar “Trabajo activo” y dejar la tarea `COMPLETADA`, `PARCIAL` o `BLOQUEADA` según evidencia.
5. Revisar `git diff --check` y `git status --short`.
6. Pushear el checkpoint final y actualizar el PR.
7. Entregar un resumen con archivos, pruebas y siguiente paso seguro.

## Handoff mínimo

El handoff debe responder:

- ¿Qué cambió?
- ¿Qué está verificado?
- ¿Qué no se pudo verificar?
- ¿Qué contratos o variables cambiaron?
- ¿Cuál es la siguiente tarea desbloqueada?
