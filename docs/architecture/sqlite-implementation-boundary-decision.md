# SQLite Implementation Boundary Decision

## Decision

The SQLite persistence stack is currently foundation-only. It defines planning shells, readiness summaries, missing-piece reporting, warning aggregation, identity-only SQLite probes, durable identity initialization, create/read/list verification, and repository-facing identity shell reporting.

This note is the boundary for future work: no task should cross from identity-only foundation persistence into gameplay persistence, full repository behavior, or UI wiring unless that work is explicitly scoped.

Identity persistence is approved only for durable save identity records and the minimal `save_metadata` row data needed to prove identity round-tripping. Gameplay persistence is still not approved.

## Current Diagnostics-Only Stack

- `SaveProgressionContractShell` describes future save/progression identity, selected setup references, replay/seed references, and progression/persistence status placeholders.
- `PersistenceAdapterContractShell` describes future adapter kind, storage target, supported operation placeholders, and save progression references.
- `StorageAdapterInterfaceExpectationsShell` describes expected adapter operations and structural capabilities, including unsupported-operation and missing-capability warnings.
- `SaveDataShapeExpectationsShell` describes expected future save sections and required identity, replay, and progression fields.
- `SQLiteSchemaExpectationsShell` describes expected future SQLite tables, primary keys, indexes, replay columns, and progression columns.
- `SQLiteMigrationExpectationsShell` describes expected migration version, migration steps, rollback support, and schema reference readiness.
- `SQLiteAdapterRefinementShell` refines the adapter contract against SQLite-specific capability, schema, migration, and operation support expectations.
- `SQLitePersistenceReadinessSummary` aggregates the planning stack into one diagnostics-only summary with readiness fields, missing persistence pieces, warning summary, and overall SQLite persistence readiness.
- `SQLiteSaveRepositoryContractShell` describes future save repository operation, table, identity field, schema migration, and connection health expectations without exposing repository methods.
- `SQLiteGatedSaveCreationShell` describes a gated save identity creation readiness path and may return a non-gameplay save identity result, but it does not persist anything.
- `SQLiteSaveIdentitySchemaExecutionShell` executes only the approved save identity schema migration against an isolated test-safe SQLite database and reports diagnostics about created identity tables.
- `SQLiteMigrationTrackingInsertShell` inserts only one approved migration tracking row into `schema_migrations` in an isolated test-safe SQLite database.
- `SQLiteSaveIdentityInsertShell` inserts one save identity row and minimal `save_metadata` identity data in an isolated test-safe SQLite database after schema execution and migration tracking.
- `SQLiteSaveIdentityVerificationShell` reads back only the isolated save identity row and minimal save metadata row in a controlled test-safe SQLite database after schema execution, migration tracking, and save identity insert gates.
- `SQLiteSaveRepositoryOrchestrationShell` summarizes the isolated save identity flow and repository contract readiness without exposing repository methods or durable storage.
- `SQLiteDurableSaveIdentityPathBoundaryShell` gates durable identity paths before any file-backed SQLite identity probe is allowed.
- `SQLiteDurableSaveIdentityInitializationShell` initializes only the approved identity tables and migration tracking row in an approved durable identity target.
- `SQLiteDurableSaveIdentityInsertShell` inserts only one approved save identity row and one minimal metadata row into an initialized durable identity target.
- `SQLiteDurableSaveIdentityVerificationShell` reads back only that durable save identity row and minimal metadata row for verification.
- `SQLiteDurableSaveIdentityRepositoryCreateShell` is the repository-facing `createSave` identity shell. It may orchestrate durable identity initialization, insert, and verification, but it does not expose a repository object or callable repository methods.
- `SQLiteDurableSaveIdentityRepositoryReadShell` is the identity-only read shell. It may read one durable save identity record and minimal metadata needed to verify identity round-tripping, but it does not expose full load behavior or gameplay payloads.
- `SQLiteDurableSaveIdentityRepositoryListShell` is the identity-only list shell. It may list durable save identity records and minimal identity metadata, but it does not expose full save list behavior, gameplay payload summaries, player-facing save management, or UI wiring.
- `SQLiteDurableSaveIdentityRepositoryUpdateContractShell` and `SQLiteDurableSaveIdentityRepositoryDeleteContractShell` remain blocked contract shells only. They must not update or delete durable save data.

All current outputs are foundation diagnostics. They must remain non-gameplay and not player-facing.

## Explicit Non-Implementation

SQLite runtime access is limited to approved identity-only shells.

No full SQLite adapter exists yet.

A diagnostics-only migration runner shell exists for metadata readiness only.

A diagnostics-only schema creation migration definition exists as inert SQL text only.

A diagnostics-only save repository contract shell exists for operation/table/field readiness only.

A gated save creation shell exists for save identity readiness only.

An isolated schema execution shell may open a controlled `:memory:` SQLite database and create only the approved identity tables: `saves`, `save_metadata`, and `schema_migrations`.

An isolated migration tracking insert shell may insert one approved schema migration row into `schema_migrations` after isolated schema execution.

An isolated save identity insert shell may insert one row into `saves` and one minimal identity row into `save_metadata` after schema execution and migration tracking.

An isolated save identity verification shell may query back only the inserted identity row and minimal metadata row from a controlled `:memory:` SQLite database and must not expose full load or list behavior.

A repository orchestration shell may summarize the controlled health, schema execution, migration tracking, save identity insert, save identity verification, and repository contract shells. It must not create callable repository methods or durable persistence behavior.

A durable identity initialization shell may create only the approved identity tables and migration tracking row in an approved durable identity target.

A durable identity insert shell may insert only one save identity row and one minimal metadata row into an approved durable identity target.

A durable identity verification shell may read back only the inserted durable identity row and minimal metadata row from an approved durable identity target.

A repository-facing `createSave` identity shell may orchestrate the durable identity initialization, insert, and verification path. It must not expose a full repository object, full repository methods, or gameplay save behavior.

Identity-only read/list shells may read or list durable save identity records and minimal identity metadata only. They must not become full save load/list behavior, return gameplay payloads, expose player-facing save management, or wire UI save/load/list flows.

No application database connection beyond controlled health checks, isolated identity probes, durable identity initialization, durable identity insert, durable identity verification, and repository-facing identity shell summaries, runtime table alteration, or broad persistence IO exists yet.

No persisted full load/list behavior exists yet beyond identity-only read/list.

No save update behavior exists yet.

No save delete behavior exists yet.

No player-facing save management exists yet.

No UI save/load/list wiring exists yet.

No draft, roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated-text, or GenAI save payloads exist yet.

No full save repository object exists yet.

No save creation is wired into New Game Start, gameplay start, week advancement, draft execution, roster assignment, UI, business systems, fan/social output, generated text, or GenAI.

## Future Approved Implementation Order

1. Add SQLite dependency and connection health check only. This is present.
2. Add migration runner shell. This is present as diagnostics-only metadata readiness.
3. Add schema creation migrations. The identity schema can execute only through approved identity shells.
4. Add save repository contract. This is present as a diagnostics-only shell.
5. Add gated save creation. This is present as a non-gameplay save identity shell.
6. Add durable identity initialization, insert, and verification. This is present for identity fields only.
7. Add repository-facing `createSave` identity shell. This is present without a full repository object or methods.
8. Add identity-only durable read shell. This is present without full load behavior.
9. Add identity-only durable list shell. This is present without full list, player-facing, or UI behavior.
10. Keep update and delete as blocked contract shells only until separately scoped.
11. Add full load/list/delete/update behavior later only if separately scoped.

Each step should be implemented as its own scoped change with tests proving that engine outputs, engine metadata, deterministic replay boundaries, and player-facing output boundaries remain unchanged.

## Boundary Rules

Diagnostics shells may summarize readiness, missing pieces, warnings, identity-only create/read/list counts, schema migration tracking, minimal metadata identity support, and repository-facing identity shell status only.

Implementation code must not be introduced by modifying the diagnostics-only shells.

Save creation must not imply gameplay start. Future gated save creation must remain behind an explicit start/save contract and must not advance weeks, run drafts, assign rosters, calculate business systems, or trigger fan/social outputs.

Persistence must stay outside Match, Show, Fan Reaction, and Social Discourse engine ownership. Engines should continue to operate on explicit inputs and seeded context, not database reads.
