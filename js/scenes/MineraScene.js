// ============================================================
// ISLA PERDIDA — Livello 4: La Miniera del Sole Nero
// ============================================================
// Palette: nero assoluto, grigio cenere, riflessi viola, bagliori azzurri.
// Meccanica Dimenticanza: il tempo trascorso (this.timeInMine) corrompe
// lentamente l'interfaccia e i nomi degli oggetti in inventario.
// Enigma principale: il Mercante senza Volto (Obren) che cambia aspetto.
// ============================================================

class MineraScene {

  // ────────────────────────────────────────────────────────────────────────────
  constructor(g) {
    this.g    = g;
    this.objs = [];      // clickables registrati
    this.time = 0;       // tempo globale (animazioni)
    this.npcs = [];      // NPC per collision/walk

    // ── Stato dimenticanza ──
    this.timeInMine          = 0;    // secondi in miniera
    this.forgetTimer         = 0;    // timer 30s tra un effetto e l'altro
    this.forgetPhase         = 0;    // 0 = normale, 1 = nomi corrotti, 2 = scena rinominata
    this.fogDensityTimer     = 0;    // ogni 5s altera la densità della nebbia

    // ── Enigma Obren ──
    this.obrenVisitCount     = 0;
    this.obrenColorIndex     = 0;
    this.obrenColors         = [0x8B0000, 0x00008B, 0x006400, 0x4B0082, 0x8B4513];
    this.obrenMesh           = null; // gruppo THREE.js del mercante
    this.obrenBodyMesh       = null; // mesh corpo (per cambio colore)

    // ── Passaggio segreto ──
    this.secretWallMesh      = null;   // il muro che scompare
    this.passaggioSegretoObj = null;   // il clickable "Passaggio Segreto"

    // ── Luci animate ──
    this.cristalloLights     = [];  // { light, phase, baseIntensity }
    this.lanternLights       = [];  // { light, flickerOffset }
    this.wallMats            = [];  // materiali pareti per pulse emissive

    // ── Oggetti di scena animati ──
    this.polvereTimer        = 0;  // nebbia polvere
  }

  // ────────────────────────────────────────────────────────────────────────────
  addClickable(mesh, label, walkTarget, action, opts = {}) {
    const objDef = { mesh, label, walkTarget, action, ...opts };
    this.objs.push(objDef);
    mesh.traverse(child => {
      if (child.isMesh) child.userData.parentObj = objDef;
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  build() {
    const g     = this.g;
    const scene = g.scene;

    // ── NEBBIA E SFONDO ──
    scene.fog = new THREE.FogExp2(0x050508, 0.08);
    scene.background = new THREE.Color(0x030305);

    // ── LUCI PRINCIPALI ──
    // Luce ambientale quasi buia, dominante viola
    scene.add(new THREE.AmbientLight(0x110011, 0.3));

    // Luce direzionale debolissima (simula bagliori lontani)
    const ghostLight = new THREE.DirectionalLight(0x220033, 0.15);
    ghostLight.position.set(-5, 8, 3);
    scene.add(ghostLight);

    // ── STRUTTURA PRINCIPALE ──
    this._buildTunnel(scene);
    this._buildColumns(scene);
    this._buildRails(scene);
    this._buildCristalli(scene);
    this._buildLanterns(scene);

    // ── OGGETTI INTERATTIVI ──
    this._buildItems(scene, g);

    // ── NPC: OBREN ──
    this._buildObren(scene, g);

    // ── PASSAGGIO SEGRETO ──
    this._buildPassaggioSegreto(scene, g);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── TUNNEL: pavimento, soffitto, pareti ──
  _buildTunnel(scene) {
    // Pavimento
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Pavimento Miniera';
    scene.add(floor);

    // Soffitto basso (y=4)
    const ceilMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4;
    ceil.name = 'Soffitto Miniera';
    scene.add(ceil);

    // Pareti laterali — 4 lati, colore quasi nero
    const wallBaseMat = new THREE.MeshLambertMaterial({
      color:    0x0d0d0d,
      emissive: new THREE.Color(0x050009),
      emissiveIntensity: 0.4
    });
    this.wallMats.push(wallBaseMat);

    const wallDefs = [
      // [larg, alt, prof, x, y, z,   rotY]
      [40, 5, 0.5,   0,    2.5,  -20,  0],         // parete posteriore
      [40, 5, 0.5,   0,    2.5,   20,  Math.PI],   // parete anteriore
      [0.5, 5, 40,  -20,  2.5,    0,  Math.PI / 2],// parete sinistra
      [0.5, 5, 40,   20,  2.5,    0, -Math.PI / 2],// parete destra
    ];

    wallDefs.forEach(([w, h, d, x, y, z, ry]) => {
      const mat = wallBaseMat.clone();
      this.wallMats.push(mat);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      wall.position.set(x, y, z);
      wall.rotation.y = ry;
      wall.name = 'Parete Miniera';
      scene.add(wall);
    });

    // Stalattiti a soffitto — cilindretti irregolari
    const stalMat = new THREE.MeshLambertMaterial({ color: 0x0a0a12 });
    const stalPositions = [
      [-6, 4, -8], [3, 4, -5], [-2, 4, 0], [7, 4, 3],
      [-9, 4, 4], [1, 4, 8], [-4, 4, 11], [6, 4, -12],
      [-7, 4, -14], [4, 4, 14], [-1, 4, -16], [8, 4, 7],
    ];
    stalPositions.forEach(([x, y, z]) => {
      const h  = 0.4 + Math.random() * 0.8;
      const st = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04 + Math.random() * 0.08, 0.01, h, 5),
        stalMat
      );
      st.position.set(x, y - h / 2, z);
      scene.add(st);
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── 8 COLONNE DI SUPPORTO (legno marcio) ──
  _buildColumns(scene) {
    const colMat = new THREE.MeshLambertMaterial({ color: 0x2d1a0a });
    const colPositions = [
      [-6, -5], [-6, 0], [-6, 6],
      [ 6, -5], [ 6, 0], [ 6, 6],
      [ 0, -10], [0, 11],
    ];
    colPositions.forEach(([x, z]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 4, 8),
        colMat
      );
      col.position.set(x, 2, z);
      col.name = 'Colonna Miniera';
      scene.add(col);

      // Traverse orizzontale (trave)
      const trv = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.2, 0.2),
        colMat
      );
      trv.position.set(x, 3.8, z);
      scene.add(trv);
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── BINARI DEFORMATI ──
  _buildRails(scene) {
    const railMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    // 2 binari paralleli lungo Z, a ±0.5 di X
    [-0.5, 0.5].forEach(xOff => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.08, 30),
        railMat
      );
      rail.position.set(xOff, 0.04, 0);
      // Lieve deformazione verticale per effetto "binario torto"
      rail.rotation.z = (Math.random() - 0.5) * 0.06;
      rail.rotation.x = (Math.random() - 0.5) * 0.03;
      rail.name = 'Binario Miniera';
      scene.add(rail);
    });

    // Traverse del binario
    const tieMat = new THREE.MeshLambertMaterial({ color: 0x1a0e04 });
    for (let z = -14; z <= 14; z += 1.2) {
      const tie = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.06, 0.25),
        tieMat
      );
      tie.position.set(0, 0.01, z);
      scene.add(tie);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── 6 CRISTALLI NERI (bevono la luce) ──
  _buildCristalli(scene) {
    const cristalloPositions = [
      [-8, 0,  -7], [ 9, 0, -4], [-3, 0, -12],
      [ 5, 0,   6], [-7, 0,  9], [ 8, 0,  13],
    ];

    cristalloPositions.forEach(([x, y, z], i) => {
      const grp = new THREE.Group();

      // Cristallo principale (cono esagonale)
      const cristMat = new THREE.MeshLambertMaterial({
        color:    0x0a0020,
        emissive: new THREE.Color(0x1a0050),
        emissiveIntensity: 1.0
      });
      const crist = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1.5, 6),
        cristMat
      );
      crist.position.y = 0.75;
      grp.add(crist);

      // Cristallini secondari attorno
      for (let s = 0; s < 3; s++) {
        const ang = (s / 3) * Math.PI * 2;
        const sc  = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.6, 6),
          cristMat.clone()
        );
        sc.position.set(Math.sin(ang) * 0.35, 0.3, Math.cos(ang) * 0.35);
        sc.rotation.z = (Math.random() - 0.5) * 0.5;
        grp.add(sc);
      }

      grp.position.set(x, y, z);
      grp.rotation.y = Math.random() * Math.PI * 2;
      grp.name = 'Cristallo Nero ' + i;
      scene.add(grp);

      // PointLight viola associata al cristallo — intensità oscillante in update()
      const baseIntensity = 0.3;
      const cLight = new THREE.PointLight(0x4400ff, baseIntensity, 3);
      cLight.position.set(x, 1.0, z);
      scene.add(cLight);
      this.cristalloLights.push({
        light:         cLight,
        phase:         (i / 6) * Math.PI * 2,  // fase diversa per ogni cristallo
        baseIntensity: baseIntensity
      });
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── 4 LANTERNE A MURO (flickering arancio) ──
  _buildLanterns(scene) {
    const lanternPositions = [
      [-9, 2.5, -6], [9, 2.5, -3],
      [-9, 2.5,  5], [9, 2.5,  8],
    ];

    lanternPositions.forEach(([x, y, z], i) => {
      // Corpo lanterna (cilindro piccolo)
      const bodyMat = new THREE.MeshLambertMaterial({
        color:    0x884400,
        emissive: new THREE.Color(0xff6600),
        emissiveIntensity: 1.5
      });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.08, 0.25, 6),
        bodyMat
      );
      body.position.set(x, y, z);
      body.name = 'Lanterna Miniera ' + i;
      scene.add(body);

      // Vetro traslucido giallo (esagono)
      const glassMat = new THREE.MeshLambertMaterial({
        color:       0xffcc44,
        emissive:    new THREE.Color(0xff8800),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity:     0.7
      });
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.07, 0.2, 6),
        glassMat
      );
      glass.position.set(x, y - 0.05, z);
      scene.add(glass);

      // Gancio / supporto a parete
      const hook = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.3, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x222222 })
      );
      hook.position.set(x, y + 0.28, z);
      scene.add(hook);

      // Luce associata
      const lLight = new THREE.PointLight(0xff8800, 0.5, 4);
      lLight.position.set(x, y - 0.2, z);
      scene.add(lLight);
      this.lanternLights.push({
        light:         lLight,
        flickerOffset: i * 1.37  // offset diverso per ogni lanterna
      });
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── OGGETTI CLICKABLE ──
  _buildItems(scene, g) {

    // ── 1. CASCO ROTTO ──
    {
      const grp = new THREE.Group();
      grp.name = 'Casco Rotto';

      const helmetMat = new THREE.MeshLambertMaterial({ color: 0x4a4030 });
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
        helmetMat
      );
      dome.position.y = 0.22;
      grp.add(dome);

      // Bordo inferiore
      const brim = new THREE.Mesh(
        new THREE.TorusGeometry(0.23, 0.035, 6, 16, Math.PI * 2),
        helmetMat
      );
      brim.rotation.x = Math.PI / 2;
      brim.position.y = 0.1;
      grp.add(brim);

      // Crepa / sfondatura sul lato destro
      const crackMat = new THREE.MeshLambertMaterial({ color: 0x1a1010 });
      const crack = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.18, 0.05),
        crackMat
      );
      crack.position.set(0.2, 0.22, 0);
      crack.rotation.z = 0.4;
      grp.add(crack);

      // Cinturino rotto
      const strapMat = new THREE.MeshLambertMaterial({ color: 0x3a2a10 });
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.12, 0.04),
        strapMat
      );
      strap.position.set(-0.18, 0.05, 0.1);
      strap.rotation.z = 0.3;
      grp.add(strap);

      grp.position.set(-3, 0.12, -8);
      grp.rotation.y = 0.6;
      scene.add(grp);

      this.addClickable(grp, 'Casco da Minatore Sfondato', { x: -2.5, z: -7.5 }, () => {
        if (!g.inv.has('casco_rotto')) {
          g.inv.add('casco_rotto');
          g.notify('⛑️ Casco da Minatore Sfondato raccolto. Il lato destro è completamente distrutto. Qualcosa lo ha colpito con forza brutale.');
          scene.remove(grp);
          this.objs = this.objs.filter(o => o.mesh !== grp);
        } else {
          g.notify('Il casco è già nel tuo zaino. La crepa ti guarda.');
        }
      });
    }

    // ── 2. CRISTALLO NERO INTERATTIVO (speciale — beve la luce) ──
    {
      const cristGrp = new THREE.Group();
      cristGrp.name = 'Cristallo Nero Gigante';

      const cristMat = new THREE.MeshLambertMaterial({
        color:    0x08001a,
        emissive: new THREE.Color(0x220066),
        emissiveIntensity: 0.8
      });
      const mainCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 2.2, 6),
        cristMat
      );
      mainCone.position.y = 1.1;
      cristGrp.add(mainCone);

      // Schegge laterali
      const shardMat = new THREE.MeshLambertMaterial({
        color:    0x0a0030,
        emissive: new THREE.Color(0x110044),
        emissiveIntensity: 0.5
      });
      [0, 1, 2, 3, 4].forEach(i => {
        const ang   = (i / 5) * Math.PI * 2;
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(0.15, 0.9, 5),
          shardMat
        );
        shard.position.set(Math.sin(ang) * 0.5, 0.45, Math.cos(ang) * 0.5);
        shard.rotation.z = 0.35;
        shard.rotation.y = -ang;
        cristGrp.add(shard);
      });

      cristGrp.position.set(4, 0, -9);
      scene.add(cristGrp);

      // Luce speciale che viene "assorbita" — intensità calante vicino al cristallo
      this.cristalloSpecialeLight = new THREE.PointLight(0x4400ff, 0.6, 5);
      this.cristalloSpecialeLight.position.set(4, 1.5, -9);
      scene.add(this.cristalloSpecialeLight);

      this.addClickable(cristGrp, 'Cristallo Nero (beve la luce)', { x: 3.5, z: -8.5 }, () => {
        g.notify('✦ Il cristallo assorbe attivamente la luce delle lanterne vicine. Guardarlo troppo a lungo dà una sensazione di vuoto allo stomaco.');
        // Effetto: le lanterne vicine calano intensità momentaneamente
        this.lanternLights.forEach(l => {
          const origIntensity = l.light.intensity;
          l.light.intensity = 0.05;
          setTimeout(() => { if (l.light) l.light.intensity = origIntensity; }, 1800);
        });
      });
    }

    // ── 3. DINAMITE UMIDA ──
    {
      const dynGrp = new THREE.Group();
      dynGrp.name = 'Dinamite Umida';

      const dynMat = new THREE.MeshLambertMaterial({ color: 0x8b1a1a });
      const paperMat = new THREE.MeshLambertMaterial({ color: 0xcc4444 });

      // 3 candelotti legati insieme
      [-0.08, 0, 0.08].forEach((xOff, i) => {
        const stick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.35, 8),
          dynMat
        );
        stick.position.set(xOff, 0.175, 0);
        dynGrp.add(stick);

        // Involucro carta rosso
        const wrap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8),
          paperMat
        );
        wrap.position.set(xOff, 0.35, 0);
        dynGrp.add(wrap);
      });

      // Miccia penzolante (bagnata e inutile)
      const fuseGrp = new THREE.Group();
      fuseGrp.position.set(0, 0.42, 0);
      const fuseMat = new THREE.MeshLambertMaterial({ color: 0x3a3a30 });
      const fuse = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.22, 5),
        fuseMat
      );
      fuse.position.y = -0.11;
      fuse.rotation.z = 0.45;
      fuseGrp.add(fuse);
      dynGrp.add(fuseGrp);

      // Macchie di umidità (sferette scure)
      const wetMat = new THREE.MeshLambertMaterial({ color: 0x1a0a00 });
      [[-0.07, 0.1, 0.07], [0.06, 0.22, -0.06]].forEach(([wx, wy, wz]) => {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 5), wetMat);
        spot.position.set(wx, wy, wz);
        dynGrp.add(spot);
      });

      dynGrp.position.set(7, 0.05, 2);
      dynGrp.rotation.y = -0.4;
      scene.add(dynGrp);

      this.addClickable(dynGrp, 'Dinamite Umida', { x: 6.5, z: 2.5 }, () => {
        if (!g.inv.has('dinamite_umida')) {
          g.inv.add('dinamite_umida');
          g.notify('💣 Dinamite Umida raccolta. I candelotti sono fradici — la miccia non si accenderà mai. Inutilizzabile... o forse no?');
          scene.remove(dynGrp);
          this.objs = this.objs.filter(o => o.mesh !== dynGrp);
        } else {
          g.notify('La dinamite umida è già nel tuo zaino. Gocciola.');
        }
      });
    }

    // ── 4. PAPPAGALLO CIECO ──
    {
      const pappGrp = new THREE.Group();
      pappGrp.name = 'Pappagallo Cieco';

      // Palo verticale
      const paleMat = new THREE.MeshLambertMaterial({ color: 0x5c3010 });
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 1.6, 7),
        paleMat
      );
      pole.position.y = 0.8;
      pappGrp.add(pole);

      // Piedistallo
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.1, 8),
        paleMat
      );
      base.position.y = 0.05;
      pappGrp.add(base);

      // Corpo pappagallo
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x117711 });
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.1, 0.2, 4, 8),
        bodyMat
      );
      body.position.y = 1.62;
      pappGrp.add(body);

      // Testa
      const headMat = new THREE.MeshLambertMaterial({ color: 0x228822 });
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        headMat
      );
      head.position.y = 1.9;
      pappGrp.add(head);

      // Becco
      const beakMat = new THREE.MeshLambertMaterial({ color: 0xdd8800 });
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.09, 5),
        beakMat
      );
      beak.position.set(0, 1.87, 0.09);
      beak.rotation.x = Math.PI / 2;
      pappGrp.add(beak);

      // Benda sugli occhi (un cilindro sottile che fascia la testa)
      const bandMat = new THREE.MeshLambertMaterial({ color: 0x220000 });
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.092, 0.092, 0.055, 8),
        bandMat
      );
      band.position.y = 1.895;
      band.rotation.x = Math.PI / 2;
      pappGrp.add(band);

      // Artigli
      const clawMat = new THREE.MeshLambertMaterial({ color: 0x3a2a10 });
      [-0.06, 0.06].forEach(xOff => {
        const claw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.005, 0.1, 5),
          clawMat
        );
        claw.position.set(xOff, 1.48, 0);
        claw.rotation.z = xOff > 0 ? 0.4 : -0.4;
        pappGrp.add(claw);
      });

      // Cresta
      const crestMat = new THREE.MeshLambertMaterial({ color: 0xff4400 });
      for (let c = 0; c < 3; c++) {
        const feather = new THREE.Mesh(
          new THREE.ConeGeometry(0.015, 0.07, 4),
          crestMat
        );
        feather.position.set((c - 1) * 0.03, 1.98, 0);
        pappGrp.add(feather);
      }

      pappGrp.position.set(-5, 0, 4);
      pappGrp.rotation.y = Math.PI / 3;
      scene.add(pappGrp);

      // Luce verde tenue sul pappagallo
      const pappLight = new THREE.PointLight(0x004400, 0.4, 2.5);
      pappLight.position.set(-5, 1.8, 4);
      scene.add(pappLight);

      this.addClickable(pappGrp, 'Pappagallo Cieco', { x: -4.5, z: 3.5 }, () => {
        g.startDialog('pappagallo_cieco', this._getPappDialogo());
      });

      this.npcs.push(pappGrp);
      pappGrp.userData.home       = pappGrp.position.clone();
      pappGrp.userData.walkTarget = pappGrp.position.clone();
      pappGrp.userData.isMoving   = false;
      pappGrp.userData.walkTimer  = 0;
      pappGrp.userData.range      = 0; // non si muove
    }

    // ── 5. CARRELLO MINERARIO ──
    {
      const cartGrp = new THREE.Group();
      cartGrp.name = 'Carrello Minerario';

      const cartMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const rustMat = new THREE.MeshLambertMaterial({ color: 0x5a2a10 });

      // Vasca principale
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.55, 0.55),
        cartMat
      );
      body.position.y = 0.5;
      cartGrp.add(body);

      // Bordi arrugginiti
      [[-0.45, 0.5, 0], [0.45, 0.5, 0], [0, 0.5, -0.275], [0, 0.5, 0.275]].forEach(([x, y, z]) => {
        const rim = new THREE.Mesh(
          new THREE.BoxGeometry(
            Math.abs(x) > 0 ? 0.06 : 0.9,
            0.6,
            Math.abs(z) > 0 ? 0.06 : 0.55
          ),
          rustMat
        );
        rim.position.set(x, y, z);
        cartGrp.add(rim);
      });

      // Ruote (4 dischi)
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.38, 0.22, 0.3], [0.38, 0.22, 0.3], [-0.38, 0.22, -0.3], [0.38, 0.22, -0.3]].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.07, 12),
          wheelMat
        );
        wheel.position.set(wx, wy, wz);
        wheel.rotation.x = Math.PI / 2;
        cartGrp.add(wheel);

        // Raggio ruota
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.32, 0.04),
          rustMat
        );
        spoke.position.set(wx, wy, wz);
        cartGrp.add(spoke);
      });

      // Contenuto: polvere/rocce nel carrello
      const rockMat = new THREE.MeshLambertMaterial({ color: 0x1a1a22 });
      [[-0.2, 0.82, -0.1], [0.15, 0.85, 0.08], [0, 0.8, 0.0]].forEach(([rx, ry, rz]) => {
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.08, 0),
          rockMat
        );
        rock.position.set(rx, ry, rz);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        cartGrp.add(rock);
      });

      cartGrp.position.set(1.5, 0, 5);
      cartGrp.rotation.y = 0.15;
      scene.add(cartGrp);

      // Luce soffusa sul carrello
      const cartLight = new THREE.PointLight(0x331100, 0.3, 3);
      cartLight.position.set(1.5, 1.5, 5);
      scene.add(cartLight);

      this.addClickable(cartGrp, 'Carrello Minerario', { x: 0.8, z: 5 }, () => {
        g.startDialog('carrello_minerario', this._getCarrelloDialogo());
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── NPC: OBREN — Il Mercante senza Volto ──
  _buildObren(scene, g) {
    const grp = new THREE.Group();
    grp.name = 'Obren — Il Mercante senza Volto';

    // Corpo (colore iniziale: rosso scuro 0x8B0000)
    const bodyMat = new THREE.MeshLambertMaterial({
      color:    this.obrenColors[0],
      emissive: new THREE.Color(0x220000),
      emissiveIntensity: 0.6
    });
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 0.9, 4, 8),
      bodyMat
    );
    body.position.y = 0.2;
    grp.add(body);
    this.obrenBodyMesh = body;

    // Testa (senza volto — sfera nera lucida)
    const headMat = new THREE.MeshLambertMaterial({
      color:    0x080808,
      emissive: new THREE.Color(0x110022),
      emissiveIntensity: 0.9
    });
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      headMat
    );
    head.position.y = 0.95;
    grp.add(head);

    // Cappello a cilindro logoro
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10),
      hatMat
    );
    hatBrim.position.y = 1.17;
    grp.add(hatBrim);
    const hatTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.22, 0.35, 10),
      hatMat
    );
    hatTop.position.y = 1.36;
    grp.add(hatTop);

    // Mantello (cono trasparente scuro)
    const cloakMat = new THREE.MeshLambertMaterial({
      color:       0x110011,
      transparent: true,
      opacity:     0.8,
      side:        THREE.DoubleSide
    });
    const cloak = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.2, 8, 1, true),
      cloakMat
    );
    cloak.position.y = 0.3;
    grp.add(cloak);

    // Luce viola attorno a Obren
    const obrenLight = new THREE.PointLight(0x6600aa, 0.8, 4);
    obrenLight.position.set(0, 1.2, 0);
    grp.add(obrenLight);
    this.obrenLight = obrenLight;

    // Particelle "nebbia identità" — sfere minuscole che ruotano attorno
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x440066 });
    this.obrenParticles = [];
    for (let p = 0; p < 8; p++) {
      const ang  = (p / 8) * Math.PI * 2;
      const part = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 4, 4),
        particleMat
      );
      part.position.set(Math.sin(ang) * 0.7, 0.8 + Math.random() * 0.5, Math.cos(ang) * 0.7);
      part.userData.baseAngle = ang;
      grp.add(part);
      this.obrenParticles.push(part);
    }

    grp.position.set(-2, 0.8, -6);
    grp.rotation.y = Math.PI * 0.4;
    scene.add(grp);
    this.obrenMesh = grp;

    // Registra come NPC
    grp.userData.home       = grp.position.clone();
    grp.userData.walkTarget = grp.position.clone();
    grp.userData.isMoving   = false;
    grp.userData.walkTimer  = 0;
    grp.userData.range      = 0.8;
    this.npcs.push(grp);

    this.addClickable(grp, '??? (Mercante senza Volto)', { x: -1.5, z: -5.5 }, () => {
      this._interagisciConObren(g);
    });
  }

  // Interazione con Obren — aggiorna colore, contatore visite, poi avvia dialogo
  _interagisciConObren(g) {
    this.obrenVisitCount++;
    this.obrenColorIndex = (this.obrenColorIndex + 1) % this.obrenColors.length;

    // Cambia colore del corpo
    if (this.obrenBodyMesh && this.obrenBodyMesh.material) {
      this.obrenBodyMesh.material.color.setHex(this.obrenColors[this.obrenColorIndex]);
      // Piccolo flash durante il cambio
      const origEmissive = this.obrenBodyMesh.material.emissive.getHex();
      this.obrenBodyMesh.material.emissive.setHex(0xffffff);
      setTimeout(() => {
        if (this.obrenBodyMesh && this.obrenBodyMesh.material) {
          this.obrenBodyMesh.material.emissive.setHex(origEmissive);
        }
      }, 120);
    }

    // Aggiorna etichetta clickable dopo 3 visite (compare l'opzione nome)
    const objDef = this.objs.find(o => o.mesh === this.obrenMesh);
    if (objDef && this.obrenVisitCount >= 3) {
      objDef.label = '??? — Il volto cambia ogni volta (3ª visita)';
    }

    g.startDialog('obren', this._getObrenDialogo(g));
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── PASSAGGIO SEGRETO (muro che scompare) ──
  _buildPassaggioSegreto(scene, g) {
    const wallMat = new THREE.MeshLambertMaterial({
      color:       0x0a0010,
      emissive:    new THREE.Color(0x050008),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity:     1.0
    });
    const secretWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 4, 0.4),
      wallMat
    );
    secretWall.position.set(-1, 2, -19.6);
    secretWall.name = 'Muro Segreto';
    scene.add(secretWall);
    this.secretWallMesh = secretWall;

    // Incisione sul muro — indizio visivo che c'è qualcosa
    const inscribeMat = new THREE.MeshLambertMaterial({
      color:    0x220044,
      emissive: new THREE.Color(0x110033),
      emissiveIntensity: 1.0
    });
    const inscribe = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.3),
      inscribeMat
    );
    inscribe.position.set(-1, 2.5, -19.4);
    inscribe.name = 'Incisione Muro';
    scene.add(inscribe);

    // Il passaggio segreto diventa clickable dopo che obren_svelato è attivo
    const passGrp = new THREE.Group();
    passGrp.name = 'Passaggio Segreto';
    passGrp.position.set(-1, 2, -19.6);
    scene.add(passGrp);

    const passObj = {
      mesh:       passGrp,
      label:      'Muro… senti un corrente d\'aria',
      walkTarget: { x: -1, z: -18 },
      action:     () => {
        if (g.flags.obren_svelato) {
          // Rivela il passaggio
          g.startDialog('vittoria_miniera', this._getVittoriaDialogo(g));
        } else {
          g.notify('Il muro è solido. C\'è un\'incisione illeggibile e una corrente d\'aria fredda che non ha fonte.');
        }
      }
    };
    this.objs.push(passObj);
    secretWall.traverse(child => {
      if (child.isMesh) child.userData.parentObj = passObj;
    });
    inscribe.traverse(child => {
      if (child.isMesh) child.userData.parentObj = passObj;
    });
    this.passaggioSegretoObj = passObj;
  }

  // Rivela il passaggio segreto (chiamato da OBREN_REVEALED)
  _rivelaMuro() {
    if (!this.secretWallMesh) return;
    // Animazione dissolvenza
    const mat = this.secretWallMesh.material;
    const fadeOut = () => {
      if (mat.opacity > 0.02) {
        mat.opacity -= 0.04;
        requestAnimationFrame(fadeOut);
      } else {
        mat.opacity = 0;
        mat.visible = false;
        this.g.scene.remove(this.secretWallMesh);
        this.secretWallMesh = null;
        // Aggiorna label
        if (this.passaggioSegretoObj) {
          this.passaggioSegretoObj.label = '🚪 Passaggio Segreto — Una grotta profonda si apre oltre';
        }
        // Luce azzurra appare dal fondo
        const depthLight = new THREE.PointLight(0x0088ff, 1.2, 8);
        depthLight.position.set(-1, 2, -21);
        this.g.scene.add(depthLight);
      }
    };
    fadeOut();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── DIALOGHI LOCALI ──

  _getObrenDialogo(g) {
    const hasVisited3 = this.obrenVisitCount >= 3;
    const isRevealed  = g.flags.obren_svelato;

    const baseChoices = [
      { text: 'Chi sei tu veramente?',          next: 'chi'    },
      { text: 'Cosa vendi in questo buco buio?', next: 'vende'  },
      { text: 'Devo andare prima di dimenticare le mie scarpe.', next: 'end' },
    ];

    if (hasVisited3 && !isRevealed) {
      baseChoices.splice(2, 0, {
        text: '✦ Il tuo vero nome è Obren.',
        next: 'obren_reveal'
      });
    }

    return [
      {
        id:      'start',
        speaker: '??? (Il Mercante Cangiante)',
        portrait:'👤',
        text:    'Benvenuto nella Miniera del Sole Nero... compro e vendo ciò che la gente dimentica. Io stesso ho dimenticato chi sono... o forse sono solo il dipendente del mese? Ha qualcosa da barattare... vero?',
        choices: baseChoices
      },
      {
        id:      'chi',
        speaker: '??? (Il Mercante Cangiante)',
        portrait:'👤',
        text:    'Sono chiunque tu abbia bisogno che io sia... vero? I nomi qui si perdono come chiavi nelle tasche bucate. Io cambio faccia e colore ogni volta che mi parli, così non mi annoio mai di me stesso.',
        choices: [
          { text: 'Mostrami cosa vendi.',       next: 'vende' },
          { text: 'Stai dicendo che non hai un\'identità?', next: 'tutti' }
        ]
      },
      {
        id:      'tutti',
        speaker: '??? (Il Mercante Cangiante)',
        portrait:'👤',
        text:    'L\'identità è sopravvalutata... vero? Guarda questo cristallo nero, beve la luce e anche i ricordi. Se rimani qui abbastanza a lungo, scambierai la tua storia per un casco rotto. Io colleziono i pezzi persi.',
        choices: [
          { text: 'Cosa vendi?', next: 'vende' }
        ]
      },
      {
        id:      'vende',
        speaker: '??? (Il Mercante Cangiante)',
        portrait:'👤',
        text:    'Vendo frammenti di ricordi altrui. E compro nomi usati. È un mercato stabile... vero? Spesso la gente mi paga con il proprio nome pur di avere un po\' di pane duro o una dinamite umida. Ho un ottimo archivio.',
        choices: [
          { text: 'Che tipo di nomi hai in archivio?', next: 'compratori' },
          { text: 'Devo andare.',          next: 'end'        }
        ]
      },
      {
        id:      'compratori',
        speaker: '??? (Il Mercante Cangiante)',
        portrait:'👤',
        text:    'Oh, roba di prima scelta! Ho un bellissimo "Obren" in magazzino. Era il nome di un minatore che ha preferito scambiarlo con una licenza di pesca nel passato. È un nome robusto, ma non riesco a ricordarmelo... vero?',
        choices: [
          { text: 'Interessante. Vado a fare un giro.', next: 'end' }
        ]
      },
      {
        id:      'obren_reveal',
        speaker: 'Obren (Il Mercante Ritrovato)',
        portrait: '🎭',
        text:    'Obren... Obren! Per tutti i carrelli arrugginiti, le sillabe si incastrano perfettamente! Sento il mio vero io che pulsa sotto il mantello! Hai sbloccato qualcosa in me che credevo perduto per sempre. Prendi questa chiave del passaggio a nord, te la sei meritata. E ti prego, scriviti il mio nome su una mano così non lo dimentico di nuovo!',
        choices: [],
        action:  'OBREN_REVEALED',
        giveItem:'chiave_miniera',
        giveFlag:'obren_svelato'
      },
    ];
  }

  _getPappDialogo() {
    return [
      {
        id:      'start',
        speaker: 'Pappagallo Cieco',
        portrait:'🦜',
        text:    '«Craaak! Chi è là? Sento puzza di ricordi freschi! ... O-B... O-B-R... Craaak! ... Non guardare i cristalli! Ti bevono il nome e ti lasciano solo i debiti!»',
        choices: [
          { text: 'Togli la benda dagli occhi.',          next: 'benda'  },
          { text: 'Dimmi di più sul passaggio a nord.',    next: 'nord'   },
          { text: 'Shh, riposati.',           next: 'end'    }
        ]
      },
      {
        id:      'benda',
        speaker: 'Pappagallo Cieco',
        portrait:'🦜',
        text:    '«NO! Giù le mani! La benda mi protegge! La luce dei cristalli mangia le pupille e sputa l\'oblio! Nessuno vuole vedere cosa c\'è dietro il muro segreto... Craaak!»',
        choices: [
          { text: 'Parlami del passaggio a nord.', next: 'nord' },
          { text: 'Va bene, scusa.',        next: 'end'  }
        ]
      },
      {
        id:      'nord',
        speaker: 'Pappagallo Cieco',
        portrait:'🦜',
        text:    '«Il passaggio è a nord... soffia freddo... ma il muro è sordo! Si apre solo se chiami il Mercante col suo vero nome. Lui lo ha venduto all\'isola per tre monete di rame! O-B... O-B-R... Craaak!»',
        choices: [
          { text: 'Chi ha comprato il suo nome?', next: 'chi_compra' },
          { text: 'Grazie delle informazioni.',         next: 'end'         }
        ]
      },
      {
        id:      'chi_compra',
        speaker: 'Pappagallo Cieco',
        portrait:'🦜',
        text:    '«L\'isola! L\'isola compra tutto! E il Mercante cangiante si tiene i resti. Finisce per "-EN", come il vento che soffia nelle gallerie! O-B-R... e poi "-EN"... Craaak!»',
        choices: [
          { text: 'Capito. O-B-R-...-E-N.', next: 'end' }
        ]
      },
    ];
  }

  _getCarrelloDialogo() {
    const g = this.g;
    return [
      {
        id:      'start',
        speaker: 'Carrello Minerario',
        portrait:'🛒',
        text:    'Un vecchio carrello da miniera arrugginito. È colmo di pietre scure e polvere viola brillante. Le ruote sembrano inchiodate dal tempo, ma sotto lo strato di ghiaia noti qualcosa.',
        choices: [
          { text: 'Ruvida la ghiaia per cercare oggetti.',      next: 'ispeziona' },
          { text: 'Spingi il carrello lungo i binari.',          next: 'spingi'    },
          { text: 'Lascialo stare al suo destino.',              next: 'end'       }
        ]
      },
      {
        id:      'ispeziona',
        speaker: 'Carrello Minerario',
        portrait:'🛒',
        text:    'Sotto una pietra tagliente trovi un taccuino logoro con la copertina di cuoio muffito. C\'è un\'incisione: "Per non dimenticare".',
        choices: [
          { text: 'Prendi il taccuino.',   next: 'taccuino', requireFlag: '!preso_taccuino' },
          { text: 'Lascia perdere.',       next: 'end'       }
        ]
      },
      {
        id:      'taccuino',
        speaker: 'Carrello Minerario',
        portrait:'🛒',
        text:    'Hai preso il Taccuino del Minatore. L\'ultima pagina dice: «Il Mercante senza Volto cambia colore ad ogni chiacchierata. Ha barattato il suo nome con l\'isola. Ho trovato un foglio con scritto O _ _ _ N... le tre lettere nel mezzo sono volate via. Chi le ricompone sbloccherà la sua chiave e aprirà il passaggio. — Un minatore smemorato.»',
        choices: [],
        giveItem: 'taccuino_minatore',
        giveFlag: 'preso_taccuino'
      },
      {
        id:      'spingi',
        speaker: 'Carrello Minerario',
        portrait:'🛒',
        text:    'Spingi con tutta la forza. Le ruote emettono un fischio metallico che ti fa tremare i denti. Il carrello si sposta di dieci centimetri rivelando un cassetto segreto sul fondo.',
        choices: [
          { text: 'Guarda nel cassetto.',  next: 'ispeziona' },
          { text: 'Lascia stare.',      next: 'end'       }
        ]
      },
    ];
  }

  _getVittoriaDialogo(g) {
    return [
      {
        id:      'start',
        speaker: 'Il Passaggio',
        portrait:'🚪',
        text:    'Il muro si è dissolto. Oltre c\'è un corridoio che discende in spirale, illuminato da una luce azzurra fredda. L\'aria è diversa — fresca, non stantia. Come se portasse verso qualcosa di reale.',
        choices: [
          { text: 'Avanzare verso la luce.', next: 'avanza' },
          { text: 'Tornare indietro.',       next: 'end'    }
        ]
      },
      {
        id:      'avanza',
        speaker: 'Il Passaggio',
        portrait:'🚪',
        text:    'Scendi lungo il corridoio. I cristalli neri sulle pareti iniziano a cedere, si sgretolano in polvere viola. La miniera sta perdendo il suo potere. Hai restituito a Obren il suo nome — e in cambio, l\'isola ti lascia andare un passo più in là.',
        choices: [],
        action:  'LEVEL4_WIN'
      },
    ];
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── MECCANICA DIMENTICANZA ──
  _applicaEffettoDimenticanza() {
    const g = this.g;

    if (this.forgetPhase === 0) {
      // Fase 1: notifiche paranoiche
      const frasi = [
        'Come ti chiami?',
        'Perché sei qui?',
        'Ricordi il tuo nome?',
        'Qualcuno ti aspetta fuori?',
        'Sei sicura/o di essere arrivata/o da sola/o?',
        'Il cristallo ti ha già visto.',
        'Non ricordi più la direzione da cui sei venuta/o.',
      ];
      const frase = frasi[Math.floor(Math.random() * frasi.length)];
      g.notify('🪨 ' + frase);
      this.forgetPhase = 1;

    } else if (this.forgetPhase === 1) {
      // Fase 2: corruzione nomi inventario
      const itemKeys = Object.keys(GAME_DATA.items || {});
      itemKeys.forEach(key => {
        const item = GAME_DATA.items[key];
        if (item && item.nameCorrupt && g.inv.has(key)) {
          // Corruzione temporanea per 10 secondi
          const originalName = item.name;
          item.name = item.nameCorrupt;
          if (g.inv.render) g.inv.render();
          setTimeout(() => {
            if (item) {
              item.name = originalName;
              if (g.inv && g.inv.render) g.inv.render();
            }
          }, 10000);
        }
      });
      g.notify('🌀 I tuoi oggetti hanno perso i loro nomi per un momento.');
      this.forgetPhase = 2;

    } else if (this.forgetPhase === 2) {
      // Fase 3: rinomina la scena nell'HUD a "..."
      const snEl = document.getElementById('sn');
      if (snEl) {
        const originalText = snEl.textContent;
        snEl.textContent = '...';
        setTimeout(() => {
          if (snEl) snEl.textContent = originalText;
        }, 8000);
      }
      g.notify('💀 Non ricordi più dove sei.');
      this.forgetPhase = 0; // ricomincia il ciclo
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── Gestione azioni da dialogo (OBREN_REVEALED, LEVEL4_WIN) ──
  // Nota: il sistema di dialogo del gioco chiama g.handleAction(action),
  // ma qui gestiamo anche l'azione locale OBREN_REVEALED direttamente.
  _handleLocalAction(action) {
    if (action === 'OBREN_REVEALED') {
      this._rivelaMuro();
      this.g.notify('🗝️ Obren ti ha consegnato la Chiave della Miniera. Il muro si dissolve...');
    }
    if (action === 'LEVEL4_WIN') {
      this.g.handleAction('LEVEL4_WIN');
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ── UPDATE — Animazioni e meccaniche tempo-reale ──
  update(dt) {
    this.time       += dt;
    this.timeInMine += dt;

    // ── 1. CRISTALLI: intensità PointLight oscilla (sin wave) ──
    this.cristalloLights.forEach(({ light, phase, baseIntensity }) => {
      light.intensity = baseIntensity + Math.sin(this.time * 1.4 + phase) * (baseIntensity * 0.7);
    });

    // Cristallo speciale interattivo (beve la luce)
    if (this.cristalloSpecialeLight) {
      // Oscilla più lentamente e con ampiezza maggiore
      this.cristalloSpecialeLight.intensity =
        0.35 + Math.sin(this.time * 0.9) * 0.25;
    }

    // ── 2. LANTERNE: flickering irregolare ──
    this.lanternLights.forEach(({ light, flickerOffset }) => {
      const base    = 0.5;
      const flutter = Math.sin(this.time * 7.3 + flickerOffset) * 0.2
                    + Math.sin(this.time * 13.7 + flickerOffset * 2) * 0.1;
      const random  = (Math.random() - 0.5) * 0.08;
      light.intensity = Math.max(0.05, base + flutter + random);
    });

    // ── 3. PARETI: emissive pulse (sin molto lento) ──
    const wallPulse = 0.25 + Math.sin(this.time * 0.3) * 0.15;
    this.wallMats.forEach(mat => {
      if (mat.emissive) {
        mat.emissiveIntensity = wallPulse;
      }
    });

    // ── 4. OBREN: rotazione particelle, pulsazione luce ──
    if (this.obrenParticles && this.obrenParticles.length > 0) {
      this.obrenParticles.forEach((part, i) => {
        const ang = part.userData.baseAngle + this.time * 0.8;
        const radius = 0.65 + Math.sin(this.time * 2.1 + i) * 0.1;
        const yOff   = 0.85 + Math.sin(this.time * 1.3 + i * 0.7) * 0.2;
        part.position.set(Math.sin(ang) * radius, yOff, Math.cos(ang) * radius);
      });
    }
    if (this.obrenLight) {
      this.obrenLight.intensity = 0.7 + Math.sin(this.time * 2.0) * 0.3;
    }

    // ── 5. MECCANICA DIMENTICANZA: ogni 30s ──
    this.forgetTimer += dt;
    if (this.forgetTimer >= 30) {
      this.forgetTimer = 0;
      this._applicaEffettoDimenticanza();
    }

    // ── 6. POLVERE — variazione densità nebbia ogni 5s ──
    this.polvereTimer += dt;
    if (this.polvereTimer >= 5) {
      this.polvereTimer = 0;
      const g = this.g;
      if (g.scene && g.scene.fog) {
        const baseDensity = 0.08;
        const variation   = (Math.random() - 0.5) * 0.02;
        g.scene.fog.density = Math.max(0.04, Math.min(0.14, baseDensity + variation));
      }
    }

    // ── 7. MOVIMENTO NPC ──
    const pPos     = this.g.player ? this.g.player.grp.position : null;
    const isDialog = this.g.state === 'DIALOG';

    this.npcs.forEach(npc => {
      let stop = isDialog;
      if (pPos && npc.userData.range > 0) {
        const dToPlayer = Math.sqrt(
          Math.pow(npc.position.x - pPos.x, 2) +
          Math.pow(npc.position.z - pPos.z, 2)
        );
        if (dToPlayer < 2.5) {
          stop = true;
          const dx = pPos.x - npc.position.x;
          const dz = pPos.z - npc.position.z;
          npc.rotation.y = Math.atan2(dx, dz);
        }
      }

      if (stop || npc.userData.range === 0) {
        npc.userData.isMoving = false;
        npc.position.y = npc.userData.home.y;
        return;
      }

      npc.userData.walkTimer += dt;
      if (npc.userData.walkTimer > 4 + Math.random() * 4) {
        npc.userData.walkTimer = 0;
        if (npc.userData.isMoving) {
          npc.userData.isMoving = false;
        } else {
          npc.userData.isMoving = true;
          const range = npc.userData.range;
          npc.userData.walkTarget.set(
            npc.userData.home.x + (Math.random() - 0.5) * range * 2,
            npc.userData.home.y,
            npc.userData.home.z + (Math.random() - 0.5) * range * 2
          );
        }
      }

      if (npc.userData.isMoving) {
        const dx   = npc.userData.walkTarget.x - npc.position.x;
        const dz   = npc.userData.walkTarget.z - npc.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          const speed = 0.6;
          npc.position.x  += (dx / dist) * speed * dt;
          npc.position.z  += (dz / dist) * speed * dt;
          npc.rotation.y   = Math.atan2(dx, dz);
          npc.position.y   = npc.userData.home.y + Math.abs(Math.sin(this.time * 6)) * 0.06;
        } else {
          npc.userData.isMoving = false;
          npc.position.y = npc.userData.home.y;
        }
      } else {
        npc.position.y = npc.userData.home.y;
      }
    });
  }

} // ── fine classe MineraScene ──

// ────────────────────────────────────────────────────────────────────────────
// Aggancio alle azioni dialogo: il DialogSystem chiama g.handleAction(action)
// ma le azioni locali (OBREN_REVEALED) devono essere intercettate dalla scena.
// Sovrascriviamo startDialog per agganciare il callback di azione locale.
// In alternativa, il codice della scena invoca _handleLocalAction dopo
// ogni nodo con `action`. Questo pattern è compatibile con DialogSystem esistente.
// La gestione avviene in DialogSystem che chiama g.handleAction(). Quindi
// registriamo OBREN_REVEALED in handleAction del Game a livello di patch
// all'apertura del livello (vedi index.html).
// ────────────────────────────────────────────────────────────────────────────

window.MineraScene = MineraScene;
