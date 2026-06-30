import crypto from "node:crypto";
import { userModel } from "@repo/db-nosql";
import { USER_ROLE, type partnerUserInfoInTokenType } from "@repo/types";
import type { Types } from "mongoose";

export async function findOrCreateTenantUser(
  partnerUser: partnerUserInfoInTokenType,
  tenantId: Types.ObjectId
) {
  let user = await userModel.findOne({
    phone_number: partnerUser.phone_number,
    tenant_id: tenantId,
  });

  if (!user) {
    user = await userModel.create({
      phone_number: partnerUser.phone_number,
      full_name: partnerUser.full_name?.toLowerCase() ?? undefined,
      email: partnerUser.email ?? undefined,
      tenant_id: tenantId,
      type: USER_ROLE.TENANT,
      hashed_password: crypto.randomBytes(32).toString("hex"),
    });
  } else if (partnerUser.full_name && !user.full_name) {
    user.full_name = partnerUser.full_name.toLowerCase();
    await user.save();
  }

  return user;
}
