const DashboardView = {
  title: "Dashboard",
  subtitle: "Your projects, at a glance.",

  render() {
    const projects = State.data.projects;
    const active = State.getActiveProject();
    const stageLabels = {
      script: "Script", enhance: "Enhance", scenes: "Scenes", characters: "Characters",
      voice: "Voice", images: "Images", animation: "Animation", audio: "Audio",
      edit: "Edit", export: "Export",
    };
    const doneCount = Object.values(active.progress).filter(s => s === "done").length;
    const totalStages = Object.keys(active.progress).length;
    const pct = Math.round((doneCount / totalStages) * 100);

    return `
      <div class="grid grid-4" style="margin-bottom:20px;">
        <div class="stat-tile"><div class="stat-num">${projects.length}</div><div class="stat-label">Projects</div></div>
        <div class="stat-tile"><div class="stat-num">${active.scenes.length}</div><div class="stat-label">Scenes in "${Utils.escapeHtml(active.name)}"</div></div>
        <div class="stat-tile"><div class="stat-num">${active.characters.length}</div><div class="stat-label">Characters</div></div>
        <div class="stat-tile"><div class="stat-num">${pct}%</div><div class="stat-label">Project complete</div></div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Current project — ${Utils.escapeHtml(active.name)}</h3>
            <p class="muted">Updated ${Utils.timeAgo(active.updatedAt)}</p>
            <div class="progress-row" style="margin-bottom:16px;">
              <div class="progress-track" style="flex:1;"><div class="progress-fill" style="width:${pct}%;"></div></div>
              <span class="pct">${pct}%</span>
            </div>
            <div class="grid grid-3">
              ${Object.entries(active.progress).map(([k, v]) => `
                <div class="pill ${v === 'done' ? 'pill-live' : v === 'in-progress' ? 'pill-mock' : ''}" style="justify-content:center;">
                  ${stageLabels[k]} · ${v.replace('-', ' ')}
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-sprocket"></div>
          <div class="card-body">
            <h3>Estimated rendering time</h3>
            <p class="muted">Based on current scene count and settings</p>
            <div class="stat-tile" style="border:none;padding:0;">
              <div class="stat-num">${Utils.formatDuration((active.scenes.length || 1) * 8 * 60)}</div>
              <div class="stat-label">~8 min of AI compute per scene (provider dependent)</div>
            </div>
            <div class="divider"></div>
            <p class="small">Script duration estimate: <strong>${Utils.formatDuration(active.script.estDurationSec)}</strong> · ${active.script.wordCount} words</p>
          </div>
        </div>
      </div>

      <div class="section-head" style="margin-top:26px;">
        <div><h2>Previous projects</h2><p>Switch or resume any project</p></div>
        <button class="btn btn-accent" id="dashNewProject">+ New Project</button>
      </div>
      <div class="grid grid-3">
        ${projects.map(p => `
          <div class="card" style="cursor:pointer;" data-project-id="${p.id}">
            <div class="card-sprocket"></div>
            <div class="card-body">
              <div class="flex-between">
                <h3>${Utils.escapeHtml(p.name)}</h3>
                ${p.id === active.id ? '<span class="pill pill-live">Active</span>' : ''}
              </div>
              <p class="muted">${p.scenes.length} scenes · ${p.characters.length} characters</p>
              <p class="small">Updated ${Utils.timeAgo(p.updatedAt)}</p>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="section-head" style="margin-top:26px;">
        <div><h2>Generation history</h2><p>Recent render jobs and AI calls</p></div>
      </div>
      <div class="card">
        <div class="card-sprocket"></div>
        <div class="card-body">
          ${active.renderHistory.length ? `
            <table>
              <thead><tr><th>Job</th><th>Type</th><th>Status</th><th>When</th></tr></thead>
              <tbody>
                ${active.renderHistory.slice(0, 8).map(h => `
                  <tr><td>${h.id}</td><td>${h.type}</td><td>${h.status}</td><td>${Utils.timeAgo(h.time)}</td></tr>
                `).join("")}
              </tbody>
            </table>
          ` : `<div class="empty-state"><span class="glyph">🎬</span>No renders yet. Head to the Video Editor to combine your first scene.</div>`}
        </div>
      </div>
    `;
  },

  after() {
    document.getElementById("dashNewProject")?.addEventListener("click", () => App.createProject());
    document.querySelectorAll("[data-project-id]").forEach(card => {
      card.addEventListener("click", () => {
        State.setActiveProject(card.dataset.projectId);
        App.navigate("dashboard");
      });
    });
  },
};
