const ExportView = {
  title: "Export",
  subtitle: "Download your script, prompts, character sheets, and final assets.",

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid grid-3">
        <div class="card"><div class="card-body">
          <h3>Script (.txt)</h3>
          <p class="muted small">Enhanced version if available, else original.</p>
          <button class="btn btn-block" id="exportScriptBtn" ${!p.script.raw ? "disabled" : ""}>Download .txt</button>
        </div></div>

        <div class="card"><div class="card-body">
          <h3>Scene prompts (.json)</h3>
          <p class="muted small">Every image / animation / SFX / music prompt.</p>
          <button class="btn btn-block" id="exportScenesBtn" ${!p.scenes.length ? "disabled" : ""}>Download .json</button>
        </div></div>

        <div class="card"><div class="card-body">
          <h3>Character sheets (.json)</h3>
          <p class="muted small">Full consistency spec for every character.</p>
          <button class="btn btn-block" id="exportCharsBtn" ${!p.characters.length ? "disabled" : ""}>Download .json</button>
        </div></div>

        <div class="card"><div class="card-body">
          <h3>Voice files</h3>
          <p class="muted small">Requires a connected TTS backend to produce real audio.</p>
          <button class="btn btn-block" disabled>No audio backend connected</button>
        </div></div>

        <div class="card"><div class="card-body">
          <h3>Thumbnail</h3>
          <p class="muted small">Requires a connected image backend for a real file.</p>
          <button class="btn btn-block" ${!p.thumbnails.length ? "disabled" : ""} id="exportThumbBtn">Download spec (.json)</button>
        </div></div>

        <div class="card"><div class="card-body">
          <h3>Final MP4</h3>
          <p class="muted small">Requires the Video Editor render + a compositing backend.</p>
          <button class="btn btn-block" disabled>No render backend connected</button>
        </div></div>
      </div>

      <div class="note-box" style="margin-top:18px;">
        <strong>What's real vs. mock:</strong> text exports (script, prompts, character sheets) work fully offline right now. Audio, image, animation, and final MP4 files require the backend + provider integrations described throughout the app before a downloadable file exists.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("exportScriptBtn")?.addEventListener("click", () => {
      Utils.download(`${p.name}-script.txt`, p.script.enhanced || p.script.raw);
    });
    document.getElementById("exportScenesBtn")?.addEventListener("click", () => {
      Utils.download(`${p.name}-scenes.json`, JSON.stringify(p.scenes, null, 2), "application/json");
    });
    document.getElementById("exportCharsBtn")?.addEventListener("click", () => {
      Utils.download(`${p.name}-characters.json`, JSON.stringify(p.characters, null, 2), "application/json");
    });
    document.getElementById("exportThumbBtn")?.addEventListener("click", () => {
      Utils.download(`${p.name}-thumbnails.json`, JSON.stringify(p.thumbnails, null, 2), "application/json");
    });
  },
};
