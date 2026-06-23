class Game {
  constructor() {
    this.lang = 'it';
    this.state = 'LOAD';
    this.memory = 100;
    this.health = 100;
    this.flags = {};
    this.inv = new Inventory(this);
    this.ds = new DialogSystem(this);
    this.audio = new AudioGen();
    this.charId = null;
    this.keys = {};
    
    window.addEventListener('keydown', e => { this.keys[e.key] = true; });
    window.addEventListener('keyup', e => { this.keys[e.key] = false; });
    
    this.renderer = new THREE.WebGLRenderer({canvas: document.getElementById('cv'), antialias: true});
    const cw = window.innerWidth - (window.innerWidth > 768 ? 320 : 0);
    this.renderer.setSize(cw, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.camera = new THREE.PerspectiveCamera(45, cw/window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 7, 9);
    this.camera.lookAt(0, 0, 0);
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999,-999);
    this.clock = new THREE.Clock();
    
    this.curSceneId = 'porto';
    this.scenes = { porto: PortoScene, foresta: ForestaScene, quest: QuestScene };
    this.sceneNames = {
      it: { porto: 'Il Porto delle Maree Morte', foresta: 'La Foresta degli Orologi', quest: 'Tutorial: Quest di Prova' },
      en: { porto: 'The Port of Dead Tides', foresta: 'The Forest of Clocks', quest: 'Tutorial: Quest Practice' }
    };
    
    window.addEventListener('resize', () => {
      const cw = window.innerWidth - (window.innerWidth > 768 ? 320 : 0);
      this.renderer.setSize(cw, window.innerHeight);
      this.camera.aspect = cw/window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
    
    const cv = document.getElementById('cv');
    const setMouse = (cx, cy) => {
      const cw = window.innerWidth - (window.innerWidth > 768 ? 320 : 0);
      this.mouse.x = (cx / cw)*2 - 1;
      this.mouse.y = -(cy / window.innerHeight)*2 + 1;
    };
    
    cv.addEventListener('mousemove', e => setMouse(e.clientX, e.clientY));
    cv.addEventListener('mousedown', (e) => { 
      this.isPressed = true; 
      setMouse(e.clientX, e.clientY);
      this.onClick(); 
    });
    window.addEventListener('mouseup', () => { this.isPressed = false; });
    
    cv.addEventListener('touchstart', e => {
      this.isPressed = true;
      setMouse(e.touches[0].clientX, e.touches[0].clientY);
      this.onClick();
    }, {passive:true});
    window.addEventListener('touchend', () => { this.isPressed = false; });
    cv.addEventListener('touchmove', e => {
      setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive:true});
    
    cv.addEventListener('dragover', e => e.preventDefault());
    cv.addEventListener('drop', e => {
      e.preventDefault();
      if(this.state !== 'PLAY') return;
      const itemId = e.dataTransfer.getData('text/plain');
      if(!itemId) return;
      
      setMouse(e.clientX, e.clientY);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      if(this.curScene && this.curScene.objs) {
        const hits = this.raycaster.intersectObjects(this.curScene.objs.map(o => o.mesh), true);
        if(hits.length > 0) {
          const obj = this._getHitObj(hits[0].object);
          if(obj && obj.onDrop) {
            this.player.move(obj.walkTarget.x, obj.walkTarget.z);
            this.pendingAction = { tgt: obj.walkTarget, fn: () => obj.onDrop(itemId) };
          } else if(!obj || !obj.onDrop) {
            this.notify("Non puoi usare " + (GAME_DATA.items[itemId]?.name || "questo") + " qui.");
          }
        }
      }
    });
    
    document.getElementById('mb').onclick = (e) => {
      const muted = this.audio.toggle();
      e.target.textContent = muted ? '🔇' : '🔊';
    };
    
    document.getElementById('close-map-btn').onclick = () => {
      this.closeMap();
    };
    document.getElementById('map-overlay').onclick = (e) => {
      if (e.target.id === 'map-overlay') {
        this.closeMap();
      }
    };
    
    this.initOrbitControls();
    this.initEditor();
    this.loop();
  }

  showCharSelect() {
    document.getElementById('ts').classList.add('hidden');
    document.getElementById('char-select').classList.remove('hidden');
  }

  selectChar(id) {
    this.charId = id;
    const data = GAME_DATA.characters[id];
    document.querySelectorAll('.cs-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('card-' + id).classList.add('selected');
    document.getElementById('cs-start-btn').classList.remove('hidden');
    document.getElementById('iv-face').textContent = data.emoji;
    document.getElementById('iv-name').innerHTML = data.name.replace(' ', '<br>');
  }

  startDialog(id, nodes, startNodeId = 'start') {
    this.ds.start(nodes, startNodeId);
  }

  startGame() {
    this.audio.ctx.resume();
    document.getElementById('char-select').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('hud-btns').classList.remove('hidden');
    document.getElementById('iv').classList.remove('hidden');
    this.loadScene(this.curSceneId);
    this.state = 'PLAY';
    if (!this.inv.has('mappa_bagnata')) {
      this.inv.add('mappa_bagnata');
    }
  }

  handleAction(action) {
    if(action === 'LEVEL1_WIN') this.win_level1();
    if(action === 'LEVEL2_WIN') this.win_level2();
  }

  setFlag(flag) {
    this.flags[flag] = true;
  }

  notify(msg) {
    const nt = document.getElementById('nt');
    nt.textContent = msg;
    nt.classList.add('show');
    setTimeout(() => nt.classList.remove('show'), 3000);
  }

  updateHealth(amount) {
    this.health = Math.max(0, Math.min(100, this.health + amount));
    const hb = document.getElementById('health-bar');
    if (hb) hb.style.width = this.health + '%';
    if (this.health <= 0 && this.state === 'PLAY') {
      this.die();
    }
  }

  die() {
    this.state = 'DEAD';
    this.audio.playTone(120, 'sawtooth', 1.6, 0.25);
    
    const ws = document.getElementById('ws');
    const wt = document.getElementById('wt');
    const wtx = document.getElementById('wtx');
    const wco = document.querySelector('#ws .wco');
    const nextBtn = document.getElementById('next-level-btn');
    
    if (ws) ws.classList.remove('hidden');
    if (wt) wt.textContent = "SEI MORTO DI STENTI";
    if (wtx) wtx.textContent = "La fame e la sete hanno avuto la meglio su di te. L'isola ha cancellato la tua presenza e la tua storia.";
    if (wco) wco.innerHTML = "<span style='color:#e74c3c; font-weight:bold; letter-spacing: 2px;'>GAME OVER</span>";
    if (nextBtn) nextBtn.classList.add('hidden');
  }

  win_level1() {
    this.state = 'WIN';
    this.audio.playWin();
    
    // Ripristina titoli del livello 1
    const wt = document.getElementById('wt');
    const wtx = document.getElementById('wtx');
    const wco = document.querySelector('#ws .wco');
    const nextBtn = document.getElementById('next-level-btn');
    
    if (wt) wt.textContent = "IL PORTO È ALLE SPALLE";
    if (wtx) wtx.textContent = "La barca taglia le acque impossibili del porto. L'isola ti aspetta. Ti ricorderà di te?";
    if (wco) wco.innerHTML = "&diams; LIVELLO 2 &diams;<br><span style='font-size:.9rem;font-style:italic'>La Foresta degli Orologi</span>";
    if (nextBtn) nextBtn.classList.remove('hidden');
    
    document.getElementById('ws').classList.remove('hidden');
    nextBtn.onclick = () => {
      document.getElementById('ws').classList.add('hidden');
      this.state = 'PLAY';
      this.loadScene('foresta');
    };
  }

  win_level2() {
    this.state = 'WIN';
    this.audio.playWin();
    
    const wt = document.getElementById('wt');
    const wtx = document.getElementById('wtx');
    const wco = document.querySelector('#ws .wco');
    const nextBtn = document.getElementById('next-level-btn');
    
    if (wt) wt.textContent = "IL SENTIERO È LIBERO";
    if (wtx) wtx.textContent = "Con le tue risposte hai convinto il Guardiano della Foresta di non averti mai visto. Ti lasci alle spalle il ticchettio incessante degli orologi.";
    if (wco) wco.innerHTML = "&diams; LIVELLO 3 &diams;<br><span style='font-size:.9rem;font-style:italic'>L'Albergo delle Ombre</span>";
    if (nextBtn) nextBtn.classList.remove('hidden');
    
    document.getElementById('ws').classList.remove('hidden');
    nextBtn.onclick = () => {
      document.getElementById('ws').classList.add('hidden');
      this.state = 'PLAY';
      this.notify("Livello 3: L'Albergo delle Ombre - Prossimamente!");
    };
  }

  loadScene(id, startX=0) {
    this.curSceneId = id;
    this.scene = new THREE.Scene();
    
    // Luci Ambientali
    this.scene.add(new THREE.AmbientLight(0xffeedd, 0.5));
    const dl = new THREE.DirectionalLight(0xffeedd, 1.2);
    dl.position.set(5, 10, 5);
    dl.castShadow = true;
    dl.shadow.mapSize.set(1024, 1024);
    this.scene.add(dl);
    
    this.player = new Player(this.scene);

    // ── Gestione visibilità pulsanti per il livello Quest di tutorial ──
    const exitBtn = document.getElementById('exit-quest-btn');
    const saveBtn = document.getElementById('sb');
    const loadBtn = document.getElementById('lb');
    if (id === 'quest') {
      if (exitBtn) exitBtn.style.display = 'block';
      if (saveBtn) saveBtn.style.display = 'none';
      if (loadBtn) loadBtn.style.display = 'none';
      // Posizione iniziale per il tutorial al centro radura
      this.player.grp.position.set(0, 0, 0);
    } else {
      if (exitBtn) exitBtn.style.display = 'none';
      if (saveBtn) saveBtn.style.display = 'block';
      if (loadBtn) loadBtn.style.display = 'block';
      
      // ── Posizione iniziale: banchina porto (livello 1) o startX generico ──
      if (id === 'porto' && startX === 0) {
        this.player.grp.position.set(-5, 0, 1.52);
      } else {
        this.player.grp.position.set(startX, 0, 2);
      }
    }
    
    this.curScene = new this.scenes[id](this);
    this.curScene.build();

    // ── Registra collider statici e NPC nella scena corrente ──
    this._registerSceneColliders();
    
    document.getElementById('sn').textContent = this.sceneNames[this.lang][id];
    
    // Camera follow iniziale
    this.savedCamera = {
      position: new THREE.Vector3(this.player.grp.position.x, 7, this.player.grp.position.z + 9),
      target: this.player.grp.position.clone()
    };
    this.updateCameraFollow();

    if (this.state === 'EDIT') this.scene.add(this.edControls);
    
    this.loadEditorState(true); 
  }

  /**
   * Registra automaticamente i collider AABB di edifici/oggetti e gli NPC
   * dopo che la scena è stata costruita.
   */
  _registerSceneColliders() {
    if (!this.player) return;
    const p = this.player;
    p.staticColliders = [];
    p.npcColliders = [];

    if (this.curSceneId === 'porto') {
      // ── Edificio principale ──  cx=-5.5  cz=-2  size 3×2.5
      p.addStaticCollider(-5.5, -2,   1.7, 1.45);
      // ── Barca di Capitan Umber ──  cx=3  cz=-2  size 2.5×5
      p.addStaticCollider(3,    -2,   1.35, 2.6);
      // ── Terreno isola sinistra ──  cx=-10  cz=-1  size 6×12
      p.addStaticCollider(-10,  -1,   3.2, 6.2);
      // ── Banchina (piano legno) bordi laterali e testa ──
      // La banchina è percorribile (y=0), ma blocca oltre i bordi X
      // Bordo sinistro banchina (x~-7) 
      p.addStaticCollider(-7.5, -1,   0.3, 5.5);
      // Bordo testa banchina (z~-5.5)
      p.addStaticCollider(-5,   -5.5, 2.5, 0.3);
    } else if (this.curSceneId === 'foresta') {
      // ── Orologio Maestro ── cx=0 cz=10.2
      p.addStaticCollider(0, 10.2, 0.7, 0.7);
      // ── Cancello di rovi (se chiuso) ── cx=0 cz=12.8
      if (this.curScene && !this.curScene.gateOpen) {
        this.curScene.gateCollider = p.addStaticCollider(0, 12.8, 1.8, 0.3);
      }
    } else if (this.curSceneId === 'quest') {
      // Confini per il livello Quest (limita i movimenti del player in una radura 11x11)
      p.setBounds(11, 11);
      // Tavolo / Banco del Vecchio Saggio
      p.addStaticCollider(0, -4, 0.5, 0.5);
      // Scrigno del tesoro
      p.addStaticCollider(0, 3, 0.45, 0.35);
    }

    // ── Registra NPC dalla scena corrente ──
    if (this.curScene && this.curScene.npcs) {
      this.curScene.npcs.forEach(npc => {
        p.addNPCCollider(npc, 0.55);
      });
    }
  }
  
  onClick() {
    if (this.state === 'EDIT') {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.scene.children, true);
      
      const clickedGizmo = hits.find(hit => {
        let o = hit.object;
        while(o) {
          if (o === this.edControls) return true;
          o = o.parent;
        }
        return false;
      });
      if (clickedGizmo) return;

      for (let hit of hits) {
        let obj = hit.object;
        while (obj.parent && obj.parent.type !== 'Scene') {
          obj = obj.parent;
        }
        if (obj !== this.edControls && !obj.type.includes('Light') && !obj.type.includes('Helper')) {
          const listItems = Array.from(document.querySelectorAll('#editor-obj-list li'));
          const li = listItems.find(el => el.textContent === (obj.name || obj.type));
          this.selectObject(obj, li);
          return;
        }
      }
      return;
    }

    if(this.state !== 'PLAY') return;
    this.audio.ctx.resume();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check objects
    if (this.curScene && this.curScene.objs) {
      const hits = this.raycaster.intersectObjects(this.curScene.objs.map(o => o.mesh), true);
      if(hits.length > 0) {
        const obj = this._getHitObj(hits[0].object);
        if(obj) {
          this.player.move(obj.walkTarget.x, obj.walkTarget.z);
          this.pendingAction = { tgt: obj.walkTarget, fn: obj.action };
          return;
        }
      }
    }
  }

  _getHitObj(hitObject) {
    if(!this.curScene || !this.curScene.objs) return null;
    return this.curScene.objs.find(o => {
      let found = false;
      o.mesh.traverse(child => { if(child === hitObject) found = true; });
      return found;
    });
  }

  updateHover() {
    const lbl = document.getElementById('ca');
    if(this.state !== 'PLAY' || !this.curScene) { lbl.style.opacity = 0; return; }
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.curScene.objs.map(o => o.mesh), true);
    
    if(hits.length > 0) {
      const obj = this._getHitObj(hits[0].object);
      if(obj) {
        lbl.textContent = obj.label;
        lbl.style.opacity = 1;
        document.body.style.cursor = 'pointer';
        return;
      }
    }
    
    lbl.style.opacity = 0;
    document.body.style.cursor = 'default';
  }

  initOrbitControls() {
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.enabled = false; // only active in EDIT mode
  }

  resetEnvironment() {
    const currentId = this.curSceneId;
    this.loadScene(currentId, 0);
    this.notify('Ambiente resettato allo stato originale.');
  }

  saveLevel() {
    const levelData = {
      objects: [],
      camera: {
        position: this.camera.position.toArray(),
        target: this.orbitControls ? this.orbitControls.target.toArray() : [0,0,0]
      }
    };
    this.scene.traverse(obj => {
      if ((obj.isMesh || obj.isGroup) && obj.name && !['Cielo', 'Acqua', 'Terreno'].includes(obj.name)) {
        levelData.objects.push({
          name: obj.name,
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray(),
          scale: obj.scale.toArray()
        });
      }
    });
    const jsonStr = JSON.stringify(levelData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isla_level_${this.curSceneId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.notify('Livello salvato come JSON.');
  }

  loadLevel(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.resetEnvironment();
        data.objects.forEach(objData => {
          const target = this.scene.getObjectByName(objData.name);
          if (target) {
            target.position.fromArray(objData.position);
            target.rotation.fromArray(objData.rotation);
            target.scale.fromArray(objData.scale);
          }
        });
        if (data.camera && this.orbitControls) {
          this.camera.position.fromArray(data.camera.position);
          this.orbitControls.target.fromArray(data.camera.target);
          this.orbitControls.update();
          this.savedCamera = {
            position: this.camera.position.clone(),
            target: this.orbitControls.target.clone()
          };
        }
        this.notify('Livello caricato dal file JSON.');
      } catch (err) {
        console.error(err);
        this.notify('Errore nel caricamento del file JSON.');
      }
    };
    reader.readAsText(file);
  }

  triggerLoadLevel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadLevel(file);
      }
    };
    input.click();
  }

  saveCamera() {
    this.savedCamera = {
      position: this.camera.position.clone(),
      target: this.orbitControls ? this.orbitControls.target.clone() : new THREE.Vector3()
    };
    this.notify('Posizione iniziale della camera salvata.');
  }

  updateCameraFollow() {
    if (!this.savedCamera) return;
    const playerPos = this.player.grp.position;
    const offset = new THREE.Vector3().subVectors(this.savedCamera.position, playerPos);
    this.camera.position.copy(playerPos).add(offset);
    if (this.orbitControls) {
      const targetOffset = new THREE.Vector3().subVectors(this.savedCamera.target, playerPos);
      this.orbitControls.target.copy(playerPos).add(targetOffset);
      this.orbitControls.update();
    }
  }

  initEditor() {
    this.edControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
    this.edControls.addEventListener('change', () => this.updatePropUI());
    window.addEventListener('keydown', e => {
      if(e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); this.toggleEditor(); }
    });

    this.edControls.addEventListener('dragging-changed', (event) => {
      if (this.orbitControls) {
        this.orbitControls.enabled = !event.value;
      }
    });

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };
    bind('ed-btn-translate', (e) => { this.edControls.setMode('translate'); this._updateEdBtn(e.target); });
    bind('ed-btn-rotate', (e) => { this.edControls.setMode('rotate'); this._updateEdBtn(e.target); });
    bind('ed-btn-scale', (e) => { this.edControls.setMode('scale'); this._updateEdBtn(e.target); });
    bind('ed-btn-close', () => this.toggleEditor());
    bind('ed-btn-save', () => { this.saveEditorState(); this.saveLevel(); });
    bind('ed-btn-load', () => this.triggerLoadLevel());
    bind('ed-btn-camera', () => this.saveCamera());

    ['px','py','pz','rx','ry','rz','sx','sy','sz'].forEach(id => {
      const el = document.getElementById('ed-' + id);
      if (el) el.oninput = () => this.updateObjFromUI();
    });
  }

  _updateEdBtn(btn) {
    document.querySelectorAll('#editor-topbar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  toggleEditor() {
    const ui = document.getElementById('editor-ui');
    if (this.state === 'EDIT') {
      this.state = this.prevState || 'PLAY';
      ui.classList.add('hidden');
      this.scene.remove(this.edControls);
      this.edControls.detach();
      if (this.orbitControls) {
        this.orbitControls.enabled = false;
      }
      if (this.savedPlayCameraPosition && this.savedPlayCameraRotation) {
        this.camera.position.copy(this.savedPlayCameraPosition);
        this.camera.rotation.copy(this.savedPlayCameraRotation);
      }
    } else {
      this.prevState = this.state;
      this.state = 'EDIT';
      ui.classList.remove('hidden');
      this.scene.add(this.edControls);
      this.refreshObjList();
      
      this.savedPlayCameraPosition = this.camera.position.clone();
      this.savedPlayCameraRotation = this.camera.rotation.clone();
      
      if (this.orbitControls) {
        this.orbitControls.enabled = true;
        if (this.player) {
          this.orbitControls.target.copy(this.player.grp.position);
        } else {
          this.orbitControls.target.set(0, 0, 0);
        }
        this.orbitControls.update();
      }
    }
  }

  refreshObjList() {
    const list = document.getElementById('editor-obj-list');
    list.innerHTML = '';

    const labelMap = new Map();
    if (this.curScene && this.curScene.objs) {
      this.curScene.objs.forEach(o => {
        if (o.mesh) labelMap.set(o.mesh.uuid, o.label || o.mesh.name || o.mesh.type);
      });
    }

    const typeLabels = {
      'AmbientLight': '💡 Luce Ambiente',
      'DirectionalLight': '☀️ Luce Direzionale',
      'PointLight': '🔆 Luce Puntuale',
      'Mesh': '📦 Oggetto',
      'Group': '👥 Gruppo',
      'Scene': '🌍 Scena',
    };

    let idx = 0;
    const addObj = (obj, depth = 0) => {
      if (obj === this.edControls) return;
      if (obj.type.includes('Helper')) return;

      let label = labelMap.get(obj.uuid);
      if (!label) {
        if (obj.name && obj.name.trim()) {
          label = obj.name;
        } else {
          label = typeLabels[obj.type] || obj.type;
        }
      }
      label = `${label}`;

      const li = document.createElement('li');
      li.style.paddingLeft = (depth * 15 + 10) + 'px';
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.gap = '6px';

      const dot = document.createElement('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;';
      if (obj.type.includes('Light')) dot.style.background = '#f1c40f';
      else if (obj.type === 'Group') dot.style.background = '#9b59b6';
      else dot.style.background = '#3498db';
      li.appendChild(dot);

      const txt = document.createElement('span');
      txt.textContent = label;
      txt.style.overflow = 'hidden';
      txt.style.textOverflow = 'ellipsis';
      txt.style.whiteSpace = 'nowrap';
      li.appendChild(txt);

      li.onclick = () => this.selectObject(obj, li);
      list.appendChild(li);
      if (depth < 1 && obj.children) obj.children.forEach(c => addObj(c, depth + 1));
      idx++;
    };
    this.scene.children.forEach(c => addObj(c));
  }

  selectObject(obj, li) {
    document.querySelectorAll('#editor-obj-list li').forEach(l => l.classList.remove('selected'));
    if(li) li.classList.add('selected');
    this.edSelected = obj;
    this.edControls.attach(obj);
    this.updatePropUI();
  }

  updatePropUI() {
    const obj = this.edSelected;
    if(!obj) return;
    const set = (id, val) => document.getElementById(id).value = val;
    set('ed-px', obj.position.x.toFixed(2));
    set('ed-py', obj.position.y.toFixed(2));
    set('ed-pz', obj.position.z.toFixed(2));
    set('ed-rx', THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(0));
    set('ed-ry', THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(0));
    set('ed-rz', THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(0));
    set('ed-sx', obj.scale.x.toFixed(2));
    set('ed-sy', obj.scale.y.toFixed(2));
    set('ed-sz', obj.scale.z.toFixed(2));
  }

  updateObjFromUI() {
    const obj = this.edSelected;
    if(!obj) return;
    const get = (id) => parseFloat(document.getElementById(id).value);
    obj.position.set(get('ed-px'), get('ed-py'), get('ed-pz'));
    obj.rotation.set(THREE.MathUtils.degToRad(get('ed-rx')), THREE.MathUtils.degToRad(get('ed-ry')), THREE.MathUtils.radToDeg(get('ed-rz')));
    obj.scale.set(get('ed-sx'), get('ed-sy'), get('ed-sz'));
  }

  saveEditorState() {
    const wasInScene = this.edControls && this.edControls.parent;
    if (wasInScene) this.scene.remove(this.edControls);

    const states = {};
    let idx = 0;
    this.scene.traverse(obj => {
      if (obj.isMesh || obj.isGroup) {
        states[idx] = { p: obj.position.toArray(), r: obj.rotation.toArray(), s: obj.scale.toArray() };
      }
      idx++;
    });

    if (wasInScene) this.scene.add(this.edControls);

    localStorage.setItem(`isla_level_editor_${this.curSceneId}`, JSON.stringify(states));
    this.notify("Stato editor salvato in LocalStorage!");
  }

  loadEditorState(silent = false) {
    const s = localStorage.getItem(`isla_level_editor_${this.curSceneId}`);
    if (!s) {
      if (!silent) this.notify("Nessun salvataggio editor trovato!");
      return;
    }
    try {
      const states = JSON.parse(s);
      const wasInScene = this.edControls && this.edControls.parent;
      if (wasInScene) this.scene.remove(this.edControls);

      let idx = 0;
      this.scene.traverse(obj => {
        if (states[idx]) {
          const stateObj = states[idx];
          obj.position.fromArray(stateObj.p);
          obj.rotation.fromArray(stateObj.r);
          obj.scale.fromArray(stateObj.s);
        }
        idx++;
      });

      if (wasInScene) this.scene.add(this.edControls);
      if (!silent) this.notify("Stato editor caricato con successo!");
      this.updatePropUI();
    } catch(e) {
      if (!silent) this.notify("Errore nel caricamento dello stato editor!");
    }
  }

  saveGame() {
    const data = { memory: this.memory, health: this.health, charId: this.charId, flags: this.flags, items: this.inv.items, curSceneId: this.curSceneId };
    localStorage.setItem('isla_save', JSON.stringify(data));
    this.notify("Partita Salvata!");
  }

  loadGame() {
    const s = localStorage.getItem('isla_save');
    if(!s) { this.notify("Nessun salvataggio!"); return; }
    const d = JSON.parse(s);
    this.memory = d.memory;
    this.health = d.health !== undefined ? d.health : 100;
    this.charId = d.charId;
    this.flags = d.flags;
    this.inv.items = d.items || Array(12).fill(null);
    this.inv.render();
    this.selectChar(this.charId);
    this.startGame();
    this.updateHealth(0); // Forza aggiornamento della barra salute
    this.notify("Partita Caricata!");
  }

  openMap() {
    this.prevState = this.state;
    this.state = 'MAP';
    document.getElementById('map-overlay').classList.remove('hidden');
    this.audio.playClick();
  }

  closeMap() {
    this.state = this.prevState || 'PLAY';
    document.getElementById('map-overlay').classList.add('hidden');
    this.audio.playClick();
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(0.1, this.clock.getDelta());
    if(this.state === 'PLAY' || this.state === 'DIALOG' || this.state === 'EDIT') {
      if(this.player && this.state === 'PLAY') {
        this.player.update(dt, this.keys);
        this.updateHealth(-0.2 * dt);
        if(this.pendingAction) {
          const d = this.player.grp.position.distanceTo(new THREE.Vector3(this.pendingAction.tgt.x, 0, this.pendingAction.tgt.z));
          if(d < 0.5) { this.pendingAction.fn(); this.pendingAction = null; }
        }
        if(this.isPressed) this.onClick();
        this.updateHover();
        this.updateCameraFollow();
      }
      if(this.curScene && this.curScene.update) this.curScene.update(dt);

      if(this.state === 'EDIT' && this.orbitControls && this.orbitControls.enabled) {
        this.orbitControls.update();
      }
    }
    if(this.scene) this.renderer.render(this.scene, this.camera);
  }
}
