export type IracingTeamOption = {
  iracingTeamId: number;
  name: string;
};

// Stand-in for iRacing's team lookup until we have API client/credentials
// wired up (see issue #3) — the real version will need to authenticate as
// the member and fetch their actual iRacing teams, which is why this is
// already async: swapping the body for a real fetch won't change the
// signature, so no call site (app/onboarding/page.tsx -> CreateTeamForm ->
// createTeam action) needs to change when that lands.
export async function getIracingTeamOptions(): Promise<IracingTeamOption[]> {
  return [
    { iracingTeamId: 100234, name: "FOX Sim Racing" },
    { iracingTeamId: 100567, name: "Apex Predators Racing" },
    { iracingTeamId: 101089, name: "Midnight Endurance Team" },
    { iracingTeamId: 101342, name: "Redline Motorsport" },
    { iracingTeamId: 101788, name: "Nightshift Racing" },
    { iracingTeamId: 102015, name: "Checkered Flag Collective" },
  ];
}
