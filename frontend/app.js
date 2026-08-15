const Views = {
  dashboard: DashboardView,
  script: ScriptInputView,
  enhance: EnhanceView,
  scenes: ScenesView,
  characters: CharactersView,
  voice: VoiceView,
  images: ImagesView,
  animation: AnimationView,
  audio: AudioView,
  editor: EditorView,
  settings: SettingsView,
  thumbnail: ThumbnailView,
  seo: SEOView,
  export: ExportView,
  apikeys: ApiKeysView,
};

const App = {
  currentView: "dashboard",

  init() {
    State.load();
    document.body.dataset.theme = State.data.theme;
    this.updateThemeToggle();
    this.renderProjectSelector();
    this.bindGlobal();
    this.navigate("dashboard");
  },

  bindGlobal() {
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        this.navigate(btn.dataset.view);
        document.getElementById("sidebar").classList.remove("open");
      });
    });

    document.getElementById("themeToggle").addEventListener("click", () => {
      State.data.theme = State.data.theme === "dark" ? "light" : "dark";
      document.body.dataset.theme = State.data.theme;
      State.save();
      this.updateThemeToggle();
    });

    document.getElementById("mobileNavBtn").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });

    document.getElementById("newProjectBtn").addEventListener("click", () => this.createProject());

    document.getElementById("projectSelector").addEventListener("change", (e) => {
      State.setActiveProject(e.target.value);
      this.navigate(this.currentView);
    });

    document.getElementById("notifBtn").addEventListener("click", () => {
      const panel = document.getElementById("notifPanel");
      panel.classList.toggle("hidden");
      this.renderNotifications();
      document.getElementById("notifDot").classList.add("hidden");
    });
    document.addEventListener("click", (e) => {
      const panel = document.getElementById("notifPanel");
      if (!panel.contains(e.target) && e.target.id !== "notifBtn") panel.classList.add("hidden");
    });
    document.getElementById("clearNotifs").addEventListener("click", () => {
      State.data.notifications = [];
      State.save();
      this.renderNotifications();
    });
  },

  createProject() {
    const name = prompt("Project name:", "New Storybook");
    if (!name) return;
    State.addProject(name);
    this.renderProjectSelector();
    this.navigate("script");
    Utils.toast(`"${name}" created.`);
  },

  renderProjectSelector() {
    const sel = document.getElementById("projectSelector");
    sel.innerHTML = State.data.projects.map(p =>
      `<option value="${p.id}" ${p.id === State.data.activeProjectId ? "selected" : ""}>${Utils.escapeHtml(p.name)}</option>`
    ).join("");
  },

  updateThemeToggle() {
    const dark = State.data.theme === "dark";
    document.getElementById("themeIcon").textContent = dark ? "☀" : "☾";
    document.getElementById("themeLabel").textContent = dark ? "Light mode" : "Dark mode";
  },

  navigate(view) {
    if (!Views[view]) view = "dashboard";
    this.currentView = view;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    const mod = Views[view];
    document.getElementById("viewTitle").textContent = mod.title;
    document.getElementById("viewSubtitle").textContent = mod.subtitle;
    document.getElementById("viewContainer").innerHTML = mod.render();
    this.renderProjectSelector();
    if (mod.after) mod.after();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  },

  renderNotifications() {
    const list = document.getElementById("notifList");
    const notifs = State.data.notifications;
    list.innerHTML = notifs.length
      ? notifs.map(n => `
        <div class="notif-item">
          <strong>${Utils.escapeHtml(n.title)}</strong>
          <div>${Utils.escapeHtml(n.body)}</div>
          <div class="t">${Utils.timeAgo(n.time)}</div>
        </div>
      `).join("")
      : `<div class="notif-empty">No notifications yet.</div>`;
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
