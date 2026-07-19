import { oauthHandlers } from "./handlers/oauth";
import { memberHandlers } from "./handlers/member";
import { referenceHandlers } from "./handlers/reference";
import { resultsHandlers } from "./handlers/results";

export const handlers = [...oauthHandlers, ...memberHandlers, ...referenceHandlers, ...resultsHandlers];
