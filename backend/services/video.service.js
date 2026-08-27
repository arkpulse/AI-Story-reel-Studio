/**
 * Final video assembly. This is the one piece that is NOT a simple
 * third-party API call — it's server-side compositing.
 * Two common approaches:
 *   1. FFmpeg on your own server/worker (fluent-ffmpeg npm package),
 *      concatenating scene clips, mixing audio stems, burning captions.
 *   2. A managed video-assembly API (Shotstack, Remotion Lambda, JSON2Video)
 *      that takes a timeline JSON and renders the MP4 for you.
 */
async function renderTimeline({ projectId, scenes, videoSettings, audioSettings, captions }) {
  throw Object.assign(new Error("Not implemented — wire up FFmpeg or a managed rendering API here."), { status: 501 });
}

module.exports = { renderTimeline };
