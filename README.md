# Storyreel Studio

A personal-use web app for turning a written story into a long-form animated
kids' video, built as a **frontend dashboard** (HTML/CSS/vanilla JS) plus a
**backend skeleton** (Node/Express) that's structured to hold real AI
provider integrations.

## Run it

**Frontend only (works fully offline, right now):**
```
cd frontend
python3 -m http.server 8080
# open http://localhost:8080
```
Every screen is interactive out of the box. AI calls are simulated by
`components/utils.js -> MockAI`, so you can click through the entire
pipeline — script → enhance → scenes → characters → voice → images →
animation → audio → edit → export — without any API keys.

**Backend (for when you connect real providers):**
```
cd backend
cp .env.example .env      # fill in whichever provider keys you have
npm install
npm start                 # listens on :4000
```
The backend currently throws a clear `501 Not implemented` from each
service file until you fill in the real API call (each stub shows exactly
what to write, with the actual endpoint commented in).

---

## What works with HTML/CSS/JS alone (no backend needed)

- The entire UI: sidebar navigation, dark/light theme, responsive layout,
  drag-and-drop, progress bars, notifications, toasts.
- Script editor, word count, and duration estimate (~130 wpm).
- `.txt` import (native `File.text()`) and `.docx` import (via the
  `mammoth.js` library, loaded from cdnjs, running entirely in the browser).
- Scene, character, voice-setting, image-style, animation-setting, and
  audio-setting forms — all state is kept in `localStorage` per project.
- Exporting the script, scene prompts, and character sheets as `.txt`/`.json`
  files — this is just `Blob` + a download link, no server involved.
- Video setting selection (resolution/aspect/fps) as metadata for later use.

## What requires a backend + external AI APIs

Anything that produces real generated media has to go through a server,
because API keys must never sit in frontend JavaScript, and because some
providers (video especially) run long async jobs that need server-side
polling/webhooks:

| Feature | Needs | Suggested provider(s) |
|---|---|---|
| Story enhancement / scene breakdown / character extraction | Backend LLM call | OpenAI, Google Gemini |
| Narration & dialogue voices | Backend TTS call | ElevenLabs |
| Scene & character images | Backend image-gen call | Stable Diffusion, Flux |
| Animating images (movement, lip sync, camera moves) | Backend video-gen call + job polling | Runway, Luma AI, Kling AI, Pika, Google Veo |
| Background music, ambience, SFX | Backend audio-gen call | ElevenLabs Sound Effects, Stable Audio, Suno |
| Combining everything into a final MP4 with captions/transitions | Backend video compositing | FFmpeg (self-hosted) or a managed API (Shotstack, Remotion, JSON2Video) |
| Thumbnail generation | Backend image-gen call | Same as scene images |
| Real audio/video/thumbnail file exports | Backend-produced files | All of the above |

The frontend's `MockAI` object (in `components/utils.js`) mirrors the shape
every one of these calls will eventually have, so once the backend is real,
you mostly need to swap `Utils.callAI(endpoint, payload)` from calling
`MockAI.handle()` to `fetch('/api/' + endpoint, { method: 'POST', body: ... })`.

---

## Project structure

```
frontend/
  index.html            Dashboard shell — sidebar + view container
  style.css              Theme tokens, layout, all component styles
  app.js                  Router: swaps views, wires sidebar/theme/notifications
  components/
    state.js              Project/app state, persisted to localStorage
    utils.js               Shared helpers + MockAI (offline demo stand-in)
    scriptInput.js         Script editor, .txt/.docx import, word/duration stats
    enhance.js              AI story enhancement UI
    scenes.js                Scene generator + per-scene prompt editing
    characters.js             Character manager
    voice.js                   AI voice settings + narration generation UI
    images.js                    Image generation UI (art style + per scene)
    animation.js                  Animation settings + per-scene animation queue
    audio.js                       Music/SFX settings + per-scene audio
    editor.js                       Timeline + render trigger
    settings.js                      Resolution / aspect ratio / frame rate
    thumbnail.js                      Thumbnail options
    seo.js                              Title/description/tags/hashtags
    exportView.js                        Downloadable exports
    apikeys.js                            Provider connection status page
    dashboard.js                          Overview, projects, history

backend/
  server.js               Express entry point, mounts all routes
  config/env.js            Reads provider keys from environment variables
  routes/                   One file per feature area, thin — just wiring
  controllers/               Request/response handling per route
  services/                   One file per AI provider — this is where you
                                paste in the real fetch() call to each API
  .env.example              Template for provider API keys
  package.json
```

## Adding a new AI provider later

1. Add its key to `backend/.env.example` and `backend/config/env.js`.
2. Add or extend a file in `backend/services/` with the real API call,
   following the pattern already in `openai.service.js` etc. (each has a
   commented-out example request to copy from).
3. Point the matching controller in `backend/controllers/` at it.
4. On the frontend, change the relevant `Utils.callAI(...)` call site to
   `fetch('/api/<route>', ...)` instead of the `MockAI` stub.

No other files need to change — the UI, state, and progress tracking are
already provider-agnostic.
