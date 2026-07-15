/**
 * ==========================================================================
 * OPERATION: LAST STAND - CORE GAME ENGINE v3.0
 * ARCHITECTURE: Delta-Time Physics, Generative Audio, Entity Management
 * ==========================================================================
 */

// --- UTILITIES & MATH ---
class Vector2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector2(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { const m = this.mag(); return m === 0 ? new Vector2() : new Vector2(this.x / m, this.y / m); }
    static distance(v1, v2) { return Math.hypot(v2.x - v1.x, v2.y - v1.y); }
    static angle(v1, v2) { return Math.atan2(v2.y - v1.y, v2.x - v1.x); }
    static random(min, max) { return Math.random() * (max - min) + min; }
}

// --- GENERATIVE SOUND ENGINE (Web Audio API) ---
// Creates sound effects purely from math—no external assets required.
class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Global volume
        this.masterGain.connect(this.ctx.destination);
    }
    
    playShoot(type) {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.ctx.currentTime;
        if (type === 'sniper') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
            gain.gain.setValueAtTime(1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'shotgun') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else { // AR / SMG
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        }
    }

    playHit(isKill) {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        if(isKill) {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.6, now);
        } else {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.3, now);
        }
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    }
}

// --- WEAPON ARMORY ---
const Armory = [
    { name: "M4A1 (ASSAULT)", type: "ar", color: "#ccc", damage: 25, fireRate: 0.12, speed: 1200, spread: 0.08, magSize: 30, reload: 1.5, auto: true, pierce: false },
    { name: "MP5 (SMG)", type: "smg", color: "#79c", damage: 15, fireRate: 0.07, speed: 1000, spread: 0.15, magSize: 40, reload: 1.2, auto: true, pierce: false },
    { name: "LOCKWOOD (SHOTGUN)", type: "shotgun", color: "#a55", damage: 18, fireRate: 0.8, speed: 900, spread: 0.35, magSize: 8, reload: 2.0, auto: false, pellets: 8, pierce: false },
    { name: "KATT-AMR (SNIPER)", type: "sniper", color: "#5a5", damage: 200, fireRate: 1.2, speed: 2500, spread: 0.01, magSize: 5, reload: 2.5, auto: false, pierce: true }
];

// --- ENTITIES ---

class Particle {
    constructor(pos, color, speed, size, life, angle) {
        this.pos = new Vector2(pos.x, pos.y);
        this.vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.friction = 0.92;
    }
    update(dt) {
        this.vel = this.vel.mult(this.friction); // apply friction
        this.pos = this.pos.add(this.vel.mult(dt * 60)); // normalize to 60fps equivalent
        this.life -= dt;
    }
    draw(ctx, cam) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x - cam.x, this.pos.y - cam.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Bullet {
    constructor(pos, angle, stats) {
        this.pos = new Vector2(pos.x, pos.y);
        const finalAngle = angle + Vector2.random(-stats.spread, stats.spread);
        this.vel = new Vector2(Math.cos(finalAngle), Math.sin(finalAngle)).mult(stats.speed);
        this.damage = stats.damage;
        this.pierce = stats.pierce;
        this.life = 2.0; // Seconds to live
        this.hitEntities = new Set();
    }
    update(dt) {
        this.pos = this.pos.add(this.vel.mult(dt));
        this.life -= dt;
        // Trail particle
        if(Math.random() > 0.5) {
            Engine.particles.push(new Particle(this.pos, '#ffea00', 0, 1.5, 0.2, 0));
        }
    }
    draw(ctx, cam) {
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(this.pos.x - cam.x, this.pos.y - cam.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Enemy {
    constructor(pos, type, waveMultiplier) {
        this.pos = new Vector2(pos.x, pos.y);
        this.type = type; // 'walker', 'sprinter', 'tank'
        
        switch(type) {
            case 'sprinter':
                this.hp = 30 * waveMultiplier;
                this.speed = Vector2.random(250, 350);
                this.radius = 12;
                this.color = '#aa3300';
                this.dmg = 5;
                break;
            case 'tank':
                this.hp = 250 * waveMultiplier;
                this.speed = Vector2.random(50, 80);
                this.radius = 25;
                this.color = '#400000';
                this.dmg = 20;
                break;
            default: // walker
                this.hp = 60 * waveMultiplier;
                this.speed = Vector2.random(100, 150);
                this.radius = 16;
                this.color = '#800000';
                this.dmg = 10;
        }
        this.maxHp = this.hp;
    }
    update(dt, playerPos, others) {
        // Seek player
        const dir = playerPos.sub(this.pos).normalize();
        this.pos = this.pos.add(dir.mult(this.speed * dt));

        // Separation (Boids-like) to prevent extreme clumping
        let separation = new Vector2();
        let count = 0;
        for (let other of others) {
            if (other === this) continue;
            const dist = Vector2.distance(this.pos, other.pos);
            const minDist = this.radius + other.radius;
            if (dist < minDist) {
                const push = this.pos.sub(other.pos).normalize().mult((minDist - dist) * 5);
                separation = separation.add(push);
                count++;
            }
        }
        if (count > 0) this.pos = this.pos.add(separation.mult(dt));
    }
    draw(ctx, cam) {
        const drawPos = this.pos.sub(cam);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(drawPos.x + 5, drawPos.y + 5, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(drawPos.x, drawPos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#220000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Health Bar (if damaged)
        if (this.hp < this.maxHp) {
            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = 'red';
            ctx.fillRect(drawPos.x - 15, drawPos.y - this.radius - 10, 30, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(drawPos.x - 15, drawPos.y - this.radius - 10, 30 * hpRatio, 4);
        }
    }
}

class Player {
    constructor() {
        this.pos = new Vector2(0, 0);
        this.radius = 18;
        this.speed = 300; // pixels per second
        this.maxHp = 100;
        this.hp = this.maxHp;
        
        // Deep copy armory
        this.weapons = JSON.parse(JSON.stringify(Armory));
        this.weapons.forEach(w => w.ammo = w.magSize);
        this.wepIdx = 0;
        
        this.shootTimer = 0;
        this.reloadTimer = 0;
        this.isReloading = false;
        this.triggerReleased = true;
        this.regenTimer = 0;
    }
    
    get weapon() { return this.weapons[this.wepIdx]; }

    equip(idx) {
        if (this.isReloading || idx >= this.weapons.length || idx === this.wepIdx) return;
        this.wepIdx = idx;
        this.shootTimer = 0.2; // swap delay
        Engine.updateHUD();
    }

    damage(amount) {
        this.hp -= amount;
        const overlay = document.getElementById('damage-overlay');
        overlay.style.boxShadow = `inset 0 0 ${amount * 8}px var(--sys-red)`;
        overlay.style.background = 'rgba(255,0,0,0.2)';
        setTimeout(() => {
            overlay.style.boxShadow = 'inset 0 0 0px var(--sys-red)';
            overlay.style.background = 'transparent';
        }, 150);
        Engine.updateHUD();
        if (this.hp <= 0) Engine.gameOver();
    }

    update(dt) {
        // Movement
        let input = new Vector2();
        if (Engine.keys['w']) input.y -= 1;
        if (Engine.keys['s']) input.y += 1;
        if (Engine.keys['a']) input.x -= 1;
        if (Engine.keys['d']) input.x += 1;
        
        if (input.mag() > 0) {
            input = input.normalize();
            this.pos = this.pos.add(input.mult(this.speed * dt));
        }

        // Camera Logic
        Engine.cam.x = this.pos.x - Engine.canvas.width / 2;
        Engine.cam.y = this.pos.y - Engine.canvas.height / 2;

        // Weapon Logic
        if (this.shootTimer > 0) this.shootTimer -= dt;

        if (Engine.keys['r'] && !this.isReloading && this.weapon.ammo < this.weapon.magSize) {
            this.isReloading = true;
            this.reloadTimer = this.weapon.reload;
            document.getElementById('reload-warning').style.opacity = 1;
        }

        if (this.isReloading) {
            this.reloadTimer -= dt;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.weapon.ammo = this.weapon.magSize;
                document.getElementById('reload-warning').style.opacity = 0;
                Engine.updateHUD();
            }
        } else {
            if (Engine.mouse.isDown) {
                if (this.weapon.auto || this.triggerReleased) {
                    if (this.shootTimer <= 0 && this.weapon.ammo > 0) {
                        this.shoot();
                    } else if (this.weapon.ammo <= 0 && !this.isReloading) {
                        this.isReloading = true;
                        this.reloadTimer = this.weapon.reload;
                        document.getElementById('reload-warning').style.opacity = 1;
                    }
                }
            } else {
                this.triggerReleased = true;
            }
        }

        // Auto Regen
        this.regenTimer += dt;
        if(this.regenTimer > 1.0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + 5);
            this.regenTimer = 0;
            Engine.updateHUD();
        }
    }

    shoot() {
        const mouseWorld = new Vector2(Engine.mouse.x + Engine.cam.x, Engine.mouse.y + Engine.cam.y);
        const angle = Vector2.angle(this.pos, mouseWorld);
        
        Engine.audio.playShoot(this.weapon.type);

        if (this.weapon.pellets) {
            for(let i = 0; i < this.weapon.pellets; i++) {
                Engine.bullets.push(new Bullet(this.pos, angle, this.weapon));
            }
        } else {
            Engine.bullets.push(new Bullet(this.pos, angle, this.weapon));
        }

        // Muzzle Flash Particles
        for(let i=0; i<3; i++) {
            Engine.particles.push(new Particle(
                this.pos.add(new Vector2(Math.cos(angle)*25, Math.sin(angle)*25)),
                '#ffffaa', Vector2.random(10, 30), Vector2.random(2, 5), 0.1, angle + Vector2.random(-0.5, 0.5)
            ));
        }

        // Screen Shake
        Engine.ctx.translate(Vector2.random(-5, 5), Vector2.random(-5, 5));

        this.weapon.ammo--;
        this.shootTimer = this.weapon.fireRate;
        if (!this.weapon.auto) this.triggerReleased = false;
        Engine.updateHUD();
    }

    draw(ctx, cam) {
        const drawPos = this.pos.sub(cam);
        const mouseWorld = new Vector2(Engine.mouse.x + Engine.cam.x, Engine.mouse.y + Engine.cam.y);
        const angle = Vector2.angle(this.pos, mouseWorld);

        ctx.save();
        ctx.translate(drawPos.x, drawPos.y);
        ctx.rotate(angle);

        // Weapon Barrel
        ctx.fillStyle = this.weapon.color;
        ctx.fillRect(10, -4, 25, 8);

        // Player Body
        ctx.fillStyle = '#22aa55';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#115522';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }
}

// --- ENGINE CORE ---
const Engine = {
    canvas: document.getElementById('game-canvas'),
    ctx: null,
    mCanvas: document.getElementById('minimap-canvas'),
    mCtx: null,
    audio: new SoundEngine(),
    
    // State
    isRunning: false,
    lastTime: 0,
    score: 0,
    wave: 0,
    multiplier: 1.0,
    
    // Input
    keys: {},
    mouse: { x: 0, y: 0, isDown: false },
    
    // Objects
    cam: new Vector2(),
    player: null,
    bullets: [],
    enemies: [],
    particles: [],

    init() {
        this.ctx = this.canvas.getContext('2d');
        this.mCtx = this.mCanvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Event Listeners
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === '1') this.player?.equip(0);
            if (e.key === '2') this.player?.equip(1);
            if (e.key === '3') this.player?.equip(2);
            if (e.key === '4') this.player?.equip(3);
        });
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
        window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
        window.addEventListener('mousedown', () => this.mouse.isDown = true);
        window.addEventListener('mouseup', () => this.mouse.isDown = false);

        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.start());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.wave = 0;
        this.multiplier = 1.0;
        
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('hud-container').classList.remove('hidden');
        
        this.updateHUD();
        this.spawnWave();
        
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    },

    gameOver() {
        this.isRunning = false;
        document.getElementById('hud-container').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-wave').textContent = this.wave;
    },

    spawnWave() {
        this.wave++;
        document.getElementById('wave-display').textContent = `WAVE ${this.wave}`;
        
        const count = 10 + (this.wave * 5);
        const waveMult = 1 + (this.wave * 0.2);
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(this.canvas.width, this.canvas.height) + Vector2.random(200, 800);
            const pos = this.player.pos.add(new Vector2(Math.cos(angle)*dist, Math.sin(angle)*dist));
            
            // Determine type based on wave logic
            let type = 'walker';
            const rand = Math.random();
            if (this.wave > 2 && rand < 0.2) type = 'sprinter';
            if (this.wave > 4 && rand > 0.9) type = 'tank';
            
            this.enemies.push(new Enemy(pos, type, waveMult));
        }
        document.getElementById('enemies-remaining').textContent = `TARGETS: ${this.enemies.length}`;
    },

    spawnBlood(pos, hitAngle) {
        for(let i=0; i < 10; i++) {
            this.particles.push(new Particle(
                pos, 
                Math.random() > 0.5 ? '#990000' : '#ff1111', 
                Vector2.random(50, 150), 
                Vector2.random(2, 6), 
                Vector2.random(0.5, 1.5), 
                hitAngle + Vector2.random(-1, 1)
            ));
        }
    },

    triggerHitmarker(isKill) {
        const hm = document.getElementById('hitmarker');
        hm.classList.remove('hit-active', 'kill-active');
        void hm.offsetWidth; // Reflow
        hm.classList.add(isKill ? 'kill-active' : 'hit-active');
        this.audio.playHit(isKill);
    },

    updateHUD() {
        const hpBar = document.getElementById('hp-bar');
        hpBar.style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
        hpBar.className = this.player.hp < 30 ? 'critical' : '';

        document.getElementById('current-weapon').textContent = this.player.weapon.name;
        document.getElementById('ammo-count').textContent = this.player.weapon.ammo;
        document.getElementById('score-display').textContent = Math.floor(this.score).toString().padStart(6, '0');
    },

    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.03)';
        ctx.lineWidth = 1;
        const size = 100;
        const startX = -this.cam.x % size;
        const startY = -this.cam.y % size;

        ctx.beginPath();
        for (let x = startX; x < this.canvas.width; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); }
        for (let y = startY; y < this.canvas.height; y += size) { ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); }
        ctx.stroke();
    },

    drawMinimap() {
        const mCtx = this.mCtx;
        mCtx.clearRect(0, 0, 180, 180);
        
        // Radar Sweep
        const time = performance.now() / 1000;
        const scanAngle = (time * 2) % (Math.PI * 2);
        mCtx.beginPath();
        mCtx.moveTo(90, 90);
        mCtx.lineTo(90 + Math.cos(scanAngle)*90, 90 + Math.sin(scanAngle)*90);
        mCtx.strokeStyle = 'rgba(0, 255, 102, 0.5)';
        mCtx.lineWidth = 2;
        mCtx.stroke();

        const scale = 0.02; // Zoom level
        
        // Enemies
        mCtx.fillStyle = '#ff3333';
        for (let e of this.enemies) {
            const rel = e.pos.sub(this.player.pos).mult(scale);
            if (rel.mag() < 85) {
                mCtx.beginPath(); mCtx.arc(90 + rel.x, 90 + rel.y, 2, 0, Math.PI*2); mCtx.fill();
            }
        }

        // Player
        mCtx.fillStyle = '#00ff66';
        mCtx.beginPath(); mCtx.arc(90, 90, 4, 0, Math.PI*2); mCtx.fill();
    },

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Cap dt at 100ms to prevent glitches
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid(this.ctx);

        // Player Update & Render
        this.player.update(dt);
        this.player.draw(this.ctx, this.cam);

        // Bullet Update & Render
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.update(dt);
            b.draw(this.ctx, this.cam);
            if (b.life <= 0) this.bullets.splice(i, 1);
        }

        // Particle Update & Render
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.update(dt);
            p.draw(this.ctx, this.cam);
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Enemy Update, Render & Collision
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.update(dt, this.player.pos, this.enemies);
            e.draw(this.ctx, this.cam);

            // Player Collision
            if (Vector2.distance(this.player.pos, e.pos) < this.player.radius + e.radius) {
                this.player.damage(e.dmg * dt * 2); // Constant damage while touching
            }

            // Bullet Collision
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                let b = this.bullets[j];
                if (b.hitEntities.has(e)) continue;

                if (Vector2.distance(b.pos, e.pos) < e.radius + 5) {
                    e.hp -= b.damage;
                    const hitAngle = Vector2.angle(b.pos, e.pos);
                    this.spawnBlood(e.pos, hitAngle);
                    
                    if (e.hp <= 0) {
                        this.triggerHitmarker(true);
                        this.score += (100 * this.multiplier);
                        this.enemies.splice(i, 1);
                        document.getElementById('enemies-remaining').textContent = `TARGETS: ${this.enemies.length}`;
                        this.updateHUD();
                    } else {
                        this.triggerHitmarker(false);
                        this.score += (10 * this.multiplier);
                        this.updateHUD();
                    }

                    if (!b.pierce) {
                        this.bullets.splice(j, 1);
                    } else {
                        b.hitEntities.add(e);
                    }
                    break;
                }
            }
        }

        if (this.enemies.length === 0) this.spawnWave();
        
        // Minimap updates 10 times a second roughly to save performance
        if (Math.random() < 0.2) this.drawMinimap();

        // Loop
        requestAnimationFrame(t => this.loop(t));
    }
};

// --- BOOT SEQUENCE ---
window.onload = () => Engine.init();
