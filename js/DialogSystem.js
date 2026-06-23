/* ── SISTEMA DIALOGHI (nuovo) ── */
class DialogSystem {
  constructor(game) {
    this.g = game;
    this.box = document.getElementById('db');
    this.spk = document.getElementById('dsp');
    this.txt = document.getElementById('dtx');
    this.chc = document.getElementById('dch');
    this.portrait = document.getElementById('dpo');
  }
  
  start(nodes, startNodeId = 'start') {
    this.nodes = nodes;
    this.g.state = 'DIALOG';
    this.show(startNodeId);
  }
  
  show(id) {
    const node = this.nodes.find(n => n.id === id);
    if(!node) { this.end(); return; }
    if(node.portrait) this.portrait.textContent = node.portrait;
    this.spk.textContent = node.speaker;
    this.txt.textContent = '';
    this.chc.innerHTML = '';
    this.box.classList.remove('hidden');
    // Log frase per l'enigma finale
    if(node.text) FRASE_LOG.push(node.text);
    // Typewriter
    let i = 0;
    const int = setInterval(() => {
      this.txt.textContent += node.text[i++];
      if(i >= node.text.length) {
        clearInterval(int);
        if(!node.choices || node.choices.length === 0) {
          // Esegui action se presente
          if(node.action) this.g.handleAction(node.action);
          if(node.flag) this.g.setFlag(node.flag);
          if(node.giveFlag) this.g.setFlag(node.giveFlag);
          setTimeout(() => this.end(), 1800);
        } else {
          this.buildChoices(node.choices);
        }
      }
    }, 22);
  }
  
  buildChoices(choices) {
    choices.forEach(c => {
      if(c.requireItem && !this.g.inv.has(c.requireItem)) return;
      if(c.requireFlag && !this.g.flags[c.requireFlag]) return;
      const b = document.createElement('button');
      b.className = 'cb';
      b.textContent = c.text;
      b.onclick = () => {
        if(c.action) this.g.handleAction(c.action);
        if(c.giveFlag) this.g.setFlag(c.giveFlag);
        if(!c.next || c.next === 'end') { this.end(); return; }
        this.show(c.next);
      };
      this.chc.appendChild(b);
    });
  }
  
  end() {
    this.box.classList.add('hidden');
    this.g.state = 'PLAY';
  }
}
