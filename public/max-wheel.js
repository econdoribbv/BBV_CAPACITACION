// Animate the original MAX artwork as a cut-out puppet. The raised arm is rebuilt
// from its own joints (shoulder, elbow, wrist) so the real hand of the artwork holds
// a point on the rim; the wheel and the hand share the same angle on every frame.
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const point = (a, b, t) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const palm = [[196,246],[205,236],[219,229],[235,231],[237,247],[214,257],[198,255]];
// Measured on the artwork (frame 30, 500 x 500, before mirroring).
const ARM = {
  rootTop: { x: 168, y: 135 }, rootBottom: { x: 166, y: 184 },
  shoulder: { x: 164, y: 160 }, elbow: { x: 94, y: 178 }, wrist: { x: 71, y: 107.5 }, grip: { x: 70, y: 88 },
  elbowRadius: 15, wristRadius: 11.7, sleeve: '#1a2d47',
  cut: [[0,0],[176,0],[176,118],[165,135],[163,184],[163,200],[0,200]],
  hand: [[44,58],[90,58],[90,98],[84,104],[62,114],[57,110],[44,95]]
};
const UPPER = distance(ARM.shoulder, ARM.elbow);
const FORE = distance(ARM.elbow, ARM.grip);
const FORE_ANGLE = Math.atan2(ARM.grip.y - ARM.elbow.y, ARM.grip.x - ARM.elbow.x);
function trace(ctx, points) {
  points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
}
function polygon(ctx, points) { ctx.beginPath(); trace(ctx, points); }
// Two-bone arm: place the elbow so the hand reaches the target without stretching.
function solveArm(target) {
  const origin = ARM.shoulder, raw = distance(origin, target) || 1;
  const reach = Math.min(UPPER + FORE - 1, Math.max(Math.abs(UPPER - FORE) + 2, raw));
  const ux = (target.x - origin.x) / raw, uy = (target.y - origin.y) / raw;
  const along = (UPPER * UPPER - FORE * FORE + reach * reach) / (2 * reach);
  const off = Math.sqrt(Math.max(0, UPPER * UPPER - along * along));
  const base = { x: origin.x + ux * along, y: origin.y + uy * along };
  const one = { x: base.x - uy * off, y: base.y + ux * off }, other = { x: base.x + uy * off, y: base.y - ux * off };
  // The elbow hangs below the arm, as it does in the artwork.
  return { elbow: one.y >= other.y ? one : other, grip: { x: origin.x + ux * reach, y: origin.y + uy * reach } };
}
async function artwork() {
  const image = new Image(); image.src = '/mascots/max.webp'; await image.decode();
  if ('ImageDecoder' in window) {
    try {
      const decoder = new ImageDecoder({ data: await (await fetch(image.src)).arrayBuffer(), type: 'image/webp' });
      await decoder.tracks.ready;
      const frame = (await decoder.decode({ frameIndex: 30 })).image;
      const pose = await createImageBitmap(frame); frame.close(); decoder.close();
      return pose;
    } catch { /* Preserve the original artwork on browsers without WebP decoding. */ }
  }
  return createImageBitmap(image);
}

export class MaxWheelAnimator {
  constructor(area, rig, wheel) {
    this.area = area; this.rig = rig; this.wheel = wheel;
    this.ready = artwork().then((image) => { this.image = image; });
    this.layer = document.createElement('canvas');
    this.layer.className = 'max-motion-layer'; this.layer.setAttribute('aria-hidden', 'true');
    this.layer.hidden = true; area.appendChild(this.layer);
    this.ctx = this.layer.getContext('2d');
  }
  measure() {
    const a = this.area.getBoundingClientRect(), w = this.wheel.closest('.wheel-wrap').getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.layer.width = Math.round(a.width * dpr); this.layer.height = Math.round((a.height + 60) * dpr);
    this.layer.style.height = `${a.height + 60}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = a.width; this.height = a.height + 60;
    this.center = { x: w.left - a.left + w.width / 2, y: w.top - a.top + w.height / 2 };
    this.radius = w.width / 2 + 9;
    this.size = Math.min(290, w.width * .72);
    this.scale = this.size / 500;
    const s = this.scale, reach = (UPPER + FORE) * s;
    // MAX stands beside the wheel with the hand a little above and ahead of the shoulder.
    // On narrow screens he grips lower on the rim, where there is room to stand.
    const minX = 6 - 165 * s;
    const stand = (contact) => ({ x: contact.x - reach * .5 - (500 - ARM.shoulder.x) * s, y: contact.y + reach * .3 - ARM.shoulder.y * s });
    let angle = 145;
    while (angle > 100 && stand(this.rim(angle)).x < minX) angle -= 5;
    const start = this.rim(angle), end = this.rim(angle - 20);
    const body = stand(start);
    body.x = Math.max(minX, body.x); body.y = Math.min(this.height - this.size, body.y);
    let shoulder = this.place(body, ARM.shoulder);
    const gap = distance(shoulder, start);
    if (gap > reach * .92) {
      const step = 1 - reach * .92 / gap;
      body.x += (start.x - shoulder.x) * step; body.y += (start.y - shoulder.y) * step;
      shoulder = this.place(body, ARM.shoulder);
    }
    // While pulling, the body follows the hand just enough to keep the arm from stretching.
    let follow = .3;
    const pulled = () => ({ x: shoulder.x + (end.x - start.x) * follow, y: shoulder.y + (end.y - start.y) * follow });
    while (follow < 1 && distance(pulled(), end) > reach * .94) follow += .05;
    this.angle = angle; this.follow = follow; this.body = body;
    this.rest = { x: body.x - 15, y: body.y + 8 };
  }
  rim(degrees) {
    const radians = degrees * Math.PI / 180;
    return { x: this.center.x + Math.cos(radians) * this.radius, y: this.center.y + Math.sin(radians) * this.radius };
  }
  // Artwork coordinates to the screen; MAX is mirrored to face the wheel.
  place(body, spot) { return { x: body.x + (500 - spot.x) * this.scale, y: body.y + spot.y * this.scale }; }
  restHand(body) { return this.place(body, ARM.grip); }
  draw(body, hand, gripping = false) {
    const ctx = this.ctx, s = this.scale;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save(); ctx.translate(body.x + this.size, body.y); ctx.scale(-s, s);
    // Keep MAX's face, clothes and body pixels; only the reaching arm is rebuilt.
    ctx.save(); ctx.beginPath(); ctx.rect(0,0,500,500); trace(ctx, ARM.cut); ctx.clip('evenodd');
    ctx.drawImage(this.image,0,0,500,500); ctx.restore();
    const { elbow, grip } = solveArm({ x: 500 - (hand.x - body.x) / s, y: (hand.y - body.y) / s });
    const turn = Math.atan2(elbow.y - ARM.shoulder.y, elbow.x - ARM.shoulder.x);
    const nx = -Math.sin(turn) * ARM.elbowRadius, ny = Math.cos(turn) * ARM.elbowRadius;
    ctx.fillStyle = ARM.sleeve;
    // Upper sleeve: stays attached to the jacket and tapers to the elbow.
    polygon(ctx, [[ARM.rootTop.x,ARM.rootTop.y],[elbow.x+nx,elbow.y+ny],[elbow.x-nx,elbow.y-ny],[ARM.rootBottom.x,ARM.rootBottom.y]]); ctx.fill();
    ctx.beginPath(); ctx.arc(elbow.x, elbow.y, ARM.elbowRadius, 0, Math.PI * 2); ctx.fill();
    // Forearm, cuff and the original hand turn together around the elbow.
    ctx.translate(elbow.x, elbow.y); ctx.rotate(Math.atan2(grip.y - elbow.y, grip.x - elbow.x) - FORE_ANGLE); ctx.translate(-ARM.elbow.x, -ARM.elbow.y);
    const length = distance(ARM.elbow, ARM.wrist);
    const mx = (ARM.elbow.y - ARM.wrist.y) / length, my = (ARM.wrist.x - ARM.elbow.x) / length;
    polygon(ctx, [
      [ARM.elbow.x + mx * ARM.elbowRadius, ARM.elbow.y + my * ARM.elbowRadius], [ARM.wrist.x + mx * ARM.wristRadius, ARM.wrist.y + my * ARM.wristRadius],
      [ARM.wrist.x - mx * ARM.wristRadius, ARM.wrist.y - my * ARM.wristRadius], [ARM.elbow.x - mx * ARM.elbowRadius, ARM.elbow.y - my * ARM.elbowRadius]
    ]); ctx.fill();
    polygon(ctx, ARM.hand); ctx.clip(); ctx.drawImage(this.image,0,0,500,500);
    ctx.restore();
    const held = this.place(body, grip);
    this.layer.dataset.gripping = String(gripping);
    this.layer.dataset.handX = held.x.toFixed(2); this.layer.dataset.handY = held.y.toFixed(2);
    this.layer.dataset.rimX = this.center.x.toFixed(2); this.layer.dataset.rimY = this.center.y.toFixed(2);
    this.layer.dataset.radius = this.radius.toFixed(2);
  }
  timeline(ms, frame) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => { const t = Math.min(1,(now-start)/ms); frame(t); if(t<1) requestAnimationFrame(tick); else resolve(); };
      requestAnimationFrame(tick);
    });
  }
  // Hand and body while the rim is pulled; `pull` goes from 0 to 1.
  pulling(pull) {
    const start = this.rim(this.angle), end = this.rim(this.angle - 20);
    return {
      hand: this.rim(this.angle - 20 * pull),
      body: { x: this.body.x + (end.x - start.x) * pull * this.follow, y: this.body.y + (end.y - start.y) * pull * this.follow }
    };
  }
  async gripAndPush(setRotation, initialRotation) {
    await this.ready; this.measure(); this.layer.hidden = false; this.rig.classList.add('max-acting');
    const start = this.rim(this.angle);
    const startingHand = this.restHand(this.rest);
    await this.timeline(700, (t) => this.draw(point(this.rest,this.body,smooth(t)),point(startingHand,start,smooth(t))));
    this.rig.classList.add('is-gripping');
    await this.timeline(240, () => this.draw(this.body,start,true));
    await this.timeline(850, (t) => {
      const pull = t*t;
      const { hand, body } = this.pulling(pull);
      setRotation(initialRotation-20*pull);
      this.draw(body,hand,true); this.releaseBody = body; this.releaseHand = hand;
    });
    this.rig.classList.remove('is-gripping');
  }
  async release() {
    const body = this.releaseBody || this.body, hand = this.releaseHand || this.rim(this.angle - 20);
    await this.timeline(650,(t)=>this.draw(point(body,this.rest,smooth(t)),point(hand,this.restHand(this.rest),smooth(t))));
    this.reset();
  }
  reset() { this.layer.hidden = true; this.rig.classList.remove('max-acting','is-gripping'); }
  async showPrize(canvas, prizeImage) {
    await this.ready;
    if (!prizeImage.complete) await prizeImage.decode();
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,700,560);
    ctx.save(); ctx.translate(100,0); ctx.scale(1.08,1.08);
    ctx.drawImage(this.image,0,0,500,500);
    // The prize sits below the original palm; redraw that palm over its edge.
    ctx.save(); ctx.shadowColor = '#16393240'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(140,239,290,200,16); ctx.fill(); ctx.restore();
    // Frame the actual object, excluding the transparent margins in the photos.
    const photo = document.createElement('canvas');
    photo.width = prizeImage.naturalWidth; photo.height = prizeImage.naturalHeight;
    const photoCtx = photo.getContext('2d', { willReadFrequently: true });
    photoCtx.drawImage(prizeImage,0,0);
    const pixels = photoCtx.getImageData(0,0,photo.width,photo.height).data;
    let left = photo.width, top = photo.height, right = -1, bottom = -1;
    for (let y=0; y<photo.height; y++) for (let x=0; x<photo.width; x++) {
      if (pixels[(y*photo.width+x)*4+3] > 24) {
        left = Math.min(left,x); right = Math.max(right,x);
        top = Math.min(top,y); bottom = Math.max(bottom,y);
      }
    }
    if (right < left) { left=0; top=0; right=photo.width-1; bottom=photo.height-1; }
    const sourceWidth = right-left+1, sourceHeight = bottom-top+1;
    const scale = Math.min(270/sourceWidth,180/sourceHeight);
    const width = sourceWidth*scale, height = sourceHeight*scale;
    ctx.drawImage(prizeImage,left,top,sourceWidth,sourceHeight,285-width/2,339-height/2,width,height);
    ctx.save(); polygon(ctx,palm); ctx.clip(); ctx.drawImage(this.image,0,0,500,500); ctx.restore();
    ctx.restore();
  }
}
