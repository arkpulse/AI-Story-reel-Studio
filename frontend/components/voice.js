const VoiceView = {
  title: "AI Voice Generation",
  subtitle: "Generate narration and dialogue with realistic AI voices — requires ElevenLabs or a similar TTS backend.",

  voices: [
    { id: "female-warm", label: "Female — Warm" },
    { id: "female-bright", label: "Female — Bright & energetic" },
    { id: "male-friendly", label: "Male — Friendly" },
    { id: "male-deep", label: "Male — Deep, calm" },
    { id: "child-playful", label: "Child — Playful" },
    { id: "child-curious", label: "Child — Curious" },
  ],
  accents: ["american", "british", "australian", "neutral"],

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Narrator settings</h3>
            <div class="field">
              <label>Voice</label>
              <div class="chip-row" id="voiceChips">
                ${this.voices.map(v => `<button class="chip ${p.voice.narrator === v.id ? "active" : ""}" data-voice="${v.id}">${v.label}</button>`).join("")}
              </div>
            </div>
            <div class="field">
              <label>Accent</label>
              <select id="accentSelect" class="full">
                ${this.accents.map(a => `<option value="${a}" ${p.voice.accent === a ? "selected" : ""}>${a[0].toUpperCase() + a.slice(1)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Speed: <span id="speedVal">${p.voice.speed.toFixed(2)}x</span></label>
              <input type="range" id="speedRange" min="0.6" max="1.6" step="0.05" value="${p.voice.speed}">
            </div>
            <div class="field">
              <label>Pitch: <span id="pitchVal">${p.voice.pitch.toFixed(2)}x</span></label>
              <input type="range" id="pitchRange" min="0.6" max="1.6" step="0.05" value="${p.voice.pitch}">
            </div>
            <button class="btn btn-accent btn-block" id="saveVoiceBtn">Save narrator settings</button>
          </div>
        </div>

        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Generate narration clips</h3>
            <p class="muted">One clip per scene, using the narrator voice above.</p>
            ${p.scenes.length ? `
              <button class="btn btn-accent btn-block" id="genAllVoiceBtn">◔ Generate all narration</button>
              <div class="divider"></div>
              <div id="clipList">
                ${p.voice.clips.length ? p.voice.clips.map(c => `
                  <div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border);">
                    <div><strong>${Utils.escapeHtml(c.label)}</strong><div class="small">${c.voice} · ${Utils.formatDuration(c.durationSec)}</div></div>
                    <span class="pill pill-mock">audio stub</span>
                  </div>
                `).join("") : `<p class="small">No clips generated yet.</p>`}
              </div>
            ` : `<div class="empty-state"><span class="glyph">▤</span>Generate scenes first.</div>`}
          </div>
        </div>
      </div>

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> hook this up to <span class="kbd">POST /api/voice/generate</span>, which should call ElevenLabs (or Azure/Google TTS) with the scene narration text, chosen voice ID, speed, and pitch, then return a signed audio file URL.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();

    document.querySelectorAll("#voiceChips .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        p.voice.narrator = chip.dataset.voice;
        State.touchProject();
        App.navigate("voice");
      });
    });

    document.getElementById("accentSelect")?.addEventListener("change", e => { p.voice.accent = e.target.value; State.touchProject(); });
    document.getElementById("speedRange")?.addEventListener("input", e => {
      p.voice.speed = parseFloat(e.target.value);
      document.getElementById("speedVal").textContent = p.voice.speed.toFixed(2) + "x";
    });
    document.getElementById("pitchRange")?.addEventListener("input", e => {
      p.voice.pitch = parseFloat(e.target.value);
      document.getElementById("pitchVal").textContent = p.voice.pitch.toFixed(2) + "x";
    });
    document.getElementById("saveVoiceBtn")?.addEventListener("click", () => {
      State.touchProject();
      Utils.toast("Narrator settings saved.");
    });

    document.getElementById("genAllVoiceBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true; e.target.textContent = "Generating…";
      State.setProgress("voice", "in-progress");
      const clips = [];
      for (const scene of p.scenes) {
        const res = await Utils.callAI("generateVoice", { text: scene.narration, voice: p.voice.narrator }, { minMs: 200, maxMs: 500 });
        clips.push({ ...res.clip, label: `Scene ${scene.index} narration` });
      }
      p.voice.clips = clips;
      State.setProgress("voice", "done");
      State.touchProject();
      State.notify("Narration generated", `${clips.length} narration clips ready.`);
      App.navigate("voice");
      Utils.toast("Narration clips generated.");
    });
  },
};
