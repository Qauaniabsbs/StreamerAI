// server/moderator_stub.js
const PROFANITY = [
  // қазақша (мысалдар) — толықтыру қажет
  'жамансөз1', 'жамансөз2',
  // орысша
  'бляд', 'сука', 'хуй',
  // ағылшынша
  'fuck', 'shit', 'bitch'
];

function moderateText(text){
  const s = (text || '').toLowerCase();
  for(const bad of PROFANITY){
    if(!bad) continue;
    if(s.includes(bad)) return { blocked: true, reason: 'lexicon', found: bad };
  }
  return { blocked: false };
}

module.exports = { moderateText };
