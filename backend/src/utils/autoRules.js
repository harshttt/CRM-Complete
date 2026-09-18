export const NI_KEYWORDS = [
  "ni",
  "not interested",
  "not-interested",
  "no interest",
  "dont call",
  "don't call",
  "no thanks",
  "not interested right now",
];



export function isNIComment(text = "") {
  if (!text) return false;
  const lower = text.toLowerCase();
  return NI_KEYWORDS.some(k => lower.includes(k));
}

export function isNITag(tags = []) {
  const lowerTags = tags.map(t => t.toLowerCase());
  return NI_KEYWORDS.some(k => lowerTags.includes(k));
}

  export async function sendNotification({ userId, title, message, data }) {
  console.log("🔔 NOTIFICATION", {
    userId,
    title,
    message,
    data
  });

  return true;
}
