// server/ingest.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tracks.json');

function readTracks(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ return []; }
}
function writeTracks(arr){ fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8'); }

function run(){
  const base = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';
  const list = readTracks();
  let added = 0;
  for(let i=1;i<=24;i++){
    const id = `sh-${i}`;
    if(!list.find(x => x.id === id)){
      list.push({
        id,
        title: `SoundHelix Demo ${i}`,
        artist: 'SoundHelix',
        url: `${base}${(i%12)+1}.mp3`,
        duration: null,
        isPremium: false,
        isBlocked: false,
        createdAt: Date.now()
      });
      added++;
    }
  }
  writeTracks(list);
  console.log(`Ingest done — ${added} tracks added.`);
}

run();
