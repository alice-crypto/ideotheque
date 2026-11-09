/* Pack 90 — Lumière : la matière irisée, la plongée et la remontée */
(function (FX) {
  'use strict';
  var U = FX.util;

  // --- Outils WebGL partagés ----------------------------------------------------

  // Interférence en couche mince : la couleur naît de l'épaisseur, pas d'un pigment
  var FILM = 'vec3 film(float c,float t){float d=2.*1.38*t*c;return .5+.5*cos(6.28318*d/vec3(640.,530.,450.));}vec3 nacre(vec3 i){return mix(vec3(1.,.8,.88),mix(vec3(.72,.96,.9),vec3(.78,.76,1.),i.b),i.g);}';
  var VS_FULL = '#version 300 es\nout vec2 v;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v=p*2.-1.;gl_Position=vec4(v,0.,1.);}';

  function context(canvas) {
    return canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]);
      gl.shaderSource(sh, s[1]);
      gl.compileShader(sh);
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    return p;
  }
  function fitCanvas(canvas, gl, max) {
    var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, max || 1.5);
    var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function hexToRgb(h) {
    h = h.trim().replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixRgb(a, b, t) {
    return [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];
  }
  function css(c) { return 'rgb(' + Math.round(c[0]) + ' ' + Math.round(c[1]) + ' ' + Math.round(c[2]) + ')'; }

  // Avancement d'un élément : data-fx-auto (en ms) le fait boucler sans défilement
  function autoLoop(el, fn) {
    var ms = U.num(el, 'fxAuto', 0);
    if (!ms) return false;
    if (U.reduced) { fn(1); return true; }
    U.addTicker(el, function (dt, t) { fn((t % ms) / ms); });
    return true;
  }

  // Recopie un titre dans un canvas 2D, mot par mot, pour rester aligné sur le texte réel.
  // Canal rouge : le texte ; canal vert : les <em>, que le shader peut traiter à part.
  function textMask(el, ctx, ox, oy, scale) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node, range = document.createRange();
    ctx.textBaseline = 'alphabetic';
    while ((node = walker.nextNode())) {
      var cs = getComputedStyle(node.parentElement), re = /\S+/g, m;
      var size = parseFloat(cs.fontSize) * scale;
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily;
      if ('letterSpacing' in ctx) ctx.letterSpacing = (parseFloat(cs.letterSpacing) || 0) * scale + 'px';
      ctx.fillStyle = node.parentElement.closest('em') ? '#00ff00' : '#ff0000';
      var fm = ctx.measureText('Hg');
      while ((m = re.exec(node.data))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        var b = range.getBoundingClientRect();
        var asc = fm.fontBoundingBoxAscent, desc = fm.fontBoundingBoxDescent;
        var base = (b.top - oy) * scale + (b.height * scale - (asc + desc)) / 2 + asc;
        ctx.fillText(m[0], (b.left - ox) * scale, base);
      }
    }
  }
  U.textMask = textMask;

  // --- pearl-orb : une perle irisée calculée en temps réel, qui peut se dissoudre -----

  var PEARL_FS = '#version 300 es\nprecision highp float;in vec2 v;out vec4 o;uniform float uT,uD;uniform vec2 uA,uM;uniform vec3 uTint;' + FILM + `
float w(vec3 p){return sin(p.x*2.1+sin(p.z*1.7))*sin(p.y*2.4+sin(p.x*1.3))*sin(p.z*1.9+sin(p.y*2.2));}
void main(){
  vec2 q=v*uA/.74;float r=length(q);
  float halo=exp(-max(r-1.,0.)*3.4)*.2*smoothstep(1.34,1.05,r);
  vec3 glow=nacre(film(.6,420.+sin(atan(q.y,q.x)*2.+uT*.4)*90.))*halo;
  if(r>=1.){o=vec4(glow*(1.-uD),halo*(1.-uD));return;}
  vec3 n=vec3(q,sqrt(1.-r*r));
  float c=n.z;
  vec3 p=n+vec3(uM*.4,uT*.08);
  float th=400.+170.*w(p*1.3)+70.*w(p*3.1+uT*.1);
  vec3 irid=nacre(film(c*.7+.2,th));
  float hole=w(n*5.2+3.)*.5+.5;
  if(uD>.01&&hole<uD*1.05)discard;
  vec3 l=normalize(vec3(-.45+uM.x*.5,.7+uM.y*.3,.55));
  float d=max(dot(n,l),0.);
  vec3 base=mix(uTint*.42,vec3(1.,.97,.96),smoothstep(-.1,1.,d));
  vec3 col=base*mix(vec3(.99,.97,.97),irid,.62)+irid*pow(1.-c,2.2)*.3;
  col+=pow(max(dot(reflect(vec3(0.,0.,-1.),n),l),0.),46.)*vec3(1.);
  col+=smoothstep(.62,.66,dot(reflect(vec3(0.,0.,-1.),n),normalize(vec3(.5,.6,.6))))*.08;
  float a=smoothstep(1.,.985,r)*(1.-smoothstep(.72,1.,uD));
  o=vec4(col*a,a);
}`;
  var PEARL_VS = '#version 300 es\nprecision highp float;layout(location=0) in vec4 a;uniform float uT,uD;uniform vec2 uA;out vec3 c;' + FILM + `
void main(){
  vec3 n=a.xyz;float k=a.w;
  float e=uD*uD*(.5+k*1.5);
  vec3 p=n*(1.+e)+e*.34*vec3(sin(k*40.+uT*.5),cos(k*53.+uT*.4),sin(k*31.-uT*.3));
  float s=uT*.08;p=vec3(p.x*cos(s)+p.z*sin(s),p.y,-p.x*sin(s)+p.z*cos(s));
  gl_Position=vec4(p.xy*.74/uA,0.,1.);
  gl_PointSize=(1.2+k*2.2)*(.7+uD);
  c=nacre(film(max(p.z,.08)*.8+.1,380.+260.*k))*smoothstep(0.,.12,uD)*(p.z>-.1||uD>.5?1.:.2);
}`;
  var POINT_FS = '#version 300 es\nprecision highp float;in vec3 c;out vec4 o;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d);o=vec4((c+.25)*a,a*.55);}';

  FX.register('pearl-orb', {
    triggerOn: 'click',
    setup: function (el) {
      U.ensurePositioned(el);
      var canvas = U.make('canvas', 'fx-pearl-c', el);
      canvas.setAttribute('aria-hidden', 'true');
      var gl = context(canvas);
      if (!gl) { el.classList.add('fx-pearl-off'); return; }
      var pearl = program(gl, VS_FULL, PEARL_FS), pts = program(gl, PEARL_VS, POINT_FS);
      var n = U.num(el, 'fxPoints', 9000), data = new Float32Array(n * 4), gold = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) {
        var y = 1 - 2 * (i + .5) / n, rr = Math.sqrt(1 - y * y), th = i * gold;
        data[i * 4] = Math.cos(th) * rr; data[i * 4 + 1] = y; data[i * 4 + 2] = Math.sin(th) * rr; data[i * 4 + 3] = Math.random();
      }
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      var uni = function (p) { return { t: gl.getUniformLocation(p, 'uT'), d: gl.getUniformLocation(p, 'uD'), a: gl.getUniformLocation(p, 'uA'), m: gl.getUniformLocation(p, 'uM'), c: gl.getUniformLocation(p, 'uTint') }; };
      var uP = uni(pearl), uS = uni(pts);
      var tint = hexToRgb(el.dataset.fxTint || '#6f6bd8').map(function (x) { return x / 255; });
      var s = el._fxPearl = { dis: 0, target: 0, mx: 0, my: 0, tx: 0, ty: 0, t: Math.random() * 40 };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = (e.clientX - r.left) / r.width * 2 - 1;
        s.ty = 1 - (e.clientY - r.top) / r.height * 2;
      });
      s.draw = function (dt) {
        fitCanvas(canvas, gl);
        s.t += U.reduced ? 0 : dt;
        var k = U.reduced ? 1 : 1 - Math.pow(.02, dt);
        s.dis += (s.target - s.dis) * k * .6;
        s.mx += (s.tx - s.mx) * k; s.my += (s.ty - s.my) * k;
        var ax = Math.max(canvas.width / canvas.height, 1), ay = Math.max(canvas.height / canvas.width, 1);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(pearl);
        gl.uniform1f(uP.t, s.t); gl.uniform1f(uP.d, s.dis); gl.uniform2f(uP.a, ax, ay); gl.uniform2f(uP.m, s.mx, s.my); gl.uniform3fv(uP.c, tint);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (s.dis > .01) {
          gl.useProgram(pts);
          gl.uniform1f(uS.t, s.t); gl.uniform1f(uS.d, s.dis); gl.uniform2f(uS.a, ax, ay);
          gl.drawArrays(gl.POINTS, 0, n);
        }
      };
      if (U.reduced) { s.draw(0); U.onResize(function () { s.draw(0); }); }
    },
    tick: function (el, dt) {
      if (el._fxPearl && !U.reduced) el._fxPearl.draw(dt);
    },
    trigger: function (el) {
      var s = el._fxPearl;
      if (!s) return;
      s.target = s.target ? 0 : 1;
      el.setAttribute('aria-pressed', s.target ? 'true' : 'false');
      if (U.reduced) { s.dis = s.target; s.draw(0); }
    }
  });

  // --- silk-ribbon : un ruban de soie irisée qui se dessine avec le défilement ---------

  var RIBBON_GLSL = `
vec3 ribbonAt(float s,float t){
  float x=mix(-1.2,1.2,s);
  float y=.3*sin(s*7.+t*.25)+.1*sin(s*17.-t*.18);
  float z=.3*cos(s*6.+t*.2);
  float w=exp(-pow((s-.56)*7.,2.));
  x+=w*.32*sin((s-.56)*26.);
  y+=w*.3*(1.-cos((s-.56)*26.));
  return vec3(x,y,z);
}`;
  var RIBBON_VS = '#version 300 es\nprecision highp float;layout(location=0) in vec2 a;uniform float uT,uAsp,uW;out float vS,vE;out vec3 vN;' + RIBBON_GLSL + `
void main(){
  float s=a.x,e=a.y;
  vec3 c=ribbonAt(s,uT);
  vec3 tg=normalize(ribbonAt(s+.002,uT)-c);
  float tw=s*11.+uT*.3;
  vec3 up=normalize(vec3(0.,cos(tw),sin(tw)));
  vec3 bn=normalize(cross(tg,up));
  up=cross(bn,tg);
  float wd=uW*(.55+.45*sin(s*3.14159))*smoothstep(0.,.03,s)*smoothstep(1.,.97,s);
  vec3 p=c+up*e*wd;
  vN=bn;vS=s;vE=e;
  float f=1./(2.4-p.z);
  gl_Position=vec4(p.x*f*2.4*min(1.,1./uAsp*1.6),p.y*f*2.4*min(1.6,uAsp),0.,1.);
}`;
  var RIBBON_FS = '#version 300 es\nprecision highp float;in float vS,vE;in vec3 vN;uniform float uT,uP;out vec4 o;' + FILM + `
void main(){
  float tip=smoothstep(uP,uP-.012,vS);
  if(tip<=0.)discard;
  vec3 n=normalize(vN+vec3(0.,.28*vE,0.));
  if(!gl_FrontFacing)n=-n;
  float c=abs(n.z);
  float th=330.+230.*sin(vS*16.-uT*.3+vE*2.);
  vec3 i=nacre(film(c*.86+.1,th));
  vec3 col=mix(vec3(.98,.97,.98),i,.72);
  col*=.68+.42*c;
  col+=pow(max(dot(n,normalize(vec3(-.2,.7,.68))),0.),18.)*.9;
  float a=tip*smoothstep(1.,.92,abs(vE));
  o=vec4(col*a,a);
}`;

  FX.register('silk-ribbon', {
    setup: function (el) {
      U.ensurePositioned(el);
      var canvas = U.make('canvas', 'fx-ribbon-c', el);
      canvas.setAttribute('aria-hidden', 'true');
      var gl = context(canvas);
      if (!gl) { el.classList.add('fx-ribbon-off'); return; }
      var pr = program(gl, RIBBON_VS, RIBBON_FS);
      var seg = 420, data = new Float32Array((seg + 1) * 4);
      for (var i = 0; i <= seg; i++) {
        data[i * 4] = data[i * 4 + 2] = i / seg;
        data[i * 4 + 1] = -1; data[i * 4 + 3] = 1;
      }
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(pr);
      var u = { t: gl.getUniformLocation(pr, 'uT'), p: gl.getUniformLocation(pr, 'uP'), asp: gl.getUniformLocation(pr, 'uAsp'), w: gl.getUniformLocation(pr, 'uW') };
      var s = el._fxRibbon = { t: 0, p: U.reduced ? 1.02 : 0, target: U.reduced ? 1.02 : 0 };
      s.draw = function (dt) {
        fitCanvas(canvas, gl);
        s.t += U.reduced ? 0 : dt;
        s.p += (s.target - s.p) * (U.reduced ? 1 : 1 - Math.pow(.004, dt));
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(u.t, s.t); gl.uniform1f(u.p, s.p);
        gl.uniform1f(u.asp, canvas.width / canvas.height);
        gl.uniform1f(u.w, U.num(el, 'fxWidth', .1));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, (seg + 1) * 2);
      };
      autoLoop(el, function (p) { s.target = Math.min(p * 1.35, 1.02); });
    },
    scroll: function (el, info) {
      var s = el._fxRibbon;
      if (s && !U.num(el, 'fxAuto', 0)) s.target = U.reduced ? 1.02 : U.clamp((info.pass - .12) / .62, 0, 1.02);
    },
    tick: function (el, dt) {
      if (el._fxRibbon) el._fxRibbon.draw(dt);
    }
  });

  // --- water-title : un titre rendu sous l'eau, que le curseur fait onduler ----------

  var WATER_FS = '#version 300 es\nprecision highp float;in vec2 v;out vec4 o;uniform sampler2D uTx;uniform float uT,uR,uAmp;uniform vec2 uM,uRes;uniform vec3 uC;' + FILM + `
void main(){
  vec2 uv=v*.5+.5;uv.y=1.-uv.y;
  vec2 px=uv*uRes;
  vec2 d=px-uM*uRes;float l=length(d)+1.;
  vec2 rip=d/l*sin(l*.045-uT*4.)*exp(-l*.008)*9.*uAmp;
  vec2 wav=vec2(sin(px.y*.03+uT*.9)+sin(px.y*.011-uT*.5),cos(px.x*.018+uT*.7))*uAmp*1.5;
  vec2 q=(px+rip+wav)/uRes;
  vec4 m=texture(uTx,q);
  vec4 gl_=textureLod(uTx,q,3.5);float g=gl_.r+gl_.g;
  float n=fract(sin(dot(floor(px/3.),vec2(12.9,78.2)))*43758.5);
  float rv=smoothstep(n-.3,n+.3,uR*1.6-.3);
  vec3 fi=film(.6+.3*sin(px.x*.006+uT*.2),400.+160.*sin(px.x*.004-uT*.25+px.y*.01));
  vec3 dk=mix(vec3(.5,.12,.4),mix(vec3(.02,.36,.38),vec3(.22,.18,.62),fi.b),fi.g);
  vec3 ir=dot(uC,vec3(.3,.6,.1))<.45?dk:nacre(fi);
  vec3 col=uC*m.r+ir*m.g;
  float a=max(m.r,m.g);
  o=vec4((col+uC*g*.12)*rv,(a+g*.12)*rv);
}`;

  function computedRgb(el) {
    var m = getComputedStyle(el).color.match(/[\d.]+/g) || [20, 20, 30];
    return [m[0] / 255, m[1] / 255, m[2] / 255];
  }

  FX.register('water-title', {
    entrance: true,
    setup: function (el) {
      if (U.reduced) return;
      U.ensurePositioned(el);
      var canvas = U.make('canvas', 'fx-water-c', el);
      canvas.setAttribute('aria-hidden', 'true');
      var gl = context(canvas);
      if (!gl) { canvas.remove(); return; }
      var pr = program(gl, VS_FULL, WATER_FS);
      gl.bindVertexArray(gl.createVertexArray());
      gl.useProgram(pr);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      var loc = function (n) { return gl.getUniformLocation(pr, n); };
      var u = { t: loc('uT'), r: loc('uR'), a: loc('uAmp'), m: loc('uM'), res: loc('uRes'), c: loc('uC') };
      var tex = gl.createTexture(), mask = document.createElement('canvas');
      var color = computedRgb(el);
      var s = el._fxWater = { t: 0, reveal: 0, mx: .5, my: .5, tx: .5, ty: .5 };
      var M = 24;
      s.paint = function () {
        var r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
        mask.width = (r.width + M * 2) * d; mask.height = (r.height + M * 2) * d;
        var ctx = mask.getContext('2d');
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, mask.width, mask.height);
        ctx.globalCompositeOperation = 'lighter';
        textMask(el, ctx, r.left - M, r.top - M, d);
        canvas.style.inset = -M + 'px';
        canvas.style.width = r.width + M * 2 + 'px';
        canvas.style.height = r.height + M * 2 + 'px';
        fitCanvas(canvas, gl);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        el.classList.add('fx-water-on');
      };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(s.paint);
      U.onResize(s.paint);
      window.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        s.tx = (e.clientX - r.left) / r.width;
        s.ty = (e.clientY - r.top) / r.height;
      }, { passive: true });
      s.draw = function (dt) {
        s.t += dt;
        s.reveal = Math.min(1, s.reveal + dt / 1.6);
        s.mx += (s.tx - s.mx) * .08; s.my += (s.ty - s.my) * .08;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(u.t, s.t); gl.uniform1f(u.r, s.reveal); gl.uniform1f(u.a, U.num(el, 'fxAmp', 1));
        gl.uniform2f(u.m, s.mx, s.my); gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform3fv(u.c, color);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    },
    enter: function (el) {
      if (el._fxWater) el._fxWater.reveal = 0;
    },
    reset: function (el) {
      if (el._fxWater) el._fxWater.reveal = 0;
    },
    tick: function (el, dt) {
      if (el._fxWater && el.classList.contains('fx-water-on')) el._fxWater.draw(dt);
    }
  });

  // --- glow-wake : le curseur laisse un sillage de lumière vivante ------------------

  FX.register('glow-wake', {
    setup: function (el) {
      if (U.reduced || !U.canHover) return;
      var fixed = el === document.body || el.dataset.fxWake === 'page';
      var canvas = U.make('canvas', 'fx-wake-c' + (fixed ? ' fx-wake-fixed' : ''), el);
      canvas.setAttribute('aria-hidden', 'true');
      if (!fixed) U.ensurePositioned(el);
      var ctx = canvas.getContext('2d'), sparks = [], last = null;
      var colors = (el.dataset.fxColors || '#9ff5e6,#c8b6ff,#ffd9ec').split(',');
      var host = fixed ? window : el;
      host.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        var d = last ? Math.hypot(x - last.x, y - last.y) : 0, n = Math.min(4, Math.ceil(d / 18));
        for (var i = 0; i < n; i++) {
          var k = i / n;
          sparks.push({
            x: U.lerp(last.x, x, k) + U.rand(-4, 4), y: U.lerp(last.y, y, k) + U.rand(-4, 4),
            vx: U.rand(-8, 8), vy: U.rand(-16, -3), life: 1, s: U.rand(.8, 2.8),
            c: colors[Math.floor(Math.random() * colors.length)]
          });
        }
        last = { x: x, y: y };
      }, { passive: true });
      el._fxWake = function (dt) {
        var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
        if (canvas.width !== Math.round(r.width * d)) { canvas.width = r.width * d; canvas.height = r.height * d; }
        ctx.setTransform(d, 0, 0, d, 0, 0);
        ctx.clearRect(0, 0, r.width, r.height);
        ctx.globalCompositeOperation = 'lighter';
        if (sparks.length > 240) sparks.splice(0, sparks.length - 240);
        for (var i = sparks.length - 1; i >= 0; i--) {
          var p = sparks[i];
          p.life -= dt * .9;
          if (p.life <= 0) { sparks.splice(i, 1); continue; }
          p.x += p.vx * dt; p.y += p.vy * dt;
          ctx.globalAlpha = p.life * p.life * .9;
          ctx.fillStyle = p.c;
          ctx.shadowColor = p.c;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s * (.4 + p.life * .6), 0, 6.283);
          ctx.fill();
        }
      };
    },
    tick: function (el, dt) {
      if (el._fxWake) el._fxWake(dt);
    }
  });

  // --- depth-journey : toute la page change de lumière au fil de la descente ---------

  // Chaque repère [data-fx-stop="fond,encre"] fixe l'ambiance quand son centre atteint le milieu de l'écran
  FX.register('depth-journey', {
    setup: function (el) {
      var stops = el.dataset.fxStops;
      if (stops) {
        var list = stops.split('|').map(function (s) { var p = s.split(','); return [hexToRgb(p[0]), hexToRgb(p[1])]; });
        autoLoop(el, function (p) {
          var x = (Math.sin(p * 6.283 - 1.57) * .5 + .5) * (list.length - 1), i = Math.min(Math.floor(x), list.length - 2), t = x - i;
          el.style.background = css(mixRgb(list[i][0], list[i + 1][0], t));
          el.style.color = css(mixRgb(list[i][1], list[i + 1][1], t));
        });
        return;
      }
      el._fxStops = [].map.call(document.querySelectorAll('[data-fx-stop]'), function (m) {
        var p = m.dataset.fxStop.split(',');
        return { el: m, bg: hexToRgb(p[0]), ink: hexToRgb(p[1]) };
      });
    },
    scroll: function (el, info) {
      var st = el._fxStops;
      if (!st || !st.length) return;
      var mid = info.vh / 2, a = st[0], b = st[0], t = 0, idx = 0;
      for (var i = 0; i < st.length; i++) {
        var r = st[i].el.getBoundingClientRect();
        st[i].y = r.top + r.height / 2;
      }
      if (st[0].y < mid) {
        idx = st.length - 1;
        a = b = st[idx];
        for (i = 0; i < st.length - 1; i++) {
          if (st[i].y <= mid && st[i + 1].y > mid) {
            a = st[i]; b = st[i + 1];
            t = (mid - a.y) / (b.y - a.y);
            idx = i + t;
            break;
          }
        }
      }
      var smooth = t * t * (3 - 2 * t), inkT = U.clamp((t - .3) / .4, 0, 1);
      var bg = mixRgb(a.bg, b.bg, smooth), ink = mixRgb(a.ink, b.ink, inkT);
      var root = document.documentElement.style;
      root.setProperty('--fx-j-bg', css(bg));
      root.setProperty('--fx-j-ink', css(ink));
      root.setProperty('--fx-j-i', idx.toFixed(3));
      el.fxJourney = { bg: bg, ink: ink, index: idx };
    }
  });

  // --- depth-meter : une jauge verticale qui compte les mètres de la remontée --------

  FX.register('depth-meter', {
    setup: function (el) {
      var from = U.num(el, 'fxFrom', 4200), to = U.num(el, 'fxTo', 0), unit = el.dataset.fxUnit || 'm', sign = el.dataset.fxSign === undefined ? '−' : el.dataset.fxSign;
      el.setAttribute('role', 'img');
      var scale = U.make('div', 'fx-dm-scale', el), value = U.make('div', 'fx-dm-value', el);
      for (var i = 0; i < 41; i++) U.make('i', i % 5 ? '' : 'fx-dm-major', scale);
      var s = el._fxMeter = { p: 0, target: 0, shown: null };
      s.render = function () {
        var v = Math.round(U.lerp(from, to, s.p) / 10) * 10, txt = (v ? sign : '') + v.toLocaleString('fr-FR') + ' ' + unit;
        scale.style.transform = 'translateY(' + (-s.p * 50).toFixed(2) + '%)';
        if (txt !== s.shown) {
          s.shown = txt;
          value.textContent = txt;
          el.setAttribute('aria-label', 'Profondeur : ' + txt);
        }
      };
      s.render();
      autoLoop(el, function (p) { s.target = p; s.p = p; s.render(); });
    },
    scroll: function (el) {
      var s = el._fxMeter, max = document.documentElement.scrollHeight - window.innerHeight;
      if (s && !U.num(el, 'fxAuto', 0)) {
        s.target = max > 0 ? U.clamp(window.scrollY / max, 0, 1) : 0;
        if (U.reduced) { s.p = s.target; s.render(); }
      }
    },
    tick: function (el) {
      var s = el._fxMeter;
      if (!s || U.reduced || U.num(el, 'fxAuto', 0)) return;
      if (Math.abs(s.target - s.p) < .0002) return;
      s.p += (s.target - s.p) * .1;
      s.render();
    }
  });

  // --- chapter-pin : un récit en chapitres, tenu à l'écran, avec sa frise --------------

  FX.register('chapter-pin', {
    setup: function (el) {
      var parts = [].slice.call(el.children), n = parts.length;
      if (U.reduced) { el.classList.add('fx-cp-static'); return; }
      el.style.setProperty('--fx-n', n);
      var stage = U.make('div', 'fx-cp-stage', el);
      parts.forEach(function (p) { p.classList.add('fx-cp-part'); stage.appendChild(p); });
      var track = U.make('div', 'fx-cp-track', stage);
      track.setAttribute('aria-hidden', 'true');
      var seg = parts.map(function (p, i) {
        var s = U.make('span', '', track);
        U.make('small', '', s).textContent = ('0' + (i + 1)).slice(-2);
        return U.make('i', '', U.make('b', '', s));
      });
      el._fxPin = function (p) {
        var x = p * n, cur = Math.min(Math.floor(x), n - 1);
        el.fxProgress = p;
        if (cur !== el._fxCur) {
          el._fxCur = cur;
          parts.forEach(function (a, i) {
            a.classList.toggle('fx-on', i === cur);
            a.classList.toggle('fx-past', i < cur);
            a.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
          });
        }
        seg.forEach(function (b, i) { b.style.transform = 'scaleX(' + U.clamp(x - i, 0, 1).toFixed(3) + ')'; });
      };
      el._fxPin(0);
      if (autoLoop(el, el._fxPin)) el.classList.add('fx-cp-auto');
    },
    scroll: function (el, info) {
      if (!el._fxPin || U.num(el, 'fxAuto', 0)) return;
      el._fxPin(U.clamp(-info.rect.top / Math.max(1, info.rect.height - info.vh), 0, .9999));
    }
  });

  // --- dive-intro : une ouverture où l'on descend avant d'entrer ----------------------

  FX.register('dive-intro', {
    setup: function (el) {
      var copy = U.make('div', 'fx-di-copy');
      while (el.firstChild) copy.appendChild(el.firstChild);
      var local = el.dataset.fxLocal === 'true';
      if (local) el.classList.add('fx-di-local');
      el.innerHTML = '<i class="fx-di-ring"></i><i class="fx-di-ring"></i><i class="fx-di-ring"></i><div class="fx-di-count" aria-hidden="true"></div>';
      el.appendChild(copy);
      var skip = U.make('button', 'fx-di-skip', el);
      skip.type = 'button';
      skip.textContent = el.dataset.fxSkip || 'Passer';
      var count = el.querySelector('.fx-di-count');
      var from = U.num(el, 'fxFrom', 0), to = U.num(el, 'fxTo', 4200), unit = el.dataset.fxUnit || 'm', sign = el.dataset.fxSign === undefined ? '−' : el.dataset.fxSign;
      var run = 0;
      var finish = el._fxLeave = function () {
        if (el._fxDone) return;
        el._fxDone = true;
        run++;
        el.fxProgress = 1;
        el.classList.add('fx-out');
        if (!local) document.documentElement.classList.remove('fx-di-lock');
        el.dispatchEvent(new CustomEvent('fx:intro-end', { bubbles: true }));
        setTimeout(function () { if (el._fxDone) el.hidden = true; }, 1300);
      };
      var bye = function (e) {
        if (el._fxDone) return;
        if (e.type !== 'keydown' || e.key === 'Escape' || e.key === ' ' || e.key === 'ArrowDown') finish();
      };
      skip.addEventListener('click', finish);
      if (!local) {
        window.addEventListener('wheel', bye, { passive: true });
        window.addEventListener('keydown', bye);
        window.addEventListener('touchmove', bye, { passive: true });
      }
      el._fxPlay = function () {
        var me = ++run, dur = U.num(el, 'fxDuration', 3400), t0 = null;
        el.hidden = false;
        el._fxDone = false;
        el.fxProgress = 0;
        el.classList.remove('fx-out', 'fx-go');
        void el.offsetWidth;
        el.classList.add('fx-go');
        if (!local) document.documentElement.classList.add('fx-di-lock');
        (function frame(t) {
          if (me !== run) return;
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1), e = U.easeInOut(p);
          el.fxProgress = p;
          var v = Math.round(U.lerp(from, to, e) / 10) * 10;
          count.textContent = (v ? sign : '') + v.toLocaleString('fr-FR') + ' ' + unit;
          if (p < 1) U.raf(frame);
          else finish();
        })(performance.now());
      };
      var seen = false;
      if (el.dataset.fxOnce === 'true') {
        try { seen = !!sessionStorage.getItem('fx-dive-seen'); sessionStorage.setItem('fx-dive-seen', '1'); } catch (err) {}
      }
      if (U.reduced || seen) {
        el._fxDone = true;
        el.fxProgress = 1;
        el.hidden = true;
        setTimeout(function () { el.dispatchEvent(new CustomEvent('fx:intro-end', { bubbles: true })); }, 0);
      } else {
        el._fxPlay();
      }
    },
    trigger: function (el) {
      if (!U.reduced && el._fxPlay) el._fxPlay();
    }
  });

  // --- tide-score : une musique générée sur place, qui s'ouvre en remontant -----------

  FX.register('tide-score', {
    setup: function (el) {
      el.setAttribute('aria-pressed', 'false');
      if (!el.textContent.trim()) el.textContent = 'Son';
      var bars = U.make('span', 'fx-ts-bars');
      bars.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 5; i++) U.make('i', '', bars).style.setProperty('--fx-i', i);
      el.insertBefore(bars, el.firstChild);
      var a = null, on = false;
      function build() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        var c = new AC(), master = c.createGain(), lp = c.createBiquadFilter();
        master.gain.value = 0;
        lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = .4;
        var delay = c.createDelay(2), fb = c.createGain(), wet = c.createGain();
        delay.delayTime.value = .62; fb.gain.value = .55; wet.gain.value = .5;
        lp.connect(master); master.connect(c.destination);
        delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(lp);
        // Des sinus désaccordés : le fond de l'eau
        [55, 82.6, 110.3, 164.9].forEach(function (f, i) {
          var o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
          o.frequency.value = f; g.gain.value = .11 - i * .018;
          lfo.frequency.value = .05 + i * .021; lg.gain.value = .045;
          lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(lp);
          o.start(); lfo.start();
        });
        // Un bruit filtré qui respire : la houle
        var len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var ns = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain(), nl = c.createOscillator(), nlg = c.createGain();
        ns.buffer = buf; ns.loop = true;
        bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = .5;
        ng.gain.value = .035; nl.frequency.value = .09; nlg.gain.value = .028;
        nl.connect(nlg); nlg.connect(ng.gain); ns.connect(bp); bp.connect(ng); ng.connect(lp);
        ns.start(); nl.start();
        // Des notes rares sur une gamme pentatonique
        var scale = [220, 247.5, 277.2, 329.6, 370, 440, 554.4, 659.3];
        function bell() {
          if (on) {
            var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
            o.type = 'sine';
            o.frequency.value = scale[Math.floor(Math.random() * scale.length)];
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(.05, t + .04);
            g.gain.exponentialRampToValueAtTime(.0005, t + 3.2);
            o.connect(g); g.connect(delay); g.connect(lp);
            o.start(t); o.stop(t + 3.3);
          }
          setTimeout(bell, 1800 + Math.random() * 4200);
        }
        bell();
        return { c: c, master: master, lp: lp };
      }
      el._fxLevel = function (p) {
        if (a) a.lp.frequency.setTargetAtTime(220 + p * p * 4200, a.c.currentTime, .6);
      };
      el.addEventListener('click', function () {
        if (!a) a = build();
        if (!a) return;
        on = !on;
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        el.classList.toggle('fx-on', on);
        a.c.resume();
        a.master.gain.cancelScheduledValues(a.c.currentTime);
        a.master.gain.setTargetAtTime(on ? U.num(el, 'fxVolume', .5) : 0, a.c.currentTime, on ? .9 : .25);
        var max = document.documentElement.scrollHeight - window.innerHeight;
        el._fxLevel(max > 0 ? window.scrollY / max : 0);
      });
    },
    scroll: function (el) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (el._fxLevel) el._fxLevel(max > 0 ? U.clamp(window.scrollY / max, 0, 1) : 0);
    }
  });

  // --- film-sheen : un reflet de nacre qui tourne avec le curseur ---------------------

  FX.register('film-sheen', {
    setup: function (el) {
      if (U.reduced) return;
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var a = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2);
        el.style.setProperty('--fx-film', (a * 57.3 + 90).toFixed(1) + 'deg');
      }, { passive: true });
    }
  });

  // --- node-bloom : une petite constellation qui s'assemble à l'entrée -----------------

  FX.register('node-bloom', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxNodes', 3), seed = U.num(el, 'fxSeed', 0), parts = '', dots = '';
      for (var i = 0; i < n; i++) {
        var a = seed + i / n * Math.PI * 2 - 1.57, r = 40 + (i % 2) * 8;
        var x = (60 + Math.cos(a) * r).toFixed(1), y = (60 + Math.sin(a) * r).toFixed(1);
        var cx = (60 + Math.cos(a + .6) * r * .55).toFixed(1), cy = (60 + Math.sin(a + .6) * r * .55).toFixed(1);
        parts += '<path pathLength="1" style="--fx-i:' + i + '" d="M60 60Q' + cx + ' ' + cy + ' ' + x + ' ' + y + '"/>';
        dots += '<circle class="fx-nb-n" style="--fx-i:' + i + ';transform-origin:' + x + 'px ' + y + 'px" cx="' + x + '" cy="' + y + '" r="' + (4 + (i % 3)) + '"/>';
      }
      el.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="fx-nb-o" cx="60" cy="60" r="52"/><g class="fx-nb-g">' + parts + dots + '</g><circle class="fx-nb-c" cx="60" cy="60" r="13"/><circle class="fx-nb-h" cx="56" cy="56" r="3.4"/></svg>';
    }
  });

  // --- spark-path : une traînée de grains qui monte le long d'un tracé ---------------

  FX.register('spark-path', {
    setup: function (el) {
      var ns = 'http://www.w3.org/2000/svg', d = el.dataset.fxD || 'M12 392C84 340 30 262 104 214S60 86 188 12';
      var svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path');
      svg.setAttribute('viewBox', '0 0 200 400');
      svg.setAttribute('aria-hidden', 'true');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      svg.appendChild(path);
      el.appendChild(svg);
      var n = U.num(el, 'fxCount', 46), len = path.getTotalLength(), dots = [];
      for (var i = 0; i < n; i++) {
        var pt = path.getPointAtLength(len * i / (n - 1)), c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', (pt.x + U.rand(-5, 5)).toFixed(1));
        c.setAttribute('cy', (pt.y + U.rand(-5, 5)).toFixed(1));
        c.setAttribute('r', U.rand(.8, 2.9).toFixed(1));
        c.style.setProperty('--fx-i', i % 5);
        svg.appendChild(c);
        dots.push(c);
      }
      el._fxSpark = function (p) {
        var on = Math.round(p * n);
        if (on === el._fxOn) return;
        el._fxOn = on;
        dots.forEach(function (c, i) { c.classList.toggle('fx-on', i < on); });
      };
      if (U.reduced) el._fxSpark(1);
      else autoLoop(el, function (p) { el._fxSpark(Math.min(p * 1.4, 1)); });
    },
    scroll: function (el, info) {
      if (el._fxSpark && !U.reduced && !U.num(el, 'fxAuto', 0)) el._fxSpark(U.clamp((info.pass - .2) / .5, 0, 1));
    }
  });
})(window.FX);
