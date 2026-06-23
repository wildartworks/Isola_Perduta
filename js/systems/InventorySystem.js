// ============================================================
//  InventorySystem.js — Gestione inventario
// ============================================================

export class InventorySystem {
  constructor() {
    this.items    = new Set();
    this.bar      = document.getElementById('inventory-bar');
    this.slots    = document.getElementById('inventory-slots');
    this.selected = null;          // item id correntemente selezionato (per uso)
  }

  show() { this.bar.classList.remove('hidden'); }
  hide() { this.bar.classList.add('hidden'); }

  add(itemDef) {
    if (this.items.has(itemDef.id)) return;
    this.items.add(itemDef.id);
    this._render();
  }

  remove(itemId) {
    this.items.delete(itemId);
    if (this.selected === itemId) this.selected = null;
    this._render();
  }

  has(itemId) { return this.items.has(itemId); }

  _render() {
    this.slots.innerHTML = '';
    this.items.forEach(id => {
      const def = this._getdef(id);
      if (!def) return;
      const slot = document.createElement('div');
      slot.className = 'inv-slot' + (this.selected === id ? ' selected' : '');
      slot.title = def.name;
      slot.innerHTML = `<span class="inv-emoji">${def.emoji}</span><span class="inv-name">${def.name}</span>`;
      slot.addEventListener('click', () => this._select(id));
      this.slots.appendChild(slot);
    });
  }

  _select(id) {
    this.selected = (this.selected === id) ? null : id;
    this._render();
    document.body.style.cursor = this.selected ? 'crosshair' : 'default';
  }

  _getdef(id) {
    // Import dinamico evitato: il Game passa i defs all'init
    return this._defs ? this._defs[id.toUpperCase()] : null;
  }

  registerDefs(defs) { this._defs = defs; }
}
