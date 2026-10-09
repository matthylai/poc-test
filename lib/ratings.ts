const OPTIONAL_SCORE_KEYS = [
  "snow",
  "value",
  "lifts",
  "terrain",
  "facilities",
  "crowds",
  "access",
] as const;

export type OptionalScoreKey = (typeof OPTIONAL_SCORE_KEYS)[number];

export type VisitScores = {
  overall: number;
  snow: number | null;
  value: number | null;
  lifts: number | null;
  terrain: number | null;
  facilities: number | null;
  crowds: number | null;
  access: number | null;
};

function wholeScore(
  value: unknown,
  label: string,
  required: boolean,
): number | null {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(`${label} score is required`);
    }
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} must be a whole number from 1 to 5`);
  }

  if (value < 1 || value > 5) {
    throw new Error(`${label} must be from 1 to 5`);
  }

  return value;
}

export function parseVisitScores(input: {
  overall?: unknown;
  snow?: unknown;
  value?: unknown;
  lifts?: unknown;
  terrain?: unknown;
  facilities?: unknown;
  crowds?: unknown;
  access?: unknown;
}): VisitScores {
  const scores = {
    overall: wholeScore(input.overall, "Overall", true),
    snow: wholeScore(input.snow, "Snow", false),
    value: wholeScore(input.value, "Value", false),
    lifts: wholeScore(input.lifts, "Lifts", false),
    terrain: wholeScore(input.terrain, "Terrain", false),
    facilities: wholeScore(input.facilities, "Facilities", false),
    crowds: wholeScore(input.crowds, "Crowds", false),
    access: wholeScore(input.access, "Access", false),
  };

  if (scores.overall === null) {
    throw new Error("Overall score is required");
  }

  return { ...scores, overall: scores.overall };
}

const USERNAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseVisitDate(value: unknown, today: Date): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Visit date must be YYYY-MM-DD");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!real) {
    throw new Error("Visit date must be YYYY-MM-DD");
  }

  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const latestAllowed = new Date(todayUtc);
  latestAllowed.setUTCDate(latestAllowed.getUTCDate() + 1);
  if (date > latestAllowed) {
    throw new Error("Visit date cannot be in the future");
  }

  return value;
}

export function normalizeUsername(value: string): string {
  const username = value.trim().toLowerCase();
  if (
    username.length < 3 ||
    username.length > 20 ||
    !USERNAME.test(username)
  ) {
    throw new Error(
      "Username must be 3 to 20 characters: letters, numbers, and hyphens",
    );
  }
  return username;
}

export { OPTIONAL_SCORE_KEYS };
