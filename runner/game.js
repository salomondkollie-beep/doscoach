"use strict";
// Salomond Runner : course sans fin en 3 voies, vue 3D simulée.
const cv=document.getElementById("cv"),ctx=cv.getContext("2d"),pvc=document.getElementById("pv"),pctx=pvc.getContext("2d");
const $=id=>document.getElementById(id);
const ri=n=>Math.floor(Math.random()*n),pick=a=>a[ri(a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const L3=[-1,0,1];
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
let S={coins:0,best:0,owned:[0],sel:0,snd:true,miss:[],runs:0};
try{const s=JSON.parse(store("sr1")||"null");if(s)S=Object.assign(S,s)}catch(e){}
const save=()=>store("sr1",JSON.stringify(S));
// ---------- missions ----------
const MT={coin:["Ramasse {n} pièces",50],dist:["Cours {n} m en une partie",400],jump:["Saute {n} fois",20],roll:["Glisse {n} fois",15],pu:["Prends {n} bonus",4],shield:["Utilise {n} boucliers",2]};
function newMission(ex){const ks=Object.keys(MT).filter(k=>!(ex||[]).includes(k)),k=pick(ks),m=1+Math.min(5,Math.floor(S.runs/5));return{t:k,n:MT[k][1]*m,p:0,r:40+30*m}}
while(S.miss.length<3)S.miss.push(newMission(S.miss.map(x=>x.t)));
function toast(s){const e=$("toast");e.textContent=s;e.className="on";clearTimeout(toast.h);toast.h=setTimeout(()=>e.className="",2200)}
function mis(t,v){let d=false;S.miss.forEach((m,i)=>{if(m.t!==t)return;if(t==="dist")m.p=Math.max(m.p,v);else m.p+=v;if(m.p>=m.n){S.coins+=m.r;toast("Mission réussie ! +"+m.r+" 🪙");S.miss[i]=newMission(S.miss.map(x=>x.t));d=true}});if(d)save()}
// ---------- sons ----------
let ac;function tone(f,f2,d,ty,v){if(!S.snd)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type=ty||"sine";o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),n+d);g.gain.setValueAtTime(v||.08,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(ac.destination);o.start(n);o.stop(n+d)}catch(e){}}
const SFX={coin:()=>tone(880,1320,.09,"sine",.06),jump:()=>tone(300,620,.14,"square",.035),roll:()=>tone(420,150,.16,"sawtooth",.035),move:()=>tone(260,200,.05,"triangle",.05),crash:()=>{tone(200,40,.5,"sawtooth",.1);tone(90,30,.5,"square",.08)},pu:()=>{tone(500,1000,.15,"sine",.07);setTimeout(()=>tone(800,1500,.15,"sine",.07),90)},shield:()=>tone(700,200,.25,"triangle",.09),bump:()=>tone(150,80,.15,"square",.07),go:()=>{tone(400,800,.12);setTimeout(()=>tone(600,1200,.15),120)},ui:()=>tone(600,800,.06,"sine",.05)};
const sfx=n=>{try{SFX[n]&&SFX[n]()}catch(e){}};
// ---------- écran et projection ----------
let W=1,H=1,DPR=1,U=100,F=400,HOR=200,camX=0;
const ZP=3,ZOFF=1,CAMH=3.7;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+"px";cv.style.height=H+"px";ctx.setTransform(DPR,0,0,DPR,0,0);U=Math.min(W*.27,H*.16);F=U*(ZP+ZOFF);HOR=H*.3}
addEventListener("resize",resize);
const pj=(x,y,z)=>{const s=F/(z+ZOFF);return[W/2+(x-camX)*s,HOR+(CAMH-y)*s,s]};
function quad(a,b,c,d,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.closePath();ctx.fill()}
function box(x0,x1,y0,y1,z0,z1,cf,ct,cs){
 if(z1<=-.8)return;const zn=Math.max(z0,-.8);
 const A=pj(x0,y0,zn),B=pj(x1,y0,zn),C=pj(x1,y1,zn),D=pj(x0,y1,zn),E=pj(x0,y1,z1),Fp=pj(x1,y1,z1),cx=(x0+x1)/2-camX;
 if(cx<-.01)quad(B,pj(x1,y0,z1),Fp,C,cs);else if(cx>.01)quad(A,pj(x0,y0,z1),E,D,cs);
 quad(D,C,Fp,E,ct);if(z0>=-.8)quad(A,B,C,D,cf)}
// ---------- couleurs et thèmes (jour, coucher de soleil, nuit, aube) ----------
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const TH=[{sk:"#4FA3E0",sb:"#BFE5F7",rd:"#4A4F57",ln:"#F4F1E4",b0:"#C77E5F",b1:"#D9B88F",b2:"#7D93A8",sun:"#FFF3B0",wl:.25},
{sk:"#3A2A6B",sb:"#F59A5B",rd:"#3B3A47",ln:"#F2E3C8",b0:"#7A4B5F",b1:"#9B5E5A",b2:"#4C4466",sun:"#FFB36B",wl:.5},
{sk:"#080A22",sb:"#243A6B",rd:"#262A36",ln:"#B9C4E0",b0:"#1B2140",b1:"#252B52",b2:"#2E3560",sun:"#E8EEFF",wl:.85},
{sk:"#6A8CCB",sb:"#FFD6A5",rd:"#454A55",ln:"#F4EAD8",b0:"#B58C7D",b1:"#C9A98B",b2:"#8896A8",sun:"#FFE9B8",wl:.35}];
const TC=TH.map(t=>{const o={wl:t.wl};for(const k in t)if(k!=="wl")o[k]=hex(t[k]);return o});
let cur=JSON.parse(JSON.stringify(TC[0])),thIdx=0;
function blend(dt){const g=TC[thIdx],a=Math.min(1,dt*.8);for(const k in g){if(k==="wl")cur.wl+=(g.wl-cur.wl)*a;else for(let i=0;i<3;i++)cur[k][i]+=(g[k][i]-cur[k][i])*a}}
const rgb=(a,f,al)=>{f=f||1;return"rgba("+clamp(a[0]*f,0,255)+","+clamp(a[1]*f,0,255)+","+clamp(a[2]*f,0,255)+","+(al===undefined?1:al)+")"};
function shade(h,f){const c=hex(h).map(v=>clamp(v*f,0,255)|0);return"rgb("+c.join(",")+")"}
function hash(n){n=(n^61)^(n>>>16);n=n+(n<<3);n=n^(n>>>4);n=Math.imul(n,0x27d4eb2d);n=n^(n>>>15);return(n>>>0)/4294967296}
// ---------- état du jeu ----------
let st="menu",dist=0,speed=0,lane=0,prevLane=0,px=0,py=0,vy=0,rollT=0,pendRoll=false,inv=0,stumble=0,t=0,score=0,runCoins=0,committed=0,dead=false,deadT=0,revives=0,shake=0,shield=0,puMag=0,puX2=0,nextP=0,nextPU=0,flash=0;
let objs=[],parts=[];
const PK=()=>CHARS[S.sel].pk;
// ---------- création des obstacles ----------
const TRC=["#C0392B","#2980B9","#27AE60","#8E44AD","#E67E22"];
function coinLine(l,p,n,y){for(let i=0;i<n;i++)objs.push({k:"coin",x:l,p:p+i*1.4,y:y||.65})}
function coinArc(l,p,n,h){for(let i=0;i<n;i++)objs.push({k:"coin",x:l,p:p+i*1.4,y:.65+Math.sin(i/(n-1)*Math.PI)*h})}
function add(k,l,p,len,c){objs.push({k:k,x:l,p:p,len:len,c:c||0})}
const PATS=[
{w:d=>3,f:p=>{coinLine(pick(L3),p,8);return 11}},
{w:d=>d>50?2.5:0,f:p=>{const l=pick(L3);add("bar",l,p+4,.5);coinArc(l,p,8,1.1);return 12}},
{w:d=>d>40?2:0,f:p=>{const a=pick(L3);for(const l of L3)if(l!==a)add("cone",l,p+2,.5);coinLine(a,p,6);return 9}},
{w:d=>d>110?3:0,f:p=>{const l=pick(L3),len=5+ri(5);add("train",l,p+2,len,ri(5));coinLine(pick(L3.filter(x=>x!==l)),p,8);return len+5}},
{w:d=>d>90?2:0,f:p=>{const f=pick(L3);for(const l of L3)if(l!==f)add("bar",l,p+3,.5);coinLine(f,p,6);return 10}},
{w:d=>d>200?2:0,f:p=>{for(const l of L3)add("gate",l,p+3,.6);coinLine(0,p-3,3,.35);return 9}},
{w:d=>d>160?2:0,f:p=>{const a=pick(L3),b=pick(L3.filter(x=>x!==a)),c=L3.find(x=>x!==a&&x!==b);add("train",a,p+2,7,ri(5));add("bar",b,p+4,.5);coinLine(c,p,8);return 13}},
{w:d=>d>70?1.5:0,f:p=>{const seq=[-1,0,1,0];for(let i=0;i<8;i++)objs.push({k:"coin",x:seq[i%4],p:p+i*1.6,y:.65});return 14}},
{w:d=>d>280?2.5:0,f:p=>{const f=pick(L3),len=6+ri(4);for(const l of L3)if(l!==f)add("train",l,p+2,len,ri(5));coinLine(f,p,Math.ceil(len/1.4)+2);return len+5}},
{w:d=>d>400?2:0,f:p=>{const sp=6+speed*.35;let f=pick(L3);for(let i=0;i<3;i++){for(const l of L3)if(l!==f)add(i%2?"bar":"cone",l,p+i*sp,.5);coinLine(f,p+i*sp,3);f=pick(L3.filter(x=>x!==f))}return sp*3}}];
function spawn(){
 while(nextP<dist+66){
  const ws=PATS.map(p=>p.w(dist));let r=Math.random()*ws.reduce((a,b)=>a+b,0),i=0;
  while(i<ws.length-1&&(r-=ws[i])>0)i++;
  nextP+=PATS[i].f(nextP)+Math.max(4,3+speed*.45)+ri(3);
  if(dist>=nextPU){objs.push({k:"pu",t:pick(["mag","x2","sh"]),x:pick(L3),p:nextP-3,y:.9});nextPU+=260+ri(260)}
 }
}
// ---------- actions du joueur ----------
function go(d){if(st!=="play"||dead)return;const n=clamp(lane+d,-1,1);if(n!==lane){prevLane=lane;lane=n;sfx("move")}}
function jump(){if(st!=="play"||dead)return;if(py<=.001){vy=8.8*Math.sqrt(PK().jump||1);rollT=0;pendRoll=false;mis("jump",1);sfx("jump")}}
function roll(){if(st!=="play"||dead)return;if(py>.001){vy=-22;pendRoll=true}else rollT=.65;mis("roll",1);sfx("roll")}
function swipe(d){if(d==="l")go(-1);else if(d==="r")go(1);else if(d==="u")jump();else roll()}
// ---------- mise à jour ----------
function spark(x,y,n,col){for(let i=0;i<n;i++){const a=Math.random()*6.3,v=60+Math.random()*160;parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:.5+Math.random()*.4,c:col,s:2+Math.random()*3})}}
function pickup(o){
 if(o.k==="coin"){runCoins+=PK().coin||1;score+=3;mis("coin",1);sfx("coin");const q=pj(o.x,o.y,ZP);spark(q[0],q[1],4,"#FFD54A")}
 else{mis("pu",1);sfx("pu");if(o.t==="mag")puMag=9*(PK().mag||1);else if(o.t==="x2")puX2=9*(PK().x2||1);else shield=Math.min(shield+1,2)}}
function hit(){
 if(shield>0){shield--;inv=1.8*(PK().inv||1);shake=.35;sfx("shield");mis("shield",1);const q=pj(px,py+.7,ZP);spark(q[0],q[1],18,"#7FDBFF");return}
 dead=true;deadT=0;shake=.6;sfx("crash");try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}
 const q=pj(px,py+.7,ZP);spark(q[0],q[1],30,"#FF6B6B");spark(q[0],q[1],14,"#FFD54A")}
function collide(dt){
 const ph=rollT>0?.6:1.45,y0=py,y1=py+ph;
 for(const o of objs){
  const rz=o.p-dist;
  if(o.k==="coin"||o.k==="pu"){
   if(o.k==="coin"&&puMag>0&&rz>-1&&rz<14&&Math.abs(o.x-px)<3)o.mg=1;
   if(o.mg){const a=Math.min(1,dt*9);o.p+=(dist-o.p)*a;o.x+=(px-o.x)*a;o.y+=(py+.7-o.y)*a}
   if(Math.abs(o.x-px)<.6&&rz>-.5&&rz<.6&&o.y>y0-.35&&o.y<y1+.25){o.gone=1;pickup(o)}
   continue}
  if(inv>0||o.gone)continue;
  const len=o.len||.5;
  if(Math.abs(o.x-px)>.7||rz>.25||rz+len<-.25)continue;
  const top=o.k==="train"?2.4:o.k==="bar"?.7:o.k==="cone"?.5:1.9,bot=o.k==="gate"?.8:0;
  if(y1<=bot+.02||y0>=top-.02)continue;
  if(o.k==="train"&&-rz>.7&&prevLane!==lane&&stumble<=0){stumble=1.2;lane=prevLane;inv=.3;sfx("bump");shake=.25;continue}
  hit();if(dead)break}
 objs=objs.filter(o=>!o.gone)}
function step(dt){
 t+=dt;blend(dt);
 for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=520*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);
 if(shake>0)shake-=dt;
 if(st==="menu"){dist+=5*dt;camX+=(0-camX)*Math.min(1,dt*3);return}
 if(st!=="play")return;
 const pk=PK();
 if(dead){speed*=Math.max(0,1-dt*5);dist+=speed*dt;deadT+=dt;if(deadT>.9)finishRun();return}
 speed=Math.min(24,9+dist*.0045*(pk.ramp||1));dist+=speed*dt;thIdx=Math.floor(dist/900)%4;
 px+=(lane-px)*Math.min(1,dt*14);
 if(py>0||vy>0){py+=vy*dt;vy-=26*dt;if(py<=0){py=0;vy=0;if(pendRoll){rollT=.65;pendRoll=false}}}
 rollT-=dt;inv-=dt;stumble-=dt;puMag-=dt;puX2-=dt;
 score+=speed*dt*(puX2>0?2:1)*(pk.score||1);
 spawn();collide(dt);objs=objs.filter(o=>o.p>dist-8);
 camX+=(px*.55-camX)*Math.min(1,dt*6);mis("dist",dist)}
// ---------- dessin ----------
function drawSky(){
 const g=ctx.createLinearGradient(0,0,0,HOR+8);g.addColorStop(0,rgb(cur.sk));g.addColorStop(1,rgb(cur.sb));ctx.fillStyle=g;ctx.fillRect(0,0,W,HOR+8);
 if(cur.wl>.6){ctx.fillStyle="rgba(255,255,255,"+(cur.wl-.5)+")";for(let i=0;i<46;i++)ctx.fillRect(hash(i*3)*W,hash(i*7)*HOR*.8,1.6,1.6)}
 ctx.fillStyle=rgb(cur.sun,1,.9);ctx.beginPath();ctx.arc(W*.74,HOR*.55,H*.05,0,7);ctx.fill();
 for(let i=0;i<14;i++){const h=H*(.02+hash(i+5)*.07),x=i*W/13-10;ctx.fillStyle=rgb(cur.b2,.7);ctx.fillRect(x,HOR-h+3,W/13+2,h)}
 ctx.fillStyle=rgb(cur.rd,.8);ctx.fillRect(0,HOR+3,W,H)}
function drawBuildings(){
 const seg=7,base=Math.floor(dist/seg),off=dist-base*seg;
 for(let n=11;n>=0;n--){const idx=base+n,z0=n*seg-off+ZP,z1=z0+seg-1.2;if(z1<-.8)continue;
  ctx.globalAlpha=clamp((66-z0)/18,0,1);
  for(const sd of[-1,1]){
   const k=idx*2+(sd>0?1:0),h=3+hash(k)*7,w=2.6+hash(k+99)*1.6,col=cur["b"+Math.floor(hash(k+7)*3)],xin=sd*2.1;
   const x0=sd<0?xin-w:xin,x1=sd<0?xin:xin+w;
   box(x0,x1,0,h,z0,z1,rgb(col,1),rgb(col,1.25),rgb(col,.78));
   for(let y=.8,r=0;y+.6<h;y+=1.3,r++)for(let za=z0+.5,c=0;za+.8<z1;za+=1.6,c++){
    if(za<-.8)continue;const lit=hash(k*131+r*17+c)<cur.wl;
    quad(pj(xin,y,za),pj(xin,y,za+.8),pj(xin,y+.6,za+.8),pj(xin,y+.6,za),lit?"rgba(255,226,140,.95)":"rgba(0,0,0,.28)")}}}
 ctx.globalAlpha=1}
function drawRoad(){
 const zn=-.8,zf=72,sw=rgb(cur.rd,1.35);
 quad(pj(-2.1,0,zn),pj(-1.5,0,zn),pj(-1.5,0,zf),pj(-2.1,0,zf),sw);quad(pj(1.5,0,zn),pj(2.1,0,zn),pj(2.1,0,zf),pj(1.5,0,zf),sw);
 quad(pj(-1.5,0,zn),pj(1.5,0,zn),pj(1.5,0,zf),pj(-1.5,0,zf),rgb(cur.rd));
 ctx.fillStyle=rgb(cur.ln);
 for(const x of[-1.5,1.5])quad(pj(x-.05,0,zn),pj(x+.05,0,zn),pj(x+.05,0,zf),pj(x-.05,0,zf),rgb(cur.ln,.9));
 for(let k=Math.floor((dist-4)/3);k<=Math.floor((dist+68)/3);k++){const a=k*3-dist+ZP,b=a+1.5;if(b<zn)continue;const a2=Math.max(a,zn);
  for(const x of[-.5,.5])quad(pj(x-.035,0,a2),pj(x+.035,0,a2),pj(x+.035,0,b),pj(x-.035,0,b),rgb(cur.ln,1,.85))}
 const g=ctx.createLinearGradient(0,HOR,0,HOR+H*.16);g.addColorStop(0,rgb(cur.sb));g.addColorStop(1,rgb(cur.sb,1,0));ctx.fillStyle=g;ctx.fillRect(0,HOR,W,H*.16)}
function drawObj(o){
 const z=o.p-dist+ZP,len=o.len||0,a=clamp((64-z)/18,0,1);if(a<=0||z+len<-.8)return;ctx.globalAlpha=a;const x=o.x;
 if(o.k==="train"){const c=TRC[o.c%5];box(x-.45,x+.45,0,2.4,z,z+len,shade(c,1),shade(c,1.3),shade(c,.7));
  if(z>=-.8){let p=pj(x-.32,1.4,z),q=pj(x+.32,2.1,z);ctx.fillStyle="#BFE9FF";ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);
   p=pj(x-.32,.3,z);q=pj(x+.32,.55,z);ctx.fillStyle="#FFE98A";ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);
   p=pj(x-.45,1.1,z);q=pj(x+.45,1.2,z);ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1])}}
 else if(o.k==="bar"){box(x-.42,x+.42,0,.7,z,z+.5,"#F4C430","#FFE27A","#B58A00");
  if(z>=-.8)for(let i=0;i<5;i+=2){const p=pj(x-.42+i*.168,0,z),q=pj(x-.42+(i+1)*.168,.7,z);ctx.fillStyle="#2B2B2B";ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1])}}
 else if(o.k==="gate"){box(x-.5,x-.4,0,1.9,z,z+.5,"#7F8C8D","#BDC3C7","#5D6D7E");box(x+.4,x+.5,0,1.9,z,z+.5,"#7F8C8D","#BDC3C7","#5D6D7E");
  box(x-.5,x+.5,.8,1.9,z,z+.5,"#34495E","#5D7388","#22313F");
  if(z>=-.8){const p=pj(x-.5,1.2,z),q=pj(x+.5,1.4,z);ctx.fillStyle="#F4C430";ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1])}}
 else if(o.k==="cone"){const p=pj(x-.22,0,Math.max(z,-.8)),q=pj(x+.22,0,Math.max(z,-.8)),r=pj(x,.5,Math.max(z,-.8));ctx.fillStyle="#FF7A1A";ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.lineTo(r[0],r[1]);ctx.fill();
  const m=pj(x,.25,Math.max(z,-.8));ctx.fillStyle="#fff";ctx.fillRect(m[0]-.1*m[2],m[1]-.04*m[2],.2*m[2],.08*m[2])}
 else if(o.k==="coin"){const q=pj(x,o.y,z),r=.22*q[2],w=Math.abs(Math.cos(t*5+o.p))*r+1;ctx.fillStyle="#FFC107";ctx.beginPath();ctx.ellipse(q[0],q[1],w,r,0,0,7);ctx.fill();ctx.strokeStyle="#B8860B";ctx.lineWidth=Math.max(1,r*.15);ctx.stroke();ctx.fillStyle="#FFE57A";ctx.beginPath();ctx.ellipse(q[0],q[1],w*.5,r*.5,0,0,7);ctx.fill()}
 else if(o.k==="pu"){const q=pj(x,o.y+Math.sin(t*4)*.08,z),r=.34*q[2];const c=o.t==="mag"?"#E74C3C":o.t==="x2"?"#9B59B6":"#3498DB";ctx.fillStyle=c;ctx.beginPath();ctx.arc(q[0],q[1],r,0,7);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=Math.max(1.5,r*.12);ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold "+(r*1.1)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(o.t==="mag"?"🧲":o.t==="x2"?"×2":"🛡️",q[0],q[1]+r*.05)}
 ctx.globalAlpha=1}
function drawPlayer(){
 const q=pj(px,py,ZP),g=pj(px,0,ZP),s=q[2];
 ctx.globalAlpha=.3*(1-Math.min(1,py/2));ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(g[0],g[1],.38*s,.1*s,0,0,7);ctx.fill();ctx.globalAlpha=1;
 if(inv>0&&!dead&&Math.floor(t*14)%2)ctx.globalAlpha=.45;
 const ch=CHARS[S.sel];
 if(dead){ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(Math.min(1,deadT*3)*1.45);drawChar(ctx,ch,0,0,s,"jump",t,false);ctx.restore()}
 else drawChar(ctx,ch,q[0],q[1],s,rollT>0?"roll":py>.05?"jump":"run",dist*.12,false);
 ctx.globalAlpha=1;
 if(shield>0&&!dead){ctx.strokeStyle="rgba(120,220,255,.9)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(q[0],q[1]-.75*s,.95*s,0,7);ctx.stroke();ctx.fillStyle="rgba(120,220,255,.14)";ctx.fill()}}
function render(){
 ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*9*shake,(Math.random()-.5)*9*shake);
 drawSky();drawBuildings();drawRoad();
 const vis=objs.filter(o=>!o.gone).sort((a,b)=>b.p-a.p);
 for(const o of vis)if(o.p-dist>0)drawObj(o);
 drawPlayer();
 for(const o of vis)if(o.p-dist<=0)drawObj(o);
 for(const p of parts){ctx.globalAlpha=clamp(p.l*2,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.s,p.s)}ctx.globalAlpha=1;
 ctx.restore()}
// ---------- affichage du score ----------
const cache={};
function setT(id,v){if(cache[id]!==v){cache[id]=v;$(id).textContent=v}}
function setBar(id,v,max){const e=$(id),on=v>0;if(cache[id]!==on){cache[id]=on;e.hidden=!on}if(on)e.lastChild.style.width=Math.min(100,v/max*100)+"%"}
function hud(){setT("hs",Math.floor(score));setT("hcn",Math.floor(runCoins));const pk=PK();setBar("pmag",puMag,9*(pk.mag||1));setBar("pdbl",puX2,9*(pk.x2||1));setBar("pshd",shield,1);$("pshd").firstChild.textContent="🛡️"+(shield>1?"×"+shield:"")}
// ---------- menus ----------
const thumbs=CHARS.map(c=>thumb(c,64,84));let menuSel=S.sel;
function show(id){for(const n of["menu","pause","over"])$(n).hidden=n!==id;$("hud").hidden=!(st==="play"||st==="pause")}
function renderMenu(){
 $("mc").textContent=S.coins;const box=$("chars");box.innerHTML="";
 CHARS.forEach((c,i)=>{const b=document.createElement("button"),own=S.owned.includes(i);b.className="cc"+(i===menuSel?" on":"")+(own?"":" lk");b.appendChild(thumbs[i]);const n=document.createElement("span");n.textContent=c.n;b.appendChild(n);
  if(!own){const p=document.createElement("small");p.textContent="🔒 "+c.pr;b.appendChild(p)}b.onclick=()=>{menuSel=i;sfx("ui");renderMenu()};box.appendChild(b)});
 const c=CHARS[menuSel],own=S.owned.includes(menuSel);
 $("cn").textContent=c.n;$("cp").textContent=c.pe;const cb=$("cb");
 if(own){cb.textContent=S.sel===menuSel?"Choisi ✓":"Choisir";cb.disabled=S.sel===menuSel}else{cb.textContent="Acheter · "+c.pr+" 🪙";cb.disabled=S.coins<c.pr}
 const ml=$("miss");ml.innerHTML="";
 S.miss.forEach(m=>{const d=document.createElement("div");d.className="ms";d.innerHTML="<span>"+MT[m.t][0].replace("{n}",m.n)+"</span><b>+"+m.r+" 🪙</b><i><u style='width:"+Math.min(100,m.p/m.n*100)+"%'></u></i>";ml.appendChild(d)});
 $("snd").textContent=S.snd?"🔊 Son":"🔇 Son"}
$("cb").onclick=()=>{const c=CHARS[menuSel];if(!S.owned.includes(menuSel)){if(S.coins<c.pr)return;S.coins-=c.pr;S.owned.push(menuSel);sfx("pu")}S.sel=menuSel;save();renderMenu()};
$("snd").onclick=()=>{S.snd=!S.snd;save();renderMenu();sfx("ui")};
function toMenu(){st="menu";menuSel=S.sel;objs=[];dist=0;show("menu");renderMenu()}
function startRun(){
 const pk=PK();S.runs++;dist=0;speed=9;lane=prevLane=0;px=0;py=0;vy=0;rollT=0;pendRoll=false;inv=0;stumble=0;score=0;runCoins=0;committed=0;dead=false;deadT=0;revives=0;shake=0;
 shield=pk.shield||0;puMag=puX2=0;objs=[];parts=[];nextP=22;nextPU=250+ri(200);thIdx=0;st="play";show("");sfx("go");cache.pshd=null}
function commit(){const c=Math.floor(runCoins)-committed;if(c>0){S.coins+=c;committed+=c}}
function finishRun(){
 st="over";commit();S.best=Math.max(S.best,Math.floor(score));mis("dist",dist);save();show("over");
 $("os").textContent=Math.floor(score);$("ob2").textContent="Meilleur : "+S.best;$("oc").textContent="🪙 +"+Math.floor(runCoins)+" · "+Math.floor(dist)+" m";
 const cost=100*(revives+1),rv=$("rv");rv.hidden=revives>=2;rv.textContent="Revivre · "+cost+" 🪙";rv.disabled=S.coins<cost}
function revive(){const cost=100*(revives+1);if(S.coins<cost||revives>=2)return;S.coins-=cost;revives++;save();dead=false;deadT=0;st="play";for(const o of objs)if(o.k!=="coin"&&o.p>dist-1&&o.p<dist+16)o.gone=1;objs=objs.filter(o=>!o.gone);inv=2.5;speed=9;show("");sfx("pu")}
function pauseGame(){if(st!=="play"||dead)return;st="pause";show("pause")}
$("play").onclick=startRun;$("pb").onclick=pauseGame;$("rs").onclick=()=>{st="play";show("")};$("pm2").onclick=()=>{commit();save();toMenu()};
$("rv").onclick=revive;$("again").onclick=startRun;$("om").onclick=toMenu;
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseGame()});
// ---------- commandes ----------
let sx=0,sy=0,sw=false;
cv.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;sw=true});
cv.addEventListener("pointermove",e=>{if(!sw)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>26){swipe(Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u"));sw=false}});
addEventListener("pointerup",()=>sw=false);addEventListener("pointercancel",()=>sw=false);
addEventListener("keydown",e=>{const k=e.key;if(k==="ArrowLeft"||k===
