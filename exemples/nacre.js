/* Nacre — le monde en temps réel : l'eau, la perle, le ruban, le plancton et le titre immergé.
   Tout est calculé par la carte graphique ; aucune image, aucune bibliothèque 3D. */
(function () {
  'use strict';

  var U = window.FX.util;
  var canvas = document.getElementById('world');
  var gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
  var root = document.documentElement;
  var isMobile = window.matchMedia('(max-width: 820px)').matches;

  // --- Le déroulé : où est la perle à chaque moment de la page ------------------------

  // x : -1 à 1 (largeur), y : -1 à 1 (hauteur), r : rayon en part de hauteur,
  // s : forme (0 perle, 1 baroque, 2 goutte, 3 anneau, 4 flacon), f : décalage de reflet, g : verre (0 nacre, 1 verre)
  function K(sel, at, d, m) {
    return { el: document.querySelector(sel), at: at, d: d, m: Object.assign({}, d, m || {}) };
  }
  var PATH = [
    K('#hero', .5, { x: .56, y: .14, r: .3, s: 0, f: 0, g: 0 }, { x: 0, y: .56, r: .115 }),
    K('#genese', .02, { x: .45, y: 0, r: .012, s: 0, f: .3, g: 0 }, { x: 0, y: .34, r: .01 }),
    K('#genese', .3, { x: .42, y: 0, r: .1, s: 1, f: .5, g: 0 }, { x: 0, y: .34, r: .08 }),
    K('#genese', .62, { x: .42, y: 0, r: .24, s: 1, f: .9, g: 0 }, { x: 0, y: .34, r: .15 }),
    K('#genese', .98, { x: .42, y: 0, r: .34, s: 0, f: 1.3, g: 0 }, { x: 0, y: .42, r: .16 }),
    K('#manifeste', .5, { x: -.62, y: -.3, r: .14, s: 0, f: 1.7, g: .1 }, { x: -.5, y: -.62, r: .08 }),
    K('#collection', .1, { x: .35, y: .02, r: .26, s: 1, f: 2.1, g: 0 }, { x: 0, y: .32, r: .17 }),
    K('#collection', .36, { x: .35, y: .02, r: .27, s: 2, f: 2.9, g: .15 }, { x: 0, y: .32, r: .17 }),
    K('#collection', .63, { x: .35, y: .02, r: .25, s: 3, f: 3.5, g: .3 }, { x: 0, y: .32, r: .16 }),
    K('#collection', .9, { x: .35, y: .02, r: .27, s: 0, f: 4.2, g: 0 }, { x: 0, y: .32, r: .17 }),
    K('#geste', .4, { x: .7, y: .55, r: .1, s: 0, f: 4.8, g: .1 }, { x: .6, y: .8, r: .05 }),
    K('#questions', .5, { x: .68, y: -.1, r: .16, s: 2, f: 5.3, g: .6 }, { x: .8, y: .85, r: .05 }),
    K('#surface', .55, { x: .46, y: .04, r: .33, s: 4, f: 6, g: .78 }, { x: 0, y: .6, r: .13 })
  ];
  var pathY = [];
  function measure() {
    var vh = window.innerHeight;
    pathY = PATH.map(function (k) {
      var r = k.el.getBoundingClientRect(), top = r.top + window.scrollY;
      if (r.height > vh * 1.2) return top + (r.height - vh) * k.at; // section épinglée
      return top + r.height * k.at - vh / 2;
    });
    // Le premier repère reste valable depuis le tout début de la page
    pathY[0] = Math.min(pathY[0], 0);
  }
  function samplePath(y) {
    var key = isMobile ? 'm' : 'd', n = PATH.length;
    if (y <= pathY[0]) return PATH[0][key];
    if (y >= pathY[n - 1]) return PATH[n - 1][key];
    for (var i = 0; i < n - 1; i++) {
      if (y >= pathY[i] && y < pathY[i + 1]) {
        var t = (y - pathY[i]) / Math.max(1, pathY[i + 1] - pathY[i]);
        t = t * t * (3 - 2 * t);
        var a = PATH[i][key], b = PATH[i + 1][key], o = {};
        for (var c in a) o[c] = a[c] + (b[c] - a[c]) * t;
        return o;
      }
    }
    return PATH[0][key];
  }

  // Sans WebGL 2 : la page reste entière, avec un fond CSS qui suit le voyage
  if (!gl) {
    root.classList.add('no-gl');
    document.getElementById('release').hidden = true;
    return;
  }
  root.classList.add('has-gl');

  // --- Shaders -------------------------------------------------------------------------

  var COMMON = `#version 300 es
precision highp float;
vec3 film(float c,float t){float d=2.*1.38*t*c;return .5+.5*cos(6.28318*d/vec3(640.,530.,450.));}
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float gyr(vec3 p){return dot(sin(p),cos(p.yzx));}
`;

  var WORLD_VS = '#version 300 es\nout vec2 v;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v=p*2.-1.;gl_Position=vec4(v,0.,1.);}';

  var WORLD_FS = COMMON + `
in vec2 v;out vec4 o;
uniform vec2 uRes,uMouse;
uniform float uT,uDepth,uR,uShape,uF,uGlass,uDis,uReveal,uVel;
uniform vec2 uC;
uniform vec3 uBg,uBg2,uInk;
uniform mat3 uRot;
uniform sampler2D uTitle;
uniform vec4 uTR;   // zone du titre : x, y, largeur, hauteur (en pixels depuis le haut)
uniform vec4 uRip[6];
const int STEPS=STEPS_N;

// --- les formes, mélangées par uShape ---
float sdRound(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float shape(vec3 p,float id){
  if(id<.5)return length(p)-1.;
  if(id<1.5){ // perle baroque
    float g=gyr(p*2.1+vec3(0.,uT*.12,0.))*.075+gyr(p*4.3-uT*.06)*.02;
    return (length(p*vec3(1.,.92,1.))-.98)+g;
  }
  if(id<2.5){ // goutte
    vec3 q=p+vec3(0.,.22,0.);
    float a=length(q)-.78;
    float tip=length(p-vec3(0.,.62,0.))-.13;
    return smin(a,tip,.62);
  }
  if(id<3.5){ // anneau vrillé
    float a=atan(p.z,p.x);
    vec2 q=vec2(length(p.xz)-.72,p.y);
    float tw=a*1.5+uT*.25;
    q=mat2(cos(tw),-sin(tw),sin(tw),cos(tw))*q;
    return sdRound(vec3(q,0.),vec3(.24,.1,0.),.1);
  }
  // flacon : corps, col et bouchon-perle
  float body=sdRound(p+vec3(0.,.24,0.),vec3(.5,.56,.2),.18);
  float neck=sdRound(p-vec3(0.,.54,0.),vec3(.1,.13,.1),.03);
  float cap=length(p-vec3(0.,.92,0.))-.24;
  return smin(min(body,cap),neck,.05);
}
float map(vec3 p){
  float f=fract(uShape),i=floor(uShape);
  f=f*f*(3.-2.*f);
  float a=shape(p,i);
  return f<.001?a:mix(a,shape(p,i+1.),f);
}
// La hauteur réelle dans l'objet : les repères du flacon sont dans le repère de l'objet
float nvY(vec3 p){return p.y;}
vec3 normalAt(vec3 p){
  vec2 e=vec2(.0035,-.0035);
  return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));
}

// --- l'eau ---
vec2 ripples(vec2 p){
  vec2 r=vec2(0.);
  for(int i=0;i<6;i++){
    vec4 k=uRip[i];
    float age=uT-k.z;
    if(age<0.||age>2.6||k.w<=0.)continue;
    vec2 d=p-k.xy;float l=length(d)+.001;
    float front=age*.42;
    float amp=exp(-pow((l-front)*11.,2.))*exp(-age*1.45)*k.w;
    r+=d/l*amp*sin((l-front)*90.);
  }
  return r;
}
float caustic(vec2 p,float t){
  vec2 q=mod(p*5.,6.28318)-250.;float c=1.,inten=.0045;
  vec2 i=q;
  for(int n=0;n<3;n++){
    float tt=t*(1.-.35*float(n));
    i=q+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(q.x/(sin(i.x+tt)/inten),q.y/(cos(i.y+tt)/inten)));
  }
  c/=3.;
  c=1.17-pow(c,1.4);
  return clamp(pow(abs(c),8.),0.,1.);
}
vec3 water(vec2 p,vec2 uv){
  float top=clamp(uv.y,0.,1.);
  vec3 c=mix(uBg2,uBg,smoothstep(0.,1.,1.-top*.9));
  // courants lents
  float n=noise(p*1.6+vec2(uT*.03,-uT*.02)+noise(p*2.4-uT*.04)*1.4);
  c*=.88+.26*n;
  // lumière qui tombe de la surface
  float near=smoothstep(.18,.86,uDepth);
  float sway=p.x+p.y*.34+sin(uT*.08)*.2;
  float rays=noise(vec2(sway*5.,uT*.05))*noise(vec2(sway*12.+3.,-uT*.07));
  c+=mix(vec3(.05,.22,.3),vec3(.9,.85,.72),near)*rays*pow(top,1.8)*(.12+near*.5);
  // filets de lumière près de la surface
  float ca=caustic(p*vec2(1.,1.6)+vec2(0.,uT*.015),uT*.34);
  c+=vec3(.95,1.,.95)*ca*near*.38*(.25+top*.75);
  // quelques lueurs mortes dans le noir
  float deep=1.-smoothstep(.05,.45,uDepth);
  c+=vec3(.03,.1,.16)*deep*smoothstep(.75,.0,length(p-vec2(.25,.0)))*.5;
  return c;
}
float titleMask(vec2 frag,out float acc,out float glow){
  acc=0.;glow=0.;
  if(uTR.z<=0.)return 0.;
  vec2 tp=(vec2(frag.x,uRes.y-frag.y)-uTR.xy)/uTR.zw;
  if(tp.x<-.2||tp.x>1.2||tp.y<-.2||tp.y>1.2)return 0.;
  vec4 m=texture(uTitle,tp);
  vec4 b=textureLod(uTitle,tp,3.6);
  acc=m.g;glow=b.r+b.g;
  // apparition par grains
  float g=hash(floor(frag/2.5));
  float n=noise(frag*.012+3.)*.7+g*.3;
  float rv=smoothstep(n-.14,n+.14,uReveal*1.5-.2);
  acc*=rv;glow*=rv;
  return m.r*rv;
}
vec3 withTitle(vec3 c,vec2 frag,vec2 p){
  // l'ondulation permanente, plus les ronds laissés par le curseur
  vec2 px=frag;
  px+=vec2(sin(frag.y*.021+uT*.8)+sin(frag.y*.0087-uT*.5),cos(frag.x*.012+uT*.6))*(1.1+abs(uVel)*.04);
  vec2 rp=ripples(p)*uRes.y*.03;
  float dm=length(p-uMouse);
  px+=rp;
  px+=(p-uMouse)/(dm+.04)*sin(dm*34.-uT*3.1)*exp(-dm*6.)*3.;
  float acc,glow;
  float m=titleMask(px,acc,glow);
  vec3 ir=film(.62+.3*sin(frag.x*.005+uT*.2),395.+170.*sin(frag.x*.0034-uT*.22+frag.y*.008));
  float lum=dot(uInk,vec3(.3,.6,.1));
  vec3 irt=mix(vec3(1.,.8,.9),mix(vec3(.66,.98,.9),vec3(.76,.74,1.),ir.b),ir.g);
  vec3 ird=mix(vec3(.5,.12,.4),mix(vec3(.02,.36,.38),vec3(.22,.18,.62),ir.b),ir.g);
  ir=lum<.45?ird:irt;
  c+=(mix(uInk,ir,.6))*glow*.05*(lum<.45?-1.:1.);
  c=mix(c,uInk,m);
  c=mix(c,ir,acc);
  return c;
}

void main(){
  vec2 frag=gl_FragCoord.xy;
  vec2 p=(frag-.5*uRes)/uRes.y;
  vec2 uv=frag/uRes;
  vec2 rp=ripples(p);
  vec3 col=water(p+rp*.4,uv+rp*.3);
  col=withTitle(col,frag,p);
  vec2 q=(p-uC)/uR;
  float dist=length(q);
  // halo autour de l'objet
  float halo=exp(-max(dist-.92,0.)*(2.6+uGlass));
  vec3 hc=mix(vec3(.62,.74,.9),film(.55,400.+sin(atan(q.y,q.x)*2.+uT*.3+uF)*110.+uF*60.),.4);
  float lum=dot(uBg,vec3(.3,.6,.1));
  col+=hc*halo*(.17-.13*smoothstep(.2,.8,lum))*(1.-uDis)*step(.0005,uR);
  if(dist<1.75&&uR>.002){
    vec3 ro=vec3(q,-3.4);
    vec3 rd=normalize(vec3(q*.1,1.));
    ro=uRot*ro;rd=uRot*rd;
    float t=1.2,hit=-1.;
    for(int i=0;i<STEPS;i++){
      float d=map(ro+rd*t);
      if(d<.0016){hit=t;break;}
      t+=d*.92;
      if(t>6.)break;
    }
    if(hit>0.){
      vec3 pos=ro+rd*hit;
      vec3 n=normalAt(pos);
      float cs=clamp(dot(n,-rd),0.,1.);
      float fr=pow(1.-cs,3.2);
      // l'objet se dissout par trous, la poussière prend le relais
      float hole=gyr(pos*7.+2.)*.14+gyr(pos*16.)*.05+.5;
      if(uDis>.01&&hole<uDis*1.3-.05){ o=vec4(pow(max(col,0.),vec3(.97)),1.); return; }
      // réfraction : on revoit réellement l'eau et le titre à travers la matière
      vec3 nv=transpose(uRot)*n;
      vec3 rr=refract(vec3(0.,0.,1.),nv,1./1.42);
      vec2 off=rr.xy*uR*uRes.y*(.8+.5*uGlass);
      vec2 f2=frag+off;
      vec2 p2=(f2-.5*uRes)/uRes.y;
      vec3 behind=water(p2,f2/uRes);
      behind=withTitle(behind,f2,p2);
      // reflets : une grande fenêtre douce et la surface au-dessus
      vec3 rf=reflect(rd,n);
      vec3 rv=transpose(uRot)*rf;
      float sky=smoothstep(-.3,1.,rv.y);
      vec3 env=mix(uBg*.8+.05,mix(vec3(.4,.62,.72),vec3(1.,.97,.92),uDepth),sky);
      float win=pow(max(dot(rv,normalize(vec3(-.5,.62,-.6))),0.),9.);
      float spot=pow(max(dot(rv,normalize(vec3(.42,.6,-.65))),0.),90.);
      // nacre : l'épaisseur ondule sur la matière et fabrique la couleur
      vec3 pf=pos+vec3(uF*.4);
      float th=390.+95.*gyr(pf*1.1)+40.*gyr(pf*2.6+uT*.05)+uF*40.;
      vec3 irid=film(cs*.7+.2,th);
      // une perle est laiteuse : le reflet teinte le blanc, il ne le remplace pas
      vec3 tone=mix(vec3(1.,.8,.88),mix(vec3(.72,.96,.9),vec3(.78,.76,1.),irid.b),irid.g);
      vec3 soft=mix(vec3(.99,.97,.97),tone,.62+.3*fr);
      float wrap=smoothstep(-.55,1.,dot(nv,normalize(vec3(-.42,.72,-.55))));
      vec3 shade=mix(vec3(.2,.2,.34),vec3(.52,.48,.62),uDepth);
      vec3 pearl=mix(shade,vec3(1.,.97,.96),wrap)*soft;
      pearl+=tone*fr*.3;
      // l'eau profonde refroidit légèrement le corps de la perle
      pearl*=mix(vec3(.82,.88,1.),vec3(1.),uDepth);
      // verre : l'arrière-plan teinté, avec l'irisation sur les arêtes
      vec3 glassy=behind*mix(vec3(.86,.9,.94),soft,.34)+soft*fr*.75;
      float bottle=smoothstep(.9,1.,uShape-3.);
      // le bouchon du flacon reste une vraie perle, opaque
      float glassAmt=uGlass*(1.-bottle*smoothstep(.6,.66,nvY(pos)));
      vec3 mat=mix(pearl,glassy,glassAmt);
      mat=mix(mat,env,fr*.35);
      // sur fond clair, un verre se lit par ses arêtes sombres
      float bright=smoothstep(.45,.85,dot(uBg,vec3(.3,.6,.1)));
      mat*=1.-bright*glassAmt*smoothstep(.1,.85,1.-cs)*.72;
      // liquide dans le flacon : un ambre avec son ménisque
      float lv=nvY(pos);
      float liquid=bottle*smoothstep(.235,.22,lv)*step(lv,.3)*step(abs(pos.x),2.);
      vec3 amber=mix(vec3(.96,.52,.2),vec3(1.,.8,.46),smoothstep(-.8,.25,lv));
      mat=mix(mat,behind*.25+amber*(.72+.28*cs),liquid*.86);
      mat+=bottle*smoothstep(.015,.0,abs(lv-.228))*vec3(1.,.92,.78)*.5*step(lv,.3);
      mat+=win*(.34+.2*uGlass)*vec3(1.,.99,.97)+spot*1.1;
      float edge=smoothstep(0.,.018,cs);
      col=mix(col,mat,edge);
    }
  }
  // grain et vignette : le rendu reste organique
  float vg=smoothstep(1.25,.3,length(p*vec2(.82,1.)));
  col*=mix(.74,1.,vg);
  col+=(hash(frag+fract(uT)*91.)-.5)*.018;
  o=vec4(pow(max(col,0.),vec3(.97)),1.);
}`;

  // Le ruban : un maillage de bande vrillé dans la même scène que la perle
  var RIBBON_VS = COMMON + `
layout(location=0) in vec2 a;
uniform float uT,uAsp,uW,uL;
uniform vec2 uAnchor;
out float vS,vE;out vec3 vN;
vec3 cc(float s){
  float x=mix(-1.25,1.25,s);
  float y=.3*sin(s*7.+uT*.2)+.09*sin(s*17.-uT*.15);
  float z=.35*cos(s*6.+uT*.17);
  float w=exp(-pow((s-.52)*6.5,2.));
  x+=w*.36*sin((s-.52)*24.);
  y+=w*.33*(1.-cos((s-.52)*24.));
  z+=w*.3*sin((s-.52)*12.);
  return vec3(x,y,z);
}
void main(){
  float s=a.x,e=a.y;
  vec3 c=cc(s);
  vec3 tg=normalize(cc(s+.0015)-c);
  float tw=s*10.+uT*.26+uL;
  vec3 up=normalize(vec3(.0,cos(tw),sin(tw)));
  vec3 bn=normalize(cross(tg,up));
  up=cross(bn,tg);
  float wd=uW*(.5+.5*sin(s*3.14159))*smoothstep(0.,.025,s)*smoothstep(1.,.975,s);
  vec3 p=c+up*e*wd;
  vN=bn;vS=s;vE=e;
  float f=2.5/(2.5-p.z);
  vec2 sc=vec2(p.x*f*.5*max(uAsp,1.15),p.y*f*.5);
  sc+=uAnchor;
  gl_Position=vec4(sc.x*2./uAsp,sc.y*2.,0.,1.);
}`;
  var RIBBON_FS = COMMON + `
in float vS,vE;in vec3 vN;
uniform float uT,uP,uTail,uL;
out vec4 o;
void main(){
  float a=smoothstep(uP,uP-.012,vS)*smoothstep(uTail-.03,uTail,vS);
  if(a<=0.)discard;
  vec3 n=normalize(vN+vec3(0.,.3*vE,0.));
  if(!gl_FrontFacing)n=-n;
  float c=abs(n.z);
  float th=330.+230.*sin(vS*15.-uT*.25+vE*2.+uL);
  vec3 i=film(c*.84+.1,th);
  vec3 tone=mix(vec3(1.,.82,.9),mix(vec3(.72,.96,.9),vec3(.78,.76,1.),i.b),i.g);
  vec3 col=mix(vec3(.98,.97,.98),tone,.72);
  col*=.68+.42*c;
  col+=pow(max(dot(n,normalize(vec3(-.2,.72,.66))),0.),24.)*.8;
  a*=smoothstep(1.,.9,abs(vE));
  o=vec4(col*a,a);
}`;

  // Le plancton : remonte lentement, s'allume près du curseur
  var SNOW_VS = COMMON + `
layout(location=0) in vec4 a;
uniform float uT,uAsp,uDepth,uPx;
uniform vec2 uMouse;
uniform vec4 uRip[6];
out float vA;out vec3 vC;
void main(){
  float sp=.012+a.w*.03;
  float y=fract(a.y+uT*sp)-.5;
  float x=(a.x-.5)*uAsp*1.15+sin(uT*.17+a.z*40.)*.022;
  vec2 p=vec2(x,y);
  vec2 d=p-uMouse;
  float dm=length(d);
  p+=d/(dm+.01)*.05*exp(-dm*7.);
  float lit=exp(-dm*5.5);
  for(int i=0;i<6;i++){
    float age=uT-uRip[i].z;
    if(age<0.||age>2.2||uRip[i].w<=0.)continue;
    float l=length(p-uRip[i].xy);
    lit+=exp(-pow((l-age*.42)*9.,2.))*exp(-age*1.6);
  }
  float z=a.z;
  float tw=.55+.45*sin(uT*(.5+a.w*1.6)+a.z*90.);
  float deep=1.-smoothstep(.1,.72,uDepth);
  vA=(.08+.54*tw*z*z+lit*.9)*mix(.24,1.,deep);
  vC=mix(vec3(.96,.95,.88),mix(vec3(.45,.95,.9),vec3(.7,.62,1.),fract(a.w*7.)),max(deep,min(lit,1.)));
  gl_PointSize=(1.+z*z*3.8+lit*2.2)*uPx;
  gl_Position=vec4(p.x*2./uAsp,p.y*2.,0.,1.);
}`;
  var SNOW_FS = COMMON + `
in float vA;in vec3 vC;out vec4 o;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.03,d);a*=a;o=vec4(vC*a*vA,a*vA*.8);}`;

  // La poussière de la perle libérée
  var DUST_VS = COMMON + `
layout(location=0) in vec4 a;
uniform float uT,uAsp,uDis,uR,uPx,uF;
uniform vec2 uC,uMouse;
uniform mat3 uRot;
out vec3 vC;out float vA;
void main(){
  vec3 n=a.xyz;float k=a.w;
  float e=uDis*uDis;
  float spread=e*(.08+k*k*1.25);
  vec3 p=n*(1.+spread);
  p+=e*vec3(sin(k*51.+uT*.32+n.y*3.),cos(k*37.+uT*.27+n.z*3.),sin(k*23.-uT*.24+n.x*3.))*.16;
  p=uRot*p;
  vec2 sp=uC+p.xy*uR;
  vec2 d=sp-uMouse;float dm=length(d);
  sp+=d/(dm+.01)*.06*exp(-dm*7.)*uDis;
  float th=380.+250.*k+uF*40.;
  vec3 fi=film(clamp(abs(p.z)*.8+.12,0.,1.),th);
  vC=mix(vec3(1.,.96,.97),mix(vec3(1.,.8,.88),mix(vec3(.7,.97,.9),vec3(.78,.76,1.),fi.b),fi.g),.7);
  vA=smoothstep(.0,.16,uDis)*(p.z<0.||uDis>.45?1.:.15)*(.34+k*.5)*(1.-.5*spread/(spread+.6));
  gl_PointSize=(.9+k*k*2.2)*(.8+uDis*.3)*uPx;
  gl_Position=vec4(sp.x*2./uAsp,sp.y*2.,0.,1.);
}`;
  var DUST_FS = COMMON + `
in vec3 vC;in float vA;out vec4 o;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.06,d);o=vec4(vC*a*vA,a*vA*.75);}`;

  function compile(vs, fs) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]);
      gl.shaderSource(sh, s[1]);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    var cache = {};
    return { p: p, u: function (n) { return n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n)); } };
  }

  var worldP = compile(WORLD_VS, WORLD_FS.replace('STEPS_N', isMobile ? '34' : '56'));
  var ribbonP = compile(RIBBON_VS, RIBBON_FS);
  var snowP = compile(SNOW_VS, SNOW_FS);
  var dustP = compile(DUST_VS, DUST_FS);

  function vao(data, size) {
    var v = gl.createVertexArray();
    gl.bindVertexArray(v);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, size, gl.FLOAT, false, 0, 0);
    return v;
  }
  var worldV = gl.createVertexArray();

  var SEG = 520, rb = new Float32Array((SEG + 1) * 4);
  for (var i = 0; i <= SEG; i++) { rb[i * 4] = rb[i * 4 + 2] = i / SEG; rb[i * 4 + 1] = -1; rb[i * 4 + 3] = 1; }
  var ribbonV = vao(rb, 2);

  var SNOW = isMobile ? 500 : 1400, sn = new Float32Array(SNOW * 4);
  for (i = 0; i < SNOW * 4; i++) sn[i] = Math.random();
  var snowV = vao(sn, 4);

  var DUST = isMobile ? 9000 : 26000, du = new Float32Array(DUST * 4), gold = Math.PI * (3 - Math.sqrt(5));
  for (i = 0; i < DUST; i++) {
    var yy = 1 - 2 * (i + .5) / DUST, rr = Math.sqrt(1 - yy * yy), th = i * gold;
    du[i * 4] = Math.cos(th) * rr; du[i * 4 + 1] = yy; du[i * 4 + 2] = Math.sin(th) * rr; du[i * 4 + 3] = Math.random();
  }
  var dustV = vao(du, 4);

  gl.bindVertexArray(worldV);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // --- Le titre passe dans la texture : la perle peut le réfracter ---------------------

  var titles = [].slice.call(document.querySelectorAll('[data-gl-title]'));
  var maskC = document.createElement('canvas'), maskX = maskC.getContext('2d');
  var titleTex = gl.createTexture(), activeTitle = null, titleW = 0, titleH = 0, PAD = 30;
  function paintTitle(el) {
    activeTitle = el;
    if (!el) return;
    var r = el.getBoundingClientRect(), s = Math.min(window.devicePixelRatio || 1, 1.6);
    titleW = r.width + PAD * 2; titleH = r.height + PAD * 2;
    maskC.width = Math.round(titleW * s); maskC.height = Math.round(titleH * s);
    maskX.fillStyle = '#000';
    maskX.fillRect(0, 0, maskC.width, maskC.height);
    maskX.globalCompositeOperation = 'lighter';
    U.textMask(el, maskX, r.left - PAD, r.top - PAD, s);
    maskX.globalCompositeOperation = 'source-over';
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, titleTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskC);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  function chooseTitle() {
    var best = null;
    titles.forEach(function (t) {
      var r = t.getBoundingClientRect();
      if (r.bottom > -window.innerHeight * .3 && r.top < window.innerHeight * 1.3) best = t;
    });
    if (best !== activeTitle) paintTitle(best);
  }
  function titlesReady() {
    root.classList.add('gl-titles');
    measure();
    paintTitle(null);
    chooseTitle();
  }

  // --- État vivant ------------------------------------------------------------------

  var S = {
    t: Math.random() * 30,
    x: .44, y: 0, r: .3, s: 0, f: 0, g: 0, dis: 0, disT: 0, reveal: 0, revealT: 0,
    mx: 0, my: 0, tmx: 0, tmy: 0, vel: 0, lastY: window.scrollY,
    scale: 1, frames: 0, ms: 0, lastT: 0, intro: 0
  };
  var RIPPLES = new Float32Array(24), ripI = 0, lastRip = 0;
  function ripple(px, py, power) {
    RIPPLES[ripI * 4] = (px - window.innerWidth / 2) / window.innerHeight;
    RIPPLES[ripI * 4 + 1] = (window.innerHeight / 2 - py) / window.innerHeight;
    RIPPLES[ripI * 4 + 2] = S.t;
    RIPPLES[ripI * 4 + 3] = power;
    ripI = (ripI + 1) % 6;
  }
  window.addEventListener('pointermove', function (e) {
    S.tmx = (e.clientX - window.innerWidth / 2) / window.innerHeight;
    S.tmy = (window.innerHeight / 2 - e.clientY) / window.innerHeight;
    var now = performance.now();
    if (now - lastRip > 170 && (Math.abs(e.movementX) + Math.abs(e.movementY)) > 6) {
      lastRip = now;
      ripple(e.clientX, e.clientY, .55);
    }
  }, { passive: true });
  window.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('a,button,input,label')) ripple(e.clientX, e.clientY, 1.3);
  }, { passive: true });

  // « Libérer la lumière »
  var releaseBtn = document.getElementById('release');
  releaseBtn.addEventListener('click', function () {
    S.disT = S.disT ? 0 : 1;
    releaseBtn.setAttribute('aria-pressed', S.disT ? 'true' : 'false');
    releaseBtn.querySelector('span').textContent = S.disT ? 'Rassembler la perle' : 'Libérer la lumière';
    var r = releaseBtn.getBoundingClientRect();
    ripple(r.left + r.width / 2, r.top, 1.4);
    if (U.reduced) { S.dis = S.disT; render(0); }
  });

  // L'ouverture : la perle s'allume depuis un point, au centre
  var intro = document.getElementById('intro');
  var journeyEl = document.getElementById('journey');
  function introEnded() {
    S.revealT = 1;
    root.classList.add('intro-done');
    ripple(window.innerWidth / 2, window.innerHeight / 2, 2);
    ripple(window.innerWidth / 2, window.innerHeight / 2 + 40, 1.2);
  }
  intro.addEventListener('fx:intro-end', introEnded);
  document.querySelectorAll('[data-replay]').forEach(function (b) {
    b.addEventListener('click', function () {
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = '';
      S.reveal = 0; S.revealT = 0; S.intro = 0;
      root.classList.remove('intro-done');
      window.FX.trigger(intro);
    });
  });

  // --- Dimensions ---------------------------------------------------------------------

  function resize() {
    var d = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5) * S.scale;
    var w = Math.round(window.innerWidth * d), h = Math.round(window.innerHeight * d);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  }
  window.addEventListener('resize', function () {
    resize();
    measure();
    if (activeTitle) paintTitle(activeTitle);
    render(0);
  });

  // --- Dessin -------------------------------------------------------------------------

  function rotation(ay, ax) {
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    return [cy, 0, -sy, sx * sy, cx, sx * cy, cx * sy, -sx, cx * cy];
  }
  var ribbons = [].slice.call(document.querySelectorAll('[data-ribbon]')).map(function (el, n) {
    return { el: el, p: 0, tail: 0, seed: n * 2.3 };
  });
  var stopCount = Math.max(1, document.querySelectorAll('[data-fx-stop]').length - 1);

  function render(dt) {
    var y = window.scrollY, vh = window.innerHeight, asp = canvas.width / canvas.height;
    var j = (journeyEl && journeyEl.fxJourney) || { bg: [3, 6, 15], ink: [238, 245, 246], index: 0 };
    var depth = j.index / stopCount;

    var soft = U.reduced || dt === 0 ? 1 : 1 - Math.pow(.0012, dt);
    var tgt = samplePath(y);
    S.x += (tgt.x - S.x) * soft; S.y += (tgt.y - S.y) * soft; S.r += (tgt.r - S.r) * soft;
    S.s += (tgt.s - S.s) * soft; S.f += (tgt.f - S.f) * soft; S.g += (tgt.g - S.g) * soft;
    var track = U.reduced ? 1 : Math.min(1, dt * 5);
    S.mx += (S.tmx - S.mx) * track; S.my += (S.tmy - S.my) * track;
    S.vel += ((y - S.lastY) - S.vel) * .1; S.lastY = y;
    if (!U.reduced) S.t += dt;
    S.dis += (S.disT - S.dis) * (U.reduced ? 1 : 1 - Math.pow(.11, dt));
    S.reveal = U.reduced ? S.revealT : Math.min(S.revealT, S.reveal + dt / 1.9);

    // L'ouverture part d'un point au centre, puis rejoint sa place
    var ip = intro.fxProgress === undefined ? 0 : intro.fxProgress;
    var outro = root.classList.contains('intro-done') ? 1 : 0;
    S.intro += (outro - S.intro) * (dt ? 1 - Math.pow(.015, dt) : 1);
    var ie = S.intro, grow = Math.pow(ip, 3);
    var cx = U.lerp(0, S.x, ie), cy = U.lerp(0, S.y, ie), rad = U.lerp(.006 + grow * .13, S.r, ie);
    var cpx = cx * asp * .5, cpy = cy * .5;
    var filmExtra = (1 - ie) * ip * 2;
    // Le bouton reste accroché au bas de la perle, quel que soit le format d'écran
    if (y < vh) {
      releaseBtn.style.left = ((cpx / asp + .5) * 100).toFixed(2) + '%';
      releaseBtn.style.top = ((.5 - cpy + S.r * .68) * vh).toFixed(1) + 'px';
    }
    // Le flacon se présente de face et ne fait que se balancer : on lit sa forme
    var face = U.clamp(S.s - 3, 0, 1);
    var turn = U.lerp(S.t * .11 + y * .0009, Math.sin(S.t * .35) * .22 + S.mx * .5, face);
    var rot = rotation(turn, S.my * -.5 * (1 - face * .5) + Math.sin(S.t * .17) * .08);

    gl.disable(gl.BLEND);
    gl.useProgram(worldP.p);
    gl.bindVertexArray(worldV);
    var u = worldP.u;
    gl.uniform2f(u('uRes'), canvas.width, canvas.height);
    gl.uniform2f(u('uMouse'), S.mx, S.my);
    gl.uniform1f(u('uT'), S.t);
    gl.uniform1f(u('uDepth'), depth);
    gl.uniform1f(u('uR'), rad);
    gl.uniform1f(u('uShape'), S.s);
    gl.uniform1f(u('uF'), S.f + filmExtra);
    gl.uniform1f(u('uGlass'), S.g);
    gl.uniform1f(u('uDis'), S.dis);
    gl.uniform1f(u('uReveal'), S.reveal);
    gl.uniform1f(u('uVel'), S.vel);
    gl.uniform2f(u('uC'), cpx, cpy);
    gl.uniform3f(u('uBg'), j.bg[0] / 255, j.bg[1] / 255, j.bg[2] / 255);
    var b2 = j.bg.map(function (c) { return Math.min(1, c / 255 * 1.05 + (depth > .5 ? .06 : .03)); });
    gl.uniform3f(u('uBg2'), b2[0], b2[1], b2[2]);
    gl.uniform3f(u('uInk'), j.ink[0] / 255, j.ink[1] / 255, j.ink[2] / 255);
    gl.uniformMatrix3fv(u('uRot'), false, rot);
    gl.uniform4fv(u('uRip'), RIPPLES);
    chooseTitle();
    var dW = canvas.width / window.innerWidth;
    if (activeTitle) {
      var tr = activeTitle.getBoundingClientRect();
      gl.uniform4f(u('uTR'), (tr.left - PAD) * dW, (tr.top - PAD) * dW, titleW * dW, titleH * dW);
    } else {
      gl.uniform4f(u('uTR'), 0, 0, 0, 0);
    }
    gl.uniform1i(u('uTitle'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);

    // Le plancton
    gl.useProgram(snowP.p);
    gl.bindVertexArray(snowV);
    gl.uniform1f(snowP.u('uT'), S.t);
    gl.uniform1f(snowP.u('uAsp'), asp);
    gl.uniform1f(snowP.u('uDepth'), depth);
    gl.uniform1f(snowP.u('uPx'), dW);
    gl.uniform2f(snowP.u('uMouse'), S.mx, S.my);
    gl.uniform4fv(snowP.u('uRip'), RIPPLES);
    gl.drawArrays(gl.POINTS, 0, SNOW);

    // La poussière libérée par la perle
    if (S.dis > .012 && ie > .5) {
      gl.useProgram(dustP.p);
      gl.bindVertexArray(dustV);
      gl.uniform1f(dustP.u('uT'), S.t);
      gl.uniform1f(dustP.u('uAsp'), asp);
      gl.uniform1f(dustP.u('uDis'), S.dis);
      gl.uniform1f(dustP.u('uR'), rad);
      gl.uniform1f(dustP.u('uPx'), dW);
      gl.uniform1f(dustP.u('uF'), S.f);
      gl.uniform2f(dustP.u('uC'), cpx, cpy);
      gl.uniform2f(dustP.u('uMouse'), S.mx, S.my);
      gl.uniformMatrix3fv(dustP.u('uRot'), false, rot);
      gl.drawArrays(gl.POINTS, 0, DUST);
    }

    // Les rubans se dessinent avec le défilement, puis se retirent par l'autre bout
    ribbons.forEach(function (rb) {
      var r = rb.el.getBoundingClientRect();
      var pass = (vh - r.top) / (vh + r.height);
      var head = U.clamp((pass - .08) / .58, 0, 1.03), tail = U.clamp((pass - .72) / .3, 0, 1.03);
      if (U.reduced) { head = pass > .05 && pass < .98 ? 1.03 : 0; tail = 0; }
      var k = dt ? 1 - Math.pow(.004, dt) : 1;
      rb.p += (head - rb.p) * k;
      rb.tail += (tail - rb.tail) * k;
      if (rb.p <= .002 || rb.tail >= 1 || r.bottom < -vh * .3 || r.top > vh * 1.3) return;
      gl.useProgram(ribbonP.p);
      gl.bindVertexArray(ribbonV);
      gl.uniform1f(ribbonP.u('uT'), S.t);
      gl.uniform1f(ribbonP.u('uAsp'), asp);
      gl.uniform1f(ribbonP.u('uW'), isMobile ? .05 : .068);
      gl.uniform1f(ribbonP.u('uL'), rb.seed);
      gl.uniform1f(ribbonP.u('uP'), rb.p);
      gl.uniform1f(ribbonP.u('uTail'), rb.tail);
      // Le ruban suit sa section à l'écran
      gl.uniform2f(ribbonP.u('uAnchor'), 0, (r.top + r.height / 2 - vh / 2) / -vh);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, (SEG + 1) * 2);
    });
  }

  // La résolution s'adapte à la machine pour garder la fluidité
  function adapt(ms) {
    S.ms += ms; S.frames++;
    if (S.frames < 40) return;
    var avg = S.ms / S.frames;
    S.ms = 0; S.frames = 0;
    S.fps = Math.round(1000 / avg);
    var next = S.scale;
    if (avg > 25) next = Math.max(.42, S.scale * .82);
    else if (avg < 13.5 && S.scale < 1) next = Math.min(1, S.scale * 1.12);
    if (Math.abs(next - S.scale) > .01) { S.scale = next; resize(); }
  }

  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !U.reduced) { S.lastT = 0; requestAnimationFrame(loop); }
  });
  function loop(t) {
    if (!running) return;
    var dt = S.lastT ? Math.min((t - S.lastT) / 1000, .05) : 0;
    if (S.lastT) adapt(t - S.lastT);
    S.lastT = t;
    render(dt);
    requestAnimationFrame(loop);
  }

  // Mouvement réduit : une image juste, redessinée seulement quand on défile
  function start() {
    resize();
    measure();
    if (U.reduced) {
      S.revealT = S.reveal = S.intro = 1;
      root.classList.add('intro-done');
      render(0);
      var again = false;
      window.addEventListener('scroll', function () {
        if (again) return;
        again = true;
        requestAnimationFrame(function () { again = false; render(0); });
      }, { passive: true });
      return;
    }
    requestAnimationFrame(loop);
  }

  // La police d'affichage doit être chargée pour passer dans la texture
  var fontsReady = Promise.all([
    document.fonts.load('500 96px "Bodoni Moda"'),
    document.fonts.load('italic 500 96px "Bodoni Moda"')
  ]).catch(function () {}).then(function () { return document.fonts.ready; });
  // Un réseau lent ne bloque jamais le monde : le titre sera redessiné à l'arrivée de la police
  var fontsOrTimeout = Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1200); })]);
  fontsReady.then(function () {
    if (activeTitle) { measure(); paintTitle(activeTitle); }
  });

  // Après un rechargement au milieu de la page, l'ambiance doit repartir du bon endroit
  function resync() { window.dispatchEvent(new Event('scroll')); }
  window.addEventListener('load', function () { setTimeout(resync, 60); });
  window.addEventListener('pageshow', resync);

  fontsOrTimeout.then(function () {
    titlesReady();
    start();
    resync();
    // Si l'ouverture était déjà passée (mémoire de session), on révèle tout de suite
    if (intro.hidden) {
      S.revealT = 1;
      root.classList.add('intro-done');
    }
    canvas.classList.add('ready');
  });

  // Pour la mise au point
  window.NACRE = { state: S, render: render, measure: measure };
  window.addEventListener('load', measure);
})();
