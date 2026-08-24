const SEOView = {
  title: "SEO Generator",
  subtitle: "Generate a title, description, tags, and hashtags for publishing.",

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Generate</h3>
            <div class="field"><label>Working title</label><input type="text" id="seoTitleInput" value="${Utils.escapeHtml(p.name)}"></div>
            <button class="btn btn-accent btn-block" id="genSeoBtn"># Generate SEO package</button>
          </div>
        </div>
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Result</h3>
            ${p.seo.title ? `
              <div class="field"><label>YouTube title</label><input type="text" id="seoOutTitle" value="${Utils.escapeHtml(p.seo.title)}"></div>
              <div class="field"><label>Description</label><textarea id="seoOutDesc" rows="4">${Utils.escapeHtml(p.seo.description)}</textarea></div>
              <div class="field"><label>Tags</label><div class="tag-row">${p.seo.tags.map(t => `<span class="tag">${Utils.escapeHtml(t)}</span>`).join("")}</div></div>
              <div class="field"><label>Hashtags</label><div class="tag-row">${p.seo.hashtags.map(t => `<span class="tag">${Utils.escapeHtml(t)}</span>`).join("")}</div></div>
              <button class="btn btn-block" id="saveSeoBtn">Save edits</button>
            ` : `<div class="empty-state"><span class="glyph">#</span>No SEO package yet.</div>`}
          </div>
        </div>
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("genSeoBtn")?.addEventListener("click", async (e) => {
      const title = document.getElementById("seoTitleInput").value;
      e.target.disabled = true; e.target.textContent = "Generating…";
      const res = await Utils.callAI("generateSEO", { title });
      p.seo = res.seo;
      State.touchProject();
      App.navigate("seo");
      Utils.toast("SEO package generated.");
    });
    document.getElementById("saveSeoBtn")?.addEventListener("click", () => {
      p.seo.title = document.getElementById("seoOutTitle").value;
      p.seo.description = document.getElementById("seoOutDesc").value;
      State.touchProject();
      Utils.toast("SEO details saved.");
    });
  },
};
