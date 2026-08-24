const AnimationView = {
  title: "Animation",
  subtitle: "Bring scene art to life — requires a video model like Runway, Luma, Kling, Pika, or Google Veo.",

  cameraMoves: ["gentle-pan", "slow-zoom-in", "slow-zoom-out", "orbit", "static"],
  transitions: ["crossfade", "cut", "wipe", "iris"],

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Global animation settings</h3>
            <div class="field">
              <label><input type="checkbox" id="lipSyncToggle" ${p.animationSettings.lipSync ? "checked" : ""}> Enable lip sync on dialogue scenes</label>
            </div>
            <div class="field">
              <label>Default camera movement</label>
              <select id="cameraMoveSelect" class="full">
                ${this.cameraMoves.map(c => `<option value="${c}" ${p.animationSettings.cameraMovement === c ? "selected" : ""}>${c.replace(/-/g, " ")}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Scene transition</label>
              <select id="transitionSelect" class="full">
                ${this.transitions.map(t => `<option value="${t}" ${p.animationSettings.transitions === t ? "selected" : ""}>${t}</option>`).join("")}
              </select>
            </div>
            <button class="btn btn-accent btn-block" id="saveAnimSettingsBtn">Save settings</button>
          </div>
        </div>

        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>What gets animated</h3>
            <ul class="small" style="padding-left:18px;line-height:1.9;">
              <li>Character movement (walk cycles, gestures, idle motion)</li>
              <li>Facial expressions matched to narration tone</li>
              <li>Lip sync to generated narration/dialogue audio</li>
              <li>Camera movement: zoom, pan, orbit</li>
              <li>Cross-scene transitions</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div><h2>Scene animation queue</h2><p>Animate each scene once its image is ready</p></div>
        ${p.scenes.length ? `<button class="btn btn-accent" id="animateAllBtn">▶ Animate all scenes</button>` : ""}
      </div>
      ${p.scenes.length ? `
        <div class="grid grid-3">
          ${p.scenes.map(s => `
            <div class="scene-card" data-scene-id="${s.id}">
              <div class="flex-between"><span class="scene-num">${s.index}</span>
                <span class="pill ${s.status === "animated" ? "pill-live" : "pill-mock"}">${s.status}</span>
              </div>
              <div class="scene-thumb">${s.status === "animated" ? "🎞 animated" : "static frame"}</div>
              <p class="small">${Utils.escapeHtml(s.animationPrompt)}</p>
              <button class="btn btn-sm" data-animate="${s.id}">Animate scene</button>
            </div>
          `).join("")}
        </div>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">▶</span>Generate scenes and images first.</div></div>`}

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> route animation jobs through <span class="kbd">POST /api/animation/generate</span>. It should submit the scene image + animation prompt + audio (for lip sync) to Runway Gen-3, Luma Dream Machine, Kling, Pika, or Veo, then poll for job completion and store the resulting clip URL.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("saveAnimSettingsBtn")?.addEventListener("click", () => {
      p.animationSettings.lipSync = document.getElementById("lipSyncToggle").checked;
      p.animationSettings.cameraMovement = document.getElementById("cameraMoveSelect").value;
      p.animationSettings.transitions = document.getElementById("transitionSelect").value;
      State.touchProject();
      Utils.toast("Animation settings saved.");
    });

    const animateOne = async (sceneId) => {
      const scene = p.scenes.find(s => s.id === sceneId);
      if (!scene) return;
      await Utils.callAI("generateAnimation", { sceneId }, { minMs: 300, maxMs: 700 });
      scene.status = "animated";
      State.touchProject();
    };

    document.querySelectorAll("[data-animate]").forEach(btn => {
      btn.addEventListener("click", async () => { await animateOne(btn.dataset.animate); App.navigate("animation"); });
    });

    document.getElementById("animateAllBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true; e.target.textContent = "Animating…";
      State.setProgress("animation", "in-progress");
      for (const s of p.scenes) await animateOne(s.id);
      State.setProgress("animation", "done");
      State.notify("Animation complete", "All scenes animated and ready for editing.");
      App.navigate("animation");
      Utils.toast("All scenes animated.");
    });
  },
};
