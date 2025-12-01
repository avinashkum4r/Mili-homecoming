// Simple starfield + countdown + interactions
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let w, h, stars = [];
function resize(){ w=canvas.width=innerWidth; h=canvas.height=innerHeight; initStars(); }
window.addEventListener('resize', resize, false);
function initStars(){
  stars = [];
  const count = Math.floor((w*h)/8000);
  for(let i=0;i<count;i++){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.5+0.2,
      a: Math.random()*0.8+0.2,
      vx: (Math.random()-0.5)*0.02
    });
  }
}
function draw(){
  ctx.clearRect(0,0,w,h);
  // subtle nebula
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,'rgba(11,18,45,0.2)');
  grad.addColorStop(1,'rgba(3,6,20,0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);
  // stars
  for(const s of stars){
    s.x += s.vx;
    if(s.x<0)s.x=w; if(s.x>w)s.x=0;
    ctx.beginPath();
    ctx.globalAlpha = s.a;
    ctx.fillStyle = '#ffffff';
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
resize(); draw();

// Countdown
const timerEl = document.getElementById('timer');
const targetInput = document.getElementById('targetInput');
const defaultDate = new Date(Date.now()+1000*60*60*24*3); // 3 days from now
targetInput.value = defaultDate.toISOString().slice(0,16);

function getTimeLeft(t){
  const then = new Date(t).getTime();
  const now = Date.now();
  let d = Math.max(0, then - now);
  const days = Math.floor(d / (1000*60*60*24)); d %= 1000*60*60*24;
  const hours = Math.floor(d / (1000*60*60)); d %= 1000*60*60;
  const minutes = Math.floor(d / (1000*60)); d %= 1000*60;
  const seconds = Math.floor(d / 1000);
  return {days,hours,minutes,seconds,total: then-now};
}
function pad(n){return String(n).padStart(2,'0');}
function updateTimer(){
  const t = targetInput.value;
  const left = getTimeLeft(t);
  if(left.total<=0) timerEl.textContent = "She's home! �わ�";
  else timerEl.textContent = `${left.days}d ${pad(left.hours)}h ${pad(left.minutes)}m ${pad(left.seconds)}s`;
}
setInterval(updateTimer,1000);
updateTimer();

// Interactions: file upload, apply names/message
const fileInput = document.getElementById('fileInput');
const herPhoto = document.getElementById('herPhoto');
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev)=> herPhoto.src = ev.target.result;
  reader.readAsDataURL(f);
});

// apply button
document.getElementById('applyBtn').addEventListener('click',()=>{
  const hn = document.getElementById('herNameInput').value.trim();
  const yn = document.getElementById('yourNameInput').value.trim();
  const msg = document.getElementById('msgInput').value.trim();
  if(hn) document.getElementById('herName').textContent = hn;
  if(yn) document.getElementById('yourName').textContent = yn;
  if(msg) document.getElementById('message').textContent = msg;
});

// copy URL
document.getElementById('copyBtn').addEventListener('click', ()=>{
  navigator.clipboard?.writeText(window.location.href);
  alert('Page link copied to clipboard (if supported).');
});

// download ZIP button - will prompt to download the zip we generated on the server if served
document.getElementById('downloadBtn').addEventListener('click', ()=>{
  // link to starry-homecoming-site.zip (same origin)
  window.location.href = 'starry-homecoming-site.zip';
});





// run once now
updateTimer();


// Hourglass visualization function (6-hour segment)
function updateHourglassVisual(targetIso){
  const topSand = document.getElementById('topSand');
  const bottomSand = document.getElementById('bottomSand');
  const hourglass = document.getElementById('hourglass');
  if(!topSand || !bottomSand || !hourglass) return;
  const now = Date.now();
  const target = new Date(targetIso).getTime();
  let remaining = Math.max(0, Math.floor((target - now) / 1000)); // seconds
  const sixHours = 6 * 60 * 60; // seconds
  const remInBlock = remaining % sixHours;
  const pct = remInBlock / sixHours; // 0..1
  const topPct = pct * 100;
  const bottomPct = (1 - pct) * 100;
  topSand.style.height = topPct + '%';
  bottomSand.style.height = bottomPct + '%';
  // falling grain
  let grain = hourglass.querySelector('.hg-grain');
  if(remInBlock > 1){
    if(!grain){
      grain = document.createElement('div');
      grain.className = 'hg-grain';
      hourglass.appendChild(grain);
    }
    grain.style.display = 'block';
  } else if(grain){
    grain.style.display = 'none';
  }
}


// Countdown - robust calculation using hidden targetIso (local)
const timerEl = document.getElementById('timer');
const targetInput = document.getElementById('targetInput');
// ensure targetIso is read from hidden input (format: YYYY-MM-DDTHH:MM)
const TARGET_ISO = targetInput ? targetInput.value : '2025-12-28T12:00';

function getTimeLeftToTarget(iso){
  // Create a Date object using local time by expanding to seconds
  const isoWithSeconds = iso.length===16 ? iso + ':00' : iso;
  const then = new Date(isoWithSeconds);
  const now = new Date();
  let diff = Math.max(0, then.getTime() - now.getTime()); // milliseconds
  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days * (1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours * (1000*60*60);
  const minutes = Math.floor(diff / (1000*60));
  diff -= minutes * (1000*60);
  const seconds = Math.floor(diff / 1000);
  return {days,hours,minutes,seconds,total: then.getTime() - now.getTime()};
}

function pad(n){return String(n).padStart(2,'0');}

function updateTimer(){
  const left = getTimeLeftToTarget(TARGET_ISO);
  if(left.total<=0){
    timerEl.textContent = "She's home! �わ�";
    updateHourglassVisual(TARGET_ISO); // final update
    return;
  }
  timerEl.textContent = `${left.days}d ${pad(left.hours)}h ${pad(left.minutes)}m ${pad(left.seconds)}s`;
  updateHourglassVisual(TARGET_ISO);
}

setInterval(updateTimer, 1000);
updateTimer();
