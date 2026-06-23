/* ── PLAYER ── */
class Player {
  constructor(scene) {
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
}
