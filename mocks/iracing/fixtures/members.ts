// Fictitious cust_ids, deliberately outside any real iRacing member ID range.
// Field names/shape are best-effort from public community docs of the real
// Data API (/data/member/summary) — see stintly-iracing-data-api skill.
export const memberSummaryFixtures: Record<
  string,
  {
    cust_id: number;
    display_name: string;
    irating: number;
    safety_rating: string;
  }
> = {
  "100001": {
    cust_id: 100001,
    display_name: "Ana Torres",
    irating: 4820,
    safety_rating: "A 4.99",
  },
  "100002": {
    cust_id: 100002,
    display_name: "Marco Belli",
    irating: 2760,
    safety_rating: "B 3.42",
  },
  "100003": {
    cust_id: 100003,
    display_name: "Sofia Nakamura",
    irating: 6150,
    safety_rating: "A 4.65",
  },
  "100004": {
    cust_id: 100004,
    display_name: "Diego Fernandes",
    irating: 1820,
    safety_rating: "C 2.31",
  },
  "100005": {
    cust_id: 100005,
    display_name: "Priya Shah",
    irating: 980,
    safety_rating: "R 0.00",
  },
};
