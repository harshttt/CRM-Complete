import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

const IST_TZ = "Asia/Kolkata";
const FORMAT = "DD/MM/YYYY hh:mm:ss A";

dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export function parseToUtc(dateInput) {
  if (typeof dateInput === "string" && dateInput.includes("T")) {
    const iso = dayjs(dateInput);
    if (!iso.isValid()) {
      throw new Error("Invalid ISO date");
    }
    return iso.utc().toDate();
  }
  const ist = dayjs.tz(
    dateInput,
    "DD/MM/YYYY hh:mm:ss A",
    "Asia/Kolkata"
  );

  if (!ist.isValid()) {
    throw new Error(
      "Invalid scheduledAt format. Use DD/MM/YYYY hh:mm:ss AM/PM"
    );
  }

  return ist.utc().toDate();
}


export function parseToIst(dateInput) {
  const ist = dayjs.tz(dateInput, FORMAT, IST_TZ);
  if (!ist.isValid()) {
    throw new Error("Invalid scheduledAt format. Use DD/MM/YYYY hh:mm:ss AM/PM");
  }
  return ist.toDate();
}

export function formatIst(date) {
  return dayjs(date).tz(IST_TZ).format(FORMAT);
}