// server/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { moderateText } = require('./moderator_stub'); // simple local moderator

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Paths
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_FILE = path.join(__dirname, '..', 'data', 'tracks.json');

// Serve frontend
app.use(express.static(PUBLIC_DIR));

// Utility: read/write tracks.json
function readTracks(){
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read tracks.json, returning empty array.', e.message);
    return [];
  }
}
function writeTracks(arr){
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// API: get all tracks
app.get('/api/tracks', (req, res) => {
  const list = readTracks();
  // newest first
  list.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  res.json(list);
});

// API: get single track
app.get('/api/track/:id', (req, res) => {
  const list = readTracks();
  const t = list.find(x => x.id === req.params.id);
  if(!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// API: upload track (user-generated)
app.post('/api/upload', (req, res) => {
  const { title, artist, url, lyrics } = req.body || {};
  if(!title || !artist || !url) return res.status(400).json({ error: 'title, artist and url required' });

  // simple moderation
  const check = moderateText(`${title}\n${artist}\n${lyrics||''}`);
  const isBlocked = check.blocked;

  const list = readTracks();
  const id = 'u-' + Date.now();
  const entry = {
    id,
    title,
    artist,
    url,
    lyrics: lyrics||'',
    duration: null,
    isPremium: false,
    isBlocked,
    createdAt: Date.now()
  };
  list.push(entry);
  writeTracks(list);

  res.json({
    message: isBlocked ? 'Контент блокталды (модерация арқылы).' : 'Ән қабылданды және тізімге қосылды.',
    track: entry
  });
});

// API: trigger ingest (adds more sample tracks from SoundHelix)
app.get('/api/ingest', (req, res) => {
  // add 12 demo SoundHelix tracks if they not already exist
  const base = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';
  const list = readTracks();
  let added = 0;
  for(let i=1;i<=12;i++){
    const sourceId = `sh-${i}`;
    if(!list.find(x => x.id === sourceId)){
      list.push({
        id: sourceId,
        title: `SoundHelix Demo ${i}`,
        artist: 'SoundHelix',
        url: `${base}${i}.mp3`,
        duration: null,
        isPremium: false,
        isBlocked: false,
        createdAt: Date.now() + i
      });
      added++;
    }
  }
  writeTracks(list);
  res.json({ message: `Ingest completed. ${added} tracks added.` });
});

// fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log(`SazAi demo server listening on port ${PORT}`);
});
