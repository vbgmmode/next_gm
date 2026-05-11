import {
  type NewGMModeStaticWrestlerFixture,
  type NewGMModeStaticWrestlerFixtureCatalogShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";

export interface NewGMModeStaticWrestlerFixtureCatalogMetrics {
  readonly totalFixtureCount: number;
  readonly eligibleFixtureCount: number;
  readonly ineligibleFixtureCount: number;
  readonly eligibleSourceRosterPoolCounts: Readonly<
    Record<"Raw" | "SmackDown" | "NXT" | "AEW", number>
  >;
}

export function createNewGMModeStaticWrestlerFixtureCatalogMetrics(
  catalog: NewGMModeStaticWrestlerFixtureCatalogShell =
    createNewGMModeStaticWrestlerFixtureCatalogShell()
): NewGMModeStaticWrestlerFixtureCatalogMetrics {
  const eligibleFixtures = catalog.fixtures.filter(isEligibleFixture);

  return Object.freeze({
    totalFixtureCount: catalog.fixtures.length,
    eligibleFixtureCount: eligibleFixtures.length,
    ineligibleFixtureCount: catalog.fixtures.length - eligibleFixtures.length,
    eligibleSourceRosterPoolCounts: Object.freeze({
      Raw: countEligiblePoolFixtures(eligibleFixtures, "Raw"),
      SmackDown: countEligiblePoolFixtures(eligibleFixtures, "SmackDown"),
      NXT: countEligiblePoolFixtures(eligibleFixtures, "NXT"),
      AEW: countEligiblePoolFixtures(eligibleFixtures, "AEW")
    })
  });
}

function isEligibleFixture(fixture: NewGMModeStaticWrestlerFixture): boolean {
  return fixture.draftEligibility.eligible && fixture.availabilityStatus === "available";
}

function countEligiblePoolFixtures(
  fixtures: readonly NewGMModeStaticWrestlerFixture[],
  sourceRosterPool: keyof NewGMModeStaticWrestlerFixtureCatalogMetrics["eligibleSourceRosterPoolCounts"]
): number {
  return fixtures.filter((fixture) => fixture.sourceRosterPool === sourceRosterPool).length;
}
