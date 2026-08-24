const CharactersView = {
  title: "Character Manager",
  subtitle: "Lock down every character's look, voice, and personality so they stay consistent scene to scene.",

  render() {
    const p = State.getActiveProject();
    return `
      <div class="section-head">
        <div><h2>Characters</h2><p>${p.characters.length} character${p.characters.length === 1 ? "" : "s"} defined</p></div>
        <div style="display:flex;gap:8px;">
          <button class="btn" id="extractCharBtn">✦ Auto-detect from script</button>
          <button class="btn btn-accent" id="addCharBtn">+ Add Character</button>
        </div>
      </div>

      ${p.characters.length ? `
        <div class="grid grid-3" id="charGrid">
          ${p.characters.map(c => this.charCard(c)).join("")}
        </div>
      ` : `<div class="card"><div class="card-body empty-state"><span class="glyph">☺</span>No characters yet. Add one manually or auto-detect from your script.</div></div>`}
    `;
  },

  charCard(c) {
    const initial = (c.name || "?").charAt(0).toUpperCase();
    return `
      <div class="char-card" data-char-id="${c.id}">
        <div class="char-avatar" style="background:${c.color};">${initial}</div>
        <div class="field"><label>Name</label><input type="text" data-field="name" value="${Utils.escapeHtml(c.name)}"></div>
        <div class="field-row">
          <div><label>Age</label><input type="text" data-field="age" value="${Utils.escapeHtml(c.age)}"></div>
          <div><label>Gender</label><input type="text" data-field="gender" value="${Utils.escapeHtml(c.gender)}"></div>
        </div>
        <div class="field"><label>Clothes</label><input type="text" data-field="clothes" value="${Utils.escapeHtml(c.clothes)}"></div>
        <div class="field"><label>Hair</label><input type="text" data-field="hair" value="${Utils.escapeHtml(c.hair)}"></div>
        <div class="field"><label>Face</label><input type="text" data-field="face" value="${Utils.escapeHtml(c.face)}"></div>
        <div class="field"><label>Personality</label><input type="text" data-field="personality" value="${Utils.escapeHtml(c.personality)}"></div>
        <div class="field"><label>Voice style</label><input type="text" data-field="voiceStyle" value="${Utils.escapeHtml(c.voiceStyle)}"></div>
        <div class="field">
          <label>Color palette</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="color-swatch" style="background:${c.color};"></span>
            <input type="text" data-field="color" value="${Utils.escapeHtml(c.color)}" style="flex:1;">
          </div>
        </div>
        <button class="btn btn-sm" data-delete-char="${c.id}">Remove</button>
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();

    document.getElementById("addCharBtn")?.addEventListener("click", () => {
      const name = `Character ${p.characters.length + 1}`;
      p.characters.push({
        id: Utils.uid("char"), name, age: "young", gender: "unspecified",
        clothes: "", hair: "", face: "", personality: "", voiceStyle: "",
        color: Utils.hashColor(name + Date.now()),
      });
      State.setProgress("characters", "in-progress");
      State.touchProject();
      App.navigate("characters");
    });

    document.getElementById("extractCharBtn")?.addEventListener("click", async (e) => {
      const p2 = State.getActiveProject();
      if (!p2.script.raw.trim()) { Utils.toast("Add a script first.", "warn"); return; }
      e.target.disabled = true; e.target.textContent = "Scanning…";
      const res = await Utils.callAI("extractCharacters", { text: p2.script.enhanced || p2.script.raw });
      const existingNames = new Set(p2.characters.map(c => c.name.toLowerCase()));
      res.characters.forEach(c => { if (!existingNames.has(c.name.toLowerCase())) p2.characters.push(c); });
      State.setProgress("characters", "done");
      State.touchProject();
      State.notify("Characters detected", `${res.characters.length} character(s) found in the script.`);
      App.navigate("characters");
      Utils.toast("Characters extracted.");
    });

    document.querySelectorAll(".char-card [data-field]").forEach(el => {
      el.addEventListener("change", () => {
        const card = el.closest(".char-card");
        const c = p.characters.find(c => c.id === card.dataset.charId);
        if (c) { c[el.dataset.field] = el.value; State.setProgress("characters", "done"); State.touchProject(); App.navigate("characters"); }
      });
    });

    document.querySelectorAll("[data-delete-char]").forEach(btn => {
      btn.addEventListener("click", () => {
        p.characters = p.characters.filter(c => c.id !== btn.dataset.deleteChar);
        State.touchProject();
        App.navigate("characters");
      });
    });
  },
};
