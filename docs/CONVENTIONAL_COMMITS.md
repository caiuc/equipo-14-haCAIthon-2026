# Conventional Commits para agentes de IA

Formato obligatorio:

```text
<type>(<scope>): <descripción imperativa>

[cuerpo opcional: por qué y restricciones]

Refs: RTN-###
```

## Tipos permitidos

| Tipo | Cuándo usarlo |
| --- | --- |
| `feat` | Capacidad visible o contrato nuevo |
| `fix` | Corrección de comportamiento defectuoso |
| `docs` | Sólo documentación |
| `test` | Pruebas sin cambio funcional |
| `refactor` | Cambio interno sin feature/fix |
| `perf` | Mejora medible de rendimiento |
| `style` | Formato sin cambio lógico |
| `build` | Build system o dependencias de producción |
| `ci` | Pipelines y automatización |
| `chore` | Mantenimiento no cubierto arriba |
| `revert` | Reversión explícita de un commit |

## Scopes recomendados

`app`, `auth`, `communities`, `recycling`, `leaderboards`, `missions`, `social`, `sharing`, `barcode`, `db`, `design`, `docs`, `tasks`, `ci`, `deps`.

## Commits de coordinación

Toda tarea que escriba en el repositorio comienza con un commit sin implementación:

```text
chore(tasks): claim RTN-203 community creation

Refs: RTN-203
```

Si el lease debe renovarse en un commit independiente:

```text
chore(tasks): refresh RTN-203 lease
```

Al cerrar, la liberación puede acompañar el último commit documental o usar:

```text
chore(tasks): release RTN-203 claim
```

Estos commits no son ruido permanente cuando el PR se integra por squash, y hacen visible la coordinación mientras el trabajo está activo.

## Reglas de redacción

- Descripción breve, concreta y en imperativo: “add”, “protect”, “derive”, “document”.
- Máximo recomendado: 72 caracteres en el encabezado.
- Explicar el **porqué** en el cuerpo cuando no sea obvio.
- Usar `!` y footer `BREAKING CHANGE:` sólo para incompatibilidades reales.
- No usar mensajes como `updates`, `fix stuff`, `WIP`, `changes` o nombres de archivos sin intención.
- Un commit debe representar una unidad reversible y coherente.
- No atribuir pruebas que no se ejecutaron.

## Ejemplos válidos

```text
feat(communities): add public membership flow

Validates membership server-side and refreshes the internal leaderboard.

Refs: RTN-204
```

```text
fix(recycling): reverse both ledgers when deleting an action

Refs: RTN-305
```

```text
docs(docs): add mandatory multi-agent progress protocol

Refs: RTN-002
```

## Ejemplos inválidos

```text
update files
WIP
feat: everything
fix(app): maybe fix ranking
```
