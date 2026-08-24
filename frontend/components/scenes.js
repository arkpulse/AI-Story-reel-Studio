const ScenesView = {
  title: "Scene Generator",
  subtitle: "Break the story into shootable scenes with prompts for every downstream AI tool.",

  render() {
    const p = State.getActiveProject();
    if (!p.script.raw.trim()) {
      return `<div class="card"><div class="card-body empty-state"><span class="glyph">▤</span>Add a script first, then generate scenes.</div></div>`;
    }
    return `
      <div class="section-head">
        <div><h2>Scenes</h2><p>${p.scenes.length} scene${p.scenes.length === 1 ? "" : "s"} generated</p></div>
        <div style="display:flex;gap:8px;">
          <input type="number" id="sceneCount" value="${p.scenes.length || 6}" min="2" max="20" style="width:70px;">
          <button class="btn btn-accent" id="genScenesBtn">▤ Generate Scenes</button>
        </div>
      </div>

      ${p.scenes.length ? `
        <div class="grid grid-2" id="sceneGrid">
          ${p.scenes.map(s => this.sceneCard(s)).join("")}
        </div>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">🎬</span>No scenes yet — click Generate Scenes.</div></div>`}
    `;
  },

  sceneCard(s) {
    return `
      <div class="scene-card" data-scene-id="${s.id}">
        <div class="flex-between">
          <span class="scene-num">${s.index}</span>
          <span class="pill ${s.status === 'done' ? 'pill-live' : 'pill-mock'}">${s.status}</span>
        </div>
        <div class="scene-thumb">${s.imageUrl ? `<img src="${s.imageUrl}">` : "no image yet"}</div>
        <div>
          <label>Scene description</label>
          <textarea rows="2" data-field="description">${Utils.escapeHtml(s.description)}</textarea>
        </div>
        <div class="field-row">
          <div><label>Background</label><input type="text" data-field="background" value="${Utils.escapeHtml(s.background)}"></div>
          <div><label>Camera angle</label><input type="text" data-field="camera" value="${Utils.escapeHtml(s.camera)}"></div>
        </div>
        <div><label>Narration</label><textarea rows="2" data-field="narration">${Utils.escapeHtml(s.narration)}</textarea></div>
        <div><label>Dialogue (optional)</label><textarea rows="2" data-field="dialogue" placeholder="Character: line...">${Utils.escapeHtml(s.dialogue)}</textarea></div>
        <div><label>Image prompt</label><textarea rows="2" data-field="imagePrompt">${Utils.escapeHtml(s.imagePrompt)}</textarea></div>
        <div><label>Animation prompt</label><textarea rows="2" data-field="animationPrompt">${Utils.escapeHtml(s.animationPrompt)}</textarea></div>
        <div class="field-row">
          <div><label>Sound effect prompt</label><input type="text" data-field="sfxPrompt" value="${Utils.escapeHtml(s.sfxPrompt)}"></div>
          <div><label>Music prompt</label><input type="text" data-field="musicPrompt" value="${Utils.escapeHtml(s.musicPrompt)}"></div>
        </div>
        <button class="btn btn-sm" data-delete-scene="${s.id}">Delete scene</button>
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();

    document.getElementById("genScenesBtn")?.addEventListener("click", async (e) => {
      const count = parseInt(document.getElementById("sceneCount").value, 10) || 6;
      e.target.disabled = true;
      e.target.textContent = "Generating…";
      State.setProgress("scenes", "in-progress");
      const res = await Utils.callAI("generateScenes", { text: p.script.enhanced || p.script.raw, count });
      p.scenes = res.scenes;
      State.setProgress("scenes", "done");
      State.touchProject();
      State.notify("Scenes generated", `${res.scenes.length} scenes created from your script.`);
      App.navigate("scenes");
      Utils.toast(`${res.scenes.length} scenes generated.`);
    });

    document.querySelectorAll(".scene-card [data-field]").forEach(el => {
      el.addEventListener("change", () => {
        const card = el.closest(".scene-card");
        const scene = p.scenes.find(s => s.id === card.dataset.sceneId);
        if (scene) { scene[el.dataset.field] = el.value; State.touchProject(); }
      });
    });

    document.querySelectorAll("[data-delete-scene]").forEach(btn => {
      btn.addEventListener("click", () => {
        p.scenes = p.scenes.filter(s => s.id !== btn.dataset.deleteScene);
        p.scenes.forEach((s, i) => s.index = i + 1);
        State.touchProject();
        App.navigate("scenes");
      });
    });
  },
};
