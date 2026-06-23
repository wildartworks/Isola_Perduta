// ============================================================
//  DialogSystem.js — Sistema dialoghi stile Monkey Island
// ============================================================

export class DialogSystem {
  constructor(game) {
    this.game = game;
    this.box      = document.getElementById('dialog-box');
    this.speaker  = document.getElementById('dialog-speaker');
    this.textEl   = document.getElementById('dialog-text');
    this.choices  = document.getElementById('dialog-choices');
    this.active   = false;
    this.currentDialog = null;
    this.nodes    = null;
  }

  /* Avvia un dialogo. npcId = 'pirate' | 'barkeep' */
  start(npcId, nodes) {
    this.active = true;
    this.npcId  = npcId;
    this.nodes  = nodes;
    this.game.state = 'DIALOG';
    this.showNode('start');
  }

  showNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) { this.end(); return; }
    this.currentNode = node;

    this.speaker.textContent = node.speaker;
    this.textEl.textContent  = '';
    this.choices.innerHTML   = '';
    this.box.classList.remove('hidden');

    // Typewriter effect
    this._typeWriter(node.text, () => {
      if (node.choices.length === 0) {
        // Auto-close after pause
        setTimeout(() => this.end(), 1800);
      } else {
        this._buildChoices(node.choices);
      }
    });
  }

  _typeWriter(text, onDone) {
    let i = 0;
    this.textEl.textContent = '';
    const interval = setInterval(() => {
      this.textEl.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(interval);
        onDone();
      }
    }, 22);
  }

  _buildChoices(choices) {
    choices.forEach(ch => {
      // Nascondi se richiede un item mancante
      if (ch.requireItem && !this.game.inventory.has(ch.requireItem)) return;

      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = ch.text;
      btn.addEventListener('click', () => {
        // Esegui azione opzionale
        if (ch.action) this.game.handleDialogAction(ch.action);
        if (ch.next) this.showNode(ch.next);
        else this.end();
      });
      this.choices.appendChild(btn);
    });
  }

  end() {
    this.active = false;
    this.box.classList.add('hidden');
    this.game.state = 'PLAYING';
  }
}
