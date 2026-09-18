import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.join(
  process.cwd(),
  "src/config/firebase-adminsdk.json"
);

if (!admin.apps.length && fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))
    ),
  });
}

export default admin;
