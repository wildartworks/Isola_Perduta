/**
 * CuoreScene.js - Livello 7: Il Cuore dell'Isola
 * 
 * Il nucleo fantascientifico dell'isola: una gigantesca macchina tecnologica.
 * Contiene la sfera sospesa di ricordi, le 3 statue della verità e il dialogo con la registrazione di Valentine.
 */

class CuoreScene {
  constructor() {
    this.id = 'cuore';
    this.name = 'Il Cuore dell\'Isola';
    this.npcs = [];
    this.objs = [];
    this.statueAnswers = { 1: false, 2: false, 3: false };
    this.heartCoreActivated = false;
  }

  build(scene, player, game) {
    this.scene = scene;
    this.player = player;
    this.g = game;
    this.objs = [];
    this.npcs = [];
    this.statueAnswers = { 1: false, 2: false, 3: false };

    // ── TERRENO TECNOLOGICO ──
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a1018, metalness: 0.8, roughness: 0.2 });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.4, 24), floorMat);
    floor.position.set(0, 0, 0);
    floor.name = 'Pavimento del Cuore';
    scene.add(floor);
    this.floorMesh = floor;

    // Anelli concentrici luminosi sul pavimento
    const ringGeo = new THREE.RingGeometry(5, 5.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.21, 0);
    scene.add(ring);

    // ── SFERA GIGANTE DEL CUORE (SOSPESA AL CENTRO) ──
    const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x0044aa,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.coreMesh.position.set(0, 6.5, 0);
    scene.add(this.coreMesh);

    // Luce pulsante centrale
    this.coreLight = new THREE.PointLight(0x00c8ff, 1.8, 25);
    this.coreLight.position.set(0, 6.5, 0);
    scene.add(this.coreLight);

    // ── TRE STATUE DELLA VERITÀ (ENIGMA BUGIE) ──
    const statueGeo = new THREE.BoxGeometry(1.0, 3.5, 1.0);
    const statueMat = new THREE.MeshStandardMaterial({ color: 0x1e2836, metalness: 0.5, roughness: 0.4 });

    const statuePositions = [
      { id: 1, x: -7, z: -4, label: 'Statua dell\'Origine' },
      { id: 2, x: 0,  z: -8, label: 'Statua dello Scopo' },
      { id: 3, x: 7,  z: -4, label: 'Statua della Verità' }
    ];

    statuePositions.forEach(st => {
      const mesh = new THREE.Mesh(statueGeo, statueMat);
      mesh.position.set(st.x, 1.75, st.z);
      scene.add(mesh);

      // Testa incoronata della statua
      const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x002255 }));
      head.position.set(st.x, 3.8, st.z);
      scene.add(head);

      this.objs.push({
        mesh: mesh,
        label: st.label,
        walkTarget: { x: st.x, z: st.z + 2 },
        action: () => this.interactStatue(st.id, st.label)
      });
    });

    // ── PROIEZIONE / REGISTRAZIONE DI VALENTINE ──
    const holoGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.7, 12);
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6, wireframe: true });
    this.holoMesh = new THREE.Mesh(holoGeo, holoMat);
    this.holoMesh.position.set(0, 1.0, -3);
    this.holoMesh.visible = false;
    scene.add(this.holoMesh);

    this.objs.push({
      mesh: this.coreMesh,
      label: 'Il Cuore della Macchina',
      walkTarget: { x: 0, z: -2 },
      action: () => this.interactCore()
    });
  }

  interactStatue(statueId, label) {
    const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';

    if (statueId === 1) {
      this.g.openDialog([
        { text: '«Perché sei venuto su quest\'isola?» tuona la statua.', speaker: label },
        { text: 'Scegli la tua risposta risuonante:', speaker: 'Macchina' }
      ], () => {
        // Opzioni di risposta
        this.g.notify('1: "Per trovare il tesoro" | 2: "Per fuggire dal passato" | 3: "Per ricordare chi sono"');
        this.statueAnswers[1] = true; // Sbloccato il passaggio
        setTimeout(() => this.g.notify('✅ Risposta registrata: "Per ricordare chi sono". La statua si illumina di blu!'), 2000);
      });
    } else if (statueId === 2) {
      this.g.openDialog([
        { text: '«Cosa cercavi nel profondo dei tuoi ricordi?»', speaker: label }
      ], () => {
        this.statueAnswers[2] = true;
        this.g.notify('✅ Risposta registrata: "La verità su chi amavo". La seconda statua risuona!');
      });
    } else if (statueId === 3) {
      this.g.openDialog([
        { text: '«Qual è la natura di questa grande macchina?»', speaker: label }
      ], () => {
        this.statueAnswers[3] = true;
        this.g.notify('✅ Risposta registrata: "Cancellare il dolore dell\'umanità". Le 3 statue sono sbloccate!');
      });
    }
  }

  interactCore() {
    const allStatuesOk = this.statueAnswers[1] && this.statueAnswers[2] && this.statueAnswers[3];
    const pName = this.g.charId === 'valentine' ? 'Valentine' : 'Elias';
    const otherName = this.g.charId === 'valentine' ? 'Elias' : 'Valentine';

    if (!allStatuesOk) {
      this.g.notify('🔒 Le tre Statue del Giudizio devono prima valutare la tua verità.');
      return;
    }

    if (!this.heartCoreActivated) {
      this.heartCoreActivated = true;
      this.holoMesh.visible = true;

      this.g.openDialog([
        { text: 'Il Cuore pulsante rilascia una figura ologrammatica d\'azzurro intenso...', speaker: 'Attivazione Macchina' },
        { text: `«${pName}... se stai ascoltando questa registrazione, significa che hai fallito.»`, speaker: `Registrazione di ${otherName}` },
        { text: '«Fallito cosa?» gridi verso la luce.', speaker: pName },
        { text: `«Nel dimenticarmi. Quest'isola non era un archivio... era stata costruita per cancellare il dolore. Ma ha iniziato a cancellare tutto: identità, amore, famiglia.»`, speaker: `Registrazione di ${otherName}` },
        { text: 'Il macchinario sta iniziando a collassare! Un passaggio si apre verso la camera finale dell\'isola!', speaker: 'Allarme' }
      ], () => {
        this.g.notify('🚨 IL CUORE STA COLLASSANDO! Portale sbloccato per il Livello 8 (L\'Ultimo Ricordo).');
        setTimeout(() => {
          if (this.g.loadScene) this.g.loadScene('finale');
        }, 3000);
      });
    } else {
      this.g.notify('🌀 La registrazione è completata. Il portale per il finale è aperto!');
      if (this.g.loadScene) this.g.loadScene('finale');
    }
  }

  update(dt) {
    // Rotazione ed elevazione della sfera sospesa del cuore
    if (this.coreMesh) {
      this.coreMesh.rotation.y += dt * 0.3;
      this.coreMesh.position.y = 6.5 + Math.sin(Date.now() * 0.0015) * 0.4;
    }

    // Ologramma rotante
    if (this.holoMesh && this.holoMesh.visible) {
      this.holoMesh.rotation.y += dt * 1.2;
    }
  }
}

// Espone la scena al window globale
if (typeof window !== 'undefined') {
  window.CuoreScene = CuoreScene;
}
