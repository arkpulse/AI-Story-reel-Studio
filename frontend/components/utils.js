/* ============================================================
   Utils — helpers shared across every view module.
   ============================================================ */

const Utils = {
  uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  },

  wordCount(text) {
    const t = (text || "").trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  },

  // Kids' narration ~ 130 words/minute (slower, clearer pacing than adult content)
  estimateDurationSec(text) {
    const words = this.wordCount(text);
    return Math.round((words / 130) * 60);
  },

  formatDuration(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  },

  timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  },

  escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[s]));
  },

  toast(message, type = "ok") {
    const container = document.getElementById("toastContainer");
    const el = document.createElement("div");
    el.className = "toast" + (type === "warn" ? " warn" : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  },

  /* ----------------------------------------------------------
     callAI — STUB for the backend bridge.
     In production this becomes:
       return fetch('/api/<endpoint>', { method:'POST', body: JSON.stringify(payload) })
         .then(r => r.json());
     Here it simulates network latency + returns deterministic
     mock content so every view is fully interactive offline.
     Never call provider APIs (OpenAI, ElevenLabs, Runway, etc.)
     directly from this file with a key — that belongs server-side.
     ---------------------------------------------------------- */
  async callAI(endpoint, payload, { minMs = 700, maxMs = 1600 } = {}) {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise(res => setTimeout(res, delay));
    return MockAI.handle(endpoint, payload);
  },

  download(filename, content, mime = "text/plain") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  },

  hashColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const palette = ["#f5a524", "#ef6f5b", "#3ecf8e", "#9b7bf0", "#4f9df5", "#f06fa8"];
    return palette[Math.abs(hash) % palette.length];
  },
};

/* ============================================================
   MockAI — deterministic offline stand-ins for each provider
   call, so the UI is demonstrable without live API keys.
   ============================================================ */
const MockAI = {
  handle(endpoint, payload) {
    switch (endpoint) {
      case "enhanceStory": return this.enhanceStory(payload);
      case "generateScenes": return this.generateScenes(payload);
      case "extractCharacters": return this.extractCharacters(payload);
      case "generateVoice": return this.generateVoice(payload);
      case "generateImage": return this.generateImage(payload);
      case "generateAnimation": return this.generateAnimation(payload);
      case "generateAudio": return this.generateAudio(payload);
      case "generateThumbnails": return this.generateThumbnails(payload);
      case "generateSEO": return this.generateSEO(payload);
      case "renderVideo": return this.renderVideo(payload);
      default: return { ok: false, error: "Unknown endpoint" };
    }
  },

  enhanceStory({ text, level, readingAge }) {
    const trimmed = (text || "").trim();
    const intro = `Once upon a time, in a world full of wonder, `;
    const body = trimmed
      ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
      : "a small hero learned something wonderful about friendship.";
    const outro = `\n\nAnd from that day on, everyone remembered the lesson with a smile. The end.`;
    return {
      ok: true,
      enhanced: intro + body + outro,
      notes: [
        `Reading level tuned for ages ${readingAge}.`,
        `Tone: ${level}.`,
        "Simplified complex sentences and added sensory detail.",
        "Checked character names for consistent spelling.",
      ],
    };
  },

  generateScenes({ text, count }) {
    const sentences = (text || "").split(/(?<=[.!?])\s+/).filter(Boolean);
    const n = count || Math.max(3, Math.min(10, Math.ceil(sentences.length / 2) || 4));
    const scenes = [];
    for (let i = 0; i < n; i++) {
      const chunk = sentences.slice(i * 2, i * 2 + 2).join(" ") || `Scene ${i + 1} continues the story.`;
      scenes.push({
        id: Utils.uid("scene"),
        index: i + 1,
        description: chunk.slice(0, 220),
        background: ["a sunny meadow", "a cozy village square", "an enchanted forest edge", "a starlit treehouse"][i % 4],
        camera: ["wide establishing shot", "gentle push-in", "over-the-shoulder", "slow orbit"][i % 4],
        animationPrompt: "Soft squash-and-stretch character motion, idle breathing, blinking, gentle cloth sway.",
        imagePrompt: `Storybook illustration, ${chunk.slice(0, 80)}, soft lighting, warm palette, no text`,
        sfxPrompt: ["birdsong and rustling leaves", "distant village chatter", "wind through branches", "crickets and night ambience"][i % 4],
        musicPrompt: "Whimsical, gentle orchestral theme, major key, playful woodwinds",
        narration: chunk,
        dialogue: "",
        imageUrl: null,
        status: "pending",
      });
    }
    return { ok: true, scenes };
  },

  extractCharacters({ text }) {
    const words = (text || "").match(/\b[A-Z][a-z]{2,}\b/g) || [];
    const stop = new Set(["The", "Once", "And", "But", "Then", "She", "He", "They", "It"]);
    const names = [...new Set(words.filter(w => !stop.has(w)))].slice(0, 3);
    if (!names.length) names.push("Luma");
    return {
      ok: true,
      characters: names.map(name => ({
        id: Utils.uid("char"),
        name,
        age: "young",
        gender: "unspecified",
        clothes: "simple, colorful outfit",
        hair: "soft, rounded style",
        face: "big expressive eyes, warm smile",
        personality: "curious and kind",
        voiceStyle: "friendly, gentle",
        color: Utils.hashColor(name),
      })),
    };
  },

  generateVoice({ text, voice }) {
    return {
      ok: true,
      clip: {
        id: Utils.uid("clip"),
        label: (text || "").slice(0, 40) || "Narration",
        voice,
        durationSec: Utils.estimateDurationSec(text),
        url: null, // would be a signed audio URL from ElevenLabs/etc.
      },
    };
  },

  generateImage({ prompt, style }) {
    return {
      ok: true,
      image: { id: Utils.uid("img"), prompt, style, url: null },
    };
  },

  generateAnimation({ sceneId }) {
    return { ok: true, animation: { sceneId, status: "queued", eta: "~90s per scene (provider dependent)" } };
  },

  generateAudio({ mood }) {
    return { ok: true, track: { id: Utils.uid("track"), mood, url: null } };
  },

  generateThumbnails({ title }) {
    const palettes = [
      ["#f5a524", "#ef6f5b"], ["#3ecf8e", "#4f9df5"], ["#9b7bf0", "#f06fa8"], ["#f5a524", "#3ecf8e"],
    ];
    return {
      ok: true,
      thumbnails: palettes.map((p, i) => ({
        id: Utils.uid("thumb"), gradient: p, label: title || `Option ${i + 1}`,
      })),
    };
  },

  generateSEO({ title }) {
    const base = title || "My Animated Kids Story";
    return {
      ok: true,
      seo: {
        title: `${base} | A Magical Animated Story for Kids`,
        description: `Join our heroes on a heartwarming animated adventure! ${base} teaches kids about friendship, courage, and kindness. Perfect for family movie night — watch now!`,
        tags: ["kids stories", "animated story", "bedtime story", "cartoon for kids", "children's animation", "story time"],
        hashtags: ["#KidsStories", "#AnimatedStory", "#BedtimeStory", "#CartoonForKids", "#StoryTime"],
      },
    };
  },

  renderVideo({ sceneCount }) {
    return { ok: true, job: { id: Utils.uid("render"), etaSec: (sceneCount || 5) * 8 } };
  },
};
