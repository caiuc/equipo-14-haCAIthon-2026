# Gitflow de Retorna

Se usa una variante liviana de Gitflow adecuada para un MVP y trabajo multiagente.

## Ramas protegidas

- `main`: versión demostrable o desplegable. No recibe trabajo directo.
- `develop`: integración de la siguiente versión.

## Ramas de trabajo

| Tipo | Nace desde | Integra hacia | Uso |
| --- | --- | --- | --- |
| `feat/RTN-###-slug` | `develop` | `develop` | Funcionalidad nueva |
| `fix/RTN-###-slug` | `develop` | `develop` | Corrección no urgente |
| `docs/RTN-###-slug` | `develop` | `develop` | Sólo documentación |
| `chore/RTN-###-slug` | `develop` | `develop` | Tooling/config/dependencias |
| `release/x.y.z` | `develop` | `main` y luego `develop` | Estabilización de release |
| `hotfix/RTN-###-slug` | `main` | `main` y luego `develop` | Incidente urgente productivo |

Ejemplos:

```text
feat/RTN-203-private-community-invites
fix/RTN-312-ledger-delete-rollback
docs/RTN-002-agent-governance
chore/RTN-004-ci-bootstrap
```

## Flujo normal

1. Actualizar `develop` sin descartar cambios locales.
2. Tomar una tarea en `docs/TASKS.md`.
3. Crear rama corta desde `develop`.
4. Implementar y verificar.
5. Actualizar `docs/TASKS.md` y `docs/PROGRESS.md`.
6. Crear commits convencionales pequeños.
7. Abrir PR hacia `develop` usando el template.
8. Requerir CI verde y revisión del área afectada.
9. Usar squash merge salvo que el historial intermedio aporte valor real.

## Reglas para agentes de IA

- No crear rama, commit, push, PR, merge o rebase sin autorización del usuario/flujo anfitrión.
- No trabajar directamente sobre `main` o `develop` cuando sí exista autorización para usar ramas.
- No reescribir historia compartida.
- No usar `git reset --hard`, force-push ni checkout destructivo.
- Antes de integrar, revisar `git diff`, `git status` y el tablero de progreso.
- Si el working tree contiene cambios ajenos, preservarlos y limitar el diff al alcance propio.

## Pull requests

Cada PR debe declarar:

- tarea `RTN-###`;
- problema y solución;
- evidencia de pruebas;
- cambios de esquema/env/deploy;
- capturas para UI cuando aplique;
- actualización de `docs/PROGRESS.md`.

Los PRs no deben mezclar refactors oportunistas con funcionalidad.
