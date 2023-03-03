import { Review } from "./reviews";
import { Intent } from "./types/intent";

export function determineIntent(hasLabel: boolean, review: Review | undefined): Intent {
  if (hasLabel && !review) {
    return Intent.Approve;
  }
  else if (!hasLabel && review?.state === 'APPROVE') {
    return Intent.Dismiss;
  }
  return Intent.DoNothing;
}