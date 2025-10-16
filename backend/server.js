import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra"; // to copy files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure frontend build is copied to backend/dist
const frontendDist = path.join(__dirname, "../frontend/dist");
const backendDist = path.join(__dirname, "dist");

if (!fs.existsSync(backendDist)) {
  fs.copySync(frontendDist, backendDist);
  console.log("✅ Frontend dist copied to backend/dist");
}

app.use(express.static(backendDist));

app.get("*", (req, res) => {
  res.sendFile(path.join(backendDist, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
