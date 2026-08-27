/**
 * Image generation service — Stability AI (Stable Diffusion) core endpoint.
 * Docs: https://platform.stability.ai/docs/api-reference#tag/Generate/paths/~1v2beta~1stable-image~1generate~1core/post
 */
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

const STYLE_SUFFIX = {
  pixar3d: "Pixar-inspired 3D animated style, soft rounded shapes, warm lighting",
  disneyish: "classic hand-drawn Disney-inspired 2D animation style",
  cute2d: "cute simple 2D cartoon style, flat colors, thick outlines",
  anime: "anime cartoon style, expressive eyes",
  storybook: "children's storybook illustration style, soft watercolor textures",
  claymation: "clay animation / stop-motion claymation style, tactile texture",
};

async function generateImage({ prompt, style, seed }) {
  if (!env.isConfigured("stableDiffusionApiKey")) {
    throw Object.assign(new Error("SD_API_KEY is not configured on the server."), { status: 501 });
  }

  const fullPrompt = `${prompt}, ${STYLE_SUFFIX[style] || ""}, no text, no watermark, kid-friendly`;

  const form = new FormData();
  form.append("prompt", fullPrompt);
  form.append("output_format", "png");
  form.append("aspect_ratio", "16:9");
  if (seed && seed !== "auto") form.append("seed", String(seed));

  const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stableDiffusionApiKey}`,
      Accept: "image/*",
    },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`Stability AI request failed (${res.status}): ${errBody.slice(0, 300)}`),
      { status: res.status === 401 ? 401 : 502 }
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const outDir = path.join(__dirname, "..", "generated", "images");
  fs.mkdirSync(outDir, { recursive: true });
  const filename = `img_${Date.now()}.png`;
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(arrayBuffer));

  return { image: { prompt: fullPrompt, style, localPath: `/generated/images/${filename}` } };
}

module.exports = { generateImage };
