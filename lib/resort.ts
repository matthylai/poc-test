export type ScoreAverages = {
  overall: number | string | null;
  snow: number | string | null;
  value: number | string | null;
  lifts: number | string | null;
  terrain: number | string | null;
  facilities: number | string | null;
  crowds: number | string | null;
  access: number | string | null;
};

export type ResortCard = ScoreAverages & {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  review_count: number;
};

export type ReviewRow = {
  id: string;
  user_id: string;
  resort_id: string;
  visited_on: string;
  body: string;
  rating_overall: number;
  rating_snow: number | null;
  rating_value: number | null;
  rating_lifts: number | null;
  rating_terrain: number | null;
  rating_facilities: number | null;
  rating_crowds: number | null;
  rating_access: number | null;
  profiles: { username: string; display_name: string } | null;
};

export function formatAverage(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return "—";
  }
  return number.toFixed(1);
}

export function placeLabel(resort: { region: string; country: string }) {
  return [resort.region, resort.country].filter(Boolean).join(", ");
}
