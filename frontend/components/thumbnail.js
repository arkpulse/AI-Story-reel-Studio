const ThumbnailView = {
  title: "Thumbnail Generator",
  subtitle: "Generate colorful, kid-friendly thumbnail options — requires an image AI backend.",

  render() {
    const p = State.getActiveProject();
    return `
      <div class="section-head">
        <div><h2>Thumbnail options</h2><p>${p.thumbnails.length} generated</p></div>
        <button class="btn btn-accent" id="genThumbsBtn">▨ Generate thumbnails</button>
      </div>
      ${p.thumbnails.length ? `
        <div class="grid grid-4">
          ${p.thumbnails.map(t => `
            <div class="card" data-thumb-id="${t.id}">
              <div class="card-body">
                <div style="aspect-ratio:16/9;border-radius:var(--radius-s);background:linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]});display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-display);font-weight:700;text-align:center;padding:10px;">
                  ${Utils.escapeHtml(t.label)}
                </div>
                <button class="btn btn-sm btn-block" style="margin-top:10px;" data-select-thumb="${t.id}">Use this thumbnail</button>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">▨</span>No thumbnails yet.</div></div>`}

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> connect to <span class="kbd">POST /api/thumbnails/generate</span>, which should render a few title-card variants via an image model, or auto-crop/enhance the most colorful animated frame.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("genThumbsBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true; e.target.textContent = "Generating…";
      const res = await Utils.callAI("generateThumbnails", { title: p.seo.title || p.name });
      p.thumbnails = res.thumbnails;
      State.touchProject();
      State.notify("Thumbnails generated", `${res.thumbnails.length} options ready.`);
      App.navigate("thumbnail");
      Utils.toast("Thumbnails generated.");
    });
    document.querySelectorAll("[data-select-thumb]").forEach(btn => {
      btn.addEventListener("click", () => { Utils.toast("Thumbnail selected for export."); });
    });
  },
};
