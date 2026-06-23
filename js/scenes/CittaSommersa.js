// ============================================================
// ISOLA PERDUTA — Livello 5: La Città Sommersa
// ============================================================

class CittaSommersa {
  constructor(g) {
    this.g = g;
    this.objs = [];
    this.time = 0;
    this.npcs = [];

    // Animazioni atmosferiche
    this.lunaLight       = null;   // PointLight della luna
    this.lunaMesh        = null;   // Mesh sfera lunare
    this.waterSurface    = null;   // Piano acqua semitrasparente
    this.ombre           = [];     // { grp, radius, speed, phase, homeY } — figure spettrali
    this.pesci           = [];     // { mesh, angle, radius, speed, yBase } — stormo di pesci
    this.campane         = [];     // { grp, phase, speed } — campane sommerse oscillanti
    this.simboli         = [];     // { mesh } — rune emissive sulle pareti
    this.ambientLight    = null;
    this.fogBaseColor    = new THREE.Color(0x041020);
  }

  // ─────────────────────────────────────────────────────────────────
  addClickable(mesh, label, walkTarget, action, opts = {}) {
    const objDef = { mesh, label, walkTarget, action, ...opts };
    this.objs.push(objDef);
    mesh.traverse(child => {
      if (child.isMesh) child.userData.parentObj = objDef;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  build() {
    const g     = this.g;
    const scene = g.scene;

    // ── ATMOSFERA GENERALE ──
    scene.fog        = new THREE.FogExp2(0x041020, 0.04);
    scene.background = new THREE.Color(0x020810);

    // Luce ambientale lunare diffusa
    this.ambientLight = new THREE.AmbientLight(0x1a3a6a, 0.5);
    scene.add(this.ambientLight);

    // Luce direzionale lunare debole dall'alto
    const moonDir = new THREE.DirectionalLight(0x8899cc, 0.3);
    moonDir.position.set(-8, 20, 5);
    scene.add(moonDir);

    // ── COSTRUZIONE SCENA ──
    this._buildFloor(scene);
    this._buildLuna(scene);
    this._buildEdifici(scene);
    this._buildColonne(scene);
    this._buildStatue(scene);
    this._buildArchi(scene);
    this._buildAcqua(scene);
    this._buildCampane(scene);
    this._buildOmbreDelPassato(scene);
    this._buildPesci(scene);
    this._buildSimboliSuiMuri(scene);
    this._buildItems(scene, g);
    this._buildNPCs(scene, g);
  }

  // ─────────────────────────────────────────────────────────────────
  _buildFloor(scene) {
    // Pavimento — pietra blu-grigia consumata dall'acqua
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0a1520 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Pavimento Città Sommersa';
    scene.add(floor);

    // Crepe nel pavimento — strisce scure che lo solcano
    const crepaGeo = new THREE.BoxGeometry(0.08, 0.01, 12);
    const crepaMat = new THREE.MeshLambertMaterial({ color: 0x020810 });
    const crepePositions = [
      [2, 0, 5, 0.4], [-5, 0, 8, -0.7], [8, 0, -3, 1.1],
      [-10, 0, 2, 0.2], [4, 0, -8, -0.3], [0, 0, 0, 0.8]
    ];
    crepePositions.forEach(([x, y, z, ry]) => {
      const c = new THREE.Mesh(crepaGeo, crepaMat);
      c.position.set(x, 0.005, z);
      c.rotation.y = ry;
      scene.add(c);
    });

    // Muschio e incrostazioni (piccole sfere scure sparse)
    const mussoMat = new THREE.MeshLambertMaterial({ color: 0x0d2018 });
    for (let i = 0; i < 40; i++) {
      const r = 0.08 + Math.random() * 0.22;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 5, 4), mussoMat);
      m.position.set(
        (Math.random() - 0.5) * 50,
        r * 0.3,
        (Math.random() - 0.5) * 50
      );
      m.scale.y = 0.35;
      scene.add(m);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  _buildLuna(scene) {
    // Sfera lunare in alto
    const lunaMat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
    this.lunaMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), lunaMat);
    this.lunaMesh.position.set(-8, 22, -18);
    scene.add(this.lunaMesh);

    // Luce puntuale dalla luna
    this.lunaLight = new THREE.PointLight(0xaabbff, 0.8, 50);
    this.lunaLight.position.copy(this.lunaMesh.position);
    scene.add(this.lunaLight);

    // Alone lunare (sfera più grande semitrasparente)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x5577aa,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 8), haloMat);
    halo.position.copy(this.lunaMesh.position);
    scene.add(halo);
  }

  // ─────────────────────────────────────────────────────────────────
  _buildEdifici(scene) {
    // ── TEMPIO CENTRALE — protagonista dell'ambientazione ──
    const tempioMat  = new THREE.MeshLambertMaterial({ color: 0x1a3028 });
    const tempioBase = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 10), new THREE.MeshLambertMaterial({ color: 0x122220 }));
    tempioBase.position.set(0, 0.3, -10);
    scene.add(tempioBase);

    const tempio = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), tempioMat);
    tempio.position.set(0, 3.6, -10);
    tempio.name = 'Tempio Centrale Sommerso';
    scene.add(tempio);

    // Frontone del tempio (triangolo)
    const frontone = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 5.8, 2, 4),
      new THREE.MeshLambertMaterial({ color: 0x152820 })
    );
    frontone.position.set(0, 7.6, -10);
    frontone.rotation.y = Math.PI / 4;
    scene.add(frontone);

    // Cornicione del tempio
    const corniceMat = new THREE.MeshLambertMaterial({ color: 0x2a4a38 });
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.4, 10.4), corniceMat);
    cornice.position.set(0, 6.7, -10);
    scene.add(cornice);

    // Porta del tempio (apertura buia)
    const portaMat = new THREE.MeshLambertMaterial({ color: 0x010508 });
    const porta = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 0.3), portaMat);
    porta.position.set(0, 2.2, -5.85);
    scene.add(porta);
    const portaArco = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.15, 8, 16, Math.PI),
      corniceMat
    );
    portaArco.position.set(0, 3.8, -5.85);
    scene.add(portaArco);

    // Luce interna del tempio (azzurra misteriosa)
    const tempioBluLight = new THREE.PointLight(0x3388cc, 1.2, 12);
    tempioBluLight.position.set(0, 2.5, -10);
    scene.add(tempioBluLight);
    this.tempioLight = tempioBluLight;

    // ── CASE BASSE INTORNO ──
    const caseMat   = new THREE.MeshLambertMaterial({ color: 0x0d2018 });
    const casaDefs  = [
      { pos: [-14, 1.5, -6],  size: [4, 3, 4] },
      { pos: [14, 1.5, -6],   size: [4, 3, 4] },
      { pos: [-16, 1.0, 5],   size: [3, 2, 3] },
      { pos: [15, 1.0, 5],    size: [3, 2, 3] },
      { pos: [-10, 1.5, -15], size: [4, 3, 5] },
      { pos: [10, 1.5, -15],  size: [5, 3, 4] },
      { pos: [-6, 1.0, 8],    size: [3, 2, 4] },
      { pos: [6, 1.0, 8],     size: [3, 2, 3] },
      { pos: [-18, 1.0, -12], size: [4, 2, 3] },
      { pos: [18, 1.0, -12],  size: [3, 2, 4] },
    ];
    casaDefs.forEach(d => {
      const casa = new THREE.Mesh(new THREE.BoxGeometry(...d.size), caseMat);
      casa.position.set(...d.pos);
      scene.add(casa);
      // Tetto a spiovente
      const tetto = new THREE.Mesh(
        new THREE.CylinderGeometry(0, d.size[0] * 0.75, d.size[1] * 0.55, 4),
        new THREE.MeshLambertMaterial({ color: 0x0a1810 })
      );
      tetto.position.set(d.pos[0], d.pos[1] + d.size[1] / 2 + d.size[1] * 0.25, d.pos[2]);
      tetto.rotation.y = Math.PI / 4;
      scene.add(tetto);
    });

    // ── ROVINE — edifici parzialmente crollati ──
    const ruinaMat = new THREE.MeshLambertMaterial({ color: 0x101e18 });
    const ruinaDefs = [
      { pos: [-8, 1.2, 12],  size: [4, 2.4, 3] },
      { pos: [7, 0.8, 14],   size: [3, 1.6, 4] },
      { pos: [-20, 0.8, 2],  size: [3, 1.6, 3] },
      { pos: [20, 1.2, 0],   size: [4, 2.4, 4] },
    ];
    ruinaDefs.forEach(d => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(...d.size), ruinaMat);
      r.position.set(...d.pos);
      r.rotation.y = Math.random() * 0.15;
      scene.add(r);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildColonne(scene) {
    const colMat = new THREE.MeshLambertMaterial({ color: 0x1e3830 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x2a4a3c });

    // Colonne del tempio (doppia fila frontale)
    const colonneTempio = [
      [-3.5, -5.8], [-1.2, -5.8], [1.2, -5.8], [3.5, -5.8], // fila frontale
      [-3.5, -14.2], [-1.2, -14.2], [1.2, -14.2], [3.5, -14.2], // fila posteriore
      [-4.8, -8], [-4.8, -10], [-4.8, -12], // lato sinistro
      [4.8, -8], [4.8, -10], [4.8, -12],    // lato destro
    ];
    colonneTempio.forEach(([x, z]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 6.5, 10), colMat);
      col.position.set(x, 3.25, z);
      scene.add(col);
      // Capitello
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), capMat);
      cap.position.set(x, 6.68, z);
      scene.add(cap);
      // Base colonna
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 8), capMat);
      base.position.set(x, 0.15, z);
      scene.add(base);
    });

    // Colonne sparse nella piazza — alcune rotte/cadute
    const colonneExtra = [
      [-12, 2.5, -3, true], [12, 2.5, -3, false],
      [-16, 1.5, -8, true], [16, 1.5, -8, true],
    ];
    colonneExtra.forEach(([x, h, z, rotta]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, h * 2, 8), colMat);
      if (rotta) {
        col.position.set(x, 0.1, z - 2.5);
        col.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      } else {
        col.position.set(x, h, z);
      }
      scene.add(col);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildStatue(scene) {
    const statuaMat = new THREE.MeshLambertMaterial({ color: 0x2a4040 });
    const braccioMat = new THREE.MeshLambertMaterial({ color: 0x2a4040 });

    // Statue giganti ai lati del tempio (x = -7 e +7)
    const statuePosX = [-7, 7];
    this.statueGrp = [];

    statuePosX.forEach((sx, idx) => {
      const grp = new THREE.Group();
      grp.name = idx === 0 ? 'Statua Guardiana Sinistra' : 'Statua Guardiana Destra';

      // Corpo (capsula allungata)
      const corpo = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.9, 4, 4, 8),
        statuaMat
      );
      corpo.position.y = 3.2;
      grp.add(corpo);

      // Testa sferica schiacciata
      const testa = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), statuaMat);
      testa.position.y = 6.1;
      testa.scale.y = 0.85;
      grp.add(testa);

      // Occhi luminosi vuoti (cavi emissivi)
      const occhioMat = new THREE.MeshBasicMaterial({ color: 0x00ccdd });
      [-0.35, 0.35].forEach(ox => {
        const occhio = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), occhioMat);
        occhio.position.set(ox, 6.25, 0.95);
        grp.add(occhio);
      });

      // Braccio sinistro alzato (ogni statua tiene un oggetto diverso)
      const braccio = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 1.8, 4, 6),
        braccioMat
      );
      braccio.position.set(idx === 0 ? -1.1 : 1.1, 3.8, 0.2);
      braccio.rotation.z = idx === 0 ? -0.8 : 0.8;
      grp.add(braccio);

      // Avambraccio
      const avanbraccio = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 1.5, 4, 6),
        braccioMat
      );
      avanbraccio.position.set(idx === 0 ? -1.8 : 1.8, 5.0, 0.2);
      avanbraccio.rotation.z = idx === 0 ? -1.2 : 1.2;
      grp.add(avanbraccio);

      // Piedistallo
      const piedistallo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 1.0, 1.5, 8),
        new THREE.MeshLambertMaterial({ color: 0x162820 })
      );
      piedistallo.position.y = 0.75;
      grp.add(piedistallo);

      // Decorazioni sul piedistallo (iscrizioni ciano — piano emissivo)
      const iscrizioneMat = new THREE.MeshBasicMaterial({
        color: 0x00ddcc,
        transparent: true,
        opacity: 0.7
      });
      for (let r = 0; r < 6; r++) {
        const a = (r / 6) * Math.PI * 2;
        const segno = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.08), iscrizioneMat);
        segno.position.set(Math.sin(a) * 0.72, 0.75, Math.cos(a) * 0.72);
        segno.rotation.y = a;
        grp.add(segno);
        this.simboli.push({ mesh: segno });
      }

      grp.position.set(sx, 0, -7.5);
      scene.add(grp);
      this.statueGrp.push(grp);
    });

    // ── STATUA PARLANTE al centro della piazza ──
    const statuaParlante = new THREE.Group();
    statuaParlante.name = 'Statua Parlante — Oracolo';

    const sp_corpo = new THREE.Mesh(new THREE.CapsuleGeometry(1.0, 4.5, 4, 8), new THREE.MeshLambertMaterial({ color: 0x1a3030 }));
    sp_corpo.position.y = 3.8;
    statuaParlante.add(sp_corpo);

    const sp_testa = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), new THREE.MeshLambertMaterial({ color: 0x1a3030 }));
    sp_testa.position.y = 7.2;
    statuaParlante.add(sp_testa);

    // Maschera sulla testa (ornamento)
    const mascheraDecor = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.12, 8, 16, Math.PI),
      new THREE.MeshLambertMaterial({ color: 0x4a7060 })
    );
    mascheraDecor.position.set(0, 7.4, 1.1);
    statuaParlante.add(mascheraDecor);

    // Occhi emissivi della statua parlante (più intensi)
    const occhioParlMat = new THREE.MeshBasicMaterial({ color: 0x00ffee });
    [-0.4, 0.4].forEach(ox => {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), occhioParlMat);
      o.position.set(ox, 7.4, 1.1);
      statuaParlante.add(o);
      this.simboli.push({ mesh: o, isOcchio: true });
    });

    // Luce dell'oracolo
    const oracoloLight = new THREE.PointLight(0x00ccaa, 0.6, 8);
    oracoloLight.position.set(0, 5, 0);
    statuaParlante.add(oracoloLight);
    this.oracoloLight = oracoloLight;

    // Piedistallo monumentale
    const pPied = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.6, 2.0, 10),
      new THREE.MeshLambertMaterial({ color: 0x102018 })
    );
    pPied.position.y = 1.0;
    statuaParlante.add(pPied);

    statuaParlante.position.set(0, 0, 3);
    scene.add(statuaParlante);

    // Clickable: Statua Parlante Oracolo
    this.addClickable(statuaParlante, 'Statua Oracolo — L\'Isola Ricorda', { x: 0, z: 1.5 }, () => {
      if (!g.flags.obren_svelato) {
        g.notify('La statua tace. Sembra aspettare qualcuno con un passato più denso.');
        return;
      }
      g.startDialog('statua_parlante', this._buildStatuaDialog(g));
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildArchi(scene) {
    const arcoMat = new THREE.MeshLambertMaterial({ color: 0x2a4a38 });

    // Archi semisollersi — alcuni sono appena visibili sopra l'acqua
    const archiDefs = [
      [-12, 0, 0, 0], [12, 0, 0, Math.PI / 2],
      [-5, 0, -18, 0], [5, 0, -18, Math.PI / 2],
      [0, 0, -20, 0], [-15, 0, -16, Math.PI / 4],
      [15, 0, -16, -Math.PI / 4],
    ];
    archiDefs.forEach(([x, y, z, ry]) => {
      const arco = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.28, 8, 18, Math.PI),
        arcoMat
      );
      arco.position.set(x, 2.2, z);
      arco.rotation.y = ry;
      scene.add(arco);

      // Pilastri dell'arco
      const pMat = new THREE.MeshLambertMaterial({ color: 0x1e3828 });
      [-2.2, 2.2].forEach(ox => {
        const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 4.5, 8), pMat);
        const dir = new THREE.Vector3(ox, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
        pil.position.set(x + dir.x, 2.25, z + dir.z);
        scene.add(pil);
      });
    });

    // Muri di connessione tra le case (bassi, con finestre vuote)
    const muroMat = new THREE.MeshLambertMaterial({ color: 0x0e2018 });
    const muroDefs = [
      [-11, 1.0, -5, 8, 2, 0.4, 0],
      [11, 1.0, -5, 8, 2, 0.4, 0],
      [0, 1.0, -21, 18, 2, 0.4, 0],
    ];
    muroDefs.forEach(([x, y, z, w, h, d, ry]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), muroMat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
      // Finestra vuota (buco nero sul muro)
      const finMat = new THREE.MeshBasicMaterial({ color: 0x010508 });
      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.5), finMat);
      fin.position.set(x, y + 0.2, z);
      scene.add(fin);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildAcqua(scene) {
    // Piano dell'acqua bassa — bassa marea lunare
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x0a2a50,
      emissive: 0x011020,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    this.waterSurface = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 32, 32), waterMat);
    this.waterSurface.rotation.x = -Math.PI / 2;
    this.waterSurface.position.y = 0.5;
    this.waterSurface.name = 'Superficie Acqua Bassa';
    scene.add(this.waterSurface);

    // Luce azzurra che scintilla dal basso — riflesso acqua
    this.waterShimmerLight = new THREE.PointLight(0x1166aa, 0.5, 20);
    this.waterShimmerLight.position.set(0, 0.3, 0);
    scene.add(this.waterShimmerLight);

    // Zone di acqua più profonda (pozzanghere buie)
    const pozzaMat = new THREE.MeshLambertMaterial({
      color: 0x020f1a,
      transparent: true,
      opacity: 0.7
    });
    const pozzeDefs = [
      [3, 0.01, -14, 4, 3], [-6, 0.01, 8, 3, 3],
      [16, 0.01, -4, 3, 4], [-16, 0.01, -10, 4, 3]
    ];
    pozzeDefs.forEach(([x, y, z, w, h]) => {
      const pozza = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pozzaMat);
      pozza.rotation.x = -Math.PI / 2;
      pozza.position.set(x, y, z);
      scene.add(pozza);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildCampane(scene) {
    const campanaMat = new THREE.MeshLambertMaterial({ color: 0x3a5040 });
    const cordaMat   = new THREE.MeshBasicMaterial({ color: 0x2a3028 });

    const campanePosizioni = [
      [-4, 7, -8], [4, 7, -8],
      [-8, 6.5, -12], [8, 6.5, -12],
      [0, 7, -6],
      [-2, 5.5, 5], [2, 5.5, 5],
    ];

    campanePosizioni.forEach(([x, y, z]) => {
      const grp = new THREE.Group();

      // Corda di sospensione
      const ropeLen = 0.8 + Math.random() * 0.6;
      const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, ropeLen, 5), cordaMat);
      corda.position.y = ropeLen / 2;
      grp.add(corda);

      // Campana (cono invertito)
      const campana = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.7, 10, 1, true), campanaMat);
      campana.rotation.x = Math.PI;
      campana.position.y = -0.35;
      grp.add(campana);

      // Bordo campana
      const bordo = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 6, 16), campanaMat);
      bordo.position.y = -0.7;
      bordo.rotation.x = Math.PI / 2;
      grp.add(bordo);

      // Batacchio (pendolino interno)
      const batacchio = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6), campanaMat);
      batacchio.position.y = -0.55;
      grp.add(batacchio);

      grp.position.set(x, y, z);
      scene.add(grp);

      this.campane.push({
        grp,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        amplitude: 0.12 + Math.random() * 0.18
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildOmbreDelPassato(scene) {
    // 3 figure semitrasparenti che camminano in cerchio — ombre del passato
    const ombra_configs = [
      { radius: 7, speed: 0.18, phase: 0,                  yBase: 0.8, color: 0x3a4a6a },
      { radius: 5, speed: 0.12, phase: Math.PI * 2 / 3,    yBase: 0.8, color: 0x2a3a5a },
      { radius: 9, speed: 0.14, phase: Math.PI * 4 / 3,    yBase: 0.8, color: 0x303a58 },
    ];

    ombra_configs.forEach((cfg, idx) => {
      const grp = new THREE.Group();

      // Corpo spettrale (capsula semi-trasparente)
      const ombraMat = new THREE.MeshLambertMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.22 + Math.random() * 0.1,
        emissive: new THREE.Color(0x1a2244),
        emissiveIntensity: 0.6
      });

      const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.0, 4, 8), ombraMat);
      corpo.position.y = 1.0;
      grp.add(corpo);

      const testa = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), ombraMat.clone());
      testa.position.y = 1.95;
      grp.add(testa);

      // Mantello/strascico (cono che sfuma verso il basso)
      const mantelloMat = new THREE.MeshLambertMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const mantello = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.4, 8, 1, true),
        mantelloMat
      );
      mantello.position.y = 0.5;
      grp.add(mantello);

      const startAngle = cfg.phase;
      grp.position.set(
        Math.cos(startAngle) * cfg.radius,
        cfg.yBase,
        Math.sin(startAngle) * cfg.radius
      );
      scene.add(grp);

      this.ombre.push({
        grp,
        radius:    cfg.radius,
        speed:     cfg.speed,
        phase:     cfg.phase,
        yBase:     cfg.yBase
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildPesci(scene) {
    // Stormo di piccole sfere ciano che nuotano in cerchio ellittico
    const pesciConfigs = [
      { count: 12, radius: 4, yBase: 1.2, speed: 0.9, spread: 0.8, color: 0x00ddcc },
      { count: 8,  radius: 6, yBase: 2.0, speed: 0.7, spread: 1.2, color: 0x00bbee },
      { count: 15, radius: 3, yBase: 0.8, speed: 1.1, spread: 0.5, color: 0x22eedd },
    ];

    const pescheMat_cache = {};

    pesciConfigs.forEach((cfg, gi) => {
      const matKey = cfg.color.toString();
      if (!pescheMat_cache[matKey]) {
        pescheMat_cache[matKey] = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.75
        });
      }
      const mat = pescheMat_cache[matKey];

      for (let i = 0; i < cfg.count; i++) {
        const baseAngle = (i / cfg.count) * Math.PI * 2;
        // offset x/z dal centro dello stormo
        const ox = (Math.random() - 0.5) * cfg.spread;
        const oz = (Math.random() - 0.5) * cfg.spread;
        const oy = (Math.random() - 0.5) * cfg.spread * 0.4;

        const size = 0.05 + Math.random() * 0.06;
        const pesce = new THREE.Mesh(
          new THREE.SphereGeometry(size, 5, 4),
          mat
        );
        pesce.position.set(
          Math.cos(baseAngle) * cfg.radius + ox,
          cfg.yBase + oy,
          Math.sin(baseAngle) * cfg.radius + oz - 5
        );
        scene.add(pesce);

        this.pesci.push({
          mesh:      pesce,
          angle:     baseAngle,
          radius:    cfg.radius,
          speed:     cfg.speed,
          yBase:     cfg.yBase + oy,
          ox, oz,
          groupIdx:  gi,
          centerZ:   -5
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildSimboliSuiMuri(scene) {
    // Rune emissive sulle pareti degli edifici — pulsano lentamente
    const simboliDefs = [
      // [x, y, z, rotY]
      [-13.9, 2.0, -6, Math.PI / 2],
      [13.9, 2.0, -6, -Math.PI / 2],
      [-13.9, 3.2, -8, Math.PI / 2],
      [13.9, 3.2, -8, -Math.PI / 2],
      [0, 3.0, -5.7, 0],
      [-2.2, 2.5, -5.72, 0],
      [2.2, 2.5, -5.72, 0],
      [-15.9, 1.5, 5, Math.PI / 2],
      [14.9, 1.5, 5, -Math.PI / 2],
      [-9.8, 2.0, -14.8, Math.PI / 4],
      [9.8, 2.0, -14.8, -Math.PI / 4],
    ];

    simboliDefs.forEach((d, idx) => {
      const simboloMat = new THREE.MeshBasicMaterial({
        color: 0x00ddcc,
        transparent: true,
        opacity: 0.65
      });

      // Simbolo come gruppo di mini-geometrie (due barre che si incrociano = croce arcaica)
      const grp = new THREE.Group();

      const w = 0.28 + Math.random() * 0.12;
      const h = 0.35 + Math.random() * 0.1;

      const barra1 = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.04), simboloMat.clone());
      grp.add(barra1);
      const barra2 = new THREE.Mesh(new THREE.PlaneGeometry(0.04, h), simboloMat.clone());
      grp.add(barra2);

      // Cerchio intorno (in alcune rune)
      if (idx % 3 === 0) {
        const cerchio = new THREE.Mesh(
          new THREE.RingGeometry(0.14, 0.18, 10),
          simboloMat.clone()
        );
        grp.add(cerchio);
      }

      grp.position.set(d[0], d[1], d[2]);
      grp.rotation.y = d[3];
      scene.add(grp);

      // Aggiungi al registro simboli per l'animazione
      grp.traverse(child => {
        if (child.isMesh) this.simboli.push({ mesh: child, phase: Math.random() * Math.PI * 2 });
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _buildItems(scene, g) {
    // ══════════════════════════════════════════════════════════
    // 1. MASCHERA DI OTTONE — appesa sulla statua sinistra
    // ══════════════════════════════════════════════════════════
    const mascheraGrp = new THREE.Group();
    mascheraGrp.name = 'Maschera Cerimoniale di Ottone';

    const volto = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0x8a6020, emissive: 0x3a2808, emissiveIntensity: 0.5 })
    );
    volto.scale.set(1, 1.1, 0.5);
    mascheraGrp.add(volto);

    // Occhi della maschera (vuoti neri)
    const occhioNero = new THREE.MeshBasicMaterial({ color: 0x010305 });
    [[-0.18, 0.05, 0.22], [0.18, 0.05, 0.22]].forEach(([ox, oy, oz]) => {
      const oc = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), occhioNero);
      oc.position.set(ox, oy, oz);
      mascheraGrp.add(oc);
    });

    // Decorazione: corna/cresta dorata
    const crestaMat = new THREE.MeshLambertMaterial({ color: 0xc08020 });
    for (let ci = -1; ci <= 1; ci++) {
      const cresta = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 5), crestaMat);
      cresta.position.set(ci * 0.22, 0.5, 0.05);
      cresta.rotation.z = ci * 0.3;
      mascheraGrp.add(cresta);
    }

    mascheraGrp.position.set(-7, 4.5, -6.5);
    mascheraGrp.rotation.y = 0.4;
    scene.add(mascheraGrp);

    // Luce dorata che illumina la maschera
    const mascheraLight = new THREE.PointLight(0xd4a040, 0.8, 4);
    mascheraLight.position.set(-7, 5.0, -6.2);
    scene.add(mascheraLight);
    this._mascheraLight = mascheraLight;

    this.addClickable(mascheraGrp, 'Maschera Cerimoniale di Ottone', { x: -6.5, z: -5.5 }, () => {
      if (!g.inv.has('maschera_ottone')) {
        g.inv.add('maschera_ottone');
        g.setFlag('maschera_trovata');
        g.notify('🎭 Maschera Cerimoniale di Ottone raccolta. Il volto vuoto ti osserva anche mentre la tieni tra le mani. Sul retro, un\'incisione: "Chi indossa il viso dimenticato ricorda per tutti."');
        scene.remove(mascheraGrp);
        scene.remove(mascheraLight);
        this.objs = this.objs.filter(o => o.mesh !== mascheraGrp);
      } else {
        g.notify('La maschera è già nel tuo zaino. Gli occhi vuoti ti fissano da dentro.');
      }
    });

    // ══════════════════════════════════════════════════════════
    // 2. CONCHIGLIA SONORA — su una pietra vicino all'acqua
    // ══════════════════════════════════════════════════════════
    const conchigliaGrp = new THREE.Group();
    conchigliaGrp.name = 'Conchiglia Sonora';

    // Corpo spirale (approssimato con sfere decrescenti)
    const conMat = new THREE.MeshLambertMaterial({ color: 0xd4b890, emissive: 0x5a3010, emissiveIntensity: 0.3 });
    const spiraleRaggi = [0.32, 0.24, 0.17, 0.12, 0.07];
    spiraleRaggi.forEach((r, i) => {
      const sfera = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), conMat);
      const a = i * 0.7;
      sfera.position.set(Math.cos(a) * i * 0.22, i * 0.1, Math.sin(a) * i * 0.1);
      conchigliaGrp.add(sfera);
    });

    // Apertura della conchiglia
    const aperturaMat = new THREE.MeshBasicMaterial({ color: 0x3a1508, side: THREE.BackSide });
    const apertura = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), aperturaMat);
    apertura.scale.set(1, 0.8, 0.5);
    conchigliaGrp.add(apertura);

    conchigliaGrp.position.set(10, 0.35, 2);
    conchigliaGrp.rotation.y = -0.8;
    scene.add(conchigliaGrp);

    this.addClickable(conchigliaGrp, 'Conchiglia Sonora', { x: 9.2, z: 1.5 }, () => {
      if (!g.inv.has('conchiglia_sonora')) {
        g.notify('🐚 Avvicini la Conchiglia Sonora all\'orecchio... Un suono ovattato si sprigiona, come voci lontanissime sott\'acqua. Si lamentano. O forse cantano.');
        g.inv.add('conchiglia_sonora');
        g.setFlag('conchiglia_trovata');
        scene.remove(conchigliaGrp);
        this.objs = this.objs.filter(o => o.mesh !== conchigliaGrp);
      } else {
        g.notify('Tieni già la Conchiglia Sonora. Se l\'avvicini all\'orecchio, senti ancora quelle voci.');
      }
    });

    // ══════════════════════════════════════════════════════════
    // 3. ARPIONE CERIMONIALE — appoggiato a una colonna
    // ══════════════════════════════════════════════════════════
    const arpionGrp = new THREE.Group();
    arpionGrp.name = 'Arpione Cerimoniale';

    const arpMat = new THREE.MeshLambertMaterial({ color: 0x6a8070, emissive: 0x1a2820, emissiveIntensity: 0.4 });

    // Asta
    const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.8, 7), arpMat);
    asta.position.y = 1.4;
    arpionGrp.add(asta);

    // Punta a tridente (3 spine)
    const spinaMat = new THREE.MeshLambertMaterial({ color: 0x8ab0a0 });
    for (let si = -1; si <= 1; si++) {
      const spina = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.5, 5), spinaMat);
      spina.position.set(si * 0.12, 2.9 + Math.abs(si) * 0.1, 0);
      arpionGrp.add(spina);
    }

    // Incisioni simboli (anelli decorativi)
    [0.6, 1.2, 1.8].forEach(ypos => {
      const anello = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.02, 5, 12),
        new THREE.MeshLambertMaterial({ color: 0x4a7060 })
      );
      anello.position.y = ypos;
      anello.rotation.x = Math.PI / 2;
      arpionGrp.add(anello);
    });

    // Impugnatura avvolta (cilindro scuro)
    const impMat = new THREE.MeshLambertMaterial({ color: 0x2a1808 });
    const impugnatura = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.55, 7), impMat);
    impugnatura.position.y = 0.27;
    arpionGrp.add(impugnatura);

    arpionGrp.position.set(-5, 0, -5.8);
    arpionGrp.rotation.set(0.1, 0.5, 0.15);
    scene.add(arpionGrp);

    this.addClickable(arpionGrp, 'Arpione Cerimoniale', { x: -4.5, z: -5 }, () => {
      if (!g.inv.has('arpione_cerimoniale')) {
        g.inv.add('arpione_cerimoniale');
        g.setFlag('arpione_trovato');
        g.notify('🔱 Arpione Cerimoniale raccolto. Non è un\'arma da guerra — gli intagli mostrano cerimonie, non battaglie. I simboli incisi sembrano raccontare un rituale dimenticato.');
        scene.remove(arpionGrp);
        this.objs = this.objs.filter(o => o.mesh !== arpionGrp);
      } else {
        g.notify('Hai già l\'Arpione Cerimoniale. I simboli continuano a brillare debolmente.');
      }
    });

    // ══════════════════════════════════════════════════════════
    // 4. LIBRO IMPERMEABILE — pagine di pietra, sul piedistallo del tempio
    // ══════════════════════════════════════════════════════════
    const libroGrp = new THREE.Group();
    libroGrp.name = 'Libro Impermeabile — Pagine di Pietra';

    const libroMat  = new THREE.MeshLambertMaterial({ color: 0x3a5040 });
    const copertina = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.06), libroMat);
    libroGrp.add(copertina);

    const paginaMat = new THREE.MeshLambertMaterial({ color: 0x6a9080 });
    const pagine = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.04), paginaMat);
    pagine.position.z = 0.05;
    libroGrp.add(pagine);

    // Incisioni simboli sulla copertina
    const copertinaSim = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00ccaa, transparent: true, opacity: 0.6 })
    );
    copertinaSim.position.set(0, 0.08, 0.035);
    libroGrp.add(copertinaSim);
    this.simboli.push({ mesh: copertinaSim, phase: 1.2 });

    const libroLight = new THREE.PointLight(0x44ccaa, 0.7, 3);
    libroLight.position.set(-1, 1.5, -9.8);
    scene.add(libroLight);

    libroGrp.position.set(-1, 1.1, -9.8);
    libroGrp.rotation.set(0, 0.3, 0.1);
    scene.add(libroGrp);

    this.addClickable(libroGrp, 'Libro Impermeabile — Pagine di Pietra', { x: -0.5, z: -8.5 }, () => {
      if (!g.inv.has('libro_impermeabile')) {
        g.inv.add('libro_impermeabile');
        g.setFlag('libro_trovato');
        g.setFlag('rivelazione_isola');
        g.notify('📖 Libro Impermeabile raccolto. Le pagine sono di pietra sottile, incise finemente. Leggi: "L\'isola non è naturale. È una gigantesca macchina costruita per conservare ricordi. Ogni pietra, ogni corallo è un frammento di coscienza. Non siamo annegati — siamo stati archiviati."');
        scene.remove(libroGrp);
        scene.remove(libroLight);
        this.objs = this.objs.filter(o => o.mesh !== libroGrp);

        // Effetto visivo — il tempio palpita
        setTimeout(() => {
          if (this.tempioLight) {
            this.tempioLight.intensity = 5.0;
            this.tempioLight.color.set(0x00ffaa);
            setTimeout(() => {
              if (this.tempioLight) {
                this.tempioLight.intensity = 1.2;
                this.tempioLight.color.set(0x3388cc);
              }
            }, 1200);
          }
        }, 300);
      } else {
        g.notify('Le pagine di pietra del libro riportano ancora quelle parole inquietanti: "Noi siamo la memoria. L\'isola è la mente."');
      }
    });

    // ══════════════════════════════════════════════════════════
    // 5. MEDAGLIONE SPEZZATO — in due metà, sparse nella piazza
    // ══════════════════════════════════════════════════════════
    // Prima metà
    const metaMat = new THREE.MeshLambertMaterial({ color: 0x7a6030, emissive: 0x2a1808, emissiveIntensity: 0.4 });
    const meta1 = new THREE.Group();
    meta1.name = 'Medaglione Spezzato (metà sinistra)';

    // Semicerchio sinistro (torus tagliato)
    const semicirc1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI),
      metaMat
    );
    meta1.add(semicirc1);
    const disco1 = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12, 0, Math.PI), metaMat.clone());
    disco1.position.z = 0.02;
    meta1.add(disco1);

    meta1.position.set(-3, 0.12, 2);
    meta1.rotation.set(Math.PI / 2, 0, 0.3);
    scene.add(meta1);

    this.addClickable(meta1, 'Medaglione Spezzato — Metà Sinistra', { x: -2.5, z: 1.5 }, () => {
      if (!g.inv.has('medaglione_meta1')) {
        g.inv.add('medaglione_meta1');
        g.notify('Hai raccolto la metà sinistra del Medaglione Spezzato. Un volto è inciso su di essa — sembra il tuo, ma più vecchio.');
        scene.remove(meta1);
        this.objs = this.objs.filter(o => o.mesh !== meta1);
        this._checkMedaglione(g);
      } else {
        g.notify('Hai già questa metà del medaglione.');
      }
    });

    // Seconda metà
    const meta2 = new THREE.Group();
    meta2.name = 'Medaglione Spezzato (metà destra)';

    const semicirc2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI),
      metaMat.clone()
    );
    semicirc2.rotation.y = Math.PI;
    meta2.add(semicirc2);
    const disco2 = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12, Math.PI, Math.PI), metaMat.clone());
    disco2.position.z = 0.02;
    meta2.add(disco2);

    meta2.position.set(4, 0.12, 6);
    meta2.rotation.set(Math.PI / 2, 0, -0.4);
    scene.add(meta2);

    // Piccola luce dorata sulla seconda metà
    const meta2Light = new THREE.PointLight(0xd4a040, 0.5, 2.5);
    meta2Light.position.set(4, 0.5, 6);
    scene.add(meta2Light);

    this.addClickable(meta2, 'Medaglione Spezzato — Metà Destra', { x: 3.5, z: 5.5 }, () => {
      if (!g.inv.has('medaglione_meta2')) {
        g.inv.add('medaglione_meta2');
        g.notify('Hai raccolto la metà destra del Medaglione Spezzato. Mostra un\'isola — forse questa stessa isola — vista dall\'alto. O dal fondo del mare.');
        scene.remove(meta2);
        scene.remove(meta2Light);
        this.objs = this.objs.filter(o => o.mesh !== meta2);
        this._checkMedaglione(g);
      } else {
        g.notify('Hai già questa metà del medaglione.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  _checkMedaglione(g) {
    if (g.inv.has('medaglione_meta1') && g.inv.has('medaglione_meta2')) {
      // Combina le due metà
      g.inv.rem('medaglione_meta1');
      g.inv.rem('medaglione_meta2');
      g.inv.add('medaglione_spezzato');
      g.setFlag('medaglione_unito');
      setTimeout(() => {
        g.notify('✨ Le due metà del Medaglione si sono unite da sole, vibrando. Il medaglione è intero — mostra un volto sull\'isola. Il tuo volto. Capisci di essere stata qui prima.');
        g.setFlag('obren_svelato');
      }, 800);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  _buildNPCs(scene, g) {
    // ── Custode Sommerso — frammento di coscienza archiviata ──
    const custode = this._createNPC(scene, 0x1a2a4a, -12, 0.8, -5);
    custode.name = 'Custode Sommerso';
    custode.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.55;
        child.material.emissive = new THREE.Color(0x1a3366);
        child.material.emissiveIntensity = 0.7;
      }
    });

    this.addClickable(custode, 'Custode Sommerso', { x: -11.5, z: -4.5 }, () => {
      g.startDialog('custode_sommerso', [
        { id: 'start', speaker: 'Custode Sommerso', portrait: '🌊',
          text: 'La figura ti fissa con occhi profondi e umidi. "Sei arrivata prima della marea lunare. Ottimo. Di solito a quest\'ora sto pulendo i coralli, ma per te farò un\'eccezione."',
          choices: [
            { text: 'Chi sei tu?', next: 'chi_sei' },
            { text: 'Cosa è questo posto sommerso?', next: 'cosa_citta' },
            { text: 'Come posso convincere quella gigantesca testa di pietra a farmi passare?', next: 'statua_hint' }
          ]
        },
        { id: 'chi_sei', speaker: 'Custode Sommerso', portrait: '🌊',
          text: '"Sono il Custode della memoria. Un tempo ero un normale cartografo con troppi debiti. Ora sono parte di questa scogliera. Meno tasse da pagare, ma decisamente troppa umidità."',
          choices: [
            { text: 'Cosa viene archiviato qui?', next: 'conservato' },
            { text: 'Ho altre domande.', next: 'start' }
          ]
        },
        { id: 'conservato', speaker: 'Custode Sommerso', portrait: '🌊',
          text: '"Ogni pietra qui è un pensiero che qualcuno ha smarrito. Ogni corallo è un vecchio sogno nel cassetto. L\'intera isola è una gigantesca macchina-archivio. E tu stai camminando sulla scheda di memoria."',
          choices: [{ text: 'Incredibile. Grazie.', next: 'end' }]
        },
        { id: 'cosa_citta', speaker: 'Custode Sommerso', portrait: '🌊',
          text: '"È la prima città dell\'isola, costruita da Obren e dal suo popolo prima che decidessero di caricare le proprie menti nella roccia per sfuggire al tempo. Un backup di pietra, per così dire."',
          choices: [
            { text: 'Obren... il mercante della miniera?', next: 'obren_nome' },
            { text: 'Ho altre domande.', next: 'start' }
          ],
          giveFlag: 'obren_svelato'
        },
        { id: 'obren_nome', speaker: 'Custode Sommerso', portrait: '🌊',
          text: '"Esatto, proprio lui! Ha barattato così tanto con l\'isola che ha persino diviso il suo medaglione in due parti e le ha sparse nella piazza. Se le trovi entrambe, capirai finalmente chi sei."',
          choices: [{ text: 'Capisco.', next: 'end' }]
        },
        { id: 'statua_hint', speaker: 'Custode Sommerso', portrait: '🌊',
          text: '"Quella testa di pietra è l\'Oracolo. Ti farà una domanda filosofico-esistenziale sul senso dei ricordi. La risposta corretta è incisa sulle pagine del libro di pietra o sussurrata da chi ha fuggito la miniera. Ricorda bene."',
          choices: [{ text: 'Ci proverò.', next: 'end' }]
        }
      ]);
    });

    // ── Bambina-Fantasma — spirito di una piccola abitante ──
    const bambina = this._createNPCBambina(scene, 7, 0.6, 1);
    bambina.name = 'Bambina-Fantasma';

    this.addClickable(bambina, 'Bambina-Fantasma di Obren', { x: 6.5, z: 0.5 }, () => {
      g.startDialog('bambina_fantasma', [
        { id: 'start', speaker: 'Bambina-Fantasma', portrait: '👧',
          text: 'La bambina trasparente gioca con un granchio invisibile. "Cerchi la fine dell\'isola?" ti chiede ridacchiando. "Tutti i vivi corrono verso la fine. Noi qui abbiamo trovato l\'inizio e ci siamo addormentati dentro."',
          choices: [
            { text: 'Cosa intendi per inizio?', next: 'inizio' },
            { text: 'Non ti senti sola qui sotto?', next: 'sola' },
            { text: 'Cosa c\'è oltre il tempio?', next: 'tempio' }
          ]
        },
        { id: 'inizio', speaker: 'Bambina-Fantasma', portrait: '👧',
          text: '"L\'inizio di ogni storia è un ricordo. Voi lo chiamate passato, noi lo chiamiamo presente eterno. L\'isola custodisce tutto, anche i tuoi giocattoli preferiti."',
          choices: [{ text: 'Che bello. Grazie.', next: 'end' }]
        },
        { id: 'sola', speaker: 'Bambina-Fantasma', portrait: '👧',
          text: '"Sola? No! Ci sono i pesci che cantano stonato e le ombre del passato che ballano sempre lo stesso valzer. Semmai sei tu che sembri sola... e un po\' bagnata!"',
          choices: [{ text: 'Hai ragione.', next: 'end' }]
        },
        { id: 'tempio', speaker: 'Bambina-Fantasma', portrait: '👧',
          text: '"C\'è il nucleo centrale. La macchina che proietta l\'isola. Se rispondi all\'Oracolo usando la frase corretta che parla di mare e affondamento... il nucleo si sbloccherà. La trovi scritta sui frammenti o nei taccuini della miniera!"',
          choices: [{ text: 'Ottimo indizio!', next: 'end' }]
        }
      ]);
    });

    // Inizializzazione NPC per movimento
    const initNPC = (npc, range) => {
      npc.userData.home       = npc.position.clone();
      npc.userData.walkTarget = npc.position.clone();
      npc.userData.isMoving   = false;
      npc.userData.walkTimer  = Math.random() * 2;
      npc.userData.range      = range;
      this.npcs.push(npc);
    };
    initNPC(custode, 2.0);
    initNPC(bambina, 1.5);
  }

  // ─────────────────────────────────────────────────────────────────
  _createNPC(scene, color, x, y, z) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.9, 4, 8),
      new THREE.MeshLambertMaterial({ color })
    );
    body.position.y = 0;
    grp.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xa0b0c0 })
    );
    head.position.y = 0.9;
    grp.add(head);
    grp.position.set(x, y, z);
    scene.add(grp);
    return grp;
  }

  // ─────────────────────────────────────────────────────────────────
  _createNPCBambina(scene, x, y, z) {
    const grp = new THREE.Group();

    const bambinaBodyMat = new THREE.MeshLambertMaterial({
      color: 0x2a3a5a,
      transparent: true,
      opacity: 0.38,
      emissive: new THREE.Color(0x1a2244),
      emissiveIntensity: 0.9
    });

    const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 4, 8), bambinaBodyMat);
    corpo.position.y = 0;
    grp.add(corpo);

    const testa = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 7), bambinaBodyMat.clone());
    testa.position.y = 0.58;
    grp.add(testa);

    // Capelli (piccolo cupolone)
    const capelliMat = new THREE.MeshLambertMaterial({
      color: 0x1a2a3a, transparent: true, opacity: 0.3
    });
    const capelli = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), capelliMat);
    capelli.position.y = 0.62;
    grp.add(capelli);

    // Vestitino (cono)
    const vestitoMat = new THREE.MeshLambertMaterial({
      color: 0x243050, transparent: true, opacity: 0.35
    });
    const vestito = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 8, 1, true), vestitoMat);
    vestito.position.y = -0.2;
    grp.add(vestito);

    grp.position.set(x, y, z);
    scene.add(grp);
    return grp;
  }

  // ─────────────────────────────────────────────────────────────────
  _buildStatuaDialog(g) {
    return [
      { id: 'start', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'La gigantesca testa di pietra ti scruta con occhi colmi di licheni e acqua marina. "Ho le orecchie piene d\'acqua da quattrocento anni... parla chiaramente. Completa la formula sacra: \'La memoria...\'"',
        choices: [
          { text: '...è il vero mare...', next: 'parte2' },
          { text: '...è solo un brutto sogno dopo troppo rum...', next: 'sbaglio_rum' },
          { text: '...è come un carrello minerario senza ruote...', next: 'sbaglio_carrello' },
          { text: '...non me la ricordo, ironico vero?', next: 'sbaglio_ironico' }
        ]
      },
      { id: 'sbaglio_rum', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'La statua emette un grugnito di sdegno che fa tremare le colonne del tempio. "Il rum offusca la mente, non la risveglia! Riprova, profana!"',
        choices: [{ text: 'Riprovare.', next: 'start' }]
      },
      { id: 'sbaglio_carrello', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'La statua ruota gli occhi di pietra verso l\'alto. "Cosa c\'entrano i carrelli sotterranei con la maestosità dell\'oceano della mente? Concentrati!"',
        choices: [{ text: 'Riprovare.', next: 'start' }]
      },
      { id: 'sbaglio_ironico', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'La statua sospira un getto d\'aria fredda. "L\'ironia non apre i cancelli del nucleo dell\'isola. Cerca le parole scritte nelle profondità!"',
        choices: [{ text: 'Riprovare.', next: 'start' }]
      },
      { id: 'parte2', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: '"...è il vero mare..." La pietra si incrina leggermente in un cenno di assenso. "...continua la formula: \'...e allora?\'"',
        choices: [
          { text: '...e tutti noi stiamo affondando.', next: 'vittoria' },
          { text: '...e quindi è meglio che tu ti sposti!', next: 'sbaglio_sposta' },
          { text: '...e io ho dimenticato come si nuota.', next: 'sbaglio_nuoto' },
          { text: '...e l\'acqua è incredibilmente gelida qui sotto.', next: 'sbaglio_acqua' }
        ]
      },
      { id: 'sbaglio_sposta', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'La statua ti lancia un\'occhiata severa. "Se potessi spostarmi non sarei inchiodata al pavimento da secoli. Risposta errata!"',
        choices: [{ text: 'Riprovare dall\'inizio.', next: 'start' }]
      },
      { id: 'sbaglio_nuoto', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: '"Il nuoto non ti salverà dall\'oblio dell\'isola. Le parole corrette parlano di un destino comune!"',
        choices: [{ text: 'Riprovare dall\'inizio.', next: 'start' }]
      },
      { id: 'sbaglio_acqua', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: '"La temperatura dell\'acqua è irrilevante per la formula cosmica! Trova la conclusione corretta!"',
        choices: [{ text: 'Riprovare dall\'inizio.', next: 'start' }]
      },
      { id: 'vittoria', speaker: 'Statua dell\'Oracolo', portrait: '🗿',
        text: 'Gli occhi della statua si illuminano di un accecante bagliore verde-azzurro. "La formula è completa. Qualcuno ha finalmente ricordato la verità." Le porte dorate del tempio sommerso si aprono con un boato maestoso. La macchina dell\'isola si risveglia dal sonno millenario!',
        choices: [],
        action: 'LEVEL5_WIN'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────
  update(dt) {
    this.time += dt;
    const t = this.time;

    // ── 1. LUNA OSCILLA E PULSA ──
    if (this.lunaLight) {
      this.lunaLight.intensity = 0.7 + Math.sin(t * 0.4) * 0.15 + Math.sin(t * 1.7) * 0.07;
    }
    if (this.lunaMesh) {
      this.lunaMesh.position.y = 22 + Math.sin(t * 0.22) * 0.8;
      if (this.lunaLight) this.lunaLight.position.copy(this.lunaMesh.position);
    }

    // ── 2. LUCE ACQUA SHIMMER (fog e luce pulsano leggermente) ──
    if (this.waterShimmerLight) {
      this.waterShimmerLight.intensity = 0.35 + Math.sin(t * 1.2) * 0.18 + Math.sin(t * 3.3) * 0.05;
      // Oscillazione colore tra blu e ciano
      const blend = (Math.sin(t * 0.5) + 1) / 2;
      this.waterShimmerLight.color.setRGB(0.02 + blend * 0.04, 0.25 + blend * 0.15, 0.50 + blend * 0.15);
    }

    // Fog shimmer — varia leggermente l'intensità
    if (this.g.scene.fog) {
      this.g.scene.fog.density = 0.038 + Math.sin(t * 0.3) * 0.004;
    }

    // ── 3. OMBRE DEL PASSATO camminano in cerchio ──
    this.ombre.forEach(o => {
      o.phase += dt * o.speed;
      o.grp.position.x = Math.cos(o.phase) * o.radius;
      o.grp.position.z = Math.sin(o.phase) * o.radius;
      o.grp.position.y = o.yBase + Math.sin(t * 0.8 + o.phase) * 0.12;
      // Ruota verso la direzione del moto
      o.grp.rotation.y = o.phase + Math.PI / 2;
      // Lieve oscillazione opacità (effetto fantasma che appare/scompare)
      o.grp.traverse(child => {
        if (child.isMesh && child.material.transparent) {
          child.material.opacity = 0.15 + Math.sin(t * 1.5 + o.phase * 2) * 0.08;
        }
      });
    });

    // ── 4. PESCI nuotano in cerchio a diverse velocità ──
    this.pesci.forEach(p => {
      p.angle += dt * p.speed * 0.5;
      p.mesh.position.x = Math.cos(p.angle) * p.radius + p.ox;
      p.mesh.position.z = Math.sin(p.angle) * p.radius + p.oz + p.centerZ;
      p.mesh.position.y = p.yBase + Math.sin(t * 2.5 + p.angle * 3) * 0.1;
      p.mesh.rotation.y = p.angle + Math.PI / 2;
    });

    // ── 5. CAMPANE oscillano lentamente ──
    this.campane.forEach(c => {
      c.grp.rotation.z = Math.sin(t * c.speed + c.phase) * c.amplitude;
      c.grp.rotation.x = Math.sin(t * c.speed * 0.7 + c.phase + 1.3) * c.amplitude * 0.4;
    });

    // ── 6. SIMBOLI PULSANO — emissiveIntensity oscilla ──
    this.simboli.forEach((s, idx) => {
      if (!s.mesh || !s.mesh.material) return;
      const ph = s.phase !== undefined ? s.phase : idx * 0.7;
      const pulse = 0.45 + Math.sin(t * 1.8 + ph) * 0.4;
      if (s.mesh.material.opacity !== undefined) {
        s.mesh.material.opacity = Math.max(0.15, pulse * 0.9);
      }
    });

    // ── 7. LUCE TEMPIO PULSA ──
    if (this.tempioLight) {
      this.tempioLight.intensity = 1.0 + Math.sin(t * 0.7) * 0.3;
    }

    // ── 8. LUCE ORACOLO PULSA ──
    if (this.oracoloLight) {
      this.oracoloLight.intensity = 0.5 + Math.sin(t * 1.1) * 0.25 + Math.sin(t * 2.8) * 0.1;
    }

    // ── 9. ONDULAZIONE SUPERFICIE ACQUA ──
    if (this.waterSurface && this.waterSurface.geometry) {
      const pos = this.waterSurface.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setZ(i, Math.sin(x * 0.18 + t * 0.5) * 0.08 + Math.cos(z * 0.22 + t * 0.4) * 0.06);
      }
      pos.needsUpdate = true;
    }

    // ── 10. MOVIMENTO NPC ──
    const pPos     = this.g.player ? this.g.player.grp.position : null;
    const isDialog = this.g.state === 'DIALOG';

    this.npcs.forEach(npc => {
      let stop = isDialog;
      if (pPos) {
        const dx = npc.position.x - pPos.x;
        const dz = npc.position.z - pPos.z;
        if (Math.sqrt(dx * dx + dz * dz) < 2.5) {
          stop = true;
          npc.rotation.y = Math.atan2(pPos.x - npc.position.x, pPos.z - npc.position.z);
        }
      }

      if (stop) {
        npc.userData.isMoving = false;
        npc.position.y = npc.userData.home.y;
        return;
      }

      npc.userData.walkTimer += dt;
      if (npc.userData.walkTimer > 4.0 + Math.random() * 3) {
        npc.userData.walkTimer = 0;
        if (npc.userData.isMoving) {
          npc.userData.isMoving = false;
        } else {
          npc.userData.isMoving = true;
          npc.userData.walkTarget.set(
            npc.userData.home.x + (Math.random() - 0.5) * npc.userData.range * 2,
            npc.userData.home.y,
            npc.userData.home.z + (Math.random() - 0.5) * npc.userData.range * 2
          );
        }
      }

      if (npc.userData.isMoving) {
        const dx   = npc.userData.walkTarget.x - npc.position.x;
        const dz   = npc.userData.walkTarget.z - npc.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          const spd = 0.5;
          npc.position.x += (dx / dist) * spd * dt;
          npc.position.z += (dz / dist) * spd * dt;
          npc.rotation.y  = Math.atan2(dx, dz);
          // Fluttuazione spettrale verticale
          npc.position.y  = npc.userData.home.y + Math.sin(t * 2.2) * 0.06;
        } else {
          npc.userData.isMoving = false;
          npc.position.y = npc.userData.home.y;
        }
      } else {
        // Fluttuazione leggera anche da fermi (sono fantasmi)
        npc.position.y = npc.userData.home.y + Math.sin(t * 1.8) * 0.04;
      }
    });

    // ── 11. SEPARAZIONE NPC ──
    const NPC_RADIUS = 0.55;
    for (let i = 0; i < this.npcs.length; i++) {
      for (let j = i + 1; j < this.npcs.length; j++) {
        const a  = this.npcs[i];
        const b  = this.npcs[j];
        const dx = a.position.x - b.position.x;
        const dz = a.position.z - b.position.z;
        const d  = Math.sqrt(dx * dx + dz * dz);
        const minD = NPC_RADIUS * 2;
        if (d < minD && d > 0.0001) {
          const push = (minD - d) * 0.5;
          a.position.x += (dx / d) * push;
          a.position.z += (dz / d) * push;
          b.position.x -= (dx / d) * push;
          b.position.z -= (dz / d) * push;
        }
      }
    }

    // ── 12. LUCE MASCHERA DORATA OSCILLA ──
    if (this._mascheraLight && this._mascheraLight.parent) {
      this._mascheraLight.intensity = 0.65 + Math.sin(t * 1.4) * 0.2;
    }
  }
}

// ── Esponi globalmente ──
window.CittaSommersa = CittaSommersa;
