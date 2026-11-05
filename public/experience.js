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
function freezeMascot(mount) {
  const image = mount.querySelector('img');
  const still = mount.querySelector('canvas');
  if (!image.complete || !image.naturalWidth) return;
  if (paused) still.getContext('2d').drawImage(image, 0, 0, still.width, still.height);
  image.hidden = paused;
  still.hidden = !paused;
}
function applyMotion() {
  document.body.classList.toggle('motion-paused', paused);
  toggle.textContent = paused ? '▷ Activar ambiente' : 'Ⅱ Pausar ambiente';
  toggle.setAttribute('aria-pressed', String(paused));
  document.querySelectorAll('.bull-mascot').forEach(freezeMascot);
}
toggle.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('bbv-motion-paused', String(paused)); } catch {}
  applyMotion();
});
reducedMotion.addEventListener('change', (event) => { paused = event.matches; applyMotion(); });
const motionHost = document.querySelector('.wheel-top-actions, .topbar, .qr-stage-header, .login-art');
(motionHost || document.body).appendChild(toggle);
// Original animated MAX artwork from the user's Aula Bursátil website.
// Freeze a rendered frame when motion is paused, without altering the source asset.
document.querySelectorAll('[data-bull]').forEach((mount) => {
  mount.innerHTML = '<div class="bull-mascot bull-body" role="img" aria-label="MAX, el toro de Aula Bursátil"><img class="max-image" src="/mascots/max.webp" width="500" height="500" alt="" aria-hidden="true"><canvas class="max-still" width="500" height="500" aria-hidden="true" hidden></canvas></div>';
  mount.querySelector('img').addEventListener('load', () => freezeMascot(mount.querySelector('.bull-mascot')));
});
applyMotion();
