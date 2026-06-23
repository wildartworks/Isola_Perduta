// ============================================================
//  BeachScene.js — Scena spiaggia (scena iniziale)
// ============================================================
import * as THREE from 'three';

export class BeachScene {
  constructor(game) {
    this.game    = game;
    this.objects = []; // oggetti interattivi { mesh, label, onClick }
    this._animMeshes = [];
    this._keyPickedUp = false;
  }

  build(scene, player) {
    this._scene  = scene;
    this._player = player;
    this._roots  = [];

    /* ── CIELO (background renderer) ── */
    this.game.renderer.setClearColor(0xffa94d, 1);

    /* ── SOLE ── */
    const sunGeo  = new THREE.SphereGeometry(0.8, 16, 16);
    const sunMat  = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    const sun     = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(5, 6, -8);
    scene.add(sun);
    // Alone sole
    const glowGeo = new THREE.SphereGeometry(1.1, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true, opacity: 0.25, side: THREE.BackSide });
    scene.add(new THREE.Mesh(glowGeo, glowMat)).position.copy(sun.position);

    /* ── SABBIA ── */
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 12),
      new THREE.MeshLambertMaterial({ color: 0xe8c98a })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    scene.add(sand);

    /* ── OCEANO ── */
    this._water = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 6, 30, 10),
      new THREE.MeshLambertMaterial({ color: 0x1a7abf, transparent: true, opacity: 0.88 })
    );
    this._water.rotation.x = -Math.PI / 2;
    this._water.position.set(0, 0.02, -6.5);
    scene.add(this._water);
    this._animMeshes.push(this._water);

    /* ── PALME ── */
    [[-5, -1.5], [-3.5, -2.8], [4, -2]] .forEach(([x, z]) => this._addPalm(scene, x, z));

    /* ── BARILE con PIRATA ── */
    this._addBarrel(scene, -2, 0.5);
    this._addPirate(scene, -2, 0.5);

    /* ── MUCCHIO DI SABBIA (chiave sepolta) ── */
    if (!this._keyPickedUp) {
      this._sandMound = this._addSandMound(scene, 3, 1.2);
    }

    /* ── NUVOLE ── */
    this._clouds = [];
    for (let i = 0; i < 4; i++) {
      const c = this._makeCloud(scene);
      c.position.set(-10 + i * 6, 4.5 + Math.random(), -7);
      this._clouds.push(c);
    }

    /* ── PIANO CALPESTABILE (invisibile, per raycasting) ── */
    this._floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this._floor.rotation.x = -Math.PI / 2;
    this._floor.position.set(0, 0, 0.5);
    scene.add(this._floor);
    this.floorMesh = this._floor;

    player.setBounds(7.5, 3.2);
  }

  /* ── PALMA ── */
  _addPalm(scene, x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, 2.5, 7),
      new THREE.MeshLambertMaterial({ color: 0x8B5E3C })
    );
    trunk.position.set(x, 1.25, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.3;
    scene.add(trunk);
    this._animMeshes.push(trunk);
    trunk._baseRotZ = trunk.rotation.z;

    // Foglie
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e8b3e, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 4), leafMat);
      const angle = (i / 6) * Math.PI * 2;
      leaf.position.set(x + Math.cos(angle) * 0.6, 2.7, z + Math.sin(angle) * 0.6);
      leaf.rotation.z = Math.cos(angle) * 0.6;
      leaf.rotation.x = Math.sin(angle) * 0.6;
      scene.add(leaf);
    }
  }

  /* ── BARILE ── */
  _addBarrel(scene, x, z) {
    const mat  = new THREE.MeshLambertMaterial({ color: 0x6b3a1f });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.55, 10), mat);
    body.position.set(x, 0.28, z);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 8, 12),
      new THREE.MeshLambertMaterial({ color: 0x555 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.28, z);
    scene.add(body, ring);
  }

  /* ── PIRATA NPC ── */
  _addPirate(scene, x, z) {
    const npc = new THREE.Group();
    const skin  = new THREE.MeshLambertMaterial({ color: 0xd4956a });
    const coat  = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const pants = new THREE.MeshLambertMaterial({ color: 0x2a2a4a });
    const hat   = new THREE.MeshLambertMaterial({ color: 0x1a0a00 });

    // Corpo seduto (torso inclinato)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.22), coat);
    torso.position.y = 0.82;
    torso.rotation.x = 0.25;

    const head  = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.26), skin);
    head.position.y = 1.15;

    // Barba bianca
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
    beard.position.set(0, 1.04, 0.12);

    const brim  = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), hat);
    brim.position.y = 1.3;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 8), hat);
    crown.position.y = 1.42;

    // Gambe sedute
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2a4a });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), legMat);
    legL.position.set(-0.1, 0.6, 0.3);
    legL.rotation.x = -1.2;
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), legMat);
    legR.position.set(0.1, 0.6, 0.3);
    legR.rotation.x = -1.2;

    npc.add(torso, head, beard, brim, crown, legL, legR);
    npc.position.set(x, 0.3, z);
    npc.rotation.y = 0.4;
    scene.add(npc);

    // Collider click
    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.4, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(x, 0.7, z);
    scene.add(collider);

    this.objects.push({
      mesh: collider,
      label: '💬 Parla con il Pirata',
      onClickWalk: { x, z: z + 1.2 },
      onArrive: () => this.game.dialogSystem.start('pirate', this.game.dialogs.pirate)
    });
  }

  /* ── MUCCHIO DI SABBIA ── */
  _addSandMound(scene, x, z) {
    const mat  = new THREE.MeshLambertMaterial({ color: 0xd4b57a });
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), mat);
    mound.scale.y = 0.45;
    mound.position.set(x, 0.1, z);
    scene.add(mound);

    // Segno X
    const xMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const xa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05), xMat);
    xa.rotation.y = Math.PI / 4;
    xa.position.set(x, 0.22, z);
    const xb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05), xMat);
    xb.rotation.y = -Math.PI / 4;
    xb.position.set(x, 0.22, z);
    scene.add(xa, xb);

    // Collider
    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.9),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(x, 0.2, z);
    scene.add(collider);
    this._sandCollider = collider;
    this._sandMeshes = [mound, xa, xb, collider];

    this.objects.push({
      mesh: collider,
      label: '👀 Esamina mucchio di sabbia',
      onClickWalk: { x, z: z + 0.8 },
      onArrive: () => this._pickUpKey()
    });

    return mound;
  }

  _pickUpKey() {
    if (this._keyPickedUp) return;
    this._keyPickedUp = true;
    // Rimuovi oggetti dalla scena
    this._sandMeshes.forEach(m => this._scene.remove(m));
    // Rimuovi dall'array objects
    this.objects = this.objects.filter(o => o.mesh !== this._sandCollider);
    this.game.inventory.add(this.game.items.KEY);
    this.game.showNotification('🗝️ Hai trovato la Chiave Arrugginita!');
  }

  /* ── NUVOLA ── */
  _makeCloud(scene) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffeedd, transparent: true, opacity: 0.85 });
    [[0,0,0,1.0],[0.6,0.1,0,0.75],[-0.6,0,0,0.75],[0.3,0.3,0,0.65]].forEach(([x,y,z,r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
      s.position.set(x, y, z);
      g.add(s);
    });
    scene.add(g);
    return g;
  }

  /* ── ZONA DI TRANSIZIONE DESTRA → Taverna ── */
  getTransitionRight() { return 7.2; }   // se player.x > questo → vai in taverna

  update(delta) {
    const t = performance.now() * 0.001;
    // Acqua ondeggiante
    const pos = this._water.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setZ(i, Math.sin(x * 0.8 + t * 1.2) * 0.08 + Math.cos(z * 0.5 + t) * 0.05);
    }
    pos.needsUpdate = true;

    // Nuvole che si spostano
    this._clouds.forEach((c, i) => {
      c.position.x += 0.3 * delta;
      if (c.position.x > 12) c.position.x = -12;
    });
  }

  dispose(scene) {
    // Three.js: basta rimuovere tutto dalla scena — gestiamo con scene.clear() nel Game
  }
}
