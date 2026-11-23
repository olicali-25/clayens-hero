// Hero Clayens Aerospace pour Webflow : intro au défilement, hélico et avion de ligne en 3D (Three.js).
// Chargé en module depuis le dossier hébergé ; images, polices et modèles 3D sont lus à côté de ce fichier.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const BASE = new URL('./', import.meta.url).href;
window.HERO_DECOLLAGE = true;   // l'avion décolle de face au défilement
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s){return document.querySelector(s)};
/* en-tête du site Webflow : passe en sombre pendant le cockpit si un élément #hd existe (facultatif) */
var hd=$('#hd'),ckOn=false;function headerState(){if(!hd)return;var inHero=scrollY<$('#hero').offsetHeight-innerHeight;hd.classList.toggle('dark',inHero&&ckOn)}
var lead=$('#lead'),words=lead.textContent.split(' ');lead.innerHTML=words.map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');var ws=lead.querySelectorAll('.w');
var Z=[['Europe/Paris','GENAS, FRANCE'],['Europe/Paris','BRIGNAIS, FRANCE'],['America/New_York','ATLANTA, USA'],['America/Chicago','ROCKFORD, USA'],['America/Denver','LOVELAND, USA']],zi=0,gmt=$('#gmt'),cur='';
function zstr(z){var d=new Date();var off=new Intl.DateTimeFormat('en-US',{timeZone:z[0],timeZoneName:'shortOffset'}).formatToParts(d).find(function(p){return p.type==='timeZoneName'}).value.replace('UTC','GMT');var t=new Intl.DateTimeFormat('en-GB',{timeZone:z[0],hour:'2-digit',minute:'2-digit'}).format(d);return z[1]+'  ·  '+t+'  ·  '+off}
function setGmt(s){var L=Math.max(s.length,cur.length);var html='';for(var i=0;i<L;i++){var a=s[i]||' ',b=cur[i]||' ';html+='<span'+(a!==b&&!reduce?' class="flip" style="animation-delay:'+(i*22)+'ms"':'')+'>'+(a===' '?'&nbsp;':a)+'</span>'}gmt.innerHTML=html;cur=s}
if(gmt){setGmt(zstr(Z[zi]));setInterval(function(){zi=(zi+1)%Z.length;setGmt(zstr(Z[zi]))},3600);}
var wm=$('#wm');
/* ===== Hero f : apparition puis caméra vers l'avion de ligne ===== */
var hero=$('#hero'),scene=$('#scene'),VS=[].slice.call(document.querySelectorAll('#hero .v')),hbase=$('#hbase'),meet=$('#meet'),hwhite=$('#hwhite'),notch=document.querySelector('#hero .notch')||document.createElement('i');
var hpin=document.querySelector('#hero .pin'),mqM=matchMedia('(max-width:900px)');function placeUI(){var t=mqM.matches?hpin:scene;if(hbase.parentNode!==t){t.insertBefore(hbase,t.querySelector('.white'));t.insertBefore(meet,t.querySelector('.white'))}}placeUI();(mqM.addEventListener?mqM.addEventListener('change',placeUI):mqM.addListener(placeUI));
var HDESC={f:'Four aircraft facing the viewer on a tarmac: a launcher, a helicopter, an airliner in the centre and a fighter (3D renders).',h:'An airliner facing the viewer on a tarmac, with a helicopter and a fighter flying above it (3D renders).',i:'An airliner facing the viewer on a tarmac, a helicopter and a fighter flying above it and a launcher lifting off in the distance (3D renders).'};
var introT=[];function intro(){introT.forEach(clearTimeout);introT=[];var V=hero.dataset.v;VS.forEach(function(v){var vi=v.querySelector('.vi');vi.classList.remove('in');var fly=V!=='f'&&(v.classList.contains('hl')||v.classList.contains('ft')||v.classList.contains('f22'));v.classList.toggle('fly',fly);var im=v.querySelector('img[data-fly]');if(im){if(!im.dataset.gnd)im.dataset.gnd=im.getAttribute('src');var src=fly?im.dataset.fly:im.dataset.gnd;if(im.getAttribute('src')!==src)im.setAttribute('src',src)}var d;if(V==='f')d=v.classList.contains('back')?0:v.classList.contains('mid')?260:520;else d=v.classList.contains('ln')?0:v.classList.contains('jt')?350:v.classList.contains('rk')?500:900;introT.push(setTimeout(function(){vi.classList.add('in')},reduce?0:250+d))})}
function setV(V){hero.dataset.v=V;$('#hdesc').textContent=HDESC[V];document.querySelectorAll('.vsw button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===V))});void hero.offsetWidth;intro();zo=null}
document.querySelectorAll('.vsw button').forEach(function(b){b.addEventListener('click',function(){setV(b.dataset.v)})});
var qv=(location.search.match(/hero=([fhi])/)||[])[1];hero.dataset.v=qv||'h';Promise.all([].map.call(document.querySelectorAll('#hero img, #wm'),function(i){return i.decode?i.decode().catch(function(){}):0})).then(function(){setV(qv||'h')});[BASE+'img/front-fighter.webp',BASE+'img/front-f22.webp',BASE+'img/cockpit-aube.webp'].forEach(function(u){var i=new Image();i.src=u});if(/variantes/.test(location.search))document.querySelector('.vsw').style.display='flex';
function sm(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
var ck=$('#ck'),ckb=ck.querySelector('.ckb'),ckc=ck.querySelector('.ckc'),glass=$('#glass'),PS=0,zo=null;addEventListener('resize',function(){zo=null});
/* point de zoom : le pare-brise de l'avion de ligne (50 % de la largeur, 44 % de la hauteur de l'image) */
function zoomOrigin(){var ln=scene.querySelector('.v.ln'),cs=getComputedStyle(ln),W=scene.offsetWidth,Hs=scene.offsetHeight,x=parseFloat(cs.getPropertyValue('--x')),b=parseFloat(cs.getPropertyValue('--b')),w=parseFloat(cs.getPropertyValue('--w')),ih=w/100*W*475/1186;var ox=x/100*W,oy=b/100*Hs-ih*(1-.44);var sr=hpin.getBoundingClientRect(),top=parseFloat(getComputedStyle(scene).top)||0;return {ox:ox,oy:oy,sy:top+oy,ph:hpin.offsetHeight}}
function heroFrame(y,H){var tot=hero.offsetHeight-H;if(y>tot+H)return;var T=Math.max(0,Math.min(1,y/tot));
  if(reduce){var on=T>.35;ckOn=on;ck.style.opacity=on?'1':'0';ckb.style.transform='none';for(var j=0;j<ws.length;j++)ws[j].classList.add('on');var g=String(on?0:1);hbase.style.opacity=g;meet.style.opacity=g;notch.style.opacity=g;meet.style.pointerEvents=on?'none':'';return}
  /* lissage : la progression suit le défilement avec un léger amorti */
  PS+=(T-PS)*.16;if(Math.abs(T-PS)<.0004)PS=T;var p=PS;
  if(!zo)zo=zoomOrigin();
  var z=sm(p/.6),Smax=mqM.matches?6:5,s=1,dy=0;/* variante : pas de zoom, l'avion décolle de face */var lnv=scene.querySelector('.v.ln');lnv.style.setProperty('--decol',Math.max(0,Math.min(1,p/.5)).toFixed(4));
  scene.style.transformOrigin=zo.ox+'px '+zo.oy+'px';scene.style.transform='translate(-50%,var(--ty)) translate3d(0,'+dy.toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
  var e=sm(p/.4);
  /* sortie des appareils, trajectoires d'après les mouvements réels :
     - hélico vers la gauche : nez bas, il s'enfonce un peu en prenant de la vitesse puis remonte en courbe (accélération progressive)
     - chasseurs vers la droite : accélération franche, virage incliné en montée, s'éloignent (rapetissent)
     - fusée vers le haut : poussée constante, la montée s'accélère (déplacement en t²), léger basculement en fin de course
     L'inclinaison et le virage des appareils 3D suivent --sortie (0 à 1). */
  VS.forEach(function(v){var side=+v.dataset.side;if(!side)return;var far=v.classList.contains('back')?1.25:1;
    var hl=v.classList.contains('hl'),rk=v.classList.contains('rk'),ch=v.classList.contains('ft')||v.classList.contains('f22');
    var dx,dy,rot=0,k=1,op,so;
    if(hl){var u=sm(p/.46);dx=-54*Math.pow(u,1.7);dy=4*Math.sin(Math.min(1,u*1.6)*Math.PI)*(1-u)-12*Math.pow(u,2.2);k=1-.12*u;op=1-sm((p-.14)/.32);so=sm(p/.34)}
    else if(ch){var u=sm(p/.4);dx=side*50*far*Math.pow(u,1.9);dy=-16*Math.pow(u,2);k=1-.28*u;op=1-sm((p-.08)/.3);so=sm(p/.26)}
    else if(rk){var u=sm(p/.5);dx=3*Math.pow(u,3);dy=-75*u*u;rot=6*Math.pow(u,3);op=1-sm((p-.2)/.3);so=u}
    else{dx=side*e*40*far;dy=0;op=1-sm(p/.3);so=e}
    v.style.transform='translate(calc(-50% + '+dx.toFixed(2)+'vw),calc(-100% + '+dy.toFixed(2)+'vh)) rotate('+rot.toFixed(2)+'deg) scale('+k.toFixed(4)+')';
    v.style.opacity=String(op);v.style.setProperty('--sortie',so.toFixed(4))});
  wm.style.opacity=String(1-sm(p/.3));
  var f=String(1-sm(p/.14));hbase.style.opacity=f;meet.style.opacity=f;notch.style.opacity=f;meet.style.pointerEvents=p>.1?'none':'';
  /* traversée du pare-brise : reflet de vitre, puis le cockpit prend le relais en continuant le mouvement */
  var g1=sm((z-.42)/.2),g2=1-sm((z-.72)/.22);glass.style.opacity='0';
  var c=sm((p-.52)/.16);ck.style.opacity=c.toFixed(3);ckc.style.opacity=sm((p-.5)/.12).toFixed(3);ckc.style.transform='translate(-50%,calc(-50% + '+((1-sm((p-.5)/.16))*24).toFixed(1)+'px))';ckOn=c>.6;ck.style.pointerEvents=c>.5?'auto':'none';
  var k=sm((p-.36)/.4);ckb.style.transform='scale('+(1.9-.9*k).toFixed(4)+')';ckb.style.setProperty('--bl',((1-k)*6).toFixed(1)+'px');
  var n=Math.round(sm((p-.6)/.3)*ws.length);for(var i=0;i<ws.length;i++)ws[i].classList.toggle('on',i<n);
  hwhite.style.opacity='0';}

function frame(){headerState();heroFrame(scrollY,innerHeight);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();

// Hélico 3D du hero (GLB Clayens). L'image d'origine reste en repli si WebGL ou le chargement échoue.
const box = document.querySelector('#hero .v.hl'), cv = box && box.querySelector('.h3d');
if (cv) try {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width:900px)').matches || navigator.hardwareConcurrency <= 4;
  const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));   // petit canvas : 1,5 suffit
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.6); sun.position.set(-6, 12, 10); scene.add(sun);
  const cam = new THREE.PerspectiveCamera(14, 1, 1, 400);
  const pivot = new THREE.Group(); scene.add(pivot);
  const base = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/';
  const loader = new GLTFLoader()
    .setDRACOLoader(new DRACOLoader().setDecoderPath(base + 'draco/gltf/'))
    .setKTX2Loader(new KTX2Loader().setTranscoderPath(base + 'basis/').detectSupport(r));
  let rotor, fan, ready = false, visible = true, last = performance.now(), t = 0, rendu = 0;
  const ckH = document.getElementById('ck');
  const FIT = { w: 15, h: 6, cy: 2.3 };
  function size() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h;
    // cadrage : disque rotor (13,4 m) + marge, centré sur le milieu de l'appareil
    // cadrage calculé sur le modèle chargé : envergure du rotor en largeur, hauteur totale + marge
    const halfW = FIT.w / 2 * 1.04, halfH = FIT.h / 2 * 1.1, vf = THREE.MathUtils.degToRad(cam.fov) / 2;
    const d = Math.max(halfH / Math.tan(vf), halfW / (Math.tan(vf) * cam.aspect));
    cam.position.set(0, FIT.cy + d * 0.07, d + (FIT.dz || 0)); cam.lookAt(0, FIT.cy, 0); cam.updateProjectionMatrix();
  }
  loader.load(BASE + '3d/' + (matchMedia('(max-width: 767px)').matches ? 'helico_ec135_realiste.m.glb' : 'helico_ec135_realiste.web.glb'), (g) => {   // 2K sur ordinateur, 1K sur téléphone
    const m = g.scene; pivot.add(m);
    const bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3());
    FIT.w = sz.x; FIT.h = sz.y; FIT.cy = (bb.min.y + bb.max.y) / 2; FIT.dz = sz.z / 2;
    m.position.x -= (bb.min.x + bb.max.x) / 2; m.position.z -= (bb.min.z + bb.max.z) / 2;
    m.traverse((o) => { const ms = o.material ? [].concat(o.material) : []; for (const mt of ms) if (/glass/i.test(mt.name)) { mt.transmission = 0; mt.color.set(0x7f888d); mt.transparent = true; mt.opacity = 0.5; mt.depthWrite = false; mt.roughness = 0.04; mt.metalness = 0; mt.clearcoat = 0; mt.envMapIntensity = 0.6; o.renderOrder = 2; } });
  rotor = m.getObjectByName('rotor_principal'); fan = m.getObjectByName('rotor_anticouple'); if (rotor) rotor.scale.setScalar(0.88);
    size(); r.render(scene, cam);
    r.compileAsync ? r.compileAsync(scene, cam).then(go, go) : go();
  }, undefined, (e) => console.warn('hélico 3D : repli image', e));
  function go() { ready = true; box.classList.add('on3d'); requestAnimationFrame(loop); }
  function loop(now) {
    if (!ready) return;
    const dt = Math.min(0.05, (now - last) / 1000);   // temps écoulé depuis le dernier rendu
    // 30 images/s au plus ; rien sous la photo du cockpit
    const cache = ckH && parseFloat(getComputedStyle(ckH).opacity) > 0.95;
    if (visible && !document.hidden && !cache && now - rendu > 33) {
      rendu = now; last = now; t += dt;
      if (!reduce) {
        // sortie au défilement : vrai mouvement d'hélico vers la gauche (nez bas pour accélérer, inclinaison et virage à gauche)
        const so = parseFloat(box.style.getPropertyValue('--sortie')) || 0, ss = so * so * (3 - 2 * so);
        if (rotor) rotor.rotation.y -= dt * 2 * Math.PI * (0.9 + ss * 0.35);
        if (fan) fan.rotation.x += dt * 2 * Math.PI * 3.1;
        const calme = 1 - ss;
        pivot.rotation.y = 0.28 * calme - 0.85 * ss + Math.sin(t * 0.35) * 0.04 * calme;   // léger angle (fenêtres latérales), puis virage vers la gauche
        pivot.rotation.x = 0.1 + 0.3 * ss + Math.sin(t * 0.5) * 0.015;                  // nez baissé en vol, plus bas pour accélérer
        pivot.rotation.z = -0.07 * calme + 0.42 * ss + Math.sin(t * 0.35 + 1) * 0.02 * calme; // inclinaison à gauche dans le virage
      } else { pivot.rotation.set(0.1, 0.28, -0.07); }
      r.render(scene, cam);
    }
    requestAnimationFrame(loop);
  }
  new ResizeObserver(size).observe(cv);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(cv);
} catch (e) { console.warn('hélico 3D indisponible', e); }

// Écrans plus larges que la scène (1440 x 860) : véhicules écartés pour occuper la largeur, jusqu'à 1,4 fois (ordinateur)
{
  const he = document.getElementById('hero'), sce = document.getElementById('scene');
  const etal = () => { const e = matchMedia('(max-width:900px)').matches || !sce.offsetWidth ? 1 : Math.min(1.4, Math.max(1, innerWidth / sce.offsetWidth)); he.style.setProperty('--etal', e.toFixed(3)); };
  etal(); addEventListener('resize', etal);
}

// Avion de ligne 3D du hero et autres véhicules (chasseur, F-22, jet d'affaires, fusée) : un même moteur de rendu.
// Chaque véhicule remplace son image plate : caméra calée sur cette image (vehicules/scripts/caler_camera.py),
// projection recadrée pour que la silhouette occupe exactement la place de l'image (bas aligné sur l'image).
// Le canvas ne couvre que la partie visible et suit le zoom du hero, recalculé à la résolution de l'écran :
// le cockpit de l'avion de ligne reste net quand on traverse le pare-brise. Rendu à la demande (appareils immobiles).
{
  const ckL = document.getElementById('ck');
  const BASEV = (typeof BASE === 'string' ? BASE : '');
  const mobileV = matchMedia('(max-width:900px)').matches || navigator.hardwareConcurrency <= 4;
  const PRV = Math.min(devicePixelRatio, mobileV ? 1.5 : 2);
  // animations continues (soufflantes, flottement) : ordinateur seulement, le téléphone reste statique (vu avec la cliente)
  const animV = !mobileV && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUR = Math.PI * 2;
  // hero hors de l'écran (page défilée plus bas) : plus aucun calcul, ni lecture de mise en page
  let heroVu = true;
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) new IntersectionObserver((e) => { heroVu = e[0].isIntersecting; }).observe(heroEl);
  const libs = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/';
  const dracoV = new DRACOLoader().setDecoderPath(libs + 'draco/gltf/');
  // ciel de jour généré (zénith bleu gris, horizon clair, tarmac) : reflets cohérents avec le décor du hero
  function ciel() {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(100, 48, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: [
        'varying vec3 d;',
        'void main(){',
        '  float h = d.y;',
        '  vec3 zen = vec3(.42, .55, .72), hor = vec3(.93, .95, .97), sol = vec3(.46, .46, .45);',
        '  vec3 c = h > 0. ? mix(hor, zen, pow(h, .55)) : mix(hor * .8, sol, smoothstep(0., .12, -h));',
        '  float s = max(dot(d, normalize(vec3(-.35, .75, .55))), 0.);',
        '  c += vec3(1., .93, .82) * (pow(s, 600.) * 30. + pow(s, 12.) * .25);',
        '  gl_FragColor = vec4(c, 1.);',
        '}'].join('\n'),
    })));
    return s;
  }
  // o : { sel, canvas, glb, cam:[distance devant le nez, hauteur, visée], sol (ombre au tarmac), vol (image « -fly » seulement), cockpit }
  function vehicule3d(o) {
    const box = document.querySelector('#hero ' + o.sel), cv = box && box.querySelector(o.canvas || '.v3d');
    const img = box && box.querySelector('.vi img');
    if (!cv || !img) return;
    try {
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;   // même rendu que l'hélico
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.shadowMap.enabled = !!o.sol; r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.shadowMap.autoUpdate = false;   // ombre recalculée seulement quand l'appareil se déplace (pas pour les soufflantes)
      const scene = new THREE.Scene();
      const pm = new THREE.PMREMGenerator(r);
      scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.9;   // éclairage de l'hélico
      const sun = new THREE.DirectionalLight(0xfff4e6, 1.6); sun.position.set(-18, 36, 30);   // soleil de l'hélico (même direction)
      scene.add(sun, sun.target);
      if (o.sol) {
        sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; sun.shadow.radius = 4;
        Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
        const sol = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShadowMaterial({ opacity: 0.24 }));
        sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
      }
      const cam = new THREE.PerspectiveCamera(50, 2, 0.3, 2000);
      const loader = new GLTFLoader().setDRACOLoader(dracoV)
        .setKTX2Loader(new KTX2Loader().setTranscoderPath(libs + 'basis/').detectSupport(r));   // textures KTX2 (Mirage 2000-5F)
      let model = null, P0 = null, fit = null, cle = '', on = false, A = 2, pivot = null, trains = [], fans = [], dernier = 0, boite = null, ombre = '', taille = '', lourds = [];
      const fru = new THREE.Frustum(), mpv = new THREE.Matrix4(), bw = new THREE.Box3();
      function caler(pts) {
        A = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : (img.offsetWidth / img.offsetHeight || 2);
        cam.aspect = A; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const v = new THREE.Vector3();
        for (let i = 0; i < pts.length; i += 3) { v.set(pts[i], pts[i + 1], pts[i + 2]).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
        P0 = cam.projectionMatrix.clone();
        if (o.cadre === 'hauteur') {   // appareil élancé (fusée) : calé sur la hauteur de l'image, centré en largeur
          const sg = 2 / (y1 - y0); fit = { x0: (x0 + x1) / 2 - 1 / sg, y0, sg };
        } else fit = { x0, y0, sg: 2 / (x1 - x0) };
      }
      function cacher() { if (on) { cv.style.visibility = 'hidden'; on = false; cle = ''; } }
      function frame() {
        requestAnimationFrame(frame);
        if (!model || document.hidden || !heroVu) return;
        // appareil en vol seulement : si le hero affiche l'image au sol, on la laisse visible
        const ok = !o.vol || /-fly\./.test(img.getAttribute('src') || '');
        box.classList.toggle('on3d', ok);
        if (!ok) return cacher();
        const R = img.getBoundingClientRect(), W = img.offsetWidth, H = img.offsetHeight;
        if (!W || !H) return;
        const s = R.width / W, vw = innerWidth, vh = innerHeight;
        const masque = ckL && parseFloat(getComputedStyle(ckL).opacity) > 0.95;   // photo du cockpit quasi opaque : plus rien à dessiner dessous
        // sortie au défilement (--sortie posé par le hero) : virage incliné, appliqué autour du centre de l'appareil
        const so = o.sortie ? (parseFloat(box.style.getPropertyValue('--sortie')) || 0) : 0, ss = so * so * (3 - 2 * so);
        // décollage de face (variante) : --decol posé par le hero, de 0 (au sol) à 1 (passé au-dessus de la caméra)
        const dc = o.decollage ? (parseFloat(box.style.getPropertyValue('--decol')) || 0) : 0;
        const mg = 0.08 + (o.sortie ? 0.7 * Math.min(1, ss * 3) : 0) + (dc > 0.002 ? 3 : 0);   // cadre élargi pendant les mouvements : rien n'est coupé
        const mx = W * mg, my = H * mg;
        const sx0 = Math.max(0, R.left - mx * s), sx1 = Math.min(vw, R.right + mx * s);
        const sy0 = Math.max(0, R.top - my * s), sy1 = Math.min(vh, R.bottom + my * s);
        if (masque || sx1 - sx0 < 2 || sy1 - sy0 < 2 || getComputedStyle(box).display === 'none') return cacher();
        const lx = (sx0 - R.left) / s, ly = (sy0 - R.top) / s, lw = (sx1 - sx0) / s, lh = (sy1 - sy0) / s;
        const k = [lx, ly, lw, lh, s, ss, dc].map((n) => n.toFixed(3)).join() + vw + 'x' + vh;
        // rendu à la demande, sauf animation continue : alors 30 images/s au plus
        const vivant = animV && (fans.length > 0 || !!o.flotte), now = performance.now();
        if (k === cle && !(vivant && now - dernier > 33)) return;
        cle = k; dernier = now;
        if (pivot && o.sortie) {
          pivot.rotation.set(o.sortie[0] * ss, o.sortie[1] * ss, o.sortie[2] * ss);
          pivot.position.z = pivot.userData.z0 - (o.sortie[3] || 0) * ss * ss;   // s'éloigne en accélérant
        }
        // flottement en vol stationnaire avant le défilement (houle lente, roulis et tangage légers), effacé par la sortie
        if (pivot && o.flotte && animV) {
          const f = 1 - ss, t = now / 1000;
          pivot.position.y = pivot.userData.y0 + f * o.flotte * Math.sin(t * TOUR / 5.2);
          pivot.rotation.z += f * 0.035 * Math.sin(t * TOUR / 6.7 + 1);
          pivot.rotation.x += f * 0.015 * Math.sin(t * TOUR / 4.3 + 2);
        }
        // soufflantes au ralenti (environ un demi-tour par seconde, assez lent pour que les pales restent lisibles)
        if (animV) for (const g of fans) g.rotation.z = -(now / 1000) * TOUR * 0.45;
        if (pivot && o.decollage) {
          // roulage en accélérant vers la caméra (distance en t²), rotation sur le train principal (9° puis 12° en montée),
          // envol et montée qui le font passer au-dessus de la caméra puis sortir par le haut
          const lisse = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
          const cab = lisse((dc - 0.26) / 0.2) * 0.157 + lisse((dc - 0.5) / 0.3) * 0.052;
          pivot.rotation.set(-cab, 0, 0);
          pivot.position.set(0, 80 * Math.pow(Math.max(0, dc - 0.38), 1.8), pivot.userData.z0 + 45 * dc * dc);
          // train rentré peu après l'envol : le train avant bascule vers l'avant dans sa case, le principal remonte sous l'aile
          const rt = lisse((dc - 0.44) / 0.16);
          for (const g of trains) {
            if (g.userData.avant) g.rotation.x = -1.45 * rt;
            g.scale.set(1 - 0.5 * rt, Math.max(0.001, 1 - rt), 1 - 0.5 * rt); g.visible = rt < 0.995;
          }
        }
        // recadrage en coordonnées de découpage : la silhouette de référence est posée sur le rectangle de l'image
        const { x0, y0, sg } = fit;
        const a = sg * W / lw, b = -sg * x0 * W / lw - 2 * lx / lw - 1;
        const Hb = H * (1 - (o.bas || 0));   // bas de la silhouette remonté si l'image du header a des emports dessous
        const c = sg * H / lh, d = 1 - 2 * (Hb - ly) / lh - sg * y0 * H / lh;
        const e = cam.projectionMatrix.elements, p = P0.elements;
        for (let i = 0; i < 4; i++) {
          e[i * 4] = a * p[i * 4] + b * p[i * 4 + 3];
          e[i * 4 + 1] = c * p[i * 4 + 1] + d * p[i * 4 + 3];
          e[i * 4 + 2] = p[i * 4 + 2]; e[i * 4 + 3] = p[i * 4 + 3];
        }
        cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
        // appareil sorti du cadre (décollage passé au-dessus de la caméra, sortie finie) : canvas masqué, plus aucun rendu
        if (pivot && boite && (dc > 0 || ss > 0)) {
          pivot.updateMatrixWorld(true); bw.copy(boite).applyMatrix4(pivot.matrixWorld);
          fru.setFromProjectionMatrix(mpv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
          if (!fru.intersectsBox(bw)) { cacher(); cle = k; return; }
        }
        Object.assign(cv.style, { left: lx + 'px', top: ly + 'px', width: lw + 'px', height: lh + 'px', visibility: 'visible' }); on = true;
        // densité 1,5 au repos, pleine densité pendant le zoom (là où la netteté du cockpit compte)
        const pr = Math.min((s > 1.15 ? PRV : Math.min(PRV, 1.5)) * s, 4096 / Math.max(lw, 1), 4096 / Math.max(lh, 1));
        const t2 = pr.toFixed(3) + ',' + lw.toFixed(1) + ',' + lh.toFixed(1);
        if (t2 !== taille) { taille = t2; r.setPixelRatio(pr); r.setSize(lw, lh, false); }   // redimensionner réalloue le canvas : seulement si ça change
        // planche de bord détaillée : invisible derrière le pare-brise teinté au repos, dessinée seulement en approche
        for (const n of lourds) n.visible = s > 1.15 || dc > 0.05;
        const om = ss.toFixed(4) + ',' + dc.toFixed(4);
        if (om !== ombre) { ombre = om; r.shadowMap.needsUpdate = true; }
        r.render(scene, cam);
      }
      // téléphone : version allégée (textures 1K) si elle existe
      const fichier = (o.glbm && matchMedia('(max-width: 767px)').matches) ? o.glbm : o.glb;
      loader.load(BASEV + '3d/' + fichier, (g) => {
        model = g.scene; scene.add(model);
        const bb = new THREE.Box3().setFromObject(model), sz = bb.getSize(new THREE.Vector3());
        model.position.x -= (bb.min.x + bb.max.x) / 2; model.position.y -= bb.min.y;
        model.updateMatrixWorld(true);
        // pivot au centre de l'appareil pour les mouvements de sortie
        const ctr = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
        // décollage : le pivot est le train principal (au sol, à 33,5 % de la longueur derrière le nez), sinon le centre
        const tp = model.getObjectByName('train_principal');
        if (o.decollage) {
          if (tp) { const c = new THREE.Box3().setFromObject(tp).getCenter(new THREE.Vector3()); ctr.set(0, 0, c.z); }
          else ctr.set(0, 0, bb.max.z - 0.335 * sz.z);
        }
        pivot = new THREE.Group(); pivot.position.copy(ctr); pivot.userData.z0 = ctr.z; pivot.userData.y0 = ctr.y; scene.add(pivot); pivot.add(model); model.position.sub(ctr);
        pivot.updateMatrixWorld(true);
        boite = new THREE.Box3().setFromObject(model).applyMatrix4(new THREE.Matrix4().copy(pivot.matrixWorld).invert());
        // soufflantes : chacune dans un groupe centré sur l'axe du moteur (axe de l'avion)
        for (const nom of ['soufflante_g', 'soufflante_d']) {
          const t = model.getObjectByName(nom); if (!t) continue;
          const c = new THREE.Box3().setFromObject(t).getCenter(new THREE.Vector3());
          const g = new THREE.Group(); g.position.copy(c); t.parent.add(g); g.parent.worldToLocal(g.position); g.updateMatrixWorld(true); g.attach(t); fans.push(g);
        }
        // trains : chacun dans un groupe articulé en haut de la jambe (sous le ventre ou l'aile)
        if (o.decollage) for (const nom of ['train_avant', 'train_principal']) {
          const t = model.getObjectByName(nom); if (!t) continue;
          const b = new THREE.Box3().setFromObject(t), c = b.getCenter(new THREE.Vector3());
          const g = new THREE.Group(); g.userData.avant = nom === 'train_avant';
          g.position.set(c.x, b.max.y, c.z); t.parent.add(g); g.parent.worldToLocal(g.position); g.updateMatrixWorld(true); g.attach(t); trains.push(g);
        }
        // réglage de caméra par l'adresse, pour les essais : ?cam_ft=distance,hauteur,visée
        const essai = new URLSearchParams(location.search).get('cam_' + o.sel.split('.').pop());
        const nez = bb.max.z, C = essai ? essai.split(',').map(Number) : o.cam;
        cam.position.set(0, C[1], nez + C[0]); cam.lookAt(0, C[2], nez - sz.z * 0.3); cam.updateMatrixWorld(true);
        sun.target.position.set(0, 0, nez - sz.z * 0.45);
        const a = [], v = new THREE.Vector3(), pas = Math.max(1, Math.round(model.children.length ? 7 : 7));
        model.traverse((m) => {
          if (!m.isMesh) return;
          m.castShadow = !!o.sol; m.receiveShadow = !!o.sol;
          for (const mt of [].concat(m.material)) {
            if (/^vitrage/i.test(mt.name)) {
              mt.transmission = 0; mt.color.set(0x2a3136); mt.transparent = true; mt.opacity = o.cockpit ? 0.36 : 0.82; mt.depthWrite = false;
              mt.roughness = 0.02; mt.metalness = 0; mt.envMapIntensity = 1.1; m.renderOrder = 2; m.castShadow = false;
            }
            if (/^ecrans$/.test(mt.name)) mt.emissiveIntensity = 1.4;
          }
          const pa = m.geometry.attributes.position;
          for (let i = 0; i < pa.count; i += pas) { v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); a.push(v.x, v.y, v.z); }
        });
        if (o.cockpit) { const n = model.getObjectByName('cockpit'); if (n) lourds.push(n); }
        if (o.cockpit) {   // lumière dorée du cockpit, comme la photo qui prend le relais au bout du zoom
          const pil = model.getObjectByName('pilotes');
          if (pil) {
            const c = new THREE.Box3().setFromObject(pil).getCenter(new THREE.Vector3());
            const lc = new THREE.PointLight(0xffc98a, 14, 3.6, 2); lc.position.copy(c).add(new THREE.Vector3(0, 0.55, -0.35)); scene.add(lc); lc.updateMatrixWorld(); pivot.attach(lc);
            const lf = new THREE.PointLight(0xffe2b8, 8, 2.8, 2); lf.position.copy(c).add(new THREE.Vector3(0, 0.25, -1.1)); scene.add(lf); lf.updateMatrixWorld(); pivot.attach(lf);
          }
        }
        const pret = () => {
          caler(new Float32Array(a));
          const go = () => requestAnimationFrame(frame);
          r.compileAsync ? r.compileAsync(scene, cam).then(go, go) : go();
        };
        if (img.complete && img.naturalWidth) pret(); else img.addEventListener('load', pret, { once: true });
      }, undefined, (e) => console.warn('3D ' + o.glb + ' : repli image', e));
    } catch (e) { console.warn('3D ' + o.glb + ' indisponible', e); }
  }
  const avcam = new URLSearchParams(location.search).get('avcam');
  vehicule3d({ sel: '.v.ln', canvas: '.l3d', glb: 'avion_a320_realiste.web.glb', glbm: 'avion_a320_realiste.m.glb', cam: avcam ? avcam.split(',').map(Number) : [22.5, 2.7, 7], sol: true, cockpit: true, decollage: !!window.HERO_DECOLLAGE });
  // chasseurs : en sortant vers la droite, virage sur l'aile droite, nez qui tourne vers la droite et cabre légèrement
  vehicule3d({ sel: '.v.ft', glb: 'chasseur_5f_realiste.web.glb', glbm: 'chasseur_5f_realiste.m.glb', cam: [20, 1.2, 1.6], bas: 0.24, vol: true, flotte: 0.15, sortie: [-0.16, 0.32, -0.8, 45] });
  vehicule3d({ sel: '.v.f22', glb: 'f22.web.glb', cam: [19.76, 0.7, 2.78], vol: true, flotte: 0.15, sortie: [-0.16, 0.32, -0.8, 45] });
  // jet d'affaires : retiré à la demande (image d'origine conservée)
  vehicule3d({ sel: '.v.rk', glb: 'fusee_f9_realiste.web.glb', cam: [215.6, 7.3, 49.0], cadre: 'hauteur' });
}
