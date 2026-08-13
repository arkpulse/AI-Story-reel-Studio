/**
 * Storyreel Studio — backend entry point.
 *
 * This server exists for ONE reason: keep every AI provider API key
 * off the browser. The frontend never talks to OpenAI, ElevenLabs,
 * Runway, etc. directly — it only ever calls routes on this server,
 * and this server holds the real credentials (see config/env.js).
 *
 * Run:
 *   cp .env.example .env   # fill in the keys you actually have
 *   npm install
 *   npm start
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const storyRoutes = require("./routes/story.routes");
const sceneRoutes = require("./routes/scenes.routes");
const characterRoutes = require("./routes/characters.routes");
const voiceRoutes = require("./routes/voice.routes");
const imageRoutes = require("./routes/images.routes");
const animationRoutes = require("./routes/animation.routes");
const audioRoutes = require("./routes/audio.routes");
const editRoutes = require("./routes/edit.routes");
const thumbnailRoutes = require("./routes/thumbnails.routes");
const seoRoutes = require("./routes/seo.routes");
const projectRoutes = require("./routes/projects.routes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Generated audio/image/video files land in backend/generated/* and are
// served back to the frontend from here. Swap for real cloud storage
// (S3/GCS) + signed URLs before deploying anywhere but localhost.
app.use("/generated", express.static(require("path").join(__dirname, "generated")));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "storyreel-studio-backend" }));

app.use("/api/story", storyRoutes);
app.use("/api/scenes", sceneRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/animation", animationRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/thumbnails", thumbnailRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/projects", projectRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Storyreel Studio backend listening on :${PORT}`));
