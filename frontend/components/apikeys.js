const ApiKeysView = {
  title: "API Connections",
  subtitle: "Status of the AI providers this app is built to integrate with.",

  providers: [
    { name: "OpenAI", use: "Story enhancement, scene breakdown", env: "OPENAI_API_KEY" },
    { name: "Google Gemini", use: "Story enhancement (alternative)", env: "GEMINI_API_KEY" },
    { name: "ElevenLabs", use: "AI narration & dialogue voices", env: "ELEVENLABS_API_KEY" },
    { name: "Stable Diffusion / Flux", use: "Scene & character image generation", env: "SD_API_KEY / FLUX_API_KEY" },
    { name: "Runway", use: "Image-to-video animation", env: "RUNWAY_API_KEY" },
    { name: "Luma AI", use: "Image-to-video animation (alternative)", env: "LUMA_API_KEY" },
    { name: "Kling AI", use: "Image-to-video animation (alternative)", env: "KLING_API_KEY" },
    { name: "Pika", use: "Image-to-video animation (alternative)", env: "PIKA_API_KEY" },
    { name: "Google Veo", use: "High-fidelity video generation (if available)", env: "VEO_API_KEY" },
  ],

  render() {
    return `
      <div class="card">
        <div class="card-sprocket"></div>
        <div class="card-body">
          <h3>Providers</h3>
          <p class="muted">Keys are never entered in the browser. They live in the backend's environment config (<span class="kbd">/backend/config</span>) and are called from <span class="kbd">/backend/services</span>.</p>
          <table>
            <thead><tr><th>Provider</th><th>Used for</th><th>Env variable</th><th>Status</th></tr></thead>
            <tbody>
              ${this.providers.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="small">${p.use}</td>
                  <td><span class="kbd">${p.env}</span></td>
                  <td><span class="pill pill-mock">not connected (demo mode)</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="note-box" style="margin-top:18px;">
        This page is informational for the demo. In a real deployment it would call an authenticated backend endpoint (e.g. <span class="kbd">GET /api/providers/status</span>) to show which keys are configured, without ever exposing key values to the frontend.
      </div>
    `;
  },

  after() {},
};
