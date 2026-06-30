import { ApiError } from "@repo/utils";
import { asyncHandler } from "../utils";

/** Profile settings are only available to standalone (non-tenant) users. */
export const standaloneOnly = asyncHandler(async (req, _res, next) => {
  if (req.user?.tenant_id) {
    throw new ApiError(403, "Profile settings are only available in the standalone app");
  }
  next();
});
