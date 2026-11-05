const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
try { paused ||= localStorage.getItem('bbv-motion-paused') === 'true'; } catch {}

const scene = document.createElement('div');
scene.className = 'depth-scene';
scene.setAttribute('aria-hidden', 'true');
scene.innerHTML = '<div class="scene-glow glow-one"></div><div class="scene-glow glow-two"></div><div class="scene-perspective"><div class="scene-orbit orbit-one"></div><div class="scene-orbit orbit-two"></div><div class="scene-orbit orbit-three"></div><div class="scene-sphere sphere-one"></div><div class="scene-sphere sphere-two"></div><div class="scene-floor"></div></div>';
document.body.prepend(scene);

const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'motion-toggle';
function applyMotion() {
  document.body.classList.toggle('motion-paused', paused);
  toggle.textContent = paused ? '▷ Activar ambiente' : 'Ⅱ Pausar ambiente';
  toggle.setAttribute('aria-pressed', String(paused));
}
toggle.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('bbv-motion-paused', String(paused)); } catch {}
  applyMotion();
});
reducedMotion.addEventListener('change', (event) => { paused = event.matches; applyMotion(); });
const motionHost = document.querySelector('.wheel-top-actions, .topbar, .qr-stage-header, .login-art');
(motionHost || document.body).appendChild(toggle);
applyMotion();

// Vector mascot: each limb can move independently without downloading a video.
const bull = `<svg class="bull-svg" viewBox="0 0 260 300" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="bull-body" x1="0" x2="1" y2="1"><stop stop-color="#a887cf"/><stop offset=".48" stop-color="#715094"/><stop offset="1" stop-color="#32213f"/></linearGradient>
    <linearGradient id="bull-shirt" x1="0" x2="1" y2="1"><stop stop-color="#94efc5"/><stop offset=".5" stop-color="#36bc87"/><stop offset="1" stop-color="#136b57"/></linearGradient>
    <linearGradient id="bull-horn" x1="0" x2=".7" y2="1"><stop stop-color="#fffef2"/><stop offset="1" stop-color="#c6b9a7"/></linearGradient>
    <radialGradient id="bull-muzzle" cx=".35" cy=".2" r=".85"><stop stop-color="#d5bee4"/><stop offset="1" stop-color="#9268ab"/></radialGradient>
  </defs>
  <ellipse cx="130" cy="280" rx="78" ry="12" fill="#050b15" opacity=".23"/>
  <g class="bull-body">
    <path d="M185 204 Q232 210 220 176" fill="none" stroke="#715094" stroke-width="10" stroke-linecap="round"/>
    <path d="M220 162 Q236 178 219 184 Q207 176 220 162" fill="#bd9ad7"/>
    <g class="bull-leg"><path d="M95 232 L90 269" stroke="#715094" stroke-width="28" stroke-linecap="round"/><path d="M77 267 Q90 256 107 265 L108 278 L74 278 Z" fill="#231c34"/></g>
    <g class="bull-leg leg-right"><path d="M162 232 L171 269" stroke="#5b3c7a" stroke-width="28" stroke-linecap="round"/><path d="M157 265 Q176 256 185 269 L188 278 L155 278 Z" fill="#231c34"/></g>
    <g class="bull-arm arm-left"><path d="M86 178 Q49 188 56 222" stroke="url(#bull-body)" stroke-width="25" fill="none" stroke-linecap="round"/><ellipse cx="57" cy="224" rx="16" ry="15" fill="#33213e"/></g>
    <path d="M94 160 Q130 146 166 161 Q191 191 184 235 Q132 258 78 235 Q71 196 94 160" fill="url(#bull-shirt)"/>
    <path d="M93 162 Q130 188 168 162" fill="none" stroke="#b0f6d5" stroke-width="6"/>
    <text x="130" y="218" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="25" font-weight="900">BBV</text>
    <g class="bull-arm arm-right"><path d="M175 180 Q214 169 222 137" stroke="url(#bull-body)" stroke-width="26" fill="none" stroke-linecap="round"/><ellipse cx="223" cy="135" rx="17" ry="16" fill="#33213e"/><path d="M219 124 L221 140" stroke="#87649e" stroke-width="3" stroke-linecap="round"/></g>
    <g class="bull-head">
      <path d="M79 80 Q31 82 38 30 Q52 56 87 48" fill="url(#bull-horn)"/>
      <path d="M178 80 Q226 82 220 30 Q206 56 171 48" fill="url(#bull-horn)"/>
      <ellipse cx="68" cy="96" rx="25" ry="17" transform="rotate(26 68 96)" fill="#8c65a6"/>
      <ellipse cx="192" cy="96" rx="25" ry="17" transform="rotate(-26 192 96)" fill="#715094"/>
      <path d="M71 86 Q69 36 129 39 Q190 35 189 89 L183 136 Q164 170 128 171 Q88 169 77 134 Z" fill="url(#bull-body)"/>
      <path d="M101 46 Q102 20 127 29 L122 40 Q148 19 158 39 L146 55" fill="#b694d1"/>
      <ellipse cx="105" cy="94" rx="15" ry="19" fill="#fff"/><ellipse cx="158" cy="94" rx="15" ry="19" fill="#fff"/>
      <g class="bull-eyes"><ellipse cx="110" cy="98" rx="8" ry="11" fill="#211a30"/><ellipse cx="163" cy="98" rx="8" ry="11" fill="#211a30"/><circle cx="112" cy="94" r="3" fill="#fff"/><circle cx="165" cy="94" r="3" fill="#fff"/></g>
      <path d="M91 72 Q104 64 116 72 M148 71 Q161 62 172 70" fill="none" stroke="#48305e" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="131" cy="134" rx="50" ry="33" fill="url(#bull-muzzle)"/>
      <ellipse cx="108" cy="126" rx="6" ry="5" fill="#684276"/><ellipse cx="153" cy="126" rx="6" ry="5" fill="#684276"/>
      <path d="M112 143 Q132 160 153 143" fill="#533566" stroke="#533566" stroke-width="3" stroke-linecap="round"/>
      <path d="M116 145 Q132 149 149 145" stroke="#fff9f0" stroke-width="4" fill="none"/>
    </g>
  </g>
</svg>`;
document.querySelectorAll('[data-bull]').forEach((mount) => { mount.innerHTML = bull; });
