/* ============================================================
   State — single source of truth, persisted to localStorage.
   Every "generate" action in this demo calls a stubbed async
   function (see utils.js -> callAI) that simulates a backend
   round trip. Swap callAI's internals for real fetch() calls to
   your backend once it's wired to real providers.
   ============================================================ */

const STORAGE_KEY = "storyreel_studio_v1";

function defaultProject(name = "Untitled Project") {
  return {
    id: "proj_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    script: {
      raw: "",
      enhanced: "",
      wordCount: 0,
      estDurationSec: 0,
      enhanceLevel: "balanced",
      readingAge: "5-8",
    },
    scenes: [],          // {id, index, description, background, camera, animationPrompt, imagePrompt, sfxPrompt, musicPrompt, narration, dialogue, imageUrl, status}
    characters: [],       // {id, name, age, gender, clothes, hair, face, personality, voiceStyle, color}
    voice: {
      narrator: "female-warm",
      accent: "american",
      speed: 1.0,
      pitch: 1.0,
      clips: [],
    },
    imageSettings: {
      style: "storybook",
      consistencySeed: "auto",
    },
    animationSettings: {
      lipSync: true,
      cameraMovement: "gentle-pan",
      transitions: "crossfade",
    },
    audioSettings: {
      bgMusicMood: "playful",
      ambience: true,
      actionSfx: true,
    },
    videoSettings: {
      resolution: "1080p",
      aspect: "16:9",
      fps: 30,
    },
    thumbnails: [],
    seo: { title: "", description: "", tags: [], hashtags: [] },
    progress: {
      script: "pending", enhance: "pending", scenes: "pending",
      characters: "pending", voice: "pending", images: "pending",
      animation: "pending", audio: "pending", edit: "pending", export: "pending",
    },
    renderHistory: [],
  };
}

const State = {
  data: null,

  load() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        this.data = JSON.parse(raw);
      } catch (e) {
        this.data = this._fresh();
      }
    } else {
      this.data = this._fresh();
    }
    if (!this.data.projects.length) {
      this.addProject("My First Storybook");
    }
    if (!this.data.notifications) this.data.notifications = [];
    return this.data;
  },

  _fresh() {
    return {
      theme: "dark",
      activeProjectId: null,
      projects: [],
      notifications: [],
      apiKeys: {}, // never actually stores secrets in a real build — backend only
    };
  },

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
    catch (e) { console.warn("Could not persist state", e); }
  },

  addProject(name) {
    const p = defaultProject(name);
    this.data.projects.push(p);
    this.data.activeProjectId = p.id;
    this.save();
    return p;
  },

  getActiveProject() {
    return this.data.projects.find(p => p.id === this.data.activeProjectId) || this.data.projects[0];
  },

  setActiveProject(id) {
    this.data.activeProjectId = id;
    this.save();
  },

  touchProject() {
    const p = this.getActiveProject();
    if (p) p.updatedAt = Date.now();
    this.save();
  },

  notify(title, body, level = "info") {
    this.data.notifications.unshift({
      id: "n_" + Date.now() + Math.random().toString(36).slice(2, 5),
      title, body, level, time: Date.now(), read: false,
    });
    this.data.notifications = this.data.notifications.slice(0, 40);
    this.save();
  },

  setProgress(stage, status) {
    const p = this.getActiveProject();
    if (!p) return;
    p.progress[stage] = status;
    this.touchProject();
  },
};
