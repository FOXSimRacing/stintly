// Fictitious car_ids, deliberately outside any real iRacing car ID range.
// Field names/shape are best-effort from public community docs of the real
// Data API (/data/car/get) — see stintly-iracing-data-api skill.
export const carFixtures: Record<
  string,
  {
    car_id: number;
    car_name: string;
    car_name_abbreviated: string;
  }
> = {
  "70001": { car_id: 70001, car_name: "Ferrari 296 GT3", car_name_abbreviated: "296GT3" },
  "70002": { car_id: 70002, car_name: "BMW M4 GT3", car_name_abbreviated: "M4GT3" },
  "70003": { car_id: 70003, car_name: "Porsche 992 GT3 R", car_name_abbreviated: "992R" },
  "70004": { car_id: 70004, car_name: "Audi R8 LMS GT3 EVO II", car_name_abbreviated: "R8EVOII" },
  "70005": { car_id: 70005, car_name: "Ligier JS P320", car_name_abbreviated: "JSP320" },
  "70006": { car_id: 70006, car_name: "Oreca LMP2", car_name_abbreviated: "LMP2" },
};
