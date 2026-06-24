// ============================================================
// ISLA PERDIDA — Livello 2: La Foresta degli Orologi
// ============================================================

class ForestaScene {
  constructor(g) {
    this.g = g;
    this.objs = [];
    this.time = 0;
    this.npcs = [];
    this.bats = [];
    this.pendulums = [];        // { grp, phase, speed, amplitude }
    this.insects = null;        // THREE.Points
    this.insectPositions = null;
    this.insectPhases = null;
    this.clockHour = 12;
    this.gateOpen = false;
    this.gate = null;
    this.accentLight = null;
    this.masterClockLight = null;
    this.masterHourHand = null;
    this.masterMinHand = null;
    this.gateCollider = null;   // ref rimossa quando il cancello si apre
    this.clockPanelEl = null;
    this.enemies = [];
  }

  addClickable(mesh, label, walkTarget, action, opts = {}) {
    const objDef = { mesh, label, walkTarget, action, ...opts };
    this.objs.push(objDef);
    mesh.traverse(child => {
      if (child.isMesh) child.userData.parentObj = objDef;
    });
  }

  // ─────────────────────────────────────────────────────────
  build() {
    const g = this.g;
    const scene = g.scene;

    // ── Nebbia verde-smeraldo profonda ──
    scene.fog = new THREE.FogExp2(0x061208, 0.038);
    scene.background = new THREE.Color(0x030a05);

    // ── Luci ──
    scene.add(new THREE.AmbientLight(0x0a2015, 0.8));
    this.moonLight = new THREE.DirectionalLight(0x3a8050, 0.55);
    this.moonLight.position.set(-5, 15, 5);
    scene.add(this.moonLight);

    // Luce turchese pulsante nella radura centrale
    this.accentLight = new THREE.PointLight(0x00c8a0, 0.9, 25);
    this.accentLight.position.set(0, 4, 10);
    scene.add(this.accentLight);

    // Luce dorata calda lontana (profondità foresta)
    const warmLight = new THREE.PointLight(0xd4a030, 0.4, 18);
    warmLight.position.set(0, 3, 17);
    scene.add(warmLight);

    // ── TERRENO ──
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0c1a08 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'Terreno Foresta';
    scene.add(floor);

    // ── COSTRUZIONE ──
    this._buildForest(scene);
    this._buildHangingClocks(scene);
    this._buildInsects(scene);
    this._buildBats(scene);
    this._buildBeach(scene, g);   // Riva della Nostalgia (sinistra)
    this._buildItems(scene, g);
    this._buildNPCs(scene, g);
    this._buildGate(scene, g);
    this._buildMasterClock(scene, g);
    this._buildEnemies(scene);
  }

  // ─────────────────────────────────────────────────────────
  _buildForest(scene) {
    this.treePositions = [];
    const trunkMat  = new THREE.MeshLambertMaterial({ color: 0x140a03 });
    const leavesMats = [
      new THREE.MeshLambertMaterial({ color: 0x0a2a0e }),
      new THREE.MeshLambertMaterial({ color: 0x0d3a14 }),
      new THREE.MeshLambertMaterial({ color: 0x143018 }),
      new THREE.MeshLambertMaterial({ color: 0x0a2008 }),
    ];

    // Anello di alberi più sparso attorno alla radura
    for (let i = 0; i < 40; i++) {
      const angle  = (i / 40) * Math.PI * 2;
      const radius = 10 + Math.random() * 12;
      const height = 3.5 + Math.random() * 5;
      const grp    = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 + Math.random() * 0.15, 0.25 + Math.random() * 0.15, height, 7),
        trunkMat
      );
      trunk.position.y = height / 2;
      grp.add(trunk);

      const layerCount = 2 + Math.floor(Math.random() * 3);
      for (let l = 0; l < layerCount; l++) {
        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(1.1 + Math.random() * 1.4, 7, 5),
          leavesMats[Math.floor(Math.random() * leavesMats.length)]
        );
        leaves.position.set(
          (Math.random() - 0.5) * 0.6,
          height - 0.3 + l * 0.9,
          (Math.random() - 0.5) * 0.6
        );
        leaves.scale.set(1, 0.75 + Math.random() * 0.45, 1);
        grp.add(leaves);
      }

      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      // ── Lascia aperto il corridoio verso la Riva della Nostalgia ──
      if (tx < -8 && tz > -8 && tz < 6) continue;

      // ── Lascia libera la visuale della telecamera (centro-sud) ──
      // Previene che gli alberi coprano il personaggio lungo il percorso principale
      if (Math.abs(tx) < 8 && tz > -2) continue;

      grp.position.set(tx, 0, tz);
      scene.add(grp);
      this.treePositions.push({ x: tx, z: tz });
    }

    // Cespugli sottobosco
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x081808 });
    for (let i = 0; i < 30; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 13;
      const bush   = new THREE.Mesh(
        new THREE.SphereGeometry(0.35 + Math.random() * 0.55, 6, 5),
        bushMat
      );
      bush.position.set(
        Math.cos(angle) * radius,
        0.25,
        Math.sin(angle) * radius
      );
      bush.scale.set(1, 0.55, 1);
      scene.add(bush);
    }

    // Liane pendenti
    const vineMat = new THREE.MeshBasicMaterial({ color: 0x183018 });
    for (let i = 0; i < 20; i++) {
      const vine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 2 + Math.random() * 3, 5),
        vineMat
      );
      vine.position.set(
        (Math.random() - 0.5) * 18,
        2.5 + Math.random() * 2,
        1 + Math.random() * 14
      );
      vine.rotation.z = (Math.random() - 0.5) * 0.25;
      scene.add(vine);
    }

    // Muschio / radici sinuose a terra
    const rootMat = new THREE.MeshLambertMaterial({ color: 0x0a1a08 });
    for (let i = 0; i < 12; i++) {
      const root = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 + Math.random() * 0.8, 0.04, 4, 12, Math.PI * 0.7),
        rootMat
      );
      root.position.set((Math.random() - 0.5) * 14, 0.04, 2 + Math.random() * 12);
      root.rotation.x = Math.PI / 2;
      root.rotation.z = Math.random() * Math.PI;
      scene.add(root);
    }
  }

  // ─────────────────────────────────────────────────────────
  _buildHangingClocks(scene) {
    const frameMat  = new THREE.MeshLambertMaterial({ color: 0x8a6820 }); // oro ossidato
    const faceMat   = new THREE.MeshLambertMaterial({ color: 0xddc878 });
    const handMat   = new THREE.MeshBasicMaterial({ color: 0x100800 });
    const ropeMat   = new THREE.MeshBasicMaterial({ color: 0x3a2808 });

    const positions = [
      [-5, 4.6, 2.5], [-2.5, 5.2, 3], [1.2, 4.2, 2.8], [4, 5.6, 3.5],
      [-3.5, 4.3, 6.5], [0.5, 5.3, 7.2], [3.5, 4.7, 6.8], [-4.5, 5.1, 9.5],
      [2.5, 4.3, 8.5], [-1.5, 5.7, 5.5], [5.5, 4.2, 5.8], [-6, 4.5, 4.5],
      [1.5, 5.2, 11.5], [-2.5, 4.7, 12.2], [4.5, 5.2, 10.8],
      [0, 5.5, 14.5], [-3, 4.8, 15], [3, 5, 15.5],  // oltre il cancello
    ];

    positions.forEach(([x, y, z]) => {
      const grp = new THREE.Group();

      // Corda
      const ropeLen = 0.7 + Math.random() * 1.2;
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, ropeLen), ropeMat);
      rope.position.y = ropeLen / 2 + 0.3;
      grp.add(rope);

      // Cornice (toro)
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.048, 8, 24), frameMat);
      grp.add(frame);

      // Quadrante
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.23, 24), faceMat);
      face.position.z = 0.012;
      grp.add(face);

      // 12 marcatori ore
      for (let m = 0; m < 12; m++) {
        const a   = (m / 12) * Math.PI * 2;
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 6), handMat);
        dot.position.set(Math.sin(a) * 0.19, Math.cos(a) * 0.19, 0.02);
        grp.add(dot);
      }

      // Lancetta ore (angolo casuale per ogni orologio → tutti segnano ore diverse)
      const hAngle = Math.random() * Math.PI * 2;
      const hHand  = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.13, 0.008), handMat);
      hHand.position.set(Math.sin(hAngle) * 0.05, Math.cos(hAngle) * 0.05, 0.03);
      hHand.rotation.z = -hAngle;
      grp.add(hHand);

      // Lancetta minuti
      const mAngle = Math.random() * Math.PI * 2;
      const mHand  = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.18, 0.008), handMat);
      mHand.position.set(Math.sin(mAngle) * 0.07, Math.cos(mAngle) * 0.07, 0.04);
      mHand.rotation.z = -mAngle;
      grp.add(mHand);

      // Pendolo
      const pendGrp = new THREE.Group();
      const pendRod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28), ropeMat);
      pendRod.position.y = -0.14;
      pendGrp.add(pendRod);
      const pendBob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), frameMat);
      pendBob.position.y = -0.3;
      pendGrp.add(pendBob);
      pendGrp.position.y = -0.28;
      grp.add(pendGrp);

      this.pendulums.push({
        grp:       pendGrp,
        phase:     Math.random() * Math.PI * 2,
        speed:     1.4 + Math.random() * 1.8,
        amplitude: 0.28 + Math.random() * 0.35
      });

      grp.position.set(x, y, z);
      grp.rotation.y = (Math.random() - 0.5) * 0.6;
      scene.add(grp);
    });
  }

  // ─────────────────────────────────────────────────────────
  _buildInsects(scene) {
    const count     = 200;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = 0.4 + Math.random() * 4.5;
      positions[i * 3 + 2] = Math.random() * 22;
      // Teal‑cyan con variazioni
      colors[i * 3]     = Math.random() * 0.1;
      colors[i * 3 + 1] = 0.75 + Math.random() * 0.25;
      colors[i * 3 + 2] = 0.55 + Math.random() * 0.45;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size:         0.065,
      vertexColors: true,
      transparent:  true,
      opacity:      0.88,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false
    });

    this.insects          = new THREE.Points(geo, mat);
    this.insectPositions  = positions.slice(); // copia per offset base
    this.insectPhases     = Array.from({ length: count }, () => Math.random() * Math.PI * 2);
    scene.add(this.insects);
  }

  // ─────────────────────────────────────────────────────────
  _buildBats(scene) {
    const batBodyMat = new THREE.MeshLambertMaterial({ color: 0x1f1a1d });
    const batWingMat = new THREE.MeshLambertMaterial({ color: 0x141113, side: THREE.DoubleSide });

    for (let i = 0; i < 5; i++) {
      const bat = new THREE.Group();
      bat.name = 'Pipistrello Silenzioso';

      // Corpo principale
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), batBodyMat);
      body.position.y = 0;
      bat.add(body);

      // Testa con orecchie
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), batBodyMat);
      head.position.set(0, 0, 0.08);
      bat.add(head);

      // Ala Sinistra
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.01, 0.08), batWingMat);
      wingL.position.set(-0.13, 0, 0);
      bat.add(wingL);
      bat.userData.wingL = wingL;

      // Ala Destra
      const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.01, 0.08), batWingMat);
      wingR.position.set(0.13, 0, 0);
      bat.add(wingR);
      bat.userData.wingR = wingR;

      // Posizionamento iniziale casuale ad altezze diverse (tra 3.2 e 6.5)
      bat.position.set(
        (Math.random() - 0.5) * 35,
        3.2 + Math.random() * 3.3,
        (Math.random() - 0.5) * 35
      );

      bat.userData.target = new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        3.2 + Math.random() * 3.3,
        (Math.random() - 0.5) * 35
      );
      bat.userData.speed = 2.5 + Math.random() * 3.0;
      bat.userData.wingPhase = Math.random() * Math.PI * 2;
      bat.userData.wingSpeed = 15 + Math.random() * 10;

      scene.add(bat);
      this.bats.push(bat);
    }
  }

  // ─────────────────────────────────────────────────────────
  _buildItems(scene, g) {

    // ── MANGO FLUORESCENTE (zona ingresso) ──
    const mangoMesh  = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0x00ff88, emissive: 0x00bb55, emissiveIntensity: 1.8 })
    );
    mangoMesh.name = 'Mango Fluorescente';
    mangoMesh.position.set(3.5, 0.5, 5.2);
    scene.add(mangoMesh);
    const mangoLight = new THREE.PointLight(0x00ff88, 1.8, 3.5);
    mangoLight.position.copy(mangoMesh.position);
    scene.add(mangoLight);
    this.mangoLight = mangoLight;
    this.addClickable(mangoMesh, 'Mango Fluorescente', { x: 3, z: 4.7 }, () => {
      if (!g.inv.has('mango_fluorescente')) {
        g.inv.add('mango_fluorescente');
        g.notify('🟢 Mango Fluorescente raccolto! Odora di orologiaio e ingranaggi. Strano.');
        scene.remove(mangoMesh);
        scene.remove(mangoLight);
        this.objs = this.objs.filter(o => o.mesh !== mangoMesh);
      } else {
        g.notify('Il mango è già nel tuo zaino. Continua a brillare.');
      }
    });

    // ── FISCHIETTO D'OSSO (zona ingresso sinistra) ──
    const fischietto = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.28, 8),
      new THREE.MeshLambertMaterial({ color: 0xe8d8a8 })
    );
    fischietto.name = "Fischietto d'Osso";
    fischietto.position.set(-4, 0.22, 4.2);
    fischietto.rotation.z = Math.PI / 5;
    scene.add(fischietto);
    this.addClickable(fischietto, "Fischietto d'Osso", { x: -3.5, z: 3.8 }, () => {
      if (!g.inv.has('fischietto_osso')) {
        g.inv.add('fischietto_osso');
        g.notify("🦴 Hai raccolto il Fischietto d'Osso. Un suono quasi impercettibile. Gli orologi intorno accelerano leggermente.");
        scene.remove(fischietto);
        this.objs = this.objs.filter(o => o.mesh !== fischietto);
      } else {
        g.notify("Il fischietto è già nel tuo zaino.");
      }
    });

    // ── OROLOGIO SENZA LANCETTE (zona media) ──
    const orologioGrp  = new THREE.Group();
    const orologioFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.042, 8, 24),
      new THREE.MeshLambertMaterial({ color: 0x8a6820 }));
    orologioGrp.add(orologioFrame);
    const orologioFace  = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24),
      new THREE.MeshLambertMaterial({ color: 0xddc878 }));
    orologioFace.position.z = 0.012;
    orologioGrp.add(orologioFace);
    orologioGrp.name = 'Orologio senza Lancette';
    orologioGrp.position.set(-2.2, 0.42, 7.2);
    orologioGrp.rotation.y = 0.35;
    scene.add(orologioGrp);
    this.addClickable(orologioGrp, 'Orologio senza Lancette', { x: -2, z: 6.7 }, () => {
      if (!g.inv.has('orologio_senza_lancette')) {
        g.inv.add('orologio_senza_lancette');
        g.notify('🕰️ Orologio senza Lancette raccolto. Il quadrante è perfetto. Mancano solo le lancette. E il senso del tempo.');
        scene.remove(orologioGrp);
        this.objs = this.objs.filter(o => o.mesh !== orologioGrp);
      } else {
        g.notify("L'orologio è già nello zaino. Non segna ancora l'ora.");
      }
    });

    // ── DIARIO INCOMPLETO (zona media) ──
    const diarioMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.24, 0.04),
      new THREE.MeshLambertMaterial({ color: 0x3a2015 })
    );
    diarioMesh.name = 'Diario Incompleto';
    diarioMesh.position.set(2.2, 0.14, 8.8);
    diarioMesh.rotation.y = 0.5;
    scene.add(diarioMesh);
    // Piccola luce arancio su di esso come se fosse aperto e illuminato
    const diarioLight = new THREE.PointLight(0xffaa44, 0.6, 2);
    diarioLight.position.set(2.2, 0.5, 8.8);
    scene.add(diarioLight);
    this.addClickable(diarioMesh, 'Diario Incompleto', { x: 2, z: 8.3 }, () => {
      if (!g.inv.has('diario_incompleto')) {
        g.inv.add('diario_incompleto');
        g.notify('📓 Diario Incompleto trovato! Ultima pagina: "…l\'Orologio Maestro alle ORE 3. Solo allora il guardiano dimenticherà di averti visto."');
        g.setFlag('letto_diario');
        scene.remove(diarioMesh);
        scene.remove(diarioLight);
        this.objs = this.objs.filter(o => o.mesh !== diarioMesh);
      } else {
        g.notify("Il diario è nello zaino. L'ora giusta è le 3.");
      }
    });

    // ── PENDOLO SPEZZATO (oltre il cancello) ──
    const pendGrp2 = new THREE.Group();
    const pendRod2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6, 7),
      new THREE.MeshLambertMaterial({ color: 0x9a7028 })
    );
    pendGrp2.add(pendRod2);
    const pendBob2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0xc89040 })
    );
    pendBob2.position.y = -0.38;
    pendGrp2.add(pendBob2);
    pendGrp2.name = 'Pendolo Spezzato';
    pendGrp2.position.set(4.2, 0.5, 13.5);
    scene.add(pendGrp2);
    this.addClickable(pendGrp2, 'Pendolo Spezzato', { x: 4, z: 13 }, () => {
      if (!g.inv.has('pendolo_spezzato')) {
        g.inv.add('pendolo_spezzato');
        g.notify('⚖️ Pendolo Spezzato raccolto. Oscillava ancora al momento della rottura. Ora è immobile.');
        scene.remove(pendGrp2);
        this.objs = this.objs.filter(o => o.mesh !== pendGrp2);
      } else {
        g.notify('Il pendolo è già nello zaino.');
      }
    });

    // ── FONTE D'ACQUA PURA (Livello 2) ──
    const fountainGrp = new THREE.Group();
    fountainGrp.name = "Fonte d'Acqua Pura";
    
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.08, 8, 16),
      new THREE.MeshLambertMaterial({ color: 0x1a3a2a })
    );
    ring.rotation.x = Math.PI / 2;
    fountainGrp.add(ring);
    
    const waterLevel = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 16),
      new THREE.MeshLambertMaterial({ color: 0x00aaff, emissive: 0x0033aa, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 })
    );
    waterLevel.rotation.x = -Math.PI / 2;
    waterLevel.position.y = 0.02;
    fountainGrp.add(waterLevel);
    
    fountainGrp.position.set(-2.2, 0.05, 11);
    scene.add(fountainGrp);
    
    this.addClickable(fountainGrp, "Fonte d'Acqua Pura", { x: -2.2, z: 10.2 }, () => {
      g.updateHealth(50);
      g.notify("💧 Hai bevuto l'acqua fresca e pura della fonte. (+50% Salute)");
      g.audio.playTone(400, 'sine', 0.2, 0.1);
    });

    // ── MAPPA ANTICA (📜) ──
    const mappaMesh = new THREE.Group();
    mappaMesh.name = 'Mappa Antica';
    const paper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8),
      new THREE.MeshLambertMaterial({ color: 0xd8cbb0 }) // colore pergamena
    );
    paper.rotation.z = Math.PI / 2;
    mappaMesh.add(paper);
    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.04),
      new THREE.MeshLambertMaterial({ color: 0x8b0000 }) // nastro rosso
    );
    ribbon.rotation.z = Math.PI / 2;
    mappaMesh.add(ribbon);
    
    mappaMesh.position.set(5.5, 0.15, 8.5);
    scene.add(mappaMesh);
    
    // Piccola luce dorata sopra di essa
    const mappaLight = new THREE.PointLight(0xd4a030, 1.2, 2.5);
    mappaLight.position.set(5.5, 0.4, 8.5);
    scene.add(mappaLight);
    
    this.addClickable(mappaMesh, 'Mappa Antica', { x: 5.0, z: 8.2 }, () => {
      if (!g.inv.has('mappa_antica')) {
        g.inv.add('mappa_antica');
        g.notify('📜 Mappa Antica raccolta! Mostra una X disegnata sul lato destro dell\'Orologio Maestro.');
        scene.remove(mappaMesh);
        scene.remove(mappaLight);
        this.objs = this.objs.filter(o => o.mesh !== mappaMesh);
      } else {
        g.notify('La mappa antica è già nel tuo zaino.');
      }
    });

    // ── CUMULO DI TERRA PER SCAVARE (x = 2.0, z = 10.2) ──
    const terraMat = new THREE.MeshLambertMaterial({ color: 0x422d1b });
    const terraMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.12, 8),
      terraMat
    );
    terraMesh.name = 'Cumulo di Terra';
    terraMesh.position.set(2.0, 0.06, 10.2);
    scene.add(terraMesh);
    
    this.addClickable(terraMesh, 'Cumulo di Terra', { x: 1.5, z: 9.8 }, () => {
      if (!g.inv.has('mappa_antica') && !g.inv.has('pugnale_antico') && !g.inv.has('monete_oro') && !g.flags.pugnale_venduto) {
        g.notify('C\'è della terra smossa qui a fianco dell\'Orologio Maestro. Sembra un punto in cui scavare, ma non sai dove di preciso senza indicazioni.');
      } else if (g.inv.has('mappa_antica')) {
        g.inv.rem('mappa_antica');
        g.inv.add('pugnale_antico');
        g.notify('🗡️ Usando la Mappa Antica come guida, scavi nel terreno e trovi un Pugnale Antico intarsiato!');
        g.audio.playTone(300, 'triangle', 0.4, 0.15);
        
        // Modifica la mesh per mostrare che è scavata
        terraMesh.scale.set(1.2, 0.2, 1.2);
        terraMesh.material.color.set(0x1a0f07);
      } else {
        g.notify('Hai già scavato qui e scoperto il pugnale antico.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // ── RIVA DELLA NOSTALGIA ── Spiaggia sul lato sinistro della foresta
  _buildBeach(scene, g) {
    // ── Terreno sabbioso (patch di sabbia che sovrasta il terreno verde) ──
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xc8a87a });
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.name = 'Sabbia Riva della Nostalgia';
    sand.position.set(-17, 0.005, 0);
    scene.add(sand);

    // ── Battigia (linea tra sabbia e mare — colore più scuro umido) ──
    const wetsandMat = new THREE.MeshLambertMaterial({ color: 0x9a7850 });
    const wetSand = new THREE.Mesh(new THREE.PlaneGeometry(4, 18), wetsandMat);
    wetSand.rotation.x = -Math.PI / 2;
    wetSand.position.set(-23.5, 0.006, 0);
    scene.add(wetSand);

    // ── Mare (piano blu-verde che si estende verso sinistra) ──
    const seaMat = new THREE.MeshLambertMaterial({
      color: 0x0a4a7a,
      emissive: 0x001530,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), seaMat);
    sea.rotation.x = -Math.PI / 2;
    sea.name = 'Mare';
    sea.position.set(-36, -0.01, 0);
    scene.add(sea);
    this.seaMesh = sea;

    // Luce blu-verde del mare che illumina la riva
    const beachLight = new THREE.PointLight(0x2a9acc, 0.9, 16);
    beachLight.position.set(-20, 2.5, 0);
    scene.add(beachLight);
    this.beachLight = beachLight;

    // Luce ambientale calda al tramonto per la spiaggia
    const sunsetLight = new THREE.PointLight(0xd48030, 0.6, 20);
    sunsetLight.position.set(-26, 5, -2);
    scene.add(sunsetLight);

    // ── Rocce sulla riva ──
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x6a5a48 });
    const rockPositions = [
      [-14.5, 0, -5.5, 0.6, 0.4, 0.5], [-14, 0, -3,   0.4, 0.25, 0.45],
      [-22.5, 0,  4,   0.8, 0.5, 0.7], [-23, 0, -4.5, 0.55, 0.3, 0.5],
      [-20,   0,  6.5, 0.45, 0.28, 0.4], [-21, 0, -7,  0.7, 0.4, 0.6],
      [-25,   0,  2,   0.35, 0.2, 0.3], [-24.5, 0, -2, 0.5, 0.3, 0.45],
    ];
    rockPositions.forEach(([rx, ry, rz, sx, sy, sz]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), rockMat);
      rock.position.set(rx, sy * 0.5, rz);
      rock.scale.set(sx, sy, sz);
      rock.rotation.y = Math.random() * Math.PI;
      scene.add(rock);
    });

    // ── Palme inclinate verso il mare ──
    const palmTrunkMat = new THREE.MeshLambertMaterial({ color: 0x7a5c28 });
    const palmLeafMat  = new THREE.MeshLambertMaterial({ color: 0x2a6a18 });
    [[-14.5, 0, 4.5, -0.22], [-15, 0, -4, -0.18]].forEach(([px, py, pz, lean]) => {
      const palmGrp = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3.8, 7), palmTrunkMat);
      trunk.position.y = 1.9;
      trunk.rotation.z = lean;
      palmGrp.add(trunk);
      // Chioma foglie palmizi
      for (let fi = 0; fi < 6; fi++) {
        const leafAngle = (fi / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4, 1, true), palmLeafMat);
        leaf.position.set(
          Math.sin(leafAngle) * 0.9 + lean * 3.8,
          3.9,
          Math.cos(leafAngle) * 0.9
        );
        leaf.rotation.set(0.9, leafAngle, 0);
        palmGrp.add(leaf);
      }
      palmGrp.position.set(px, py, pz);
      scene.add(palmGrp);
    });

    // ── Conchiglie e resti sulla spiaggia ──
    const shellMat = new THREE.MeshLambertMaterial({ color: 0xe8c89a });
    for (let s = 0; s < 8; s++) {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.06, 6, 4), shellMat);
      shell.scale.set(1, 0.4, 1);
      shell.position.set(
        -22 + Math.random() * 4,
        0.02,
        -5 + Math.random() * 10
      );
      scene.add(shell);
    }

    // ── Tracce di piedi nella sabbia (suggerisce il cammino verso la barca) ──
    const footMat = new THREE.MeshLambertMaterial({ color: 0xaa8a5a });
    for (let f = 0; f < 6; f++) {
      const foot = new THREE.Mesh(new THREE.EllipseCurve ? new THREE.PlaneGeometry(0.12, 0.22) : new THREE.PlaneGeometry(0.12, 0.2), footMat);
      foot.rotation.x = -Math.PI / 2;
      foot.rotation.z = (f % 2 === 0 ? 0.2 : -0.2);
      foot.position.set(-12 - f * 1.5, 0.01, f % 2 === 0 ? 0.3 : -0.3);
      scene.add(foot);
    }

    // ── CARTELLO: RIVA DELLA NOSTALGIA ──
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6),
      new THREE.MeshLambertMaterial({ color: 0x6b3a10 }));
    signPost.position.set(-11.5, 0.8, -0.8);
    scene.add(signPost);
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.06),
      new THREE.MeshLambertMaterial({ color: 0xc89a58 }));
    signBoard.position.set(-11.5, 1.5, -0.8);
    signBoard.rotation.y = 0.2;
    scene.add(signBoard);

    // ── BARCA della Riva della Nostalgia ──
    const boatGrp = new THREE.Group();
    boatGrp.name = 'Barca — Riva della Nostalgia';

    // Scafo principale
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x5c3010 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 3.0), hullMat);
    hull.position.y = 0.22;
    boatGrp.add(hull);

    // Bordi rialzati
    const rimMat = new THREE.MeshLambertMaterial({ color: 0x3d1e08 });
    [[-0.7, 0.22, 0], [0.7, 0.22, 0]].forEach(([bx, by, bz]) => {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 3.0), rimMat);
      rim.position.set(bx, by + 0.22, bz);
      boatGrp.add(rim);
    });

    // Interni barca (tavolato)
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x7a4a18 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 2.7), deckMat);
    deck.position.y = 0.46;
    boatGrp.add(deck);

    // Pagaia appoggiata
    const paddleMat = new THREE.MeshLambertMaterial({ color: 0x9a6030 });
    const paddleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), paddleMat);
    paddleHandle.position.set(0.5, 0.6, 0);
    paddleHandle.rotation.z = 0.3;
    boatGrp.add(paddleHandle);
    const paddleBlade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.45), paddleMat);
    paddleBlade.position.set(0.8, 0.98, 0.35);
    boatGrp.add(paddleBlade);

    // Corda di ormeggio
    const ropeMat = new THREE.MeshLambertMaterial({ color: 0xa08060 });
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 5), ropeMat);
    rope.position.set(-0.4, 0.3, -1.5);
    rope.rotation.z = 0.5;
    boatGrp.add(rope);

    // Posizionamento sulla riva: mezzo in acqua, mezzo sulla sabbia
    boatGrp.position.set(-23, 0.08, 0.5);
    boatGrp.rotation.y = Math.PI * 0.5 + 0.12; // prua verso il mare
    scene.add(boatGrp);

    // Luce dedicata sulla barca (atmosfera dorata tramonto)
    const boatLight = new THREE.PointLight(0xdd8830, 1.2, 5);
    boatLight.position.set(-23, 2, 0.5);
    scene.add(boatLight);

    // Onda che si increspa intorno alla barca
    const waveRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.06, 6, 20),
      new THREE.MeshLambertMaterial({ color: 0x2a7aaa, transparent: true, opacity: 0.6 })
    );
    waveRing.rotation.x = Math.PI / 2;
    waveRing.position.set(-23, 0.02, 0.5);
    scene.add(waveRing);
    this.boatWaveRing = waveRing;

    // ── CLICKABLE: dialogo e ritorno al Livello 1 ──
    this.addClickable(boatGrp, '⛵ Barca — Riva della Nostalgia', { x: -20.5, z: 0.5 }, () => {
      g.startDialog('ritorno_porto', [
        { id:'start', speaker:'La Tua Barca', portrait:'⛵',
          text:'È la barca con cui sei arrivata alla Foresta degli Orologi. La spiaggia odora di salmastro e ricordi. Vuoi riprendere il mare e tornare al Porto delle Maree Morte?',
          choices:[
            { text:'Sì, torno al Porto.', next:'conferma_ritorno' },
            { text:'No, la foresta mi aspetta ancora.', next:'end' }
          ]
        },
        { id:'conferma_ritorno', speaker:'La Tua Barca', portrait:'⛵',
          text:'Spingi la barca in acqua. L\'onda ti prende e ti porta via dalla Foresta degli Orologi. Il ticchettio si affievolisce...',
          choices:[], action:'TORNA_LIVELLO1'
        }
      ]);
    });
  }

  // ─────────────────────────────────────────────────────────
  _buildNPCs(scene, g) {
    // NPC 1: Yorick — raccoglitore di orologi con problemi di memoria
    const yorick = this._createNPC(scene, 0x3a5020, -3, 0.8, 4.5);
    yorick.name = 'Yorick — Raccoglitore di Orologi';
    this.addClickable(yorick, 'Yorick — Raccoglitore di Orologi', { x: -2.5, z: 4 }, () => {
      g.startDialog('yorick', GAME_DATA.dialogs_l2.yorick);
    });

    // NPC 2: Guardiano della Foresta (parla al contrario) — oltre il cancello
    const guardiano = this._createGuardiano(scene, 0, 0.8, 16.5);
    guardiano.name = 'Guardiano della Foresta';
    this.addClickable(guardiano, 'Guardiano della Foresta', { x: 0, z: 16 }, () => {
      if (!this.gateOpen) {
        g.notify('"…" Il guardiano ti osserva da oltre il cancello. Il passaggio è bloccato.');
      } else {
        g.startDialog('guardiano_foresta', GAME_DATA.dialogs_l2.guardiano_foresta);
      }
    });

    const initNPC = (npc, range) => {
      npc.userData.home      = npc.position.clone();
      npc.userData.walkTarget = npc.position.clone();
      npc.userData.isMoving  = false;
      npc.userData.walkTimer = Math.random() * 2;
      npc.userData.range     = range;
      this.npcs.push(npc);
    };
    initNPC(yorick,    1.8);
    initNPC(guardiano, 0.6);   // il guardiano si muove pochissimo
  }

  // ─────────────────────────────────────────────────────────
  _buildGate(scene, g) {
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x0d1f0a });
    const barMat    = new THREE.MeshLambertMaterial({ color: 0x0a180a });

    // Pilastri laterali
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.5), pillarMat);
    lp.position.set(-1.6, 1.75, 12.8);
    scene.add(lp);
    const rp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.5), pillarMat);
    rp.position.set(1.6, 1.75, 12.8);
    scene.add(rp);

    // Gruppo cancello (barre verticali + traversa)
    this.gate = new THREE.Group();
    this.gate.name = 'Cancello della Foresta';

    for (let b = 0; b < 6; b++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 3.2), barMat.clone());
      bar.position.set(-1.25 + b * 0.5, 1.8, 0);
      this.gate.add(bar);
    }
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.1), barMat.clone());
    topBar.position.y = 3.2;
    this.gate.add(topBar);

    // Spine di rovi decorate
    const thornMat = new THREE.MeshLambertMaterial({ color: 0x1a3010 });
    for (let t = 0; t < 8; t++) {
      const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), thornMat);
      thorn.position.set(-1.2 + t * 0.38, 2.5 + (Math.random() - 0.5) * 1.8, 0.05);
      thorn.rotation.z = (Math.random() - 0.5) * 1.2;
      this.gate.add(thorn);
    }

    this.gate.position.set(0, 0, 12.8);
    scene.add(this.gate);

    // Clickable sul cancello
    this.addClickable(this.gate, 'Cancello di Rovi Intrecciati', { x: 0, z: 12.2 }, () => {
      if (this.gateOpen) {
        g.notify('Il cancello è aperto. Il sentiero è libero.');
      } else if (!g.inv.has('diario_incompleto')) {
        g.notify('Il cancello è bloccato da rovi fitti. Forse qualcuno nel bosco sa come aprirlo...');
      } else {
        g.notify('Il diario dice: imposta l\'Orologio Maestro sulle ORE 3. Il cancello si aprirà.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  _buildMasterClock(scene, g) {
    const grp = new THREE.Group();
    grp.name  = 'Orologio Maestro';

    // Piedistallo
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 0.75, 14),
      new THREE.MeshLambertMaterial({ color: 0x3a2008 })
    );
    ped.position.y = 0.38;
    grp.add(ped);

    // Corpo orologio
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.13, 32),
      new THREE.MeshLambertMaterial({ color: 0x8a6018 })
    );
    body.position.y = 0.95;
    grp.add(body);

    // Quadrante
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.52, 32),
      new THREE.MeshLambertMaterial({ color: 0xeedd88 })
    );
    face.position.set(0, 0.95, 0.075);
    grp.add(face);

    // 12 segni ore sul quadrante
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x0a0500 });
    for (let m = 0; m < 12; m++) {
      const a      = (m / 12) * Math.PI * 2;
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.075, 0.01), markerMat);
      marker.position.set(Math.sin(a) * 0.4, 0.95 + Math.cos(a) * 0.4, 0.085);
      marker.rotation.z = -a;
      grp.add(marker);
    }

    // Lancetta ORA (controllata dall'utente)
    const hGeo = new THREE.BoxGeometry(0.038, 0.26, 0.018);
    hGeo.translate(0, 0.13, 0);   // pivot in basso
    this.masterHourHand = new THREE.Mesh(hGeo, new THREE.MeshBasicMaterial({ color: 0x080300 }));
    this.masterHourHand.position.set(0, 0.95, 0.09);
    grp.add(this.masterHourHand);

    // Lancetta MINUTI (fissa a 12)
    const mGeo = new THREE.BoxGeometry(0.026, 0.36, 0.018);
    mGeo.translate(0, 0.18, 0);
    this.masterMinHand = new THREE.Mesh(mGeo, new THREE.MeshBasicMaterial({ color: 0x080300 }));
    this.masterMinHand.position.set(0, 0.95, 0.1);
    grp.add(this.masterMinHand);

    // Cerchio centrale
    const center = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), markerMat);
    center.position.set(0, 0.95, 0.11);
    grp.add(center);

    grp.position.set(0, 0, 10.2);
    scene.add(grp);
    this._updateMasterClockHands();

    // Luce dorata sul quadrante
    this.masterClockLight = new THREE.PointLight(0xddaa40, 1.6, 6);
    this.masterClockLight.position.set(0, 2, 10.2);
    scene.add(this.masterClockLight);

    // Clickable
    this.addClickable(grp, 'Orologio Maestro', { x: 0, z: 9.5 }, () => {
      this._showClockInterface(g);
    });
  }

  _updateMasterClockHands() {
    if (!this.masterHourHand) return;
    // 0h = lancetta punta su (rotation.z = 0), 3h = punta a destra (rotation.z = -PI/2)...
    const hourAngle = ((this.clockHour % 12) / 12) * Math.PI * 2;
    this.masterHourHand.rotation.z = -hourAngle;
    this.masterMinHand.rotation.z  = 0; // sempre a mezzodì
  }

  _showClockInterface(g) {
    if (!this.clockPanelEl) {
      const panel = document.createElement('div');
      panel.id = 'clock-panel';
      panel.style.cssText = [
        'position:fixed', 'bottom:150px', 'left:50%', 'transform:translateX(-50%)',
        'background:linear-gradient(160deg,#1a0e04,#0a1a0a)',
        'border:2px solid #8a6820', 'border-radius:14px',
        'padding:14px 22px', 'z-index:95',
        'display:flex', 'align-items:center', 'gap:16px',
        'font-family:\'IM Fell English\',serif', 'color:#d4b060',
        'box-shadow:0 0 30px rgba(160,120,20,0.35)',
        'animation:slideUp .3s ease'
      ].join(';');
      document.body.appendChild(panel);
      this.clockPanelEl = panel;
    }

    const panel = this.clockPanelEl;
    panel.innerHTML = '';
    panel.style.display = 'flex';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:.95rem;letter-spacing:.04em;white-space:nowrap;';
    lbl.textContent = '⏰ Imposta l\'Orologio Maestro:';
    panel.appendChild(lbl);

    const mkBtn = (txt, style) => {
      const b = document.createElement('button');
      b.textContent = txt;
      b.style.cssText = style;
      return b;
    };

    const btnMinus = mkBtn('◀', 'font-size:1.3rem;background:rgba(180,130,20,.18);border:1px solid #7a5818;color:#d4b060;border-radius:7px;padding:4px 11px;cursor:pointer;');
    const display  = document.createElement('span');
    display.style.cssText = 'font-size:2rem;font-weight:bold;min-width:55px;text-align:center;color:#f0d060;text-shadow:0 0 12px rgba(240,200,60,.75);';
    display.textContent = `${this.clockHour}:00`;
    const btnPlus  = mkBtn('▶', 'font-size:1.3rem;background:rgba(180,130,20,.18);border:1px solid #7a5818;color:#d4b060;border-radius:7px;padding:4px 11px;cursor:pointer;');
    const btnOk    = mkBtn('✓ Conferma', 'font-size:.92rem;background:linear-gradient(135deg,#4a3010,#7a5818);border:1px solid #9a7820;color:#f0d070;border-radius:8px;padding:6px 15px;cursor:pointer;margin-left:6px;');
    const btnX     = mkBtn('✕', 'font-size:.95rem;background:none;border:none;color:#7a5828;cursor:pointer;');

    [btnMinus, display, btnPlus, btnOk, btnX].forEach(el => panel.appendChild(el));

    const upd = () => { display.textContent = `${this.clockHour}:00`; };
    btnMinus.onclick = () => { this.clockHour = ((this.clockHour - 2 + 12) % 12) + 1; upd(); this._updateMasterClockHands(); };
    btnPlus.onclick  = () => { this.clockHour = (this.clockHour % 12) + 1;            upd(); this._updateMasterClockHands(); };
    btnOk.onclick    = () => { panel.style.display = 'none'; this._checkClockPuzzle(g); };
    btnX.onclick     = () => { panel.style.display = 'none'; };
  }

  _checkClockPuzzle(g) {
    if (this.clockHour === 3) {
      if (!this.gateOpen) {
        this.gateOpen = true;

        // Rimuovi il collider fisico del cancello dal player
        if (g.player && this.gateCollider) {
          g.player.staticColliders = g.player.staticColliders.filter(c => c !== this.gateCollider);
          this.gateCollider = null;
        }

        // Dissolvi visivamente il cancello
        if (this.gate) {
          const fadeGate = () => {
            let done = true;
            this.gate.traverse(child => {
              if (child.isMesh) {
                if (!child.material.transparent) {
                  child.material = child.material.clone();
                  child.material.transparent = true;
                }
                if (child.material.opacity > 0) {
                  child.material.opacity -= 0.04;
                  done = false;
                }
              }
            });
            if (!done) { requestAnimationFrame(fadeGate); }
            else { g.scene.remove(this.gate); this.objs = this.objs.filter(o => o.mesh !== this.gate); }
          };
          fadeGate();
        }

        // Flash luce verde apertura
        if (this.masterClockLight) {
          this.masterClockLight.color.set(0x00ff88);
          this.masterClockLight.intensity = 6;
          setTimeout(() => {
            if (this.masterClockLight) {
              this.masterClockLight.color.set(0xddaa40);
              this.masterClockLight.intensity = 1.6;
            }
          }, 800);
        }

        g.setFlag('orologio_impostato');
        g.notify('⏰ Le lancette segnano le 3:00. Un crepitio secco risuona nella foresta. Il cancello di rovi si dissolve lentamente.');
      } else {
        g.notify("L'orologio segna già le 3:00. Il cancello è aperto.");
      }
    } else {
      g.notify(`L'orologio ora segna le ${this.clockHour}:00. Nella foresta si muove qualcosa... ma il cancello non si apre.`);
    }
  }

  // ─────────────────────────────────────────────────────────
  _createNPC(scene, color, x, y, z) {
    const grp  = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.33, 0.85, 4, 8),
      new THREE.MeshLambertMaterial({ color })
    );
    body.position.y = 0;
    grp.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xb88858 })
    );
    head.position.y = 0.82;
    grp.add(head);
    grp.position.set(x, y, z);
    scene.add(grp);
    return grp;
  }

  _createGuardiano(scene, x, y, z) {
    const grp = new THREE.Group();

    // Tronco/Corpo principale (Corteccia di legno antico)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.42, 1.3, 10),
      new THREE.MeshLambertMaterial({ color: 0x1c0d02 })
    );
    body.position.y = 0.65;
    grp.add(body);

    // Mantello di foglie
    const cape = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.1, 8, 1, true),
      new THREE.MeshLambertMaterial({ color: 0x0c2512 })
    );
    cape.position.y = 0.75;
    cape.scale.set(1.1, 1, 1.1);
    grp.add(cape);

    // Testa di legno
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0x2e1a0c })
    );
    head.position.y = 1.35;
    grp.add(head);

    // Occhi turchesi brillanti (emissive)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffd8 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eyeL.position.set(-0.08, 1.38, 0.21);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eyeR.position.set(0.08, 1.38, 0.21);
    grp.add(eyeL);
    grp.add(eyeR);

    // Corna di rami/antlers
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x140a03 });
    const hornL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 5), hornMat);
    hornL.position.set(-0.16, 1.6, 0.05);
    hornL.rotation.z = -0.4;
    hornL.rotation.x = -0.2;
    grp.add(hornL);

    const hornR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 5), hornMat);
    hornR.position.set(0.16, 1.6, 0.05);
    hornR.rotation.z = 0.4;
    hornR.rotation.x = -0.2;
    grp.add(hornR);

    // Bastone magico
    const staff = new THREE.Group();
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 1.6, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a1f0a })
    );
    rod.position.y = 0.8;
    staff.add(rod);
    // Gemma sul bastone
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x00ffaa, emissive: 0x00aa77, emissiveIntensity: 1.2 })
    );
    gem.position.y = 1.62;
    staff.add(gem);
    staff.position.set(0.45, 0, 0.35);
    grp.add(staff);

    grp.position.set(x, y - 0.8, z); // Allinea a terra visto che il pivot del corpo è a y=0.65
    scene.add(grp);
    return grp;
  }

  // ─────────────────────────────────────────────────────────
  update(dt) {
    this.time += dt;

    // Pendoli oscillanti in sincronia (senza randomismo nel tempo)
    this.pendulums.forEach(p => {
      p.grp.rotation.z = Math.sin(this.time * p.speed + p.phase) * p.amplitude;
    });

    // Insetti luminosi fluttuanti
    if (this.insects && this.insectPositions) {
      const pos = this.insects.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ph = this.insectPhases[i];
        pos.setX(i, this.insectPositions[i * 3]     + Math.sin(this.time * 0.28 + ph)        * 0.55);
        pos.setY(i, this.insectPositions[i * 3 + 1] + Math.sin(this.time * 0.65 + ph * 1.3)  * 0.32);
        pos.setZ(i, this.insectPositions[i * 3 + 2] + Math.cos(this.time * 0.38 + ph * 0.85) * 0.42);
      }
      pos.needsUpdate = true;
      this.insects.material.opacity = 0.55 + Math.sin(this.time * 1.8) * 0.32;
    }

    // ── MOVIMENTO PIPISTRELLI ──
    this.bats.forEach(bat => {
      // Sbattimento ali
      bat.userData.wingPhase += dt * bat.userData.wingSpeed;
      const flap = Math.sin(bat.userData.wingPhase) * 0.5;
      bat.userData.wingL.rotation.y = flap;
      bat.userData.wingR.rotation.y = -flap;

      // Volo verso il target
      const dir = new THREE.Vector3().subVectors(bat.userData.target, bat.position);
      const dist = dir.length();
      if (dist > 0.4) {
        dir.normalize();
        bat.position.addScaledVector(dir, bat.userData.speed * dt);
        // Ruota verso il target
        bat.rotation.y = Math.atan2(dir.x, dir.z);
      } else {
        // Nuovo target casuale
        bat.userData.target.set(
          (Math.random() - 0.5) * 35,
          3.2 + Math.random() * 3.3,
          (Math.random() - 0.5) * 35
        );
        bat.userData.speed = 2.5 + Math.random() * 3.0;
      }
    });

    // Luce turchese pulsante
    if (this.accentLight) {
      this.accentLight.intensity = 0.7 + Math.sin(this.time * 0.55) * 0.28;
    }

    // Luce orologio maestro pulsante (oro caldo)
    if (this.masterClockLight) {
      this.masterClockLight.intensity = 1.4 + Math.sin(this.time * 1.4) * 0.35;
    }

    // Luce mango fluorescente (lampeggio lento)
    if (this.mangoLight && this.mangoLight.parent) {
      this.mangoLight.intensity = 1.5 + Math.sin(this.time * 2.2) * 0.5;
    }

    // ── Movimento NPC ──
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
      if (npc.userData.walkTimer > 3.5 + Math.random() * 3) {
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
          const spd = 0.75;
          npc.position.x  += (dx / dist) * spd * dt;
          npc.position.z  += (dz / dist) * spd * dt;
          npc.rotation.y   = Math.atan2(dx, dz);
          npc.position.y   = npc.userData.home.y + Math.abs(Math.sin(this.time * 7)) * 0.07;
        } else {
          npc.userData.isMoving = false;
          npc.position.y = npc.userData.home.y;
        }
      } else {
        npc.position.y = npc.userData.home.y;
      }
    });

    // ── Spostamento improvviso del sole/luna (salto temporale) ──
    if (this.moonLight) {
      if (!this.sunJumpTimer) this.sunJumpTimer = 0;
      this.sunJumpTimer += dt;
      if (this.sunJumpTimer > 18 + Math.random() * 10) {
        this.sunJumpTimer = 0;
        // Salto di luce improvviso
        const randomX = (Math.random() - 0.5) * 20;
        const randomZ = (Math.random() - 0.5) * 20;
        this.moonLight.position.set(randomX, 15, randomZ);
        
        // Breve flash / sfarfallio per far percepire il "salto" al giocatore
        const prevIntensity = this.moonLight.intensity;
        this.moonLight.intensity = 2.0;
        setTimeout(() => {
          if (this.moonLight) this.moonLight.intensity = prevIntensity;
        }, 120);
        
        this.g.notify("⏰ Il sole si sposta all'improvviso... Il tempo ha fatto un balzo in avanti!");
      }
    }

    // ── Animazione Riva della Nostalgia ──
    if (this.seaMesh) {
      // Lieve ondeggiamento del mare (movimento verticale)
      this.seaMesh.position.y = -0.01 + Math.sin(this.time * 0.6) * 0.025;
      // Oscillazione luce mare = riflessi sull'acqua
      if (this.beachLight) {
        this.beachLight.intensity = 0.7 + Math.sin(this.time * 1.8) * 0.25;
      }
    }
    // Onda anello barca che si espande e ritorna
    if (this.boatWaveRing) {
      const scale = 1 + Math.sin(this.time * 0.9) * 0.12;
      this.boatWaveRing.scale.setScalar(scale);
      this.boatWaveRing.material.opacity = 0.6 - Math.sin(this.time * 0.9) * 0.2;
    }

    // ── GESTIONE NEMICI ──
    if (this.enemies && this.enemies.length > 0 && this.g.player && this.g.player.grp) {
      const playerPos = this.g.player.grp.position;
      const isPlayerAttacking = this.g.player.attacking;

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        
        // Cooldowns
        if (enemy.playerDamageCooldown > 0) enemy.playerDamageCooldown -= dt;
        if (enemy.isHurtCooldown > 0) enemy.isHurtCooldown -= dt;

        // Billboarding barra salute
        if (enemy.healthBarGroup && this.g.camera) {
          enemy.healthBarGroup.quaternion.copy(this.g.camera.quaternion);
        }

        const dist = enemy.mesh.position.distanceTo(playerPos);

        // Fluttuazione verticale (effetto spettro)
        enemy.mesh.position.y = 0.8 + Math.sin(this.time * 3.0 + enemy.floatPhase) * 0.15;

        if (dist < 8.0) {
          // Segui il giocatore
          const dir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
          dir.y = 0;
          dir.normalize();
          enemy.mesh.position.addScaledVector(dir, enemy.maxSpeed * dt);
          enemy.mesh.rotation.y = Math.atan2(dir.x, dir.z);

          // Attacco contro il giocatore
          if (dist < 1.3 && enemy.playerDamageCooldown <= 0) {
            this.g.updateHealth(-15);
            this.g.notify("💥 Sei colpita/o dallo " + enemy.name + "!");
            this.g.audio.playTone(150, 'sawtooth', 0.2, 0.15);
            enemy.playerDamageCooldown = 1.5;
          }
        }

        // Il giocatore colpisce il nemico
        if (isPlayerAttacking && dist < 1.8 && enemy.isHurtCooldown <= 0) {
          enemy.health -= 34; // muore in 3 colpi
          enemy.isHurtCooldown = 0.6;
          
          // Aggiorna barra salute
          if (enemy.healthBar) {
            enemy.healthBar.scale.x = Math.max(0, enemy.health / 100);
          }

          // Effetto flash rosso
          if (enemy.body && enemy.body.material) {
            enemy.body.material.color.setHex(0xff0000);
            const origColor = enemy.originalColor;
            const enemyBody = enemy.body;
            setTimeout(() => {
              if (enemy && enemy.health > 0 && enemyBody && enemyBody.material) {
                enemyBody.material.color.setHex(origColor);
              }
            }, 150);
          }

          // Suono colpo
          this.g.audio.playTone(380, 'triangle', 0.12, 0.12);

          // Controllo morte nemico
          if (enemy.health <= 0) {
            this.g.scene.remove(enemy.mesh);
            this.enemies.splice(i, 1);
            this.g.notify("💀 " + enemy.name + " sconfitto!");
            this.g.audio.playTone(90, 'sine', 0.4, 0.2);
          }
        }
      }
    }
  }

  _buildEnemies(scene) {
    this.enemies = [];
    
    // Posizioni dei due nemici: 
    // Nemico 1 nella radura di destra/centrale
    // Nemico 2 vicino al cancello/orologio maestro
    const enemyPositions = [
      { x: 3.5, y: 0.8, z: 6.0, name: "Spettro Silvano dell'Est" },
      { x: -3.5, y: 0.8, z: 10.5, name: "Spettro Silvano dell'Ovest" }
    ];

    enemyPositions.forEach((pos, idx) => {
      const enemyGrp = new THREE.Group();
      enemyGrp.name = pos.name;

      // Corpo principale - Sfera fluttuante oscura
      const bodyMat = new THREE.MeshLambertMaterial({ 
        color: 0x1a2e1d, 
        emissive: 0x07150a, 
        emissiveIntensity: 0.8 
      });
      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), bodyMat);
      body.position.y = 0;
      enemyGrp.add(body);

      // Occhi rossi incandescenti
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
      eyeL.position.set(-0.16, 0.1, 0.35);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
      eyeR.position.set(0.16, 0.1, 0.35);
      enemyGrp.add(eyeL);
      enemyGrp.add(eyeR);

      // Piccola aura di rovi/tentacoli fluttuanti sotto
      const baseMat = new THREE.MeshLambertMaterial({ color: 0x050f05 });
      for (let t = 0; t < 5; t++) {
        const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 4), baseMat);
        const a = (t / 5) * Math.PI * 2;
        thorn.position.set(Math.sin(a) * 0.22, -0.32, Math.cos(a) * 0.22);
        thorn.rotation.set(0.25, 0, a);
        enemyGrp.add(thorn);
      }

      // ── Barra della salute 3D billboarded ──
      const barGrp = new THREE.Group();
      barGrp.position.set(0, 0.9, 0); // Posizionata sopra la testa dello spettro
      
      const bgBar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.75, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x5a1111, side: THREE.DoubleSide })
      );
      barGrp.add(bgBar);

      // Barra verde della salute (spostiamo la geometria in modo che scali dal lato sinistro)
      const fgGeo = new THREE.PlaneGeometry(0.75, 0.08);
      fgGeo.translate(0.375, 0, 0); // sposta il pivot a sinistra
      const fgBar = new THREE.Mesh(
        fgGeo,
        new THREE.MeshBasicMaterial({ color: 0x27ae60, side: THREE.DoubleSide })
      );
      fgBar.position.set(-0.375, 0, 0.002); // compensa la traslazione
      barGrp.add(fgBar);

      enemyGrp.add(barGrp);

      // Impostiamo la posizione iniziale
      enemyGrp.position.set(pos.x, pos.y, pos.z);
      scene.add(enemyGrp);

      this.enemies.push({
        name: pos.name,
        mesh: enemyGrp,
        body: body,
        healthBar: fgBar,
        healthBarGroup: barGrp,
        health: 100,
        maxHealth: 100,
        originalColor: 0x1a2e1d,
        maxSpeed: 1.6 + Math.random() * 0.4,
        floatPhase: Math.random() * Math.PI * 2,
        playerDamageCooldown: 0,
        isHurtCooldown: 0
      });
    });
  }
}
