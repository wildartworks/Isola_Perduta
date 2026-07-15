/* ── PLAYER ── */
class Player {
  constructor(scene) {
    this.g = null;
    this._weaponInitialized = false;
    this.currentWeaponMesh = null;
    this.grp = new THREE.Group();
    this.target = new THREE.Vector3();
    this.moving = false;
    this.mixer = null;
    this.anims = {};
    this.currentAnim = null;
    this.currentAnimName = null;
    this.attacking = false;
    this._spaceWasDown = false;

    // ── Raggio di collisione del player (capsule radiale) ──
    this.radius = 0.4;

    // ── Sincronizzazione animazione/movimento ──
    this.walkSpeed = 4.8;
    this._walkStride = 2.0;
    this._walkAnimRefSpeed = null;

    // ── Lista di collider statici (AABB box) registrati dalla scena ──
    // Ogni elemento: { minX, maxX, minZ, maxZ }
    this.staticColliders = [];

    // ── Lista NPC (THREE.Group) con raggio di collisione ──
    this.npcColliders = []; // { mesh: Group, radius: number }

    // ── NavMesh 2D: poligono calpestabile ──
    // Array di punti [x, z] che definisce la zona percorribile della scena corrente.
    // Se null, il sistema NavMesh è disabilitato per quella scena.
    this.walkablePolygon = null;

    // Fake ombra sotto il player
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.3}));
    shadow.rotation.x = -Math.PI/2;
    shadow.position.y = 0.01;
    this.grp.add(shadow);
    
    scene.add(this.grp);

    const loader = new THREE.GLTFLoader();
    loader.load('assets/the_pirate_girl.glb', 
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(1.2, 1.2, 1.2);
        this.model.traverse(child => {
          if(child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.grp.add(this.model);

        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach(clip => {
          this.anims[clip.name] = this.mixer.clipAction(clip);
        });

        const walkClip = gltf.animations.find(c => c.name === 'Pirata_walk');
        if (walkClip && walkClip.duration > 0) {
          this._walkAnimRefSpeed = this._walkStride / walkClip.duration;
        }

        console.log('[Player] Animazioni disponibili:', Object.keys(this.anims));
        this._switchAnim('Pirata_idle');
        if (this.g && this.g.inv) {
          this.updateEquippedWeapon(this.g.inv.equipped.right);
        }
      },
      undefined,
      (err) => {
        console.warn("Model not found, using placeholder", err);
        const geo = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const mat = new THREE.MeshLambertMaterial({color: 0x4a6a8a});
        this.model = new THREE.Mesh(geo, mat);
        this.model.position.y = 0.8;
        this.model.castShadow = true;
        this.grp.add(this.model);
      }
    );
  }

  /**
   * Registra un collider AABB statico (edificio, oggetto, pavimento).
   * Passa le coordinate world-space del box.
   * @param {number} cx   - centro X
   * @param {number} cz   - centro Z
   * @param {number} halfW - metà larghezza (X)
   * @param {number} halfD - metà profondità (Z)
   */
  addStaticCollider(cx, cz, halfW, halfD) {
    this.staticColliders.push({
      minX: cx - halfW,
      maxX: cx + halfW,
      minZ: cz - halfD,
      maxZ: cz + halfD
    });
  }

  /**
   * Registra un NPC come collider dinamico.
   * @param {THREE.Group|THREE.Mesh} npcMesh
   * @param {number} radius  raggio di separazione (default 0.55)
   */
  addNPCCollider(npcMesh, radius = 0.55) {
    this.npcColliders.push({ mesh: npcMesh, radius });
  }

  /** Cambia animazione con crossfade. */
  _switchAnim(name, fadeDuration = 0.25) {
    const next = this.anims[name];
    if (!next) return;
    if (this.currentAnim === next) return;
    if (this.currentAnim) this.currentAnim.fadeOut(fadeDuration);
    next.reset().fadeIn(fadeDuration).play();
    this.currentAnim = next;
    this.currentAnimName = name;
  }

  _syncWalkAnim(actualSpeed) {
    const action = this.anims['Pirata_walk'];
    if (!action) return;
    if (this._walkAnimRefSpeed && this._walkAnimRefSpeed > 0) {
      action.timeScale = actualSpeed / this._walkAnimRefSpeed;
    }
  }

  /**
   * Risolve la penetrazione del player con i collider statici AABB.
   * Usa separazione sull'asse minore (MTV).
   */
  _resolveStaticCollisions() {
    const px = this.grp.position.x;
    const pz = this.grp.position.z;
    const r = this.radius;

    for (const col of this.staticColliders) {
      // Punto più vicino del AABB al centro del player
      const nearX = Math.max(col.minX, Math.min(px, col.maxX));
      const nearZ = Math.max(col.minZ, Math.min(pz, col.maxZ));
      const dx = px - nearX;
      const dz = pz - nearZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < r && dist > 0.0001) {
        // Penetration depth
        const pen = r - dist;
        this.grp.position.x += (dx / dist) * pen;
        this.grp.position.z += (dz / dist) * pen;
      } else if (dist < 0.0001) {
        // Player esattamente al centro: spingilo fuori lungo Z
        this.grp.position.z = col.maxZ + r;
      }
    }
  }

  /**
   * Risolve la collisione con gli NPC (cerchi).
   */
  _resolveNPCCollisions() {
    const px = this.grp.position.x;
    const pz = this.grp.position.z;

    for (const npc of this.npcColliders) {
      const npx = npc.mesh.position.x;
      const npz = npc.mesh.position.z;
      const dx = px - npx;
      const dz = pz - npz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = this.radius + npc.radius;
      if (dist < minDist && dist > 0.0001) {
        const pen = minDist - dist;
        // Sposta solo il player (gli NPC hanno il loro sistema)
        this.grp.position.x += (dx / dist) * pen * 0.7;
        this.grp.position.z += (dz / dist) * pen * 0.7;
        // Spingi leggermente l'NPC nella direzione opposta
        npc.mesh.position.x -= (dx / dist) * pen * 0.3;
        npc.mesh.position.z -= (dz / dist) * pen * 0.3;
      }
    }
  }

  move(x, z) {
    this.target.set(x, 0, z);
    this.moving = true;
    if (!this.attacking) this._switchAnim('Pirata_walk');
  }

  /** Lancia l'animazione di attacco */
  attack() {
    if (this.attacking) return;
    this.attacking = true;
    this._switchAnim('Pirata_attack1', 0.1);
    const attackClip = this.anims['Pirata_attack1'];
    const duration = attackClip ? attackClip.getClip().duration * 1000 : 800;
    setTimeout(() => {
      this.attacking = false;
      this._switchAnim(this.moving ? 'Pirata_walk' : 'Pirata_idle', 0.15);
    }, duration - 100);
  }

  update(dt, keys = {}) {
    if(this.mixer) this.mixer.update(dt);

    if (this.model && !this._weaponInitialized && this.g && this.g.inv) {
      this._weaponInitialized = true;
      this.updateEquippedWeapon(this.g.inv.equipped.right);
    }

    // Attacco con Spazio
    if (keys[' '] && !this._spaceWasDown) {
      this._spaceWasDown = true;
      this.attack();
    }
    if (!keys[' ']) this._spaceWasDown = false;

    if (this.attacking) return;
    
    // Movimento da tastiera
    let dirX = 0;
    let dirZ = 0;
    if(keys['ArrowUp']    || keys['w'] || keys['W']) dirZ = -1;
    if(keys['ArrowDown']  || keys['s'] || keys['S']) dirZ =  1;
    if(keys['ArrowLeft']  || keys['a'] || keys['A']) dirX = -1;
    if(keys['ArrowRight'] || keys['d'] || keys['D']) dirX =  1;

    if(dirX !== 0 || dirZ !== 0) {
      this.moving = false;
      const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
      const normX = dirX / len;
      const normZ = dirZ / len;
      const speed = this.walkSpeed;
      this.grp.position.x += normX * speed * dt;
      this.grp.position.z += normZ * speed * dt;
      this.grp.rotation.y = Math.atan2(normX, normZ);
      this._switchAnim('Pirata_walk');
      this._syncWalkAnim(speed);
    } else if(this.moving) {
      const dx = this.target.x - this.grp.position.x;
      const dz = this.target.z - this.grp.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if(dist > 0.1) {
        this.grp.position.x += (dx/dist) * this.walkSpeed * dt;
        this.grp.position.z += (dz/dist) * this.walkSpeed * dt;
        this.grp.rotation.y = Math.atan2(dx, dz);
        this._switchAnim('Pirata_walk');
        this._syncWalkAnim(this.walkSpeed);
      } else {
        this.moving = false;
      }
    } else {
      this._switchAnim('Pirata_idle');
    }

    // ── Risolvi collisioni ──
    this._resolveStaticCollisions();
    this._resolveNPCCollisions();
    // ── NavMesh: forza il player dentro la zona calpestabile ──
    this._clampToWalkable();

    // Applica limiti se definiti da setBounds
    if (this.boundX !== undefined && this.boundZ !== undefined) {
      this.grp.position.x = Math.max(-this.boundX, Math.min(this.boundX, this.grp.position.x));
      this.grp.position.z = Math.max(-this.boundZ, Math.min(this.boundZ, this.grp.position.z));
    }
  }

  setBounds(bx, bz) {
    this.boundX = bx;
    this.boundZ = bz;
  }

  // ── NavMesh 2D ──────────────────────────────────────────────────────────────

  /**
   * Imposta il poligono calpestabile per la scena corrente.
   * @param {Array<[number,number]>} polygon  Array di coppie [x, z] in world-space.
   *                                          null = disabilita il NavMesh.
   */
  setWalkableZone(polygon) {
    this.walkablePolygon = polygon || null;
  }

  /**
   * Dato un punto (x, z), restituisce il punto più vicino dentro il poligono.
   * Se il punto è già dentro (o non c'è NavMesh attiva), lo restituisce invariato.
   * Usato per correggere walkTarget su tap/click mobile e desktop.
   * @param {number} x
   * @param {number} z
   * @returns {{ x: number, z: number }}
   */
  clampPointToWalkable(x, z) {
    if (!this.walkablePolygon || this.walkablePolygon.length < 3) {
      return { x, z };
    }
    if (this._pointInPolygon(x, z, this.walkablePolygon)) {
      return { x, z }; // già dentro: nessuna correzione
    }
    const nearest = this._nearestPointOnPolygon(x, z, this.walkablePolygon);
    // Piccolo margine inward per non stare sul bordo
    const dx = x - nearest.x, dz = z - nearest.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    const margin = 0.1;
    if (len > 0.001) {
      return { x: nearest.x - (dx / len) * margin, z: nearest.z - (dz / len) * margin };
    }
    return { x: nearest.x, z: nearest.z };
  }

  /**
   * Ray-casting 2D: verifica se il punto (px, pz) è dentro il poligono.
   * Algoritmo: conta quante volte un raggio verso +X interseca i lati del poligono.
   * @param {number} px
   * @param {number} pz
   * @param {Array<[number,number]>} poly
   * @returns {boolean}
   */
  _pointInPolygon(px, pz, poly) {
    let inside = false;
    const n = poly.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = poly[i][0], zi = poly[i][1];
      const xj = poly[j][0], zj = poly[j][1];
      const intersect = ((zi > pz) !== (zj > pz)) &&
        (px < (xj - xi) * (pz - zi) / (zj - zi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Trova il punto più vicino sul bordo del poligono rispetto a (px, pz).
   * Itera su ogni segmento e calcola la proiezione sul segmento stesso.
   * @param {number} px
   * @param {number} pz
   * @param {Array<[number,number]>} poly
   * @returns {{ x: number, z: number }}
   */
  _nearestPointOnPolygon(px, pz, poly) {
    let bestDist = Infinity;
    let bestX = px, bestZ = pz;
    const n = poly.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const ax = poly[j][0], az = poly[j][1];
      const bx = poly[i][0], bz = poly[i][1];
      const abx = bx - ax, abz = bz - az;
      const len2 = abx * abx + abz * abz;
      if (len2 < 0.00001) continue;
      // Parametro t clampato a [0, 1] — proiezione sul segmento
      const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / len2));
      const nx = ax + t * abx;
      const nz = az + t * abz;
      const dx = px - nx, dz = pz - nz;
      const dist = dx * dx + dz * dz;
      if (dist < bestDist) {
        bestDist = dist;
        bestX = nx;
        bestZ = nz;
      }
    }
    return { x: bestX, z: bestZ };
  }

  /**
   * Forza il player a rimanere dentro il poligono calpestabile.
   * Se il player è uscito, lo riposiziona sul punto del bordo più vicino
   * con un piccolo margine verso l'interno per evitare flickering.
   */
  _clampToWalkable() {
    if (!this.walkablePolygon || this.walkablePolygon.length < 3) return;
    const px = this.grp.position.x;
    const pz = this.grp.position.z;
    if (!this._pointInPolygon(px, pz, this.walkablePolygon)) {
      const nearest = this._nearestPointOnPolygon(px, pz, this.walkablePolygon);
      // Sposta leggermente verso il centro del nearest per evitare di stare
      // esattamente sul bordo (causa flickering al frame successivo)
      const cx = nearest.x;
      const cz = nearest.z;
      // Direzione dal nearest verso il player (per dare un piccolo margine inward)
      const dx = px - cx, dz = pz - cz;
      const len = Math.sqrt(dx * dx + dz * dz);
      const margin = 0.05;
      if (len > 0.001) {
        this.grp.position.x = cx - (dx / len) * margin;
        this.grp.position.z = cz - (dz / len) * margin;
      } else {
        this.grp.position.x = cx;
        this.grp.position.z = cz;
      }
    }
  }

  findHandBone(parent) {
    let found = null;
    
    // First pass: look for right hand bones with exact or common patterns
    const regexList = [
      /mixamorigRightHand/i,
      /RightHand/i,
      /Hand_R/i,
      /Hand\.R/i,
      /R_Hand/i,
      /r.*hand/i,
      /right.*hand/i,
      /wrist_r/i,
      /wrist.*r/i
    ];

    for (const regex of regexList) {
      parent.traverse(child => {
        if (!found && child.isBone && regex.test(child.name)) {
          found = child;
        }
      });
      if (found) break;
    }

    // Fallback: look for any bone containing 'right'
    if (!found) {
      parent.traverse(child => {
        if (!found && child.isBone && child.name.toLowerCase().includes('right')) {
          found = child;
        }
      });
    }

    if (found) {
      console.log(`[Player] Trovato osso mano destra: ${found.name}`);
    } else {
      console.warn("[Player] Impossibile trovare l'osso della mano destra!");
    }
    return found;
  }

  updateEquippedWeapon(itemId) {
    // Rimuovi la mesh precedente se esiste
    if (this.currentWeaponMesh && this.currentWeaponMesh.parent) {
      this.currentWeaponMesh.parent.remove(this.currentWeaponMesh);
    }
    this.currentWeaponMesh = null;

    if (!itemId || !this.model) return;

    // Trova l'osso della mano destra, altrimenti usa un fallback
    let handBone = this.findHandBone(this.model);
    let isFallback = false;
    if (!handBone) {
      handBone = this.grp;
      isFallback = true;
    }

    // Crea la mesh dell'arma
    const weaponGroup = new THREE.Group();
    let baseScale = 1.0;

    if (itemId === 'pugnale_antico') {
      // Lama
      const bladeGeo = new THREE.BoxGeometry(0.06, 0.45, 0.02);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.9,
        roughness: 0.15
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 0.28; // Estendi in alto dall'elsa
      weaponGroup.add(blade);

      // Elsa (Guardia)
      const guardGeo = new THREE.BoxGeometry(0.16, 0.03, 0.03);
      const guardMat = new THREE.MeshStandardMaterial({
        color: 0xb5a642, // Ottone/Oro antico
        metalness: 0.8,
        roughness: 0.25
      });
      const guard = new THREE.Mesh(guardGeo, guardMat);
      guard.position.y = 0.06;
      weaponGroup.add(guard);

      // Impugnatura
      const hiltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
      const hiltMat = new THREE.MeshStandardMaterial({
        color: 0x3d2314, // Cuoio scuro
        roughness: 0.9
      });
      const hilt = new THREE.Mesh(hiltGeo, hiltMat);
      hilt.position.y = 0.0;
      weaponGroup.add(hilt);
      
      // Orientamento per la mano del personaggio
      weaponGroup.rotation.x = Math.PI / 2; // Punta in avanti
      weaponGroup.rotation.z = Math.PI / 2;
      weaponGroup.position.set(0, 0.05, 0);
      baseScale = 0.7;

    } else if (itemId === 'arpione_cerimoniale') {
      // Asta in legno
      const staffGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8);
      const staffMat = new THREE.MeshStandardMaterial({
        color: 0x422616, // legno scuro
        roughness: 0.85
      });
      const staff = new THREE.Mesh(staffGeo, staffMat);
      staff.position.y = 0.3;
      weaponGroup.add(staff);

      // Gruppo della punta dell'arpione
      const tipGroup = new THREE.Group();
      
      // Punta centrale
      const centerTipGeo = new THREE.ConeGeometry(0.035, 0.18, 4);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Oro cerimoniale
        metalness: 0.85,
        roughness: 0.2
      });
      const centerTip = new THREE.Mesh(centerTipGeo, goldMat);
      centerTip.position.y = 1.05;
      tipGroup.add(centerTip);

      // Alette laterali del tridente
      const prongLGeo = new THREE.BoxGeometry(0.012, 0.12, 0.025);
      const prongL = new THREE.Mesh(prongLGeo, goldMat);
      prongL.position.set(-0.06, 0.95, 0);
      prongL.rotation.z = -0.15;
      tipGroup.add(prongL);

      const prongR = prongL.clone();
      prongR.position.x = 0.06;
      prongR.rotation.z = 0.15;
      tipGroup.add(prongR);

      weaponGroup.add(tipGroup);
      
      // Orientamento per la mano
      weaponGroup.rotation.x = Math.PI / 2;
      weaponGroup.position.set(0, 0.05, 0);
      baseScale = 0.8;

    } else {
      // Oggetto generico (sacchetto/scatola per far capire che ha qualcosa in mano)
      const genericGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const genericMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0 });
      const genericMesh = new THREE.Mesh(genericGeo, genericMat);
      weaponGroup.add(genericMesh);
      weaponGroup.position.set(0, 0.06, 0);
      baseScale = 1.0;
    }

    if (isFallback) {
      weaponGroup.position.set(0.4, 1.2, 0); // Fluttua accanto al giocatore
      weaponGroup.rotation.set(0, 0, 0);
      weaponGroup.scale.set(baseScale, baseScale, baseScale);
    } else {
      // Correzione della scala in base all'osso per evitare deformazioni (modelli esportati a 0.01 ecc)
      const worldScale = new THREE.Vector3();
      handBone.getWorldScale(worldScale);
      const sx = worldScale.x > 0.0001 ? baseScale / worldScale.x : baseScale;
      const sy = worldScale.y > 0.0001 ? baseScale / worldScale.y : baseScale;
      const sz = worldScale.z > 0.0001 ? baseScale / worldScale.z : baseScale;
      weaponGroup.scale.set(sx, sy, sz);
    }

    handBone.add(weaponGroup);
    this.currentWeaponMesh = weaponGroup;
  }
}
