let player;
let currentVideoId = null;
const playlist = [];

function youtubeIdFromUrl(url){
  if(!url) return null;
  // common patterns
  const idMatch = url.match(/(?:v=|\/videos\/|embed\/|youtu\.be\/|v=)([A-Za-z0-9_-]{6,11})/);
  if(idMatch) return idMatch[1];
  // maybe raw id
  if(/^[-_A-Za-z0-9]{6,11}$/.test(url)) return url;
  return null;
}

// YT API ready callback
function onYouTubeIframeAPIReady(){
  // create a placeholder player — will load a video when user clicks load
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    playerVars: { 'playsinline': 1, rel:0 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(){
  // nothing for now
  updateTimeLabel();
}

function onPlayerStateChange(e){
  // update UI
}

// DOM helpers
const $ = id => document.getElementById(id);

function loadVideoById(id){
  if(!id) return alert('Tidak dapat menemukan ID video');
  currentVideoId = id;
  player.loadVideoById(id);
}

function updateTimeLabel(){
  if(!player || !player.getDuration) return;
  const dur = player.getDuration() || 0;
  const pos = player.getCurrentTime ? player.getCurrentTime() : 0;
  $('timeLabel').textContent = formatTime(pos) + ' / ' + formatTime(dur);
  const pct = dur ? Math.round((pos/dur)*100) : 0;
  $('seekRange').value = pct;
}

function formatTime(s){
  s = Math.floor(s||0);
  const m = Math.floor(s/60); const sec = s%60; return m + ':' + String(sec).padStart(2,'0');
}

// wire up controls
window.addEventListener('load', ()=>{
  $('loadBtn').addEventListener('click', ()=>{
    const val = $('videoInput').value.trim();
    const id = youtubeIdFromUrl(val);
    if(!id) return alert('Masukkan URL YouTube atau ID yang valid');
    loadVideoById(id);
  });

  $('playBtn').addEventListener('click', ()=>{ if(player && player.playVideo) player.playVideo(); });
  $('pauseBtn').addEventListener('click', ()=>{ if(player && player.pauseVideo) player.pauseVideo(); });
  $('muteBtn').addEventListener('click', ()=>{ if(player && player.mute) player.mute(); });
  $('unmuteBtn').addEventListener('click', ()=>{ if(player && player.unMute) player.unMute(); });
  $('fsBtn').addEventListener('click', ()=>{ toggleFullscreen(); });

  $('seekRange').addEventListener('input', (e)=>{
    const pct = Number(e.target.value)/100;
    const dur = player.getDuration ? player.getDuration() : 0;
    if(dur) player.seekTo(dur * pct, true);
  });

  // playlist add
  $('addBtn').addEventListener('click', ()=>{
    const val = $('addInput').value.trim();
    const id = youtubeIdFromUrl(val);
    if(!id) return alert('ID atau URL tidak valid');
    playlist.push(id);
    renderPlaylist();
    $('addInput').value = '';
  });

  // small updater
  setInterval(()=>{
    try{ updateTimeLabel(); }catch(e){}
  }, 800);

  // theme toggle
  $('themeToggle').addEventListener('click', ()=>{
    document.documentElement.classList.toggle('light');
    if(document.documentElement.classList.contains('light')){
      document.documentElement.style.setProperty('--bg','#f7fafc');
      document.documentElement.style.setProperty('--card','#ffffff');
      document.documentElement.style.setProperty('--muted','#556070');
      document.documentElement.style.setProperty('--accent','#7c5cff');
    } else {
      document.documentElement.style.removeProperty('--bg');
      document.documentElement.style.removeProperty('--card');
      document.documentElement.style.removeProperty('--muted');
      document.documentElement.style.removeProperty('--accent');
    }
  });
});

function renderPlaylist(){
  const ul = $('playlist'); ul.innerHTML = '';
  playlist.forEach((id,idx)=>{
    const li = document.createElement('li');
    const title = document.createElement('div'); title.textContent = id;
    const actions = document.createElement('div');
    const btnPlay = document.createElement('button'); btnPlay.textContent = 'Play'; btnPlay.className='btn small';
    btnPlay.addEventListener('click', ()=>{ loadVideoById(id); });
    const btnRemove = document.createElement('button'); btnRemove.textContent = 'X'; btnRemove.className='btn small';
    btnRemove.addEventListener('click', ()=>{ playlist.splice(idx,1); renderPlaylist(); });
    actions.appendChild(btnPlay); actions.appendChild(btnRemove);
    li.appendChild(title); li.appendChild(actions);
    ul.appendChild(li);
  });
}

function toggleFullscreen(){
  const el = document.getElementById('player');
  if(!document.fullscreenElement){
    if(el.requestFullscreen) el.requestFullscreen();
  } else {
    if(document.exitFullscreen) document.exitFullscreen();
  }
}

// helper for manual testing in console
window._YT = { player, playlist };

/*
