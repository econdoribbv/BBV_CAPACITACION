// Animate the original MAX artwork. The hand is attached to a point on the rim
// during the pull; the wheel and hand share the same angle on every frame.
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const point = (a, b, t) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });
const palm = [[196,246],[205,236],[219,229],[235,231],[237,247],[214,257],[198,255]];
function polygon(ctx, points) {
  ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
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
    const contact = this.rim(145);
    this.body = { x: contact.x - 45 - 316 * this.scale, y: Math.min(contact.y - 20 - 164 * this.scale, this.height - this.size) };
    this.body.x = Math.max(-100 * this.scale, this.body.x);
    this.rest = { x: this.body.x - 15, y: this.body.y + 8 };
  }
  rim(degrees) {
    const radians = degrees * Math.PI / 180;
    return { x: this.center.x + Math.cos(radians) * this.radius, y: this.center.y + Math.sin(radians) * this.radius };
  }
  shoulder(body) { return { x: body.x + 316 * this.scale, y: body.y + 164 * this.scale }; }
  restHand(body) { const s = this.shoulder(body); return { x: s.x + 14, y: s.y + this.size * .34 }; }
  draw(body, hand, gripping = false) {
    const ctx = this.ctx, s = this.scale;
    ctx.clearRect(0, 0, this.width, this.height);
    // Keep MAX's face, clothes and body pixels; animate only the reaching arm.
    ctx.save(); ctx.translate(body.x + this.size, body.y); ctx.scale(-s, s);
    ctx.beginPath(); ctx.rect(0,0,500,500); ctx.rect(0,0,182,220); ctx.clip('evenodd');
    ctx.drawImage(this.image,0,0,500,500); ctx.restore();
    const shoulder = this.shoulder(body);
    const dx = hand.x-shoulder.x, dy = hand.y-shoulder.y, distance = Math.hypot(dx,dy) || 1;
    const length = Math.max(this.size * .255, distance / 2 + 2);
    const bend = Math.sqrt(Math.max(0, length * length - distance * distance / 4));
    const bendSide = dx >= 0 ? 1 : -1;
    const elbow = { x: (shoulder.x+hand.x)/2 - dy/distance*bend*bendSide, y: (shoulder.y+hand.y)/2 + dx/distance*bend*bendSide };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(shoulder.x,shoulder.y); ctx.lineTo(elbow.x,elbow.y); ctx.lineTo(hand.x,hand.y);
    ctx.strokeStyle = '#1b304b'; ctx.lineWidth = this.size * .087; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(shoulder.x+2,shoulder.y-3); ctx.lineTo(elbow.x+2,elbow.y-3); ctx.lineTo(hand.x,hand.y);
    ctx.strokeStyle = '#28415c'; ctx.lineWidth = 2; ctx.stroke();
    const wrist = point(elbow,hand,.88);
    ctx.beginPath(); ctx.moveTo(wrist.x,wrist.y); ctx.lineTo(hand.x,hand.y); ctx.strokeStyle = '#f4f3e9'; ctx.lineWidth = this.size*.075; ctx.stroke();
    // The original brown hand is composited over the rim, with fingers in front.
    ctx.save(); ctx.translate(hand.x,hand.y);
    ctx.rotate(Math.atan2(this.center.y-hand.y,this.center.x-hand.x)-Math.PI);
    ctx.scale(s*1.25,s*1.25); ctx.translate(-216,-244); polygon(ctx,palm); ctx.clip(); ctx.drawImage(this.image,0,0,500,500); ctx.restore();
    this.layer.dataset.gripping = String(gripping);
    this.layer.dataset.handX = hand.x.toFixed(2); this.layer.dataset.handY = hand.y.toFixed(2);
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
  async gripAndPush(setRotation, initialRotation) {
    await this.ready; this.measure(); this.layer.hidden = false; this.rig.classList.add('max-acting');
    const start = this.rim(145), end = this.rim(125);
    const startingHand = this.restHand(this.rest);
    await this.timeline(700, (t) => this.draw(point(this.rest,this.body,smooth(t)),point(startingHand,start,smooth(t))));
    this.rig.classList.add('is-gripping');
    await this.timeline(240, () => this.draw(this.body,start,true));
    await this.timeline(850, (t) => {
      const pull = t*t;
      const hand = this.rim(145-20*pull);
      const body = { x:this.body.x+(end.x-start.x)*pull*.3, y:this.body.y+(end.y-start.y)*pull*.15 };
      setRotation(initialRotation-20*pull);
      this.draw(body,hand,true); this.releaseBody = body; this.releaseHand = hand;
    });
    this.rig.classList.remove('is-gripping');
  }
  async release() {
    const body = this.releaseBody || this.body, hand = this.releaseHand || this.rim(125);
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
