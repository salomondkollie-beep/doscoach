// Les personnages du jeu : apparence, prix et petit pouvoir de chacun.
const CHARS=[
{n:"Kofi",pr:0,sk:"#8D5524",hr:"#1C1C1C",hs:"cap",hc:"#E3A72F",sh:"#2E86C1",pa:"#34495E",so:"#ECF0F1",ac:"",pe:"Le héros de départ",pk:{}},
{n:"Awa",pr:250,sk:"#6B3E1E",hr:"#141414",hs:"braids",hc:"#E74C3C",sh:"#E74C3C",pa:"#2C3E50",so:"#F1C40F",ac:"scarf",pe:"Pièces +10 %",pk:{coin:1.1}},
{n:"Yao",pr:500,sk:"#A0643A",hr:"#101010",hs:"afro",hc:"#101010",sh:"#27AE60",pa:"#7F8C8D",so:"#E74C3C",ac:"shades",pe:"Aimant 40 % plus long",pk:{mag:1.4}},
{n:"Mariam",pr:800,sk:"#7B4A2B",hr:"#2C1810",hs:"bun",hc:"#F39C12",sh:"#8E44AD",pa:"#F39C12",so:"#ECF0F1",ac:"",pe:"Démarre avec un bouclier",pk:{shield:1}},
{n:"Seydou",pr:1200,sk:"#5C3317",hr:"#000000",hs:"bald",hc:"#000000",sh:"#F39C12",pa:"#1ABC9C",so:"#2C3E50",ac:"pack",pe:"Score +15 %",pk:{score:1.15}},
{n:"Fatou",pr:1700,sk:"#8D5524",hr:"#1C1C1C",hs:"band",hc:"#E91E63",sh:"#16A085",pa:"#E91E63",so:"#FFFFFF",ac:"",pe:"La vitesse monte plus doucement",pk:{ramp:.8}},
{n:"Brice",pr:2300,sk:"#6B3E1E",hr:"#101010",hs:"beanie",hc:"#C0392B",sh:"#34495E",pa:"#2980B9",so:"#F1C40F",ac:"shades",pe:"Saute 15 % plus haut",pk:{jump:1.15}},
{n:"Adjoua",pr:3000,sk:"#9A6236",hr:"#1A0F0A",hs:"pony",hc:"#1ABC9C",sh:"#F1C40F",pa:"#8E44AD",so:"#1ABC9C",ac:"scarf",pe:"Bonus ×2 plus long",pk:{x2:1.5}},
{n:"Cheick",pr:3800,sk:"#4E2A12",hr:"#050505",hs:"mohawk",hc:"#E67E22",sh:"#1C1C1C",pa:"#C0392B",so:"#E67E22",ac:"pack",pe:"Pièces +25 %",pk:{coin:1.25}},
{n:"Nadia",pr:4800,sk:"#B07A4F",hr:"#2B1B12",hs:"hat",hc:"#2ECC71",sh:"#ECF0F1",pa:"#2ECC71",so:"#2C3E50",ac:"medal",pe:"Protégée plus longtemps après un choc",pk:{inv:1.8}},
{n:"Moussa",pr:6000,sk:"#5A3519",hr:"#0B0B0B",hs:"afro",hc:"#0B0B0B",sh:"#E74C3C",pa:"#F1C40F",so:"#FFFFFF",ac:"medal",pe:"Aimant et bonus ×2 plus longs",pk:{mag:1.4,x2:1.4}},
{n:"Zara",pr:8000,sk:"#83502B",hr:"#1B1B1B",hs:"braids",hc:"#F1C40F",sh:"#9B59B6",pa:"#1C1C1C",so:"#F1C40F",ac:"scarf",pe:"Bouclier au départ et score +20 %",pk:{shield:1,score:1.2}}
];
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function dk(h,f){const v=[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(h.slice(i,i+2),16)*f))));return"rgb("+v.join(",")+")"}
// Dessine un personnage. x,y = pieds ; k = pixels par unité ; pose = run | jump | roll | idle ; front = vu de face
function drawChar(c,ch,x,y,k,pose,t,front){
 c.save();c.lineCap="round";c.lineJoin="round";
 const ph=t*11,sw=pose==="run"?Math.sin(ph):0,bob=pose==="run"?Math.abs(Math.sin(ph))*.07*k:(pose==="idle"?Math.sin(t*3)*.015*k:0);
 if(pose==="roll"){
  c.translate(x,y-.38*k);c.rotate(t*16);
  c.fillStyle=ch.pa;c.beginPath();c.arc(0,.12*k,.26*k,0,7);c.fill();
  c.fillStyle=ch.sh;c.beginPath();c.arc(0,-.02*k,.3*k,0,7);c.fill();
  c.fillStyle=ch.hs==="afro"?ch.hr:ch.sk;c.beginPath();c.arc(0,-.24*k,.17*k,0,7);c.fill();
  c.restore();return}
 const hipY=y-.62*k-bob,shY=y-1.12*k-bob,hy=y-1.34*k-bob,r=.17*k;
 const air=pose==="jump";
 if(ch.ac==="pack"&&!front){c.fillStyle=dk(ch.sh,.6);rr(c,x-.19*k,shY+.02*k,.38*k,.48*k,.08*k);c.fill()}
 // jambes
 for(const s of[-1,1]){
  const a=air?(s<0?-.6:.7):s*sw*.8,ox=s*.1*k,fx=x+ox+Math.sin(a)*.5*k,fy=hipY+Math.cos(a)*.5*k-(air?.12*k:0)-Math.max(0,-Math.cos(a+s*1.2))*0*k;
  c.strokeStyle=ch.pa;c.lineWidth=.17*k;c.beginPath();c.moveTo(x+ox,hipY);c.lineTo(fx,fy);c.stroke();
  c.fillStyle=ch.so;c.beginPath();c.ellipse(fx,fy+.02*k,.11*k,.07*k,0,0,7);c.fill()}
 // torse
 c.fillStyle=ch.sh;rr(c,x-.21*k,shY,.42*k,.58*k,.1*k);c.fill();
 c.fillStyle=dk(ch.sh,1.3);c.fillRect(x-.21*k,shY+.2*k,.42*k,.07*k);
 if(ch.ac==="medal"){c.fillStyle="#FFD54A";c.beginPath();c.arc(x,shY+.4*k,.05*k,0,7);c.fill()}
 // bras
 for(const s of[-1,1]){
  const a=air?(s<0?-2.5:2.5):-s*sw*.9,sxp=x+s*.23*k,syp=shY+.07*k,ex=sxp+Math.sin(a)*.5*k*(air?.9:.8),ey=syp+Math.cos(a)*.5*k*(air?-.6:1)*(air?1:1);
  c.strokeStyle=ch.sk;c.lineWidth=.1*k;c.beginPath();c.moveTo(sxp,syp);c.lineTo(ex,ey);c.stroke();
  c.strokeStyle=ch.sh;c.lineWidth=.13*k;c.beginPath();c.moveTo(sxp,syp);c.lineTo(sxp+(ex-sxp)*.35,syp+(ey-syp)*.35);c.stroke()}
 if(ch.ac==="scarf"){c.fillStyle=ch.hc;rr(c,x-.17*k,shY-.07*k,.34*k,.12*k,.05*k);c.fill();if(!front){c.fillRect(x+.05*k,shY,.08*k,.28*k+Math.sin(ph)*.04*k)}}
 // cou et tête
 c.fillStyle=ch.sk;c.fillRect(x-.06*k,hy+r*.7,.12*k,.12*k);
 const hr=ch.hs;
 if(hr==="afro"){c.fillStyle=ch.hr;c.beginPath();c.arc(x,hy-.04*k,r*1.6,0,7);c.fill()}
 if(hr==="pony"&&!front){c.strokeStyle=ch.hr;c.lineWidth=.07*k;c.beginPath();c.moveTo(x,hy-r*.6);c.quadraticCurveTo(x+.2*k+Math.sin(ph)*.05*k,hy-r*1.1,x+.12*k+Math.sin(ph+1)*.08*k,hy+.28*k);c.stroke();c.fillStyle=ch.hc;c.beginPath();c.arc(x,hy-r*.6,.04*k,0,7);c.fill()}
 c.fillStyle=ch.sk;c.beginPath();c.arc(x,hy,r,0,7);c.fill();
 // cheveux et chapeaux (de dos : couvrent toute la tête)
 const hair=(col,full)=>{c.fillStyle=col;c.beginPath();c.arc(x,hy,r*1.04,Math.PI*(full?0:1),Math.PI*(full?2:2));if(!full){c.closePath()}c.fill()};
 const cover=!front;
 if(hr==="braids"){hair(ch.hr,cover);for(let i=-2;i<=2;i++){c.strokeStyle=ch.hr;c.lineWidth=.045*k;c.beginPath();c.moveTo(x+i*.06*k,hy-r*.7);c.lineTo(x+i*.075*k,hy+.22*k+Math.sin(ph+i)*.02*k);c.stroke();c.fillStyle=ch.hc;c.beginPath();c.arc(x+i*.075*k,hy+.23*k,.03*k,0,7);c.fill()}}
 else if(hr==="bun"){hair(ch.hr,cover);c.fillStyle=ch.hr;c.beginPath();c.arc(x,hy-r*1.15,.09*k,0,7);c.fill();c.fillStyle=ch.hc;c.fillRect(x-.08*k,hy-r*.95,.16*k,.04*k)}
 else if(hr==="pony"||hr==="mohawk"){hair(ch.hr,cover);if(hr==="mohawk"){c.fillStyle=ch.hc;c.beginPath();c.moveTo(x-.06*k,hy-r*.8);c.lineTo(x,hy-r*1.7);c.lineTo(x+.06*k,hy-r*.8);c.fill()}}
 else if(hr==="band"){hair(ch.hr,cover);c.fillStyle=ch.hc;c.fillRect(x-r,hy-r*.45,r*2,.07*k)}
 else if(hr==="beanie"){c.fillStyle=ch.hc;c.beginPath();c.arc(x,hy-.02*k,r*1.1,Math.PI,Math.PI*2);c.fill();c.fillRect(x-r*1.1,hy-.05*k,r*2.2,.07*k);c.fillStyle="#fff";c.beginPath();c.arc(x,hy-r*1.15,.05*k,0,7);c.fill();if(cover){c.fillStyle=ch.hc;c.beginPath();c.arc(x,hy,r*1.04,0,7);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(x,hy-r*1.1,.05*k,0,7);c.fill()}}
 else if(hr==="cap"){hair(ch.hr,cover);c.fillStyle=ch.hc;c.beginPath();c.arc(x,hy-.02*k,r*1.08,Math.PI,Math.PI*2);c.fill();if(front){c.fillRect(x-r*1.2,hy-.03*k,r*2.4,.06*k)}else{c.fillRect(x-.05*k,hy-.01*k,.1*k,.05*k)}}
 else if(hr==="hat"){hair(ch.hr,cover);c.fillStyle=ch.hc;c.beginPath();c.ellipse(x,hy-r*.55,r*1.9,.07*k,0,0,7);c.fill();c.beginPath();c.arc(x,hy-r*.6,r*.95,Math.PI,Math.PI*2);c.fill();c.fillStyle=dk(ch.hc,.6);c.fillRect(x-r*.95,hy-r*.75,r*1.9,.05*k)}
 else if(hr==="bald"){c.fillStyle="rgba(255,255,255,.25)";c.beginPath();c.ellipse(x-.05*k,hy-.08*k,.05*k,.03*k,-.5,0,7);c.fill()}
 else if(hr==="afro"){}
 // visage de face
 if(front){
  c.fillStyle="#1b1b1b";
  if(ch.ac==="shades"){c.fillRect(x-r*.85,hy-.02*k,r*1.7,.07*k)}else{c.beginPath();c.arc(x-.065*k,hy,.022*k,0,7);c.arc(x+.065*k,hy,.022*k,0,7);c.fill()}
  c.strokeStyle="#3a1a10";c.lineWidth=.025*k;c.beginPath();c.arc(x,hy+.05*k,.06*k,.2,Math.PI-.2);c.stroke()}
 c.restore()}
function thumb(ch,w,h){const cv=document.createElement("canvas");cv.width=w;cv.height=h;const c=cv.getContext("2d");drawChar(c,ch,w/2,h-8,h*.52,"idle",0,true);return cv}
