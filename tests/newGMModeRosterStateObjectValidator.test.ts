import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterStateObject,
  createNewGMModeRosterStateObjectValidator
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const explicitInput = {
  rosterStateIdSeedReference: "next-gm-roster-state-alpha",
  brandRosterReference: "brand-red-roster",
  assignedWrestlerMembershipReferences: [
    "wrestler-alpha-membership",
    "wrestler-beta-membership"
  ] as const,
  sourceRosterAssignmentResultObjectIds: [
    "new-gm-mode-draft-pick-roster-assignment-result:alpha"
  ] as const,
  rosterStateStatus:
    "roster-state-object-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "persistence-unavailable",
    "roster-state-creation-not-implemented"
  ] as const,
  versionReference: "v0.1-placeholder"
};
const rosterStateObject = createNewGMModeRosterStateObject(explicitInput);

describe("New GM Mode Roster State Object Validator v0.1", () => {
  it("accepts a generated roster state object as structurally valid", () => {
    const result = createNewGMModeRosterStateObjectValidator({
      rosterStateObject
    });

    assert.equal(
      result.validatorId,
      "new-gm-mode-roster-state-object-validator-v0.1"
    );
    assert.equal(result.version, "0.1");
    assert.equal(result.domainObject, true);
    assert.equal(result.diagnosticsOnly, false);
    assert.equal(result.playerFacing, false);
    assert.equal(result.gameplayAffecting, false);
    assert.equal(result.mutable, false);
    assert.equal(result.validationOnly, true);
    assert.equal(result.structurallyValid, true);
    assert.equal(result.issueCount, 0);
    assert.deepEqual(result.issues, []);
  });

  it("produces deterministic issue IDs for malformed injected objects", () => {
    const malformed = JSON.parse(JSON.stringify(rosterStateObject));
    delete malformed.rosterStateSeedReference.rosterStateIdSeedReference;
    delete malformed.brandRosterReference.brandRosterReference;
    delete malformed.versionReference.versionReference;
    const first = issueIdsFor(malformed);
    const second = issueIdsFor(malformed);

    assert.deepEqual(first, [
      "roster-state-id-seed-reference-missing",
      "brand-roster-reference-missing",
      "version-reference-missing"
    ]);
    assert.deepEqual(first, second);
  });

  it("detects missing or mismatched rosterStateObjectId", () => {
    const missing = JSON.parse(JSON.stringify(rosterStateObject));
    delete missing.rosterStateObjectId;
    const mismatched = {
      ...rosterStateObject,
      rosterStateObjectId: "not-the-deterministic-id"
    };

    assert.deepEqual(issueIdsFor(missing), [
      "roster-state-object-id-missing"
    ]);
    assert.deepEqual(issueIdsFor(mismatched), [
      "roster-state-object-id-not-deterministic"
    ]);
  });

  it("detects missing required references", () => {
    const malformed = JSON.parse(JSON.stringify(rosterStateObject));
    delete malformed.rosterStateSeedReference.rosterStateIdSeedReference;
    delete malformed.brandRosterReference.brandRosterReference;
    delete malformed.assignedWrestlerMembershipReferences;
    delete malformed.sourceRosterAssignmentResultObjectIds;
    delete malformed.versionReference.versionReference;

    assert.deepEqual(issueIdsFor(malformed), [
      "roster-state-id-seed-reference-missing",
      "brand-roster-reference-missing",
      "assigned-wrestler-membership-references-missing",
      "source-roster-assignment-result-object-ids-missing",
      "version-reference-missing"
    ]);
  });

  it("detects malformed membership and assignment result reference arrays", () => {
    const malformed = JSON.parse(JSON.stringify(rosterStateObject));
    malformed.assignedWrestlerMembershipReferences = ["ok", ""];
    malformed.sourceRosterAssignmentResultObjectIds = ["ok", 123];

    assert.deepEqual(issueIdsFor(malformed), [
      "assigned-wrestler-membership-reference-invalid",
      "source-roster-assignment-result-object-id-invalid"
    ]);
  });

  it("detects unknown rosterStateStatus", () => {
    const malformed = {
      ...rosterStateObject,
      rosterStateStatus: "roster-state-from-assignment-data"
    };

    assert.deepEqual(issueIdsFor(malformed), [
      "roster-state-object-id-not-deterministic",
      "roster-state-status-unknown"
    ]);
  });

  it("detects missing blockedReasonIds and IDs outside the static roster state catalog", () => {
    const missing = JSON.parse(JSON.stringify(rosterStateObject));
    delete missing.blockedReasonReferences.blockedReasonIds;
    const unknown = JSON.parse(JSON.stringify(rosterStateObject));
    unknown.blockedReasonReferences.blockedReasonIds = [
      "not-in-static-catalog"
    ];

    assert.deepEqual(issueIdsFor(missing), ["blocked-reason-ids-missing"]);
    assert.deepEqual(issueIdsFor(unknown), [
      "roster-state-object-id-not-deterministic",
      "blocked-reason-id-not-in-static-catalog"
    ]);
  });

  it("detects incorrect domain flags", () => {
    const malformed = {
      ...rosterStateObject,
      domainObject: false,
      diagnosticsOnly: true,
      playerFacing: true,
      gameplayAffecting: true,
      mutable: true
    };

    assert.deepEqual(issueIdsFor(malformed), [
      "domain-object-flag-invalid",
      "diagnostics-only-flag-invalid",
      "player-facing-flag-invalid",
      "gameplay-affecting-flag-invalid",
      "mutable-flag-invalid"
    ]);
  });

  it("detects missing or incorrectly enabled capability flags", () => {
    const missingFlags = JSON.parse(JSON.stringify(rosterStateObject));
    delete missingFlags.capabilityFlags;
    const enabled = JSON.parse(JSON.stringify(rosterStateObject));
    enabled.capabilityFlags.canMutateRosterState = true;
    enabled.capabilityFlags.canPersistGameplayPayload = true;
    enabled.capabilityFlags.canStartGameplay = true;
    enabled.capabilityFlags.canInitializeWeekOne = true;
    enabled.capabilityFlags.canUnlockWeekOne = true;

    assert.deepEqual(issueIdsFor(missingFlags), ["capability-flags-missing"]);
    assert.deepEqual(issueIdsFor(enabled), [
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid"
    ]);
  });

  it("detects forbidden selected wrestler, selected candidate object, real mutation, state, persistence, UI, generated text, and GenAI fields", () => {
    const malformed = {
      ...rosterStateObject,
      selectedWrestler: "not-allowed",
      selectedCandidateObject: {},
      draftState: {},
      realRosterMutation: {},
      championshipDivision: {},
      match: {},
      show: {},
      week: {},
      calendar: {},
      savePayload: {},
      sqlite: {},
      ui: {},
      generatedText: "",
      genAI: {}
    };

    assert.equal(
      issueIdsFor(malformed).filter(
        (issueId) => issueId === "forbidden-field-present"
      ).length,
      14
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-state-object-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterStateObjectValidator({ rosterStateObject });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });

  it("keeps direct unseeded entropy calls out of source and tests", () => {
    const forbiddenCall = ["Math", "random"].join(".");
    const matches = findTextMatches(["src", "tests"], forbiddenCall);

    assert.deepEqual(matches, []);
  });
});

function issueIdsFor(source: unknown): readonly string[] {
  return createNewGMModeRosterStateObjectValidator({
    rosterStateObject: source
  }).issues.map((issue) => issue.issueId);
}

function findTextMatches(paths: readonly string[], text: string): string[] {
  return paths.flatMap((path) => scanPath(path, text));
}

function scanPath(path: string, text: string): string[] {
  const stats = statSync(path);

  if (stats.isDirectory()) {
    return readdirSync(path).flatMap((entry) => scanPath(join(path, entry), text));
  }

  if (!path.endsWith(".ts")) {
    return [];
  }

  return readFileSync(path, "utf8").includes(text) ? [path] : [];
}
