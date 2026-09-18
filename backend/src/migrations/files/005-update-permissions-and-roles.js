import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import User from "../../modules/user/user.model.js";

import Lead from "../../modules/lead/lead.model.js";
import Task from "../../modules/task/task.model.js";
import Note from "../../modules/note/note.model.js";
import Meeting from "../../modules/meeting/meeting.model.js";
import Property from "../../modules/property/property.model.js";
import Notification from "../../modules/notification/notification.model.js";
import Activity from "../../modules/activity/activity.model.js";
import SystemActivity from "../../modules/systemActivity/systemActivity.model.js";
import Session from "../../modules/session/session.model.js";
import BatchUpload from "../../modules/batchUpload/batchUpload.model.js";

import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 005: Updating permissions & roles...");
  const masterPermissionList = [

    // Lead
    ["lead:create", "lead", "create"],
    ["lead:read", "lead", "read"],
    ["lead:update", "lead", "update"],
    ["lead:delete", "lead", "delete"],
    ["lead:assign", "lead", "assign"],
    ["lead:reassign", "lead", "reassign"],
    ["lead:duplicate:read", "lead", "duplicate_read"],  
    ["lead:duplicate:update", "lead", "duplicate_update"], 
    ["lead:stage:update", "lead", "stage_update"],
    ["lead:bulk_upload", "lead", "bulk_upload"],
    ["lead:view_history", "lead", "view_history"],

    // Notes
    ["note:add", "note", "add"],
    ["note:read", "note", "read"],

    // Tasks
    ["task:create", "task", "create"],
    ["task:read", "task", "read"],
    ["task:update", "task", "update"],
    ["task:complete", "task", "complete"],

    // Meetings
    ["meeting:create", "meeting", "create"],
    ["meeting:read", "meeting", "read"],
    ["meeting:update", "meeting", "update"],

    // Notifications
    ["notification:read", "notification", "read"],

    // Users / Teams
    ["user:create", "user", "create"],
    ["user:read", "user", "read"],
    ["user:update", "user", "update"],
    ["user:disable", "user", "disable"],
    ["user:assign_role", "user", "assign_role"],
    ["user:view_team", "user", "view_team"],

    // Properties
    ["property:create", "property", "create"],
    ["property:read", "property", "read"],

    // System activity
    ["system_activity:read", "system_activity", "read"],

    // Dashboard & reports
    ["dashboard:view", "dashboard", "view"],
    ["reports:view", "reports", "view"]
  ];

  // Convert to objects
  const permissionData = masterPermissionList.map(p => ({
    name: p[0], module: p[1], action: p[2]
  }));

  logger.info("Updating permissions…");

  // ---------------------------------------------------
  // 2. INSERT MISSING PERMISSIONS (NO DUPLICATES)
  // ---------------------------------------------------
  for (const perm of permissionData) {
    const exists = await Permission.findOne({ name: perm.name });
    if (!exists) {
      await Permission.create(perm);
      logger.info(`Added missing permission: ${perm.name}`);
    }
  }

  logger.info("Permissions updated");

  // Fetch all permissions again
  const allPermissions = await Permission.find({});
  const get = (name) => allPermissions.find(p => p.name === name)?._id;

  // ---------------------------------------------------
  // 3. UPDATED ROLE PERMISSION MATRIX
  // ---------------------------------------------------

  const roleUpdates = {
    superAdmin: allPermissions.map(p => p._id),

    admin: allPermissions
      .filter(p => !["user:disable", "system_activity:read"].includes(p.name))
      .map(p => p._id),

    manager: [
      get("lead:read"),
      get("lead:update"),
      get("lead:assign"),
      get("lead:reassign"),
      get("lead:stage:update"),
      get("lead:view_history"),
      get("lead:duplicate:read"),
      get("lead:duplicate:update"),

      get("task:create"),
      get("task:read"),
      get("task:update"),
      get("task:complete"),

      get("meeting:create"),
      get("meeting:read"),

      get("note:add"),
      get("note:read"),

      get("user:view_team"),

      get("dashboard:view"),
      get("reports:view")
    ].filter(Boolean),

    teamLead: [
      get("lead:read"),
      get("lead:update"),
      get("lead:assign"),
      get("lead:reassign"),
      get("lead:stage:update"),
      get("lead:duplicate:read"),
      get("lead:duplicate:update"),

      get("task:create"),
      get("task:read"),

      get("meeting:create"),
      get("meeting:read"),

      get("note:add"),
      get("note:read"),

      get("user:view_team"),

      get("dashboard:view")
    ].filter(Boolean),

    salesExec: [
      get("lead:read"),
      get("lead:update"),
      get("lead:stage:update"),

      get("task:create"),
      get("task:read"),
      get("task:update"),

      get("meeting:create"),
      get("meeting:read"),

      get("note:add"),
      get("note:read")
    ].filter(Boolean)
  };

  // ---------------------------------------------------
  // 4. APPLY ROLE UPDATES
  // ---------------------------------------------------
  logger.info("Updating roles with new permissions…");

  const existingRoles = await Role.find({});

  for (const role of existingRoles) {
    const rp = roleUpdates[role.name.replace(" ", "")]; // match keys
    if (rp) {
      role.permissions = rp;
      await role.save();
      logger.info(`✔ Updated role: ${role.name}`);
    } else {
      logger.info(`ℹ Skipped role (no mapping defined): ${role.name}`);
    }
  }

  logger.info("Syncing indexes…");

  await Lead.syncIndexes();
  await Task.syncIndexes();
  await Meeting.syncIndexes();
  await Note.syncIndexes();
  await Property.syncIndexes();
  await Notification.syncIndexes();
  await Activity.syncIndexes();
  await SystemActivity.syncIndexes();
  await BatchUpload.syncIndexes();
  await Session.syncIndexes();

  logger.info("Migration 005 completed");
}

export async function down() {
  logger.info("Migration 005 rollback not implemented");
}
