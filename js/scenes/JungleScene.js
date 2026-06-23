// ============================================================
//  JungleScene.js — Scena Giungla + Grotta del Tesoro
// ============================================================
import * as THREE from 'three';

export class JungleScene {
  constructor(game) {
    this.game    = game;
    this.objects = [];
    this._rootsCut = false;
  }

  build(scene, player) {
    this._scene  = scene;
    this._player = player;

    /* ── CIELO GIUNGLA ── */
    this.game.renderer.setClearColor(0x0d1f0d, 1);

    /* ── TERRENO ── */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 12),
      new THREE.MeshLambertMaterial({ color: 0x2d5a1b })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ── NEBBIA LEGGERA ── */
    scene.fog = new THREE.Fog(0x0d1f0d, 12, 25);

    /* ── ALBERI GIUNGLA ── */
    const treePositions = [
      [-7, -4], [-5.5, -3.5], [-4, -4.2], [-6, -2],
      [4.5, -4], [6, -3.5], [7, -2.5], [5, -2],
      [-3, -4.5], [3, -4.5], [-1, -4.8], [1, -4.6],
      [-7.5, 1], [7.5, 0.5], [-7, 3], [7, 3]
    ];
    treePositions.forEach(([x, z]) => this._addTree(scene, x, z));

    /* ── CESPUGLI ── */
    for (let i = 0; i < 12; i++) {
      const bx = (Math.random() - 0.5) * 14;
      const bz = -2 - Math.random() * 2.5;
      this._addBush(scene, bx, bz);
    }

    /* ── GROTTA ── */
    this._addCave(scene);

    /* ── RADICI CHE BLOCCANO L'ENTRATA ── */
    if (!this._rootsCut) this._addRoots(scene);

    /* ── LUCCIOLE PARTICELLE ── */
    this._fireflies = this._createFireflies(scene);

    /* ── LUNA ── */
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xeeeebb })
    );
    moon.position.set(-4, 7, -9);
    scene.add(moon);

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

  _addTree(scene, x, z) {
    const h = 2.5 + Math.random() * 1.5;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, h, 7),
      new THREE.MeshLambertMaterial({ color: 0x4a2c0e })
    );
    trunk.position.set(x, h / 2, z);
    scene.add(trunk);

    const leafMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.3, 0.7, 0.15 + Math.random() * 0.1)
    });
    [[0, 0.5, 1.1], [0.4, 0.2, 0.9], [-0.4, 0.3, 0.9], [0, -0.1, 0.8]].forEach(([lx, ly, r]) => {
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), leafMat);
      leaves.position.set(x + lx, h + ly, z);
      scene.add(leaves);
    });
  }

  _addBush(scene, x, z) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x1a4a0a });
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 6), mat);
    bush.scale.y = 0.65;
    bush.position.set(x, 0.22, z);
    scene.add(bush);
  }

  _addCave(scene) {
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    // Roccia sinistra
    const rockL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 1.0), rockMat);
    rockL.position.set(-1.3, 1.4, -3.8);
    scene.add(rockL);
    // Roccia destra
    const rockR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 1.0), rockMat);
    rockR.position.set(1.3, 1.4, -3.8);
    scene.add(rockR);
    // Arco superiore
    const arch = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 1.0), rockMat);
    arch.position.set(0, 2.9, -3.8);
    scene.add(arch);
    // Oscurità interna
    const dark = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 0.1), darkMat);
    dark.position.set(0, 1.2, -3.75);
    scene.add(dark);

    // Dettagli roccia
    const details = [[-0.6, 3.6, -3.8], [0.5, 3.2, -3.8], [-1.8, 1.0, -3.4], [1.8, 0.8, -3.4]];
    details.forEach(([x, y, z]) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 7, 6), rockMat);
      d.position.set(x, y, z);
      scene.add(d);
    });

    // Glow azzurro dalla grotta
    this._caveGlow = new THREE.PointLight(0x4488ff, 0, 5, 2);
    this._caveGlow.position.set(0, 1.0, -3.5);
    scene.add(this._caveGlow);

    // Collider porta grotta
    this._caveCollider = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.5, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this._caveCollider.position.set(0, 1.2, -3.5);
    scene.add(this._caveCollider);
  }

  _addRoots(scene) {
    this._rootMeshes = [];
    const rootMat = new THREE.MeshLambertMaterial({ color: 0x5a3810 });
    const rootPositions = [
      [0, 0.5, -3.6, 0.6, 0.1, 0.1, 0],
      [-0.5, 1.0, -3.6, 0.4, 0.1, 0.1, 0.4],
      [0.5, 1.2, -3.6, 0.4, 0.1, 0.1, -0.4],
      [0, 1.5, -3.6, 1.5, 0.1, 0.1, 0],
      [-0.3, 0.8, -3.6, 0.1, 1.2, 0.1, 0],
      [0.4, 0.7, -3.6, 0.1, 1.0, 0.1, 0]
    ];

    rootPositions.forEach(([x, y, z, w, h, d, rz]) => {
      const root = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rootMat);
      root.position.set(x, y, z);
      root.rotation.z = rz;
      scene.add(root);
      this._rootMeshes.push(root);
    });

    this.objects.push({
      mesh: this._caveCollider,
      label: this.game.inventory.has('axe')
        ? '🪓 Usa ascia sulle radici'
        : '🔒 Radici bloccano l\'entrata',
      onClickWalk: { x: 0, z: -2.2 },
      onArrive: () => this._tryOpenCave()
    });
  }

  _tryOpenCave() {
    if (this._rootsCut) return;

    if (this.game.inventory.has('axe')) {
      // Taglia le radici!
      this._rootMeshes.forEach(m => {
        this._scene.remove(m);
      });
      this._rootsCut = true;
      this._rootMeshes = [];

      // Glow cresce
      this._caveGlow.intensity = 1.5;

      // Rimuovi oggetto vecchio e aggiungi entrata
      this.objects = this.objects.filter(o => o.mesh !== this._caveCollider);
      this.objects.push({
        mesh: this._caveCollider,
        label: '🏆 Entra nella grotta!',
        onClickWalk: { x: 0, z: -2.5 },
        onArrive: () => this.game.win()
      });
      this.game.showNotification('🪓 Hai tagliato le radici! La grotta è aperta!');
    } else {
      this.game.showNotification('🔒 Radici enormi bloccano l\'entrata. Ti serve un\'ascia!');
    }
  }

  _createFireflies(scene) {
    const count = 60;
    const geo   = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = 0.3 + Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaaff66, size: 0.08, transparent: true, opacity: 0.9 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    this._ffGeo = geo;
    this._ffInitPos = positions.slice();
    return pts;
  }

  getTransitionLeft() { return -7.2; }  // → Taverna

  update(delta) {
    const t = performance.now() * 0.001;

    // Lucciole oscillanti
    if (this._ffGeo) {
      const pos = this._ffGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setX(i, this._ffInitPos[i * 3]     + Math.sin(t * 0.8 + i) * 0.15);
        pos.setY(i, this._ffInitPos[i * 3 + 1] + Math.sin(t * 1.2 + i * 0.7) * 0.2);
        pos.setZ(i, this._ffInitPos[i * 3 + 2] + Math.cos(t * 0.6 + i * 0.5) * 0.1);
      }
      pos.needsUpdate = true;
      // Flicker opacità
      this._fireflies.material.opacity = 0.6 + Math.sin(t * 3) * 0.4;
    }

    // Glow grotta pulsante (se aperta)
    if (this._rootsCut && this._caveGlow) {
      this._caveGlow.intensity = 1.2 + Math.sin(t * 2) * 0.5;
    }
  }

  dispose(scene) {
    scene.fog = null;
  }
}
