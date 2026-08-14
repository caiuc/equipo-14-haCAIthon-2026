# Documentación de Retorna

Este directorio es la fuente de verdad operativa del proyecto. Está pensado para trabajo paralelo entre personas y agentes de IA.

## Orden de lectura

1. [`../AGENTS.md`](../AGENTS.md) — reglas obligatorias para cualquier agente.
2. [`PRODUCT.md`](PRODUCT.md) — alcance, principios y flujo central.
3. [`ARCHITECTURE.md`](ARCHITECTURE.md) — arquitectura objetivo y estado real del setup.
4. [`TASKS.md`](TASKS.md) — backlog separado por tracks, dependencias y criterios.
5. [`PROGRESS.md`](PROGRESS.md) — estado vivo y handoff entre agentes.
6. [`GITFLOW.md`](GITFLOW.md) — ramas, PRs, releases y hotfixes.
7. [`CONVENTIONAL_COMMITS.md`](CONVENTIONAL_COMMITS.md) — formato de commits para IAs.
8. [`AGENT_PLAYBOOK.md`](AGENT_PLAYBOOK.md) — rutina segura de inicio/cierre.
9. [`DECISIONS.md`](DECISIONS.md) — decisiones técnicas y sus consecuencias.

## Fuentes de verdad

| Tema | Documento |
| --- | --- |
| Qué construir | `PRODUCT.md` |
| Cómo está diseñado | `ARCHITECTURE.md` |
| Qué tarea existe y quién la toma | `TASKS.md` |
| Qué está realmente listo hoy | `PROGRESS.md` |
| Cómo integrar cambios | `GITFLOW.md` |
| Cómo nombrar commits | `CONVENTIONAL_COMMITS.md` |

Si dos documentos se contradicen, prevalece en este orden: requerimiento más reciente del usuario → `AGENTS.md` → `PROGRESS.md` para estado actual → `TASKS.md` para planificación → documentos de arquitectura.
