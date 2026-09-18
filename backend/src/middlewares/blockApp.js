// middlewares/blockApp.js
export const blockMobileApp = (req, res, next) => {
  // 🔒 App-specific headers (you control these)
  const appHeaders = [
    req.headers["x-app-source"],
    req.headers["x-client-type"],
  ];

  // 🔍 Detect Flutter / Android / iOS by User-Agent
  const userAgent = req.headers["user-agent"] || "";
  const isMobileAppUA =
    userAgent.includes("Flutter") ||
    userAgent.includes("okhttp") ||
    userAgent.includes("Dart");

  // ❌ Block ONLY app
  if (appHeaders.includes("mobile") || isMobileAppUA) {
    return res.status(403).json({
      message: "Mobile app access is not allowed",
    });
  }

  next();
};
