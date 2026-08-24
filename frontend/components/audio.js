const AudioView = {
  title: "Music & Sound Effects",
  subtitle: "Generate background score, ambience, and effects — requires a music/SFX AI model.",

  moods: ["playful", "cozy", "adventurous", "magical", "sleepy-lullaby"],

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Score settings</h3>
            <div class="field">
              <label>Background music mood</label>
              <div class="chip-row">
                ${this.moods.map(m => `<button class="chip ${p.audioSettings.bgMusicMood === m ? "active" : ""}" data-mood="${m}">${m.replace("-", " ")}</button>`).join("")}
              </div>
            </div>
            <div class="field"><label><input type="checkbox" id="ambienceToggle" ${p.audioSettings.ambience ? "checked" : ""}> Generate ambient background sound per scene</label></div>
            <div class="field"><label><input type="checkbox" id="actionSfxToggle" ${p.audioSettings.actionSfx ? "checked" : ""}> Generate action/character sound effects</label></div>
            <button class="btn btn-accent btn-block" id="saveAudioSettingsBtn">Save settings</button>
          </div>
        </div>
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>What gets generated</h3>
            <table>
              <thead><tr><th>Layer</th><th>Example</th></tr></thead>
              <tbody>
                <tr><td>Background music</td><td>Whimsical orchestral theme</td></tr>
                <tr><td>Ambient sound</td><td>Birdsong, wind, village chatter</td></tr>
                <tr><td>Character sounds</td><td>Footsteps, giggles, sighs</td></tr>
                <tr><td>Action effects</td><td>Door creak, splash, magic sparkle</td></tr>
                <tr><td>Emotional music cue</td><td>Swell for the happy ending</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div><h2>Per-scene audio</h2><p>Music &amp; SFX prompts pulled from Scene Generator</p></div>
        ${p.scenes.length ? `<button class="btn btn-accent" id="genAllAudioBtn">♪ Generate all audio</button>` : ""}
      </div>
      ${p.scenes.length ? `
        <table>
          <thead><tr><th>Scene</th><th>SFX prompt</th><th>Music prompt</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${p.scenes.map(s => `
              <tr data-scene-id="${s.id}">
                <td>${s.index}</td>
                <td class="small">${Utils.escapeHtml(s.sfxPrompt)}</td>
                <td class="small">${Utils.escapeHtml(s.musicPrompt)}</td>
                <td><span class="pill ${s.audioReady ? "pill-live" : "pill-mock"}">${s.audioReady ? "ready" : "pending"}</span></td>
                <td><button class="btn btn-sm" data-gen-audio="${s.id}">Generate</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">♪</span>Generate scenes first.</div></div>`}

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> route to <span class="kbd">POST /api/audio/generate</span>, calling a music/SFX model (e.g. ElevenLabs Sound Effects, Stable Audio, Suno) per prompt and layer, then return mixable stems.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.querySelectorAll("[data-mood]").forEach(chip => {
      chip.addEventListener("click", () => { p.audioSettings.bgMusicMood = chip.dataset.mood; State.touchProject(); App.navigate("audio"); });
    });
    document.getElementById("saveAudioSettingsBtn")?.addEventListener("click", () => {
      p.audioSettings.ambience = document.getElementById("ambienceToggle").checked;
      p.audioSettings.actionSfx = document.getElementById("actionSfxToggle").checked;
      State.touchProject();
      Utils.toast("Audio settings saved.");
    });

    const genOne = async (sceneId) => {
      const scene = p.scenes.find(s => s.id === sceneId);
      if (!scene) return;
      await Utils.callAI("generateAudio", { mood: p.audioSettings.bgMusicMood }, { minMs: 250, maxMs: 600 });
      scene.audioReady = true;
      State.touchProject();
    };

    document.querySelectorAll("[data-gen-audio]").forEach(btn => {
      btn.addEventListener("click", async () => { await genOne(btn.dataset.genAudio); App.navigate("audio"); });
    });

    document.getElementById("genAllAudioBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true; e.target.textContent = "Generating…";
      State.setProgress("audio", "in-progress");
      for (const s of p.scenes) await genOne(s.id);
      State.setProgress("audio", "done");
      State.notify("Audio generated", "Music and SFX ready for every scene.");
      App.navigate("audio");
      Utils.toast("All audio generated.");
    });
  },
};
