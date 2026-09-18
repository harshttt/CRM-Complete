/**
 * Seed permissions for the Sales Meeting & Visit Management System.
 *
 * Run: node src/migrations/seed-sales-meeting-permissions.js
 *
 * This creates Permission documents that can then be assigned to Roles
 * via the admin UI or directly in the database.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

// Dynamically import Permission model — same pattern used in the existing codebase
const permissionSchemaImport = await import("../modules/permission/permission.model.js");
const Permission = permissionSchemaImport.default;

// Import Role model to assign permissions to roles
const roleSchemaImport = await import("../modules/role/role.model.js");
const Role = roleSchemaImport.default;

const PERMISSIONS = [
  // Sales Meeting
  { name: "salesMeeting:create", module: "salesMeeting", action: "create", description: "Create sales meetings" },
  { name: "salesMeeting:read", module: "salesMeeting", action: "read", description: "View sales meetings" },
  { name: "salesMeeting:update", module: "salesMeeting", action: "update", description: "Update & transition sales meetings" },
  { name: "salesMeeting:delete", module: "salesMeeting", action: "delete", description: "Delete sales meetings" },
  { name: "salesMeeting:reopen", module: "salesMeeting", action: "reopen", description: "Reopen completed meetings (Manager/Admin)" },

  // Customer
  { name: "customer:create", module: "customer", action: "create", description: "Create customers" },
  { name: "customer:read", module: "customer", action: "read", description: "View customers" },
  { name: "customer:update", module: "customer", action: "update", description: "Update customers" },
  { name: "customer:delete", module: "customer", action: "delete", description: "Delete customers" },

  // Follow-Up
  { name: "followUp:create", module: "followUp", action: "create", description: "Create follow-ups" },
  { name: "followUp:read", module: "followUp", action: "read", description: "View follow-ups" },
  { name: "followUp:update", module: "followUp", action: "update", description: "Update follow-ups" },
  { name: "followUp:delete", module: "followUp", action: "delete", description: "Delete follow-ups" },
  { name: "followUp:complete", module: "followUp", action: "complete", description: "Complete follow-ups" },
];

// Permissions that should be assigned to ALL roles (including sales/executive)
const SALES_MEETING_PERMS_FOR_ALL_ROLES = [
  "salesMeeting:read",
  "salesMeeting:create",
  "salesMeeting:update",
  "salesMeeting:delete",
];

async function seed() {
  await connectDB();
  console.log("Seeding sales-meeting permissions...");

  let created = 0;
  let skipped = 0;

  for (const perm of PERMISSIONS) {
    const exists = await Permission.findOne({ name: perm.name });
    if (exists) {
      console.log(`  SKIP  ${perm.name} (already exists)`);
      skipped++;
      continue;
    }
    await Permission.create(perm);
    console.log(`  ADD   ${perm.name}`);
    created++;
  }

  console.log(`\nPermissions done. Created: ${created}, Skipped: ${skipped}`);

  // ── Step 2: Assign salesMeeting permissions to all roles ──
  console.log("\nAssigning salesMeeting permissions to all roles...");

  const permDocs = await Permission.find({
    name: { $in: SALES_MEETING_PERMS_FOR_ALL_ROLES },
  }).lean();
  const permIds = permDocs.map((p) => p._id);

  if (permIds.length === 0) {
    console.log("  ⚠ No salesMeeting permission docs found – skipping role assignment.");
  } else {
    const roles = await Role.find({ isDeleted: { $ne: true } });

    for (const role of roles) {
      const existingIds = role.permissions.map((id) => String(id));
      const newIds = permIds.filter((id) => !existingIds.includes(String(id)));

      if (newIds.length === 0) {
        console.log(`  SKIP  Role "${role.name}" – already has all salesMeeting perms`);
        continue;
      }

      role.permissions.push(...newIds);
      await role.save();
      console.log(`  UPDATED  Role "${role.name}" – added ${newIds.length} permission(s)`);
    }
  }

  console.log("\nAll done.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
