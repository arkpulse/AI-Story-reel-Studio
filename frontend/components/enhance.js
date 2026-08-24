const EnhanceView = {
  title: "AI Story Enhancement",
  subtitle: "Polish the script for young audiences — needs a backend AI call (e.g. OpenAI/Gemini).",

  render() {
    const p = State.getActiveProject();
    if (!p.script.raw.trim()) {
      return `<div class="card"><div class="card-body empty-state">
        <span class="glyph">✎</span>
        <p>Add a script first on the <strong>Script Input</strong> page, then come back to enhance it.</p>
      </div></div>`;
    }
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <div class="section-head"><div><h2>Original script</h2></div><span class="pill">${p.script.wordCount} words</span></div>
            <textarea rows="14" readonly>${Utils.escapeHtml(p.script.raw)}</textarea>

            <div class="divider"></div>
            <div class="field-row">
              <div class="field">
                <label>Tone</label>
                <select id="enhanceLevel" class="full">
                  <option value="gentle" ${p.script.enhanceLevel === "gentle" ? "selected" : ""}>Gentle &amp; soothing</option>
                  <option value="balanced" ${p.script.enhanceLevel === "balanced" ? "selected" : ""}>Balanced &amp; playful</option>
                  <option value="adventurous" ${p.script.enhanceLevel === "adventurous" ? "selected" : ""}>Adventurous &amp; exciting</option>
                </select>
              </div>
              <div class="field">
                <label>Reading age</label>
                <select id="readingAge" class="full">
                  <option value="2-4" ${p.script.readingAge === "2-4" ? "selected" : ""}>2–4 (toddler)</option>
                  <option value="5-8" ${p.script.readingAge === "5-8" ? "selected" : ""}>5–8 (early reader)</option>
                  <option value="9-12" ${p.script.readingAge === "9-12" ? "selected" : ""}>9–12 (middle grade)</option>
                </select>
              </div>
            </div>
            <button class="btn btn-accent btn-block" id="enhanceBtn">✦ Enhance with AI</button>
            <p class="small" style="margin-top:8px;">Improves engagement, simplifies language, keeps character names consistent, and splits story beats cleanly for scene generation.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <div class="section-head"><div><h2>Enhanced script</h2></div>
              ${p.script.enhanced ? '<span class="pill pill-live">Ready</span>' : '<span class="pill pill-needs">Backend required</span>'}
            </div>
            <div id="enhanceOutput">
              ${p.script.enhanced
                ? `<textarea rows="14" id="enhancedTextarea">${Utils.escapeHtml(p.script.enhanced)}</textarea>`
                : `<div class="empty-state"><span class="glyph">✦</span>Click "Enhance with AI" to generate a polished version.</div>`}
            </div>
            ${p.script.enhanced ? `
              <div class="divider"></div>
              <button class="btn btn-mint btn-block" id="acceptEnhanceBtn">Use enhanced version as script</button>
            ` : ""}
          </div>
        </div>
      </div>

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> this call is a stub that runs locally for demo purposes. In production, wire the "Enhance with AI" button to <span class="kbd">POST /api/story/enhance</span>, which forwards the script to OpenAI or Gemini with a kid-safety system prompt and returns the rewritten text.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("enhanceBtn")?.addEventListener("click", async (e) => {
      p.script.enhanceLevel = document.getElementById("enhanceLevel").value;
      p.script.readingAge = document.getElementById("readingAge").value;
      e.target.disabled = true;
      e.target.textContent = "Enhancing…";
      State.setProgress("enhance", "in-progress");
      const res = await Utils.callAI("enhanceStory", {
        text: p.script.raw, level: p.script.enhanceLevel, readingAge: p.script.readingAge,
      });
      p.script.enhanced = res.enhanced;
      State.setProgress("enhance", "done");
      State.notify("Story enhanced", "AI enhancement complete. Review and accept the new version.");
      App.navigate("enhance");
      Utils.toast("Enhancement complete.");
    });

    document.getElementById("acceptEnhanceBtn")?.addEventListener("click", () => {
      const ta = document.getElementById("enhancedTextarea");
      p.script.raw = ta.value;
      p.script.enhanced = ta.value;
      p.script.wordCount = Utils.wordCount(ta.value);
      p.script.estDurationSec = Utils.estimateDurationSec(ta.value);
      State.touchProject();
      Utils.toast("Enhanced version is now the active script.");
      App.navigate("scenes");
    });
  },
};
