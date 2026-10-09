import { describe, expect, it } from "vitest";
import { normalizeUsername, parseVisitDate, parseVisitScores } from "./ratings";

describe("parseVisitScores", () => {
  it("accepts an overall score and leaves the other scores blank", () => {
    expect(
      parseVisitScores({
        overall: 4,
      }),
    ).toEqual({
      overall: 4,
      snow: null,
      value: null,
      lifts: null,
      terrain: null,
      facilities: null,
      crowds: null,
      access: null,
    });
  });

  it("accepts every optional score", () => {
    expect(
      parseVisitScores({
        overall: 5,
        snow: 4,
        value: 3,
        lifts: 2,
        terrain: 5,
        facilities: 4,
        crowds: 1,
        access: 3,
      }),
    ).toMatchObject({ snow: 4, crowds: 1, access: 3 });
  });

  it("rejects an overall score outside 1 to 5", () => {
    expect(() => parseVisitScores({ overall: 0 })).toThrow(/overall/i);
    expect(() => parseVisitScores({ overall: 6 })).toThrow(/overall/i);
  });

  it("rejects a fractional score", () => {
    expect(() => parseVisitScores({ overall: 4.5 })).toThrow(/whole/i);
  });

  it("rejects an optional score outside 1 to 5", () => {
    expect(() => parseVisitScores({ overall: 3, snow: 0 })).toThrow(/snow/i);
  });
});

describe("parseVisitDate", () => {
  const today = new Date("2026-10-09T12:00:00Z");

  it("accepts a past date and the next calendar day", () => {
    expect(parseVisitDate("2026-02-14", today)).toBe("2026-02-14");
    expect(parseVisitDate("2026-10-10", today)).toBe("2026-10-10");
  });

  it("rejects a future date and a nonsense calendar day", () => {
    expect(() => parseVisitDate("2026-12-01", today)).toThrow(/future/i);
    expect(() => parseVisitDate("2026-02-31", today)).toThrow(/date/i);
  });
});
describe("normalizeUsername", () => {
  it("lowercases a handle and keeps digits and hyphens", () => {
    expect(normalizeUsername("Ski-Day-1")).toBe("ski-day-1");
  });

  it("rejects a handle that is too short or has spaces", () => {
    expect(() => normalizeUsername("ab")).toThrow(/username/i);
    expect(() => normalizeUsername("ski day")).toThrow(/username/i);
  });
});
