/**
 * Animation / image-to-video service — Google Veo, via the Gemini API's
 * long-running video generation endpoint.
 * Docs: https://ai.google.dev/gemini-api/docs/video
 *
 * Veo jobs are asynchronous: submit -> poll an operation name -> download
 * the finished video once done=true. Runway/Luma/Kling/Pika follow a
 * similar submit+poll shape if you add their keys later — see the
 * commented block below for that pattern.
 */
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

async function submitAnimationJob({ imagePath, prompt, cameraMovement }) {
  if (!env.isConfigured("veoApiKey")) {
    throw Object.assign(new Error("VEO_API_KEY is not configured on the server."), { status: 501 });
  }

  const body = {
    instances: [
      {
        prompt: `${prompt}. Camera movement: ${cameraMovement}. Gentle, kid-friendly animation.`,
        ...(imagePath
          ? { image: { bytesBase64Encoded: fs.readFileSync(imagePath).toString("base64"), mimeType: "image/png" } }
          : {}),
      },
    ],
    parameters: { aspectRatio: "16:9" },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${env.veoApiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`Veo request failed (${res.status}): ${errBody.slice(0, 300)}`),
      { status: res.status === 401 || res.status === 403 ? 401 : 502 }
    );
  }
  const data = await res.json();
  return { provider: "veo", jobId: data.name, status: "queued" };
}

async function pollAnimationJob({ jobId }) {
  if (!env.isConfigured("veoApiKey")) {
    throw Object.assign(new Error("VEO_API_KEY is not configured on the server."), { status: 501 });
  }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${jobId}?key=${env.veoApiKey}`);
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(new Error(`Veo poll failed (${res.status}): ${errBody.slice(0, 300)}`), { status: 502 });
  }
  const data = await res.json();
  if (!data.done) return { status: "processing" };

  const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!videoUri) return { status: "failed", error: "No video returned." };

  const videoRes = await fetch(`${videoUri}&key=${env.veoApiKey}`);
  const arrayBuffer = await videoRes.arrayBuffer();
  const outDir = path.join(__dirname, "..", "generated", "video");
  fs.mkdirSync(outDir, { recursive: true });
  const filename = `clip_${Date.now()}.mp4`;
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(arrayBuffer));

  return { status: "complete", localPath: `/generated/video/${filename}` };
}

/* ----------------------------------------------------------------------
   To add Runway / Luma / Kling / Pika instead (or as a fallback), the
   shape is the same submit -> jobId -> poll pattern, e.g.:

   const res = await fetch("https://api.runwayml.com/v1/image_to_video", {
     method: "POST",
     headers: { Authorization: `Bearer ${env.runwayApiKey}`, "Content-Type": "application/json" },
     body: JSON.stringify({ image: imageUrl, prompt, motion: cameraMovement }),
   });
   const { id } = await res.json();
   return { provider: "runway", jobId: id, status: "queued" };
---------------------------------------------------------------------- */

module.exports = { submitAnimationJob, pollAnimationJob };
