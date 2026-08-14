# Claims de trabajo — task leases

Un claim es una reserva temporal y visible de una tarea y de su **write set**. Evita que agentes paralelos implementen la misma capacidad o editen los mismos archivos sin saberlo.

## Cuándo aplica

- Obligatorio para cualquier tarea que vaya a modificar archivos del repositorio.
- No aplica a respuestas, explicaciones, búsquedas o revisiones estrictamente read-only.
- Si una revisión read-only deriva en un cambio, se crea el claim antes de la primera edición.

## Fuente de visibilidad

Una reserva se considera activa sólo cuando existen las cuatro señales:

1. fila `RESERVADA` o `EN CURSO` en `docs/TASKS.md`;
2. archivo `docs/claims/RTN-###.md` con lease vigente;
3. rama remota pusheada;
4. draft PR abierto contra `develop`.

El plan commit debe ser el primer commit de la rama y no debe incluir implementación.

## Estados

| Task status | Significado |
| --- | --- |
| `PENDIENTE` | disponible |
| `RESERVADA` | plan commit visible; implementación todavía no iniciada |
| `EN CURSO` | implementación activa bajo lease |
| `BLOQUEADA` | owner mantiene contexto; claim debe indicar bloqueo y próxima acción |
| `EN REVISIÓN` | implementación terminada, PR esperando integración |
| `PARCIAL` | trabajo previo liberado y disponible para nuevo owner |
| `COMPLETADA` | aceptación cumplida y claim liberado |

El archivo de claim usa `ACTIVE`, `BLOCKED`, `RELEASED` o `STALE`.

## Lease y heartbeat

- Duración predeterminada: **8 horas**.
- Heartbeat máximo: cada **4 horas** o en cada checkpoint sustancial.
- Renovar significa actualizar `last_heartbeat` y `expires_at`, commitear y pushear.
- Un agente puede solicitar un lease mayor si el plan lo justifica explícitamente.
- Un claim vencido no se roba automáticamente: primero se revisan PR, commits remotos y actividad reciente.
- Para takeover, el nuevo agente documenta la evidencia de vencimiento, cambia el claim anterior a `STALE` y publica un nuevo plan commit.

## Write set

- Declarar rutas exactas cuando sea posible y globs pequeños sólo cuando sea necesario.
- Incluir archivos generados asociados, como lockfiles o tipos.
- Leer no requiere reserva.
- Antes de tocar una ruta nueva, ampliar el claim y pushearlo.
- Si dos claims se solapan, ningún agente escribe hasta acordar una de estas salidas:
  - dividir el archivo o contrato;
  - mover una tarea a otra secuencia;
  - declarar colaboración con un owner único;
  - ceder/liberar parte del write set.

Archivos de alta colisión (`package.json`, lockfiles, migraciones, layouts raíz, `TASKS.md`, `PROGRESS.md`) deben aparecer en `shared_write_set` con una razón.

## Descubrimiento antes de trabajar

```bash
git fetch --all --prune
gh pr list --state open --json number,title,headRefName,isDraft,url
rg -n "Estado:.*(ACTIVE|BLOCKED)|Lease hasta|Vence UTC" docs/claims
```

Usa [`TEMPLATE.md`](TEMPLATE.md) para crear un claim nuevo.
