// ============================================================
// Isla Perdida - Il Tesoro dei Pirati
// Motore di gioco single-file (No ES Modules per supportare file://)
// Fallback per variabili globali
if (typeof FRASE_LOG === 'undefined') window.FRASE_LOG = [];
if (typeof GAME_DATA === 'undefined') window.GAME_DATA = { characters: {}, items: {}, dialogs_l1: {} };







  

/* ── BOOTSTRAP ── */
let game;

window.showCharSelect = () => { if(game) game.showCharSelect(); };
window.selectChar = (id) => { if(game) game.selectChar(id); };
window.startGame = () => { if(game) game.startGame(); };

// BOOTSTRAP FINALE
function bootstrap() {
  const bar = document.getElementById('lf');
  const label = document.getElementById('ll');
  let p = 0;
  
  // Funzione per aggiornare la UI di caricamento
  const updateUI = (val) => {
    p = Math.max(p, val);
    if(bar) bar.style.width = Math.min(p, 100) + '%';
    if(label) label.textContent = 'Caricamento: ' + Math.floor(p) + '%';
  };

  // Feedback immediato
  updateUI(5);

  const int = setInterval(() => {
    if (p < 90) updateUI(p + Math.random() * 5);
    
    if(p >= 100) {
      clearInterval(int);
      setTimeout(() => {
        const ls = document.getElementById('ls');
        const ts = document.getElementById('ts');
        if(ls) ls.classList.add('hidden');
        if(ts) ts.classList.remove('hidden');
      }, 500);
    }
  }, 150);

  // Controllo Three.js e inizializzazione
  const check = setInterval(() => {
    if(window.THREE) {
      clearInterval(check);
      try {
        updateUI(50);
        game = new Game();
        updateUI(100); 
      } catch(e) {
        console.error("Init Error:", e);
        if(label) label.innerHTML = '<span style="color:#ff6666">Errore Init: ' + e.message + '</span>';
        p = 100; // Forza fine caricamento per mostrare l'errore
      }
    }
  }, 200);

  // Fallback se Three.js non carica dopo 5 secondi
  setTimeout(() => {
    if(!window.THREE && label) {
      label.innerHTML = '<span style="color:#ff6666">Errore: Three.js non disponibile</span>';
    }
  }, 5000);

  // Eventi UI
  const bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
  bind('sb', () => { if(game) game.saveGame(); });
  bind('lb', () => { if(game) game.loadGame(); });
  bind('mb', (e) => { if(game) { const m = game.audio.toggle(); e.target.textContent = m ? '🔇' : '🔊'; } });
  bind('restart-btn', () => location.reload());
}

bootstrap();
