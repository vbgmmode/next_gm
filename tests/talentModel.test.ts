import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import * as domainTypes from "../src/game/domain/index.ts";
import type {
  TalentScoutingReport,
  TalentScoutingSignal
} from "../src/game/domain/index.ts";
import {
  sampleTalentProfiles,
  sampleWrestlers
} from "./fixtures/index.ts";

const forbiddenScoutingKeys = [
  "value",
  "hiddenValue",
  "score",
  "rating",
  "rawScore",
  "metric",
  "metrics",
  "internal",
  "internalValue",
  "numericValue"
] as const;

describe("Talent Attribute Model", () => {
  it("imports talent domain types cleanly", () => {
    assert.ok(domainTypes);
  });

  it("constructs sample talent profiles for the fixture wrestlers", () => {
    assert.equal(sampleTalentProfiles.length, 3);
    assert.deepEqual(
      sampleTalentProfiles.map((profile) => profile.wrestlerId),
      sampleWrestlers.map((wrestler) => wrestler.id)
    );
  });

  it("links TalentProfile to Wrestler identity without replacing Wrestler", () => {
    for (const profile of sampleTalentProfiles) {
      const wrestler = sampleWrestlers.find((candidate) => candidate.id === profile.wrestlerId);

      assert.ok(wrestler);
      assert.notEqual(profile.id, wrestler.id);
      assert.equal(profile.scoutingReport.wrestlerId, wrestler.id);
      assert.equal(Object.hasOwn(profile, "name"), false);
      assert.equal(Object.hasOwn(profile, "alignment"), false);
      assert.equal(typeof wrestler.name, "string");
      assert.equal(typeof wrestler.alignment, "string");
    }
  });

  it("allows internal talent attributes and state to contain numeric simulation values", () => {
    for (const profile of sampleTalentProfiles) {
      assertContainsNumericValues(profile.attributes);
      assertContainsNumericValues(profile.condition);
      assertContainsNumericValues(profile.momentum);
      assertContainsNumericValues(profile.perception);
      assertContainsNumericValues(profile.backstage);
    }
  });

  it("keeps TalentScoutingReport player-facing and free of raw numeric values", () => {
    for (const profile of sampleTalentProfiles) {
      assertTalentScoutingReportDoesNotExposeRawValues(profile.scoutingReport);
    }
  });

  it("rejects scouting signals with raw internal field names", () => {
    assert.throws(
      () =>
        assertTalentScoutingSignalDoesNotExposeRawValues({
          ...sampleTalentProfiles[0].scoutingReport.signals[0],
          score: "hidden"
        } as TalentScoutingSignal),
      /score/
    );
  });

  it("rejects scouting signals with numeric raw values", () => {
    assert.throws(
      () =>
        assertTalentScoutingSignalDoesNotExposeRawValues({
          ...sampleTalentProfiles[0].scoutingReport.signals[0],
          rawRead: 82
        } as TalentScoutingSignal),
      /numeric/
    );
  });

  it("keeps scouting labels number-free for now", () => {
    for (const profile of sampleTalentProfiles) {
      for (const signal of profile.scoutingReport.signals) {
        assert.doesNotMatch(signal.label, /\d/);
      }
    }
  });

  it("does not use the global random API directly in source or tests", () => {
    const forbidden = "Math" + "." + "random";
    const matches = findTypeScriptFiles(["src", "tests"]).filter((filePath) =>
      readFileSync(filePath, "utf8").includes(forbidden)
    );

    assert.deepEqual(matches, []);
  });
});

function assertContainsNumericValues(value: object): void {
  assert.ok(Object.values(value).some((item) => typeof item === "number"));
}

function assertTalentScoutingReportDoesNotExposeRawValues(report: TalentScoutingReport): void {
  assertNoForbiddenKeysOrNumericLeaves(report, "talent scouting report");

  for (const signal of report.signals) {
    assertTalentScoutingSignalDoesNotExposeRawValues(signal);
  }
}

function assertTalentScoutingSignalDoesNotExposeRawValues(signal: TalentScoutingSignal): void {
  assertNoForbiddenKeysOrNumericLeaves(signal, "talent scouting signal");
}

function assertNoForbiddenKeysOrNumericLeaves(value: unknown, path: string): void {
  if (typeof value === "number") {
    assert.fail(`${path} must not expose raw numeric values.`);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertNoForbiddenKeysOrNumericLeaves(item, `${path}[${index}]`);
    });

    return;
  }

  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      assert.equal(
        forbiddenScoutingKeys.includes(key as (typeof forbiddenScoutingKeys)[number]),
        false,
        `${path} must not expose raw/internal field "${key}".`
      );
      assertNoForbiddenKeysOrNumericLeaves(
        (value as Record<string, unknown>)[key],
        `${path}.${key}`
      );
    }
  }
}

function findTypeScriptFiles(relativeDirectories: readonly string[]): string[] {
  return relativeDirectories.flatMap((directory) => walk(directory));
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });
}
