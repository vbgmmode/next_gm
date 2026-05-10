# SQLite-First Persistence Direction

## Status

Next GM is still in foundation mode. SQLite-first local storage is the intended long-term persistence target, and the current approved implementation is limited to identity-only SQLite probes and durable save identity create/read/list shells.

Current save and storage work remains diagnostics-only and non-gameplay. The approved exceptions may open controlled SQLite databases, create only identity tables, initialize durable identity storage, create one save identity, read identity records, list identity records, track the approved identity schema migration, use minimal `save_metadata` rows only as identity support, and report diagnostics-only capability/status. They must not advance gameplay or expose player-facing output. Current shell outputs are expected to remain `playerFacing: false`.

## Current Boundary

- `SaveProgressionContractShell` describes future save/progression identity, selected setup placeholders, seed/replay references, and progression/persistence status placeholders. It does not create a save or mutate game state.
- `PersistenceAdapterContractShell` describes a future adapter contract shape, supported operation placeholders, storage target placeholders, and save/progression references. It does not provide callable save/load/list/delete methods.
- `StorageAdapterInterfaceExpectationsShell` describes future adapter operation and capability expectations. Unsupported operations and missing capabilities are warnings only.
- `SaveDataShapeExpectationsShell` describes expected future save payload sections and required identity, replay, and progression fields. It does not create a save payload.
- `SQLiteSchemaExpectationsShell` describes future SQLite-first schema expectations such as tables, primary keys, indexes, replay columns, and progression columns.
- SQLite identity-only probes may create the approved identity tables `saves`, `save_metadata`, and `schema_migrations` in controlled test-safe targets.
- SQLite initialization/migration scaffolding is approved only for the identity schema, including `schema_migrations` tracking.
- Durable SQLite save identity create, read, and list shells may use an approved durable identity path for identity records only.
- Minimal `save_metadata` row usage is approved only as identity support for identity round-tripping.
- Diagnostics-only capability and status reporting may summarize the durable identity boundary.
- The repository-facing `createSave` identity shell may orchestrate durable identity initialization, insert, and verification, but it is still diagnostics-only and does not expose a repository object or methods.

Identity persistence is approved only for durable save identity records and minimal metadata needed to prove identity round-tripping. Gameplay persistence is still not approved.

## Explicit Non-Implementation

No full SQLite adapter exists yet.

No full migration system exists yet. Only the approved save identity schema migration shell exists.

No gameplay database IO exists yet.

No full save/load/list/delete/update behavior exists yet. Identity-only read/list shells are the only approved read/list exception.

No save update or save delete behavior exists yet.

No player-facing save management exists yet.

No UI save/load/list wiring exists yet.

No save creation is wired into New Game Start, gameplay start, week advancement, draft execution, roster assignment, UI, business systems, Match, Show, Fan Reaction, Social Discourse, generated text, or GenAI.

No draft, roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated-text, or GenAI save payloads exist yet.

No full save repository object exists yet.

## Future Implementation Order

Completed foundation steps:

1. SQLite migration expectations.
2. SQLite adapter contract refinement.
3. SQLite identity schema execution probes.
4. Durable SQLite save identity initialization, insert, and verification shells.
5. Repository-facing `createSave` identity shell.
6. Identity-only durable save identity read shell.
7. Identity-only durable save identity list shell.

Still future unless separately scoped:

1. Full SQLite adapter implementation.
2. Full save repository object.
3. Full save load/list behavior beyond identity-only read/list.
4. Save delete behavior.
5. Save update behavior.
6. Gameplay save payload serialization.
7. New Game Start, UI, draft, roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated text, or GenAI wiring.

## Gameplay Boundary

Persistence work must stay behind explicit save/storage scope. Future SQLite implementation should remain deterministic where it touches replay metadata, preserve existing engine outputs, and avoid changing engine IDs or metadata unless a separately scoped engine change requires it.

Save creation must not become an implicit gameplay start. It should only be considered after the New Game Start Gate has a scoped contract for allowing that transition.
