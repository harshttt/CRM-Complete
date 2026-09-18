import assert from "node:assert/strict";
import test from "node:test";

import {
  assignSchema,
  createLeadSchema,
  stageSchema,
} from "../src/modules/lead/lead.validation.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../src/modules/task/task.validation.js";
import { createCustomerSchema } from "../src/modules/customer/customer.validation.js";
import { createFollowUpSchema } from "../src/modules/followUp/followUp.validation.js";
import {
  assertCheckInWindow,
  getEarliestCheckInTime,
} from "../src/modules/salesMeeting/salesMeeting.service.js";

const validId = "507f1f77bcf86cd799439011";

test("sales meeting check-in opens exactly 15 minutes before start", () => {
  const scheduledStart = new Date("2026-09-20T10:00:00.000Z");
  const earliestCheckIn = getEarliestCheckInTime(scheduledStart);

  assert.equal(earliestCheckIn.toISOString(), "2026-09-20T09:45:00.000Z");
  assert.doesNotThrow(() =>
    assertCheckInWindow(earliestCheckIn, scheduledStart)
  );
  assert.doesNotThrow(() =>
    assertCheckInWindow(new Date("2026-09-20T10:00:01.000Z"), scheduledStart)
  );
});

test("sales meeting check-in is rejected before the 15-minute window", () => {
  const scheduledStart = new Date("2026-09-20T10:00:00.000Z");
  const tooEarly = new Date("2026-09-20T09:44:59.999Z");

  assert.throws(
    () => assertCheckInWindow(tooEarly, scheduledStart),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Check-in not allowed yet/);
      return true;
    }
  );
});

test("a lead requires a name and phone number", () => {
  const result = createLeadSchema.validate({ fullName: "Ada Lovelace" });

  assert.ok(result.error);
  assert.match(result.error.message, /phone/);
});

test("lead sources and tags are restricted to supported values", () => {
  const invalidSource = createLeadSchema.validate({
    fullName: "Ada Lovelace",
    phone: "555-0100",
    source: "unknown-channel",
  });
  const invalidTag = createLeadSchema.validate({
    fullName: "Ada Lovelace",
    phone: "555-0100",
    tags: ["critical"],
  });

  assert.ok(invalidSource.error);
  assert.ok(invalidTag.error);
});

test("lead stages and assignments require valid controlled values", () => {
  const invalidStage = stageSchema.validate({ stage: "made-up-stage" });
  const invalidAssignment = assignSchema.validate({ assignedTo: "not-an-id" });

  assert.ok(invalidStage.error);
  assert.ok(invalidAssignment.error);
  assert.equal(assignSchema.validate({ assignedTo: validId }).error, undefined);
});

test("tasks require a supported type and due date", () => {
  const missingDueDate = createTaskSchema.validate({
    title: "Call prospect",
    type: "call",
  });
  const invalidType = createTaskSchema.validate({
    title: "Call prospect",
    type: "chat",
    dueDate: "2026-09-20T10:00:00.000Z",
  });

  assert.ok(missingDueDate.error);
  assert.ok(invalidType.error);
});

test("task status can only use supported lifecycle states", () => {
  const valid = updateTaskSchema.validate({ status: "completed" });
  const invalid = updateTaskSchema.validate({ status: "done" });

  assert.equal(valid.error, undefined);
  assert.ok(invalid.error);
});

test("customers require a name and enforce valid coordinates and email", () => {
  const missingName = createCustomerSchema.validate({ email: "person@example.com" });
  const invalidLocation = createCustomerSchema.validate({
    name: "Example Customer",
    latitude: 95,
  });
  const invalidEmail = createCustomerSchema.validate({
    name: "Example Customer",
    email: "not-an-email",
  });

  assert.ok(missingName.error);
  assert.ok(invalidLocation.error);
  assert.ok(invalidEmail.error);
});

test("follow-ups require valid meeting, customer, owner, title, and due date", () => {
  const valid = createFollowUpSchema.validate({
    meetingId: validId,
    customerId: validId,
    title: "Send proposal",
    ownerId: validId,
    dueDate: "2026-09-22",
  });
  const invalid = createFollowUpSchema.validate({
    meetingId: validId,
    customerId: validId,
    title: "Send proposal",
    ownerId: "invalid-owner",
    dueDate: "2026-09-22",
  });

  assert.equal(valid.error, undefined);
  assert.ok(invalid.error);
});