/* Tee Time Finder app logic. Depends on globals from data.js (PLACES, COURSES, SEARCH). */
/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function miles(a,b,c,d){const R=3958.8,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const fmt=m=>{let h=Math.floor(m/60),mm=m%60,ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(mm).padStart(2,"0")} ${ap}`;};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const money=n=>"$"+n.toFixed(0);

/* Sample tee sheet: deterministic per course and day, so the same search always shows the same times. */
function teeSheet(c,date){
  const r=rng(hash(c.id+iso(date)));
  const weekend=[0,6].includes(date.getDay());
  const step=[8,9,10][Math.floor(r()*3)];
  const out=[];
  for(let m=7*60+Math.floor(r()*4)*5;m<=15*60+30;m+=step){
    const hr=m/60, peak=hr>=8&&hr<11.5;
    const busy=(weekend?0.55:0.3)+(peak?0.3:0)-(hr>=13.5?0.15:0);
    const taken=Math.min(4,Math.floor(r()*5*busy));
    const open=4-taken; if(open<=0)continue;
    const holes=c.nineOnly?9:(r()<0.22?9:18);
    let price=c.base*(weekend?1.12:1)*(holes===9?0.55:1);
    if(hr>=14)price*=0.7;
    out.push({min:m,open,holes,price:Math.round(price),twilight:hr>=14});
  }
  return out;
}

/* ---------- state ---------- */
const today=new Date(); today.setHours(0,0,0,0);
const DAYS=[...Array(7)].map((_,i)=>{const d=new Date(today);d.setDate(d.getDate()+i);return d;});
let S={loc:6,radius:15,day:0,from:8*60,to:11*60,players:2,holes:"any",sort:"fit",courses:[]};
try{const saved=JSON.parse(localStorage.getItem("ttf-search")||"null");if(saved)S={...S,...saved,day:0};if(!Array.isArray(S.courses))S.courses=[];S.courses=S.courses.filter(id=>COURSES.some(c=>c.id===id));}catch(e){}
{const n=new Date();if(n.getHours()*60+n.getMinutes()>S.to-60)S.day=1;}
const save=()=>{try{localStorage.setItem("ttf-search",JSON.stringify(S));}catch(e){}};

/* ---------- controls ---------- */
$("loc").innerHTML=PLACES.map((p,i)=>`<option value="${i}">${esc(p[0])}</option>`).join("");
const times=[];for(let m=6*60;m<=18*60;m+=30)times.push(m);
$("from").innerHTML=times.map(m=>`<option value="${m}">${fmt(m)}</option>`).join("");
$("to").innerHTML=times.map(m=>`<option value="${m}">${fmt(m)}</option>`).join("");
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
$("days").innerHTML=DAYS.map((d,i)=>`<button type="button" class="chip" data-day="${i}">${i===0?"Today":i===1?"Tomorrow":DOW[d.getDay()]}<small>${MON[d.getMonth()]} ${d.getDate()}</small></button>`).join("");
$("players").innerHTML=[1,2,3,4].map(n=>`<button type="button" data-p="${n}">${n}</button>`).join("");
$("holes").innerHTML=[["any","Either"],["18","18 holes"],["9","9 holes"]].map(([v,t])=>`<button type="button" data-h="${v}">${t}</button>`).join("");

function syncControls(){
  $("loc").value=S.loc;$("radius").value=S.radius;$("radiusOut").textContent=`${S.radius} miles`;
  $("from").value=S.from;$("to").value=S.to;
  document.querySelectorAll("#days .chip").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.day===S.day)));
  document.querySelectorAll("#players button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.p===S.players)));
  document.querySelectorAll("#holes button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.h===S.holes)));
}
$("loc").addEventListener("change",e=>{S.loc=+e.target.value;update();});
$("radius").addEventListener("input",e=>{S.radius=+e.target.value;update();});
$("from").addEventListener("change",e=>{S.from=+e.target.value;update();});
$("to").addEventListener("change",e=>{S.to=+e.target.value;update();});
$("days").addEventListener("click",e=>{const b=e.target.closest("[data-day]");if(b){S.day=+b.dataset.day;update();}});
$("players").addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b){S.players=+b.dataset.p;update();}});
$("holes").addEventListener("click",e=>{const b=e.target.closest("[data-h]");if(b){S.holes=b.dataset.h;update();}});
$("search").addEventListener("submit",e=>e.preventDefault());
function renderCourses(){
  const [,plat,plng]=PLACES[S.loc], q=$("courseQ").value.trim().toLowerCase();
  const list=COURSES.map(c=>({c,d:miles(plat,plng,c.lat,c.lng)})).sort((a,b)=>a.d-b.d)
    .filter(({c})=>!q||c.name.toLowerCase().includes(q)||c.city.toLowerCase().includes(q));
  $("clist").innerHTML=list.length?list.map(({c,d})=>`<label class="copt"><input type="checkbox" data-cid="${c.id}"${S.courses.includes(c.id)?" checked":""}><span class="cn">${esc(c.name.replace(/ Golf (Course|Club)$/,""))}<small>${esc(c.city)}${c.nineOnly?" · 9 holes":""}</small></span><span class="cd">${d.toFixed(1)} mi</span></label>`).join(""):`<p class="cnone">No courses match "${esc(q)}".</p>`;
  $("picked").innerHTML=S.courses.map(id=>{const c=COURSES.find(x=>x.id===id);return `<button type="button" class="pill" data-unpick="${id}" aria-label="Remove ${esc(c.name)}">${esc(c.name.replace(/ Golf (Course|Club)$/,""))}<span aria-hidden="true">×</span></button>`;}).join("");
  const on=S.courses.length>0;
  $("clearCourses").hidden=!on; $("radiusHint").hidden=!on;
  $("radius").classList.toggle("dim",on); document.querySelector(".ticks").classList.toggle("dim",on);
}
$("courseQ").addEventListener("input",renderCourses);
$("clist").addEventListener("change",e=>{const id=e.target.dataset.cid;if(!id)return;S.courses=e.target.checked?[...S.courses,id]:S.courses.filter(x=>x!==id);update();});
$("picked").addEventListener("click",e=>{const b=e.target.closest("[data-unpick]");if(b){S.courses=S.courses.filter(x=>x!==b.dataset.unpick);update();}});
$("clearCourses").addEventListener("click",()=>{S.courses=[];$("courseQ").value="";update();});

/* ---------- search ---------- */
let expanded=new Set(), current=[];
function search(){
  const [pname,plat,plng]=PLACES[S.loc], date=DAYS[S.day];
  const now=new Date(), nowMin=S.day===0?now.getHours()*60+now.getMinutes()+10:-1;
  const found=[];
  for(const c of COURSES){
    const dist=miles(plat,plng,c.lat,c.lng);
    if(S.courses.length){if(!S.courses.includes(c.id))continue;}else if(dist>S.radius)continue;
    const slots=teeSheet(c,date).filter(t=>t.min>=S.from&&t.min<=S.to&&t.min>nowMin&&t.open>=S.players&&(S.holes==="any"||String(t.holes)===S.holes));
    if(slots.length)found.push({c,dist,drive:Math.round(dist*1.9+5),slots,min:Math.min(...slots.map(t=>t.price)),eq:Math.min(...slots.map(t=>t.price*18/t.holes)),first:slots[0].min});
  }
  if(found.length){
    const lo=Math.min(...found.map(f=>f.eq)),hi=Math.max(...found.map(f=>f.eq));
    const dmax=S.courses.length?Math.max(...found.map(f=>f.dist),1):S.radius;
    found.forEach(f=>f.fit=0.5*(f.dist/dmax)+0.5*(hi>lo?(f.eq-lo)/(hi-lo):0)-Math.min(f.slots.length,8)*0.01);
  }
  const key={fit:f=>f.fit,closest:f=>f.dist,cheapest:f=>f.min,earliest:f=>f.first}[S.sort];
  found.sort((a,b)=>key(a)-key(b));
  return found;
}
function reason(f,all){
  const closest=all.every(o=>o.dist>=f.dist), cheapest=all.every(o=>o.eq>=f.eq);
  if(closest&&cheapest)return "Closest course and best price per hole in your slot.";
  if(closest)return `Closest course with an opening, ${money(f.min)} and up.`;
  if(cheapest)return `Best price per hole in your slot, ${f.dist.toFixed(1)} miles away.`;
  return `Good balance: ${f.dist.toFixed(1)} miles and ${money(f.min)} per player.`;
}

function update(){
  syncControls(); renderCourses(); save();
  const bad=S.to<=S.from; $("timeErr").hidden=!bad;
  const R=$("results"), date=DAYS[S.day], dayTxt=`${DOW[date.getDay()]}, ${MON[date.getMonth()]} ${date.getDate()}`;
  if(bad){R.innerHTML=`<div class="empty"><h3>Your time slot ends before it starts</h3><p>Set the "To" time later than ${fmt(S.from)}.</p></div>`;return;}
  current=search();
  const n=current.reduce((a,f)=>a+f.slots.length,0);
  const sortSel=`<label class="sortbox" for="sort">Sort by <select id="sort">${[["fit","Best fit"],["earliest","Earliest time"],["closest","Closest"],["cheapest","Lowest price"]].map(([v,t])=>`<option value="${v}"${v===S.sort?" selected":""}>${t}</option>`).join("")}</select></label>`;
  let h=`<div class="summary"><div><h2>${n?`${n} open tee time${n>1?"s":""}`:"No open tee times"}</h2><p>${S.courses.length?`${current.length} of the ${S.courses.length} course${S.courses.length>1?"s":""} you picked`:`${current.length} course${current.length===1?"":"s"} within ${S.radius} mi of ${esc(PLACES[S.loc][0])}`} · ${dayTxt} · ${fmt(S.from)} to ${fmt(S.to)} · ${S.players} player${S.players>1?"s":""}</p></div>${n?sortSel:""}</div>`;
  if(!n){
    const wider=Math.min(50,S.radius+15);
    h+=`<div class="empty"><h3>Nothing open in that slot</h3><p>${S.courses.length?`The course${S.courses.length>1?"s you picked are":" you picked is"}`:`Every course within ${S.radius} miles is`} full or closed for ${S.players} player${S.players>1?"s":""} between ${fmt(S.from)} and ${fmt(S.to)}.</p><div style="display:flex;gap:8px;flex-wrap:wrap">${S.courses.length?`<button class="btn" type="button" data-fix="courses">Search all courses within ${S.radius} miles</button>`:S.radius<50?`<button class="btn" type="button" data-fix="radius">Search ${wider} miles</button>`:""}<button class="btn ghost" type="button" data-fix="time">Widen slot by an hour each side</button>${S.players>1?`<button class="btn ghost" type="button" data-fix="players">Try ${S.players-1} player${S.players>2?"s":""}</button>`:""}</div></div>`;
  }
  current.forEach((f,i)=>{
    const top=i===0&&S.sort==="fit"&&current.length>1, show=expanded.has(f.c.id)?f.slots:f.slots.slice(0,8);
    h+=`<article class="course${top?" top":""}"><div class="chead"><div><h3>${esc(f.c.name)}</h3><div class="cmeta"><span><b>${f.dist.toFixed(1)} mi</b> · about ${f.drive} min drive</span><span>${esc(f.c.city)}</span><span>from <b>${money(f.min)}</b>/player</span>${f.c.walk?"<span>Walking OK</span>":"<span>Cart required</span>"}</div></div>${top?`<span class="badge">Best fit</span>`:""}</div>${top?`<p class="why">${esc(reason(f,current))}</p>`:""}<div class="times">${show.map((t,j)=>`<button type="button" class="slot" data-c="${i}" data-t="${f.slots.indexOf(t)}"><span class="t">${fmt(t.min)}</span><span class="d">${money(t.price)} · ${t.holes} holes</span><span class="d">${t.open<=2?`<span class="few">${t.open} spot${t.open>1?"s":""} left</span>`:`${t.open} spots`}${t.twilight?" · twilight":""}</span></button>`).join("")}</div>${f.slots.length>8?`<button type="button" class="more" data-more="${f.c.id}">${expanded.has(f.c.id)?"Show fewer":`Show all ${f.slots.length} times`}</button>`:""}</article>`;
  });
  R.innerHTML=h;
}
$("results").addEventListener("change",e=>{if(e.target.id==="sort"){S.sort=e.target.value;update();}});
$("results").addEventListener("click",e=>{
  const fix=e.target.closest("[data-fix]");
  if(fix){const k=fix.dataset.fix;if(k==="radius")S.radius=Math.min(50,S.radius+15);if(k==="time"){S.from=Math.max(360,S.from-60);S.to=Math.min(1080,S.to+60);}if(k==="players")S.players--;if(k==="courses"){S.courses=[];$("courseQ").value="";}update();return;}
  const more=e.target.closest("[data-more]");
  if(more){const id=more.dataset.more;expanded.has(id)?expanded.delete(id):expanded.add(id);update();return;}
  const s=e.target.closest(".slot"); if(s)openSheet(current[+s.dataset.c],current[+s.dataset.c].slots[+s.dataset.t],s);
});

/* ---------- booking sheet ---------- */
let lastFocus=null;
function openSheet(f,t,from){
  lastFocus=from; const date=DAYS[S.day];
  const url=f.c.url||SEARCH(f.c.name+" "+f.c.city);
  $("sheet").innerHTML=`<div><h3 id="sheetTitle">${esc(f.c.name)}</h3><p class="note" style="margin-top:2px">${esc(f.c.city)} · ${f.dist.toFixed(1)} mi · about ${f.drive} min drive</p></div>
  <dl class="kv"><dt>Day</dt><dd>${DOW[date.getDay()]}, ${MON[date.getMonth()]} ${date.getDate()}</dd><dt>Tee time</dt><dd>${fmt(t.min)}</dd><dt>Holes</dt><dd>${t.holes}${t.twilight?" (twilight rate)":""}</dd><dt>Players</dt><dd>${S.players} of ${t.open} open spots</dd><dt>Price per player</dt><dd>${money(t.price)}</dd><dt>Walking</dt><dd>${f.c.walk?"Allowed":"Cart required"}</dd></dl>
  <div class="total"><span>Total for ${S.players}</span><b>${money(t.price*S.players)}</b></div>
  <p class="note">You book and pay on the course's own system, so there's no extra fee from us. In this prototype the time and price are sample data, so confirm them there.</p>
  <div class="actions"><a class="btn" href="${url}" target="_blank" rel="noopener">${f.c.url?"Book on the course's site":"Find the course's booking page"}</a><button class="btn ghost" type="button" id="closeSheet">Back to times</button></div>`;
  $("scrim").hidden=false; $("closeSheet").focus();
}
function closeSheet(){$("scrim").hidden=true; if(lastFocus)lastFocus.focus();}
$("scrim").addEventListener("click",e=>{if(e.target.id==="scrim"||e.target.id==="closeSheet")closeSheet();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("scrim").hidden)closeSheet();});

update();
