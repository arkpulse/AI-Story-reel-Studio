const ScriptInputView = {
  title: "Script Input",
  subtitle: "Write or import your story to get started.",

  render() {
    const p = State.getActiveProject();
    return `
      <div class="grid" style="grid-template-columns:2fr 1fr;gap:18px;">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <div class="section-head">
              <div><h2>Story editor</h2><p>Paste your script, or type it right here.</p></div>
              <span class="pill">100% client-side</span>
            </div>
            <div class="field">
              <textarea id="scriptTextarea" rows="18" placeholder="Once upon a time...">${Utils.escapeHtml(p.script.raw)}</textarea>
            </div>
            <div class="flex-between">
              <div class="small">
                <strong id="wordCountLabel">${p.script.wordCount}</strong> words ·
                estimated video length <strong id="durationLabel">${Utils.formatDuration(p.script.estDurationSec)}</strong>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn" id="clearScriptBtn">Clear</button>
                <button class="btn btn-accent" id="saveScriptBtn">Save Script</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Import a file</h3>
            <p class="muted">.txt or .docx</p>
            <div class="dropzone" id="dropzone">
              <div style="font-size:1.6rem;">📄</div>
              <p>Drag &amp; drop a file here<br>or click to browse</p>
              <input type="file" id="fileInput" accept=".txt,.docx" class="hidden">
            </div>
            <div class="divider"></div>
            <h3>Reading pace</h3>
            <p class="muted">Used to estimate duration (~130 wpm narration)</p>
            <div class="stat-tile" style="border:none;padding:0;">
              <div class="stat-num">${Utils.formatDuration(p.script.estDurationSec)}</div>
              <div class="stat-label">Current estimate</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    const textarea = document.getElementById("scriptTextarea");
    const wordLabel = document.getElementById("wordCountLabel");
    const durLabel = document.getElementById("durationLabel");

    const updateStats = () => {
      const wc = Utils.wordCount(textarea.value);
      const dur = Utils.estimateDurationSec(textarea.value);
      wordLabel.textContent = wc;
      durLabel.textContent = Utils.formatDuration(dur);
    };
    textarea.addEventListener("input", updateStats);

    document.getElementById("saveScriptBtn").addEventListener("click", () => {
      p.script.raw = textarea.value;
      p.script.wordCount = Utils.wordCount(textarea.value);
      p.script.estDurationSec = Utils.estimateDurationSec(textarea.value);
      State.setProgress("script", "done");
      State.notify("Script saved", `${p.script.wordCount} words captured for "${p.name}".`);
      Utils.toast("Script saved.");
    });

    document.getElementById("clearScriptBtn").addEventListener("click", () => {
      textarea.value = "";
      updateStats();
    });

    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    dropzone.addEventListener("click", () => fileInput.click());
    ["dragenter", "dragover"].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add("drag"); }));
    ["dragleave", "drop"].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove("drag"); }));
    dropzone.addEventListener("drop", e => {
      const file = e.dataTransfer.files[0];
      if (file) this.handleFile(file, textarea, updateStats);
    });
    fileInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) this.handleFile(file, textarea, updateStats);
    });
  },

  async handleFile(file, textarea, updateStats) {
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".txt")) {
        const text = await file.text();
        textarea.value = text;
        updateStats();
        Utils.toast(`Imported ${file.name}`);
      } else if (name.endsWith(".docx")) {
        if (typeof mammoth === "undefined") {
          Utils.toast("DOCX import library failed to load.", "warn");
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        textarea.value = result.value;
        updateStats();
        Utils.toast(`Imported ${file.name}`);
      } else {
        Utils.toast("Only .txt and .docx files are supported.", "warn");
      }
    } catch (err) {
      console.error(err);
      Utils.toast("Could not read that file.", "warn");
    }
  },
};
