const ImagesView = {
  title: "Image Generation",
  subtitle: "Generate consistent cartoon scene art — requires Stable Diffusion / Flux / a hosted image model.",

  styles: [
    { id: "pixar3d", label: "Pixar-inspired 3D" },
    { id: "disneyish", label: "Disney-inspired 2D" },
    { id: "cute2d", label: "Cute 2D cartoon" },
    { id: "anime", label: "Anime" },
    { id: "storybook", label: "Storybook illustration" },
    { id: "claymation", label: "Clay animation" },
  ],

  render() {
    const p = State.getActiveProject();
    return `
      <div class="section-head">
        <div><h2>Art style</h2><p>Applied consistently across every scene</p></div>
      </div>
      <div class="chip-row" id="styleChips" style="margin-bottom:20px;">
        ${this.styles.map(s => `<button class="chip ${p.imageSettings.style === s.id ? "active" : ""}" data-style="${s.id}">${s.label}</button>`).join("")}
      </div>

      <div class="section-head">
        <div><h2>Scene images</h2><p>${p.scenes.filter(s => s.imageUrl).length}/${p.scenes.length} generated</p></div>
        ${p.scenes.length ? `<button class="btn btn-accent" id="genAllImagesBtn">▧ Generate all images</button>` : ""}
      </div>

      ${p.scenes.length ? `
        <div class="grid grid-3">
          ${p.scenes.map(s => `
            <div class="scene-card" data-scene-id="${s.id}">
              <div class="flex-between"><span class="scene-num">${s.index}</span>
                <span class="pill ${s.imageUrl ? "pill-live" : "pill-mock"}">${s.imageUrl ? "generated" : "not generated"}</span>
              </div>
              <div class="scene-thumb">${s.imageUrl ? `<img src="${s.imageUrl}">` : "no image yet"}</div>
              <p class="small">${Utils.escapeHtml(s.imagePrompt)}</p>
              <button class="btn btn-sm" data-gen-image="${s.id}">Generate this image</button>
            </div>
          `).join("")}
        </div>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">▧</span>Generate scenes first.</div></div>`}

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> connect the generate buttons to <span class="kbd">POST /api/images/generate</span>, forwarding the scene's image prompt + chosen style + a consistency seed (from Character Manager) to Stable Diffusion, Flux, or another hosted model. Return the resulting image URL to swap into the scene thumbnail.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();

    document.querySelectorAll("#styleChips .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        p.imageSettings.style = chip.dataset.style;
        State.touchProject();
        App.navigate("images");
      });
    });

    const genOne = async (sceneId, btn) => {
      const scene = p.scenes.find(s => s.id === sceneId);
      if (!scene) return;
      if (btn) { btn.disabled = true; btn.textContent = "Generating…"; }
      await Utils.callAI("generateImage", { prompt: scene.imagePrompt, style: p.imageSettings.style }, { minMs: 300, maxMs: 700 });
      scene.imageUrl = null; // no real image without a backend — status still reflects "generated" for demo flow
      scene.status = "image-ready";
      State.touchProject();
    };

    document.querySelectorAll("[data-gen-image]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await genOne(btn.dataset.genImage, btn);
        App.navigate("images");
      });
    });

    document.getElementById("genAllImagesBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true; e.target.textContent = "Generating…";
      State.setProgress("images", "in-progress");
      for (const scene of p.scenes) await genOne(scene.id, null);
      State.setProgress("images", "done");
      State.notify("Images generated", `Scene art queued for all ${p.scenes.length} scenes.`);
      App.navigate("images");
      Utils.toast("All scene images generated.");
    });
  },
};
