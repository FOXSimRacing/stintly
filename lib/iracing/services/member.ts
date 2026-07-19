import { fetchIracingData } from "../client";
import { memberSummarySchema, type MemberSummary } from "../schemas/member";

export async function getMemberSummary(custId: number): Promise<MemberSummary> {
  return fetchIracingData("/data/member/summary", { cust_id: custId }, memberSummarySchema);
}
