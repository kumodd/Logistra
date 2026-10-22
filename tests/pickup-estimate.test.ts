import test from "node:test";
import assert from "node:assert/strict";
import { estimatePickupDate, formatPickupEstimate } from "../lib/shipping/pickup-estimate.ts";
import type { NormalizedCourierRate } from "../lib/shipping/types.ts";

function courier(overrides: Partial<NormalizedCourierRate> = {}): NormalizedCourierRate {
  return {
    courierCompanyId: 7,
    courierName: "Test courier",
    freightCharge: 65,
    codCharges: 0,
    additionalCharges: 0,
    totalCharge: 65,
    estimatedDeliveryDays: 3,
    etd: "Oct 25, 2026",
    pickupDate: null,
    cutoffTime: "11:00",
    pickupDelayFrom: null,
    pickupDelayTo: null,
    suppressDate: null,
    suppressText: null,
    estimatedPickupDate: null,
    rating: 4.4,
    codAvailable: false,
    chargeWeightKg: 0.5,
    rtoCharges: null,
    ...overrides,
  };
}

const beforeCutoff = "2026-10-22T04:29:59.000Z"; // 09:59:59 in Asia/Kolkata

test("uses today before cutoff on an eligible working day", () => {
  assert.equal(estimatePickupDate(courier(), beforeCutoff), "2026-10-22");
});

test("moves to the next working day exactly at cutoff", () => {
  assert.equal(estimatePickupDate(courier(), "2026-10-22T05:30:00.000Z"), "2026-10-23");
});

test("moves to the next working day after cutoff", () => {
  assert.equal(estimatePickupDate(courier(), "2026-10-22T05:30:01.000Z"), "2026-10-23");
});

test("skips a current non-working day", () => {
  assert.equal(estimatePickupDate(courier(), "2026-10-24T04:30:00.000Z"), "2026-10-26");
});

test("skips a configured holiday after the initial candidate", () => {
  assert.equal(estimatePickupDate(courier(), "2026-10-22T05:30:00.000Z", { holidays: ["2026-10-23"] }), "2026-10-26");
});

test("moves beyond an applicable pickup-delay interval", () => {
  assert.equal(estimatePickupDate(courier({ pickupDelayFrom: "2026-10-22", pickupDelayTo: "2026-10-23" }), beforeCutoff), "2026-10-26");
});

test("ignores a pickup-delay interval entirely in the past", () => {
  assert.equal(estimatePickupDate(courier({ pickupDelayFrom: "2026-10-18", pickupDelayTo: "2026-10-19" }), beforeCutoff), "2026-10-22");
});

test("handles null suppression data", () => {
  assert.equal(estimatePickupDate(courier({ pickupDelayFrom: null, pickupDelayTo: null }), beforeCutoff), "2026-10-22");
});

test("returns unavailable for missing or malformed cutoff times", () => {
  assert.equal(estimatePickupDate(courier({ cutoffTime: null }), beforeCutoff), null);
  assert.equal(estimatePickupDate(courier({ cutoffTime: "eleven" }), beforeCutoff), null);
});

test("handles malformed courier data without throwing", () => {
  assert.equal(estimatePickupDate({} as unknown as NormalizedCourierRate, beforeCutoff), null);
  assert.equal(estimatePickupDate(null as unknown as NormalizedCourierRate, beforeCutoff), null);
  assert.equal(estimatePickupDate(courier({ cutoffTime: 11 as unknown as string, pickupDelayFrom: 42 as unknown as string }), beforeCutoff), null);
});

test("uses pickup-local time at a UTC date boundary", () => {
  assert.equal(estimatePickupDate(courier(), "2026-10-21T23:45:00.000Z"), "2026-10-22");
});

test("does not invent a boundary for an incomplete delay interval", () => {
  assert.equal(estimatePickupDate(courier({ pickupDelayFrom: "2026-10-22", pickupDelayTo: null }), beforeCutoff), null);
  assert.equal(estimatePickupDate(courier({ pickupDelayFrom: null, pickupDelayTo: "2026-10-21" }), beforeCutoff), "2026-10-22");
});

test("returns unavailable when no eligible date is found within the search limit", () => {
  assert.equal(estimatePickupDate(courier(), beforeCutoff, { nonWorkingWeekdays: [0, 1, 2, 3, 4, 5, 6], maxSearchDays: 2 }), null);
});

test("does not use advisory suppression fields as a date calculation", () => {
  assert.equal(estimatePickupDate(courier({ suppressDate: "2026-10-22", suppressText: "Operational note" }), beforeCutoff), "2026-10-22");
});

test("labels pickup as today or tomorrow using the pickup origin timezone", () => {
  const reference = "2026-10-21T23:45:00.000Z"; // 05:15 on 22 Oct in Asia/Kolkata
  assert.equal(formatPickupEstimate("2026-10-22", reference), "Today · 22 Oct 2026");
  assert.equal(formatPickupEstimate("2026-10-23", reference), "Tomorrow · 23 Oct 2026");
  assert.equal(formatPickupEstimate("2026-10-24", reference), "24 Oct 2026");
});

test("keeps unavailable and malformed pickup estimates honest", () => {
  assert.equal(formatPickupEstimate(null, beforeCutoff), "Pickup estimate unavailable");
  assert.equal(formatPickupEstimate("22 Oct 2026", beforeCutoff), "Pickup estimate unavailable");
});
