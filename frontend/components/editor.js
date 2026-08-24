const EditorView = {
  title: "Video Editor",
  subtitle: "Combine animated scenes, narration, music, SFX, captions, and transitions into one timeline.",

  render() {
    const p = State.getActiveProject();
    const readyScenes = p.scenes.filter(s => s.status === "animated" || s.status === "image-ready").length;
    return `
      <div class="card" style="margin-bottom:18px;">
        <div class="card-sprocket"></div>
        <div class="card-body">
          <div class="section-head">
            <div><h2>Timeline</h2><p>${p.scenes.length} scenes · ${readyScenes} with animation/art ready</p></div>
          </div>
          <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;">
            ${p.scenes.length ? p.scenes.map(s => `
              <div style="min-width:130px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-s);padding:8px;">
                <div class="scene-thumb" style="aspect-ratio:16/9;margin-bottom:6px;">#${s.index}</div>
                <div class="small">${(s.narration || "").slice(0, 40)}${(s.narration || "").length > 40 ? "…" : ""}</div>
              </div>
            `).join("") : `<p class="small">No scenes yet.</p>`}
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Intro / Outro / Captions</h3>
            <div class="field"><label><input type="checkbox" id="introToggle" checked> Include intro title card</label></div>
            <div class="field"><label><input type="checkbox" id="outroToggle" checked> Include outro / credits card</label></div>
            <div class="field"><label><input type="checkbox" id="captionsToggle" checked> Burn in captions</label></div>
            <div class="field"><label><input type="checkbox" id="subsToggle" checked> Generate subtitle file (.srt)</label></div>
          </div>
        </div>
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Assemble &amp; render</h3>
            <p class="muted">Combines scenes + narration + music + SFX + transitions using your Video Settings.</p>
            <button class="btn btn-accent btn-block" id="renderBtn" ${!p.scenes.length ? "disabled" : ""}>✂ Render Video</button>
            <div id="renderProgressWrap" class="hidden" style="margin-top:14px;">
              <div class="progress-row"><div class="progress-track" style="flex:1;"><div class="progress-fill" id="renderFill" style="width:0%;"></div></div><span class="pct" id="renderPct">0%</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="note-box" style="margin-top:18px;">
        <strong>Backend note:</strong> real assembly needs server-side video compositing — <span class="kbd">POST /api/edit/render</span> using FFmpeg (or a managed pipeline like Shotstack/Remotion) to stitch animated clips, mix audio stems, burn captions, and export the final MP4.
      </div>
    `;
  },

  after() {
    const p = State.getActiveProject();
    document.getElementById("renderBtn")?.addEventListener("click", async (e) => {
      e.target.disabled = true;
      State.setProgress("edit", "in-progress");
      const wrap = document.getElementById("renderProgressWrap");
      const fill = document.getElementById("renderFill");
      const pct = document.getElementById("renderPct");
      wrap.classList.remove("hidden");
      const res = await Utils.callAI("renderVideo", { sceneCount: p.scenes.length }, { minMs: 100, maxMs: 200 });

      let progress = 0;
      await new Promise(resolve => {
        const iv = setInterval(() => {
          progress += Math.random() * 18 + 8;
          if (progress >= 100) { progress = 100; clearInterval(iv); resolve(); }
          fill.style.width = progress + "%";
          pct.textContent = Math.round(progress) + "%";
        }, 220);
      });

      p.renderHistory.unshift({ id: res.job.id, type: "Full render", status: "complete", time: Date.now() });
      State.setProgress("edit", "done");
      State.touchProject();
      State.notify("Render complete", "Your video has been assembled and is ready to export.");
      Utils.toast("Render complete — head to Export.");
      e.target.disabled = false;
    });
  },
};
