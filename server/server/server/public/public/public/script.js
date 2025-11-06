// public/script.js (module)
const API_ROOT = '';

const tracksEl = document.getElementById('tracks');
const audioPlayer = document.getElementById('audio-player');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');

const uploadSection = document.getElementById('upload-section');
document.getElementById('btn-upload-form').addEventListener('click', ()=> uploadSection.classList.toggle('hidden'));
document.getElementById('btn-cancel-upload').addEventListener('click', ()=> uploadSection.classList.add('hidden'));

document.getElementById('btn-refresh').addEventListener('click', loadTracks);
document.getElementById('btn-ingest').addEventListener('click', async ()=>{
  const res = await fetch('/api/ingest');
  const j = await res.json();
  alert(j.message || j);
  loadTracks();
});
document.getElementById('btn-sync').addEventListener('click', loadTracks);

document.getElementById('btn-upload').addEventListener('click', async ()=>{
  const title = document.getElementById('input-title').value.trim();
  const artist = document.getElementById('input-artist').value.trim();
  const url = document.getElementById('input-url').value.trim();
  const lyrics = document.getElementById('input-lyrics').value.trim();
  if(!title || !artist || !url){ alert('Барлық өрістерді толтырыңыз.'); return; }
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ title, artist, url, lyrics })
  });
  const j = await res.json();
  alert(j.message || 'Жүктеу орындалды');
  uploadSection.classList.add('hidden');
  loadTracks();
});

// Load tracks
async function loadTracks(){
  tracksEl.innerHTML = '<div>Жүктелуде...</div>';
  try{
    const res = await fetch('/api/tracks');
    const list = await res.json();
    renderTracks(list);
  }catch(e){
    tracksEl.innerHTML = '<div class="text-red-400">Жүктеу қатесі</div>';
  }
}

function renderTracks(list){
  tracksEl.innerHTML = '';
  if(!list || list.length === 0){ tracksEl.innerHTML = '<div>Әзірше әндер жоқ</div>'; return; }
  list.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'track-card flex justify-between items-center';
    card.innerHTML = `
      <div>
        <div class="font-semibold">${escapeHtml(t.title)} ${t.isPremium?'<span class="badge-premium">PREMIUM</span>':''}</div>
        <div class="text-sm text-gray-300">${escapeHtml(t.artist)} ${t.isBlocked?'<span style="color:#f87171;margin-left:6px;">(BLOCKED)</span>':''}</div>
      </div>
      <div>
        <button data-id="${t.id}" class="play-btn bg-green-400 px-3 py-2 rounded text-black">Play</button>
      </div>
    `;
    tracksEl.appendChild(card);
  });

  document.querySelectorAll('.play-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      const res = await fetch(`/api/track/${id}`);
      if(!res.ok){ alert('Track not available'); return; }
      const track = await res.json();
      if(track.isBlocked){ alert('Бұл ән блокталған (модерация).'); return; }
      if(track.isPremium){ alert('Бұл премиум трек — жазылым қажет (демо).'); return; }
      playerTitle.textContent = track.title;
      playerArtist.textContent = track.artist;
      audioPlayer.src = track.url;
      audioPlayer.play().catch(()=> alert('Авто ойнату рұқсат етілмеді. Play батырмасын басыңыз.'));
    });
  });
}

function escapeHtml(s){
  return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

loadTracks();
