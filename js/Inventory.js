/* ── INVENTORY ── */
class Inventory {
  constructor(game) {
    this.g = game;
    this.items = Array(12).fill(null);
    this.equipped = { left: null, right: null };
    this.slots = document.getElementById('isl');
    this.hL = document.getElementById('iv-hand-l');
    this.hR = document.getElementById('iv-hand-r');

    // Drag-and-drop support for hands
    const setupHandSlot = (slotNode, hand) => {
      slotNode.ondragover = (e) => e.preventDefault();
      slotNode.ondrop = (e) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        if (itemId) {
          this.equip(itemId, hand);
        }
      };
    };
    if (this.hL) setupHandSlot(this.hL, 'left');
    if (this.hR) setupHandSlot(this.hR, 'right');
  }
  add(id) { 
    const idx = this.items.indexOf(null);
    if(idx !== -1 && !this.has(id)) this.items[idx] = id;
    this.render(); 
  }
  rem(id) { 
    const idx = this.items.indexOf(id);
    if(idx !== -1) this.items[idx] = null;
    if(this.equipped.left === id) this.equipped.left = null;
    if(this.equipped.right === id) this.equipped.right = null;
    this.render(); 
  }
  has(id) { return this.items.includes(id); }
  equip(id, hand) {
    if(hand === 'left') this.equipped.left = id;
    if(hand === 'right') this.equipped.right = id;
    this.render();
  }
  render() {
    this.slots.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const id = this.items[i];
      const div = document.createElement('div');
      div.className = 'is';
      div.dataset.slot = i;
      
      div.ondragover = (e) => e.preventDefault();
      div.ondrop = (e) => {
        e.preventDefault();
        const fromSlot = parseInt(e.dataTransfer.getData('slot'));
        if(!isNaN(fromSlot) && fromSlot !== i) {
          const temp = this.items[i];
          this.items[i] = this.items[fromSlot];
          this.items[fromSlot] = temp;
          this.render();
        }
      };

      if(id) {
        const itemDef = (GAME_DATA && GAME_DATA.items[id]) || { emoji: '?', name: id };
        const memPct = this.g.memory / 100;
        const displayName = (memPct < 0.4 && itemDef.nameCorrupt) ? itemDef.nameCorrupt : itemDef.name;
        
        div.draggable = true;
        div.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', id);
          e.dataTransfer.setData('slot', i);
          div.style.opacity = '0.5';
        };
        div.ondragend = () => { div.style.opacity = '1'; };
        
        div.innerHTML = `<div class="ie">${itemDef.emoji || '?'}</div><div class="in">${displayName}</div>`;
        div.onclick = () => {
          if (id === 'mappa_bagnata') {
            this.g.openMap();
          } else {
            this.g.notify(`${itemDef.emoji} ${displayName}: ${itemDef.desc || ''}`);
            this.g.audio.playClick();
          }
        };
        div.ondblclick = () => {
          if (this.equipped.right === id) {
            this.equip(null, 'right');
            this.g.notify(`Mano destra libera.`);
          } else if (this.equipped.left === id) {
            this.equip(null, 'left');
            this.g.notify(`Mano sinistra libera.`);
          } else {
            this.equip(id, 'right');
            this.g.notify(`Equipaggiato ${displayName} nella mano destra.`);
          }
          this.g.audio.playTone(600, 'sine', 0.08, 0.15);
        };
      }
      this.slots.appendChild(div);
    }

    const renderHand = (node, id) => {
      node.innerHTML = '';
      if(id) {
        const itemDef = GAME_DATA.items[id];
        node.innerHTML = `<span class="ie" style="font-size:2.5rem">${itemDef ? itemDef.emoji : '?'}</span>`;
        node.onclick = () => { this.equip(null, node.id.includes('l')?'left':'right'); };
      } else {
        node.onclick = null;
      }
    };
    renderHand(this.hL, this.equipped.left);
    renderHand(this.hR, this.equipped.right);
  }
}
