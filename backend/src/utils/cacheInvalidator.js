import { cacheDel } from "./cache.js";
import User from "../modules/user/user.model.js";

export async function invalidateUserHierarchyCache(userId) {
  const user = await User.findById(userId)
    .select("parentUser ancestorIds")
    .setOptions({ ignoreDeleted: true });
  if (!user) return;
  await clearUserCache(userId);
  if (user.parentUser) {
    await clearUserCache(user.parentUser);
  }
  if (Array.isArray(user.ancestorIds)) {
    for (const a of user.ancestorIds) {
      await clearUserCache(a);
    }
  }
}

async function clearUserCache(uid) {
  const id = String(uid);

  await cacheDel(`user:${id}`);
  await cacheDel(`user:finalPermissions:${id}`);
  await cacheDel(`user:finalPermissions:${id}:flat`);
  await cacheDel(`user:finalPermissions:${id}:grouped`);
}
