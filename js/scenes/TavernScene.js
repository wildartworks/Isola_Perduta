// ============================================================
//  TavernScene.js — Scena Taverna
// ============================================================
import * as THREE from 'three';

export class TavernScene {
  constructor(game) {
    this.game    = game;
    this.objects = [];
    this._traded = false;
  }

  build(scene, player) {
    this._scene  = scene;
    this._player = player;

    /* ── SFONDO CALDO ── */
    this.game.renderer.setClearColor(0x1a0e05, 1);

    /* ── PAVIMENTO LEGNO ── */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 10),
      new THREE.MeshLambertMaterial({ color: 0x7a4f1e })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Assi del parquet
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x6b4014 });
    for (let i = -8; i < 9; i += 1.2) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 10), plankMat);
      plank.position.set(i, 0.006, 0);
      scene.add(plank);
    }

    /* ── PARETI ── */
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x4a2c0e, side: THREE.DoubleSide });
    // Parete posteriore
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), wallMat);
    backWall.position.set(0, 3, -4.8);
    scene.add(backWall);
    // Pareti laterali
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-8.5, 3, 0);
    scene.add(wallL);
    const wallR = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.set(8.5, 3, 0);
    scene.add(wallR);

    /* ── SOFFITTO TRAVI ── */
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x3a1c06 });
    for (let i = -4; i <= 4; i += 4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.18, 0.28), beamMat);
      beam.position.set(0, 5.8, i);
      scene.add(beam);
    }

    /* ── BANCONE ── */
    this._addCounter(scene);

    /* ── TAVOLI E SEDIE ── */
    [[-3, 1.5], [2.5, 1.8]].forEach(([x, z]) => this._addTable(scene, x, z));

    /* ── LANTERNE ── */
    [[-5, 4, -4], [5, 4, -4], [0, 4, -4]].forEach(([x, y, z]) => this._addLantern(scene, x, y, z));

    /* ── BOTTIGLIE SU SCAFFALE ── */
    this._addShelf(scene);

    /* ── BARISTA NPC ── */
    this._addBarkeep(scene);

    /* ── PIANO CALPESTABILE ── */
    this._floor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this._floor.rotation.x = -Math.PI / 2;
    this._floor.position.set(0, 0.01, 0.5);
    scene.add(this._floor);
    this.floorMesh = this._floor;

    player.setBounds(7, 3.5);
  }

  _addCounter(scene) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x5c3210 });
    const top = new THREE.MeshLambertMaterial({ color: 0x7a4520 });
    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 1.1, 1.0), mat);
    base.position.set(0, 0.55, -3.2);
    // Piano
    const counter = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 1.1), top);
    counter.position.set(0, 1.12, -3.2);
    scene.add(base, counter);
  }

  _addTable(scene, x, z) {
    const wood = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    const top  = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 10), wood);
    top.position.set(x, 0.78, z);
    const leg  = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 7), wood);
    leg.position.set(x, 0.39, z);
    scene.add(top, leg);
    // 2 sedie
    [-0.85, 0.85].forEach(dx => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), wood);
      seat.position.set(x + dx, 0.5, z);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.06), wood);
      back.position.set(x + dx, 0.78, z - 0.2);
      scene.add(seat, back);
    });
  }

  _addLantern(scene, x, y, z) {
    const mat  = new THREE.MeshLambertMaterial({ color: 0xcc8800, emissive: 0x663300, emissiveIntensity: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.22), mat);
    body.position.set(x, y, z);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), new THREE.MeshLambertMaterial({ color: 0x444 }));
    chain.position.set(x, y + 0.45, z);
    scene.add(body, chain);

    // Luce puntiforme
    const light = new THREE.PointLight(0xffaa33, 1.2, 6, 1.5);
    light.position.set(x, y - 0.2, z);
    scene.add(light);
  }

  _addShelf(scene) {
    const wood = new THREE.MeshLambertMaterial({ color: 0x5c3210 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 0.4), wood);
    shelf.position.set(0, 2.8, -4.6);
    scene.add(shelf);
    // Bottiglie
    const colors = [0x1a6b2f, 0x8B0000, 0xcc8800, 0x1a3f6b];
    for (let i = 0; i < 7; i++) {
      const col = colors[i % colors.length];
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.38, 7),
        new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.85 })
      );
      bottle.position.set(-2.2 + i * 0.7, 3.04, -4.6);
      scene.add(bottle);
      // Collo bottiglia
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.06, 0.14, 7),
        new THREE.MeshLambertMaterial({ color: col })
      );
      neck.position.set(-2.2 + i * 0.7, 3.28, -4.6);
      scene.add(neck);
    }
  }

  _addBarkeep(scene) {
    const npc   = new THREE.Group();
    const skin  = new THREE.MeshLambertMaterial({ color: 0xd4956a });
    const apron = new THREE.MeshLambertMaterial({ color: 0xfaf0dc });
    const shirt = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.24), shirt);
    torso.position.y = 0.78;
    const apronMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.04), apron);
    apronMesh.position.set(0, 0.72, 0.14);
    const head  = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.28), skin);
    head.position.y = 1.18;
    // Baffi
    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), new THREE.MeshLambertMaterial({ color: 0x333 }));
    mustache.position.set(0, 1.08, 0.15);
    // Cappello da cuoco
    const chefBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 10), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    chefBase.position.y = 1.35;
    const chefTop = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.25, 10), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    chefTop.position.y = 1.5;

    npc.add(torso, apronMesh, head, mustache, chefBase, chefTop);
    npc.position.set(0, 0, -2.8);
    npc.rotation.y = Math.PI;
    scene.add(npc);

    // Collider click (davanti al bancone)
    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.8, 1.0),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(0, 0.9, -2.8);
    scene.add(collider);

    this.objects.push({
      mesh: collider,
      label: '💬 Parla con il Barista',
      onClickWalk: { x: 0, z: -1.5 },
      onArrive: () => this.game.dialogSystem.start('barkeep', this.game.dialogs.barkeep)
    });
  }

  getTransitionLeft()  { return -7.2; }   // → Beach
  getTransitionRight() { return  7.2; }   // → Jungle

  update(delta) {}
  dispose(scene) {}
}
