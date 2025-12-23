// ============================================
// 🎃 HALLOWEEN RUNNER - OBSTACLES SYSTEM
// ============================================

// Base Obstacle class
class Obstacle {
    constructor(lane, y, type) {
        this.lane = lane;
        this.y = y;
        this.type = type;
        this.width = 60;
        this.height = 60;
        this.speed = GameConfig.INITIAL_SPEED;
        this.active = true;
    }

    getLaneX() {
        const centerX = GameConfig.WIDTH / 2;
        return centerX + (this.lane - 1) * GameConfig.LANE_WIDTH;
    }

    update(gameSpeed) {
        this.y += gameSpeed;
        if (this.y > GameConfig.HEIGHT + 100) {
            this.active = false;
        }
    }

    getHitbox() {
        return {
            x: this.getLaneX() - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        // Override in subclasses
    }
}

// Candy collectible
class Candy extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'candy');
        this.width = 25;
        this.height = 25;
        this.color = Utils.randomChoice(Colors.candyColors);
        this.rotation = Utils.random(0, 360);
        this.rotationSpeed = Utils.randomFloat(2, 5);
        this.collected = false;
        this.collectAnimation = 0;
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.rotation += this.rotationSpeed;

        if (this.collected) {
            this.collectAnimation += 0.1;
            if (this.collectAnimation >= 1) {
                this.active = false;
            }
        }
    }

    collect() {
        if (!this.collected) {
            this.collected = true;
            return true;
        }
        return false;
    }

    getHitbox() {
        return {
            x: this.getLaneX() - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        if (!this.active) return;

        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y);

        if (this.collected) {
            // Collection animation
            ctx.globalAlpha = 1 - this.collectAnimation;
            ctx.scale(1 + this.collectAnimation, 1 + this.collectAnimation);
        }

        ctx.rotate(Utils.degToRad(this.rotation));

        // Wrapper
        ctx.fillStyle = this.color;
        Utils.roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 5);
        ctx.fill();

        // Wrapper twist ends
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 2 - 8, -5);
        ctx.lineTo(-this.width / 2 - 8, 5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2 + 8, -5);
        ctx.lineTo(this.width / 2 + 8, 5);
        ctx.closePath();
        ctx.fill();

        // Stripes on wrapper
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -this.height / 2);
        ctx.lineTo(-5, this.height / 2);
        ctx.moveTo(5, -this.height / 2);
        ctx.lineTo(5, this.height / 2);
        ctx.stroke();

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-3, -5, 4, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Creeper Tunnel (duck or jump)
class Tunnel extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'tunnel');
        this.width = 100;
        this.height = 80;
        this.vinePhase = 0;
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.vinePhase += 0.05;
    }

    getHitbox() {
        // Only the top part is the hitbox (can slide under)
        return {
            x: this.getLaneX() - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height * 0.6 // Upper portion
        };
    }

    canSlideUnder() {
        return true;
    }

    canJumpOver() {
        return true;
    }

    draw(ctx) {
        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y);

        // Tunnel arch
        const gradient = ctx.createLinearGradient(0, -this.height, 0, 0);
        gradient.addColorStop(0, Colors.tunnelBrown);
        gradient.addColorStop(1, '#3a2518');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height * 0.3);
        ctx.quadraticCurveTo(-this.width / 2, -this.height, 0, -this.height);
        ctx.quadraticCurveTo(this.width / 2, -this.height, this.width / 2, -this.height * 0.3);
        ctx.lineTo(this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Inner tunnel darkness
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 + 10, 0);
        ctx.quadraticCurveTo(0, -this.height * 0.7, this.width / 2 - 10, 0);
        ctx.closePath();
        ctx.fill();

        // Creeping vines
        ctx.strokeStyle = Colors.tunnelGreen;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (let i = 0; i < 5; i++) {
            const startX = -this.width / 2 + 10 + i * 20;
            const vineWave = Math.sin(this.vinePhase + i) * 5;

            ctx.beginPath();
            ctx.moveTo(startX, -this.height + 10);
            ctx.quadraticCurveTo(
                startX + vineWave, -this.height * 0.5,
                startX + vineWave * 2, -this.height * 0.2
            );
            ctx.stroke();

            // Vine leaves
            ctx.fillStyle = Colors.tunnelGreen;
            ctx.beginPath();
            ctx.ellipse(startX + vineWave, -this.height * 0.6, 5, 8, vineWave * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hanging cobwebs
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.width / 3, -this.height + 5);
        ctx.quadraticCurveTo(-this.width / 4, -this.height * 0.7, -this.width / 5, -this.height * 0.5);
        ctx.stroke();

        ctx.restore();
    }
}

// Halloween Truck
class Truck extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'truck');
        this.width = 90;
        this.height = 70;
        this.pumpkinGlow = 0;
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.pumpkinGlow = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    }

    getHitbox() {
        // Front of truck is the hitbox
        return {
            x: this.getLaneX() - this.width / 2 + 10,
            y: this.y - this.height + 15,
            width: this.width - 20,
            height: this.height - 25
        };
    }

    draw(ctx) {
        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y);

        // Truck body
        ctx.fillStyle = Colors.truckBlack;
        Utils.roundRect(ctx, -this.width / 2, -this.height, this.width * 0.7, this.height * 0.7, 5);
        ctx.fill();

        // Truck cab
        ctx.fillStyle = Colors.truckOrange;
        Utils.roundRect(ctx, -this.width / 2 + this.width * 0.7, -this.height * 0.8, this.width * 0.3, this.height * 0.5, 3);
        ctx.fill();

        // Window
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(-this.width / 2 + this.width * 0.75, -this.height * 0.75, this.width * 0.2, this.height * 0.3);

        // Wheels
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-this.width / 3, 0, 12, 0, Math.PI * 2);
        ctx.arc(this.width / 4, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Wheel rims
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(-this.width / 3, 0, 6, 0, Math.PI * 2);
        ctx.arc(this.width / 4, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkins in truck bed
        for (let i = 0; i < 3; i++) {
            this.drawPumpkin(ctx, -this.width / 3 + i * 20, -this.height * 0.5, 12);
        }

        // Halloween decorations - skull
        ctx.fillStyle = '#e8dcc8';
        ctx.beginPath();
        ctx.arc(-this.width / 2 + 15, -this.height + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.width / 2 + 13, -this.height + 8, 2, 0, Math.PI * 2);
        ctx.arc(-this.width / 2 + 17, -this.height + 8, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawPumpkin(ctx, x, y, size) {
        // Pumpkin glow
        ctx.fillStyle = `rgba(255, 150, 50, ${this.pumpkinGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkin body
        ctx.fillStyle = Colors.pumpkinOrange;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkin segments
        ctx.strokeStyle = '#cc5500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.8);
        ctx.lineTo(x, y + size * 0.8);
        ctx.stroke();

        // Stem
        ctx.fillStyle = '#4a3000';
        ctx.fillRect(x - 2, y - size - 4, 4, 6);

        // Face
        ctx.fillStyle = `rgba(255, 200, 50, ${this.pumpkinGlow})`;
        // Eyes
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.lineTo(x - 2, y - 5);
        ctx.lineTo(x, y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 4, y - 2);
        ctx.lineTo(x + 2, y - 5);
        ctx.lineTo(x, y - 2);
        ctx.closePath();
        ctx.fill();
        // Mouth
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 3);
        ctx.lineTo(x, y + 1);
        ctx.lineTo(x + 5, y + 3);
        ctx.stroke();
    }
}

// Tombstone obstacle
class Tombstone extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'tombstone');
        this.width = 50;
        this.height = 70;
        this.text = Utils.randomChoice(['RIP', 'BOO', '💀', 'R.I.P']);
    }

    draw(ctx) {
        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(5, 0, this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tombstone
        const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        gradient.addColorStop(0, '#3a3a3a');
        gradient.addColorStop(0.5, Colors.tombstoneGray);
        gradient.addColorStop(1, '#3a3a3a');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height * 0.7);
        ctx.quadraticCurveTo(-this.width / 2, -this.height, 0, -this.height);
        ctx.quadraticCurveTo(this.width / 2, -this.height, this.width / 2, -this.height * 0.7);
        ctx.lineTo(this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Cracks
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, -this.height * 0.4);
        ctx.lineTo(-8, -this.height * 0.3);
        ctx.lineTo(-3, -this.height * 0.2);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 14px Creepster, cursive';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, 0, -this.height * 0.5);

        // Grass at base
        ctx.fillStyle = '#1a3a1a';
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 5, 0);
            ctx.lineTo(i * 5 - 2, -8);
            ctx.lineTo(i * 5 + 2, -6);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

// Pumpkin Bomb (rolling)
class PumpkinBomb extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'pumpkin');
        this.width = 45;
        this.height = 45;
        this.rotation = 0;
        this.rotationSpeed = 8;
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y - this.height / 2);
        ctx.rotate(Utils.degToRad(this.rotation));

        // Pumpkin glow
        const glow = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 0, ${glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.width * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkin body
        ctx.fillStyle = Colors.pumpkinOrange;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Segments
        ctx.strokeStyle = '#b84a00';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.ellipse(i * 6, 0, 5, this.height / 2.2, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Angry face
        ctx.fillStyle = `rgba(255, 200, 50, ${glow})`;
        // Evil eyes
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-5, -12);
        ctx.lineTo(0, -5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.lineTo(5, -12);
        ctx.lineTo(0, -5);
        ctx.closePath();
        ctx.fill();

        // Evil grin
        ctx.beginPath();
        ctx.moveTo(-12, 5);
        ctx.lineTo(-8, 2);
        ctx.lineTo(-4, 8);
        ctx.lineTo(0, 3);
        ctx.lineTo(4, 8);
        ctx.lineTo(8, 2);
        ctx.lineTo(12, 5);
        ctx.strokeStyle = `rgba(255, 200, 50, ${glow})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fuse/stem on fire
        ctx.fillStyle = '#3a2a00';
        ctx.fillRect(-3, -this.height / 2 - 8, 6, 10);

        // Fire on fuse
        const fireFlicker = Math.random() * 0.3;
        ctx.fillStyle = `rgba(255, ${150 + fireFlicker * 100}, 0, 0.9)`;
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 2 - 12, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 2 - 12, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Ghost Swarm (slide under)
class GhostSwarm extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'ghost');
        this.width = 80;
        this.height = 60;
        this.ghosts = [];

        // Create multiple ghosts
        for (let i = 0; i < 4; i++) {
            this.ghosts.push({
                offsetX: Utils.random(-30, 30),
                offsetY: Utils.random(-20, 10),
                size: Utils.random(15, 25),
                phase: Utils.random(0, 100),
                speed: Utils.randomFloat(0.03, 0.06)
            });
        }
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.ghosts.forEach(ghost => {
            ghost.phase += ghost.speed;
        });
    }

    getHitbox() {
        return {
            x: this.getLaneX() - this.width / 2,
            y: this.y - this.height - 20, // Floating high
            width: this.width,
            height: this.height * 0.7
        };
    }

    canSlideUnder() {
        return true;
    }

    draw(ctx) {
        const x = this.getLaneX();

        this.ghosts.forEach(ghost => {
            const floatY = Math.sin(ghost.phase) * 8;
            const gx = x + ghost.offsetX;
            const gy = this.y - this.height / 2 + ghost.offsetY + floatY;

            ctx.save();
            ctx.translate(gx, gy);

            // Ghost glow
            ctx.fillStyle = 'rgba(200, 200, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, ghost.size * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Ghost body
            ctx.fillStyle = Colors.ghostWhite;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.moveTo(-ghost.size / 2, ghost.size);
            ctx.quadraticCurveTo(-ghost.size, 0, -ghost.size / 2, -ghost.size / 2);
            ctx.quadraticCurveTo(0, -ghost.size, ghost.size / 2, -ghost.size / 2);
            ctx.quadraticCurveTo(ghost.size, 0, ghost.size / 2, ghost.size);

            // Wavy bottom
            for (let i = 0; i < 4; i++) {
                const wx = ghost.size / 2 - i * (ghost.size / 3);
                ctx.quadraticCurveTo(wx, ghost.size - 5, wx - ghost.size / 6, ghost.size);
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-ghost.size / 4, -ghost.size / 4, 3, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(ghost.size / 4, -ghost.size / 4, 3, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Spooky mouth
            ctx.beginPath();
            ctx.ellipse(0, ghost.size / 4, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }
}

// Spider Web (slows down)
class SpiderWeb extends Obstacle {
    constructor(lane, y) {
        super(lane, y, 'web');
        this.width = 70;
        this.height = 70;
        this.webPhase = 0;
    }

    update(gameSpeed) {
        super.update(gameSpeed);
        this.webPhase += 0.02;
    }

    draw(ctx) {
        const x = this.getLaneX();

        ctx.save();
        ctx.translate(x, this.y - this.height / 2);

        const wobble = Math.sin(this.webPhase) * 2;

        // Web strands (radial)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * (this.width / 2 + wobble),
                Math.sin(angle) * (this.height / 2 + wobble)
            );
            ctx.stroke();
        }

        // Spiral strands
        for (let ring = 1; ring <= 4; ring++) {
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = (ring / 4) * (this.width / 2);
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }

        // Spider
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(wobble * 2, wobble, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spider legs
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const legAngle = Utils.degToRad(-60 + i * 40);
            // Left legs
            ctx.beginPath();
            ctx.moveTo(wobble * 2 - 5, wobble);
            ctx.quadraticCurveTo(
                wobble * 2 - 15, wobble + Math.sin(legAngle + this.webPhase * 2) * 5,
                wobble * 2 - 20, wobble + 10 + i * 3
            );
            ctx.stroke();
            // Right legs
            ctx.beginPath();
            ctx.moveTo(wobble * 2 + 5, wobble);
            ctx.quadraticCurveTo(
                wobble * 2 + 15, wobble + Math.sin(legAngle + this.webPhase * 2) * 5,
                wobble * 2 + 20, wobble + 10 + i * 3
            );
            ctx.stroke();
        }

        // Spider eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(wobble * 2 - 2, wobble - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(wobble * 2 + 2, wobble - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Dragon (power-up that lifts player)
class Dragon {
    constructor() {
        this.x = GameConfig.WIDTH + 100;
        this.y = 150;
        this.width = 150;
        this.height = 80;
        this.active = false;
        this.carrying = false;
        this.wingPhase = 0;
        this.targetX = GameConfig.WIDTH / 2;
    }

    activate() {
        this.active = true;
        this.x = GameConfig.WIDTH + 100;
        this.carrying = false;
    }

    update() {
        if (!this.active) return;

        this.wingPhase += 8;

        if (!this.carrying) {
            // Fly in from right
            this.x = Utils.lerp(this.x, this.targetX, 0.05);
            if (Math.abs(this.x - this.targetX) < 50) {
                this.carrying = true;
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        const wingFlap = Math.sin(this.wingPhase * 0.15) * 20;

        // Dragon glow
        ctx.fillStyle = 'rgba(255, 100, 50, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.6, this.height * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#4a2040';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.4, this.height * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#6a3060';

        // Left wing
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.quadraticCurveTo(-60, -30 - wingFlap, -80, 10 - wingFlap / 2);
        ctx.quadraticCurveTo(-50, 20, -20, 10);
        ctx.closePath();
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.quadraticCurveTo(60, -30 - wingFlap, 80, 10 - wingFlap / 2);
        ctx.quadraticCurveTo(50, 20, 20, 10);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#4a2040';
        ctx.beginPath();
        ctx.ellipse(-this.width * 0.35, -10, 25, 18, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#2a1020';
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.35, -25);
        ctx.lineTo(-this.width * 0.4, -40);
        ctx.lineTo(-this.width * 0.3, -28);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.3, -25);
        ctx.lineTo(-this.width * 0.25, -38);
        ctx.lineTo(-this.width * 0.2, -25);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.ellipse(-this.width * 0.38, -12, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(-this.width * 0.38, -12, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fire breath
        if (Math.random() > 0.7) {
            this.drawFire(ctx, -this.width * 0.5, -5);
        }

        // Tail
        ctx.strokeStyle = '#4a2040';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.width * 0.35, 0);
        ctx.quadraticCurveTo(this.width * 0.5, 20, this.width * 0.6, -10);
        ctx.stroke();

        // Tail spike
        ctx.fillStyle = '#2a1020';
        ctx.beginPath();
        ctx.moveTo(this.width * 0.58, -15);
        ctx.lineTo(this.width * 0.7, -10);
        ctx.lineTo(this.width * 0.58, 0);
        ctx.closePath();
        ctx.fill();

        // Claws (for carrying)
        if (this.carrying) {
            ctx.strokeStyle = '#2a1020';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-10, this.height * 0.3);
            ctx.lineTo(-15, this.height * 0.5);
            ctx.moveTo(0, this.height * 0.3);
            ctx.lineTo(0, this.height * 0.5);
            ctx.moveTo(10, this.height * 0.3);
            ctx.lineTo(15, this.height * 0.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawFire(ctx, x, y) {
        const gradient = ctx.createRadialGradient(x, y, 0, x - 30, y, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 150, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.7)');
        gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.4)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 20, y - 15, x - 50, y);
        ctx.quadraticCurveTo(x - 20, y + 15, x, y);
        ctx.fill();
    }
}

// Obstacle Manager
class ObstacleManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.obstacles = [];
        this.candies = [];
        this.dragon = new Dragon();

        this.lastCandyTime = 0;
        this.lastObstacleTime = 0;
        this.lastDragonTime = 0;

        this.obstacleTypes = [Tunnel, Truck, Tombstone, PumpkinBomb, GhostSwarm, SpiderWeb];
    }

    reset() {
        this.obstacles = [];
        this.candies = [];
        this.dragon = new Dragon();
        this.lastCandyTime = Date.now();
        this.lastObstacleTime = Date.now();
        this.lastDragonTime = Date.now();
    }

    update(gameSpeed, currentTime) {
        // Spawn candies
        if (currentTime - this.lastCandyTime > GameConfig.CANDY_INTERVAL) {
            this.spawnCandyGroup();
            this.lastCandyTime = currentTime;
        }

        // Spawn obstacles
        if (currentTime - this.lastObstacleTime > GameConfig.OBSTACLE_INTERVAL) {
            this.spawnObstacle();
            this.lastObstacleTime = currentTime;
        }

        // Spawn dragon power-up
        if (currentTime - this.lastDragonTime > GameConfig.DRAGON_INTERVAL && !this.dragon.active) {
            this.dragon.activate();
            this.lastDragonTime = currentTime;
        }

        // Update obstacles
        this.obstacles.forEach(obs => obs.update(gameSpeed));
        this.obstacles = this.obstacles.filter(obs => obs.active);

        // Update candies
        this.candies.forEach(candy => candy.update(gameSpeed));
        this.candies = this.candies.filter(candy => candy.active);

        // Update dragon
        this.dragon.update();
    }

    spawnCandyGroup() {
        const lane = Utils.random(0, 2);
        const count = Utils.random(3, 10);
        const startY = -100;

        for (let i = 0; i < count; i++) {
            this.candies.push(new Candy(lane, startY - i * 40));
        }
    }

    spawnObstacle() {
        const lane = Utils.random(0, 2);
        const ObstacleClass = Utils.randomChoice(this.obstacleTypes);
        this.obstacles.push(new ObstacleClass(lane, -300));
    }

    checkCollisions(character) {
        const charHitbox = character.getHitbox();
        let candiesCollected = 0;
        let hitObstacle = false;

        // Check candy collection
        this.candies.forEach(candy => {
            if (!candy.collected && Utils.checkCollision(charHitbox, candy.getHitbox())) {
                if (candy.collect()) {
                    candiesCollected++;
                }
            }
        });

        // Check obstacle collision (skip if flying)
        if (!character.isFlying) {
            for (const obs of this.obstacles) {
                const obsHitbox = obs.getHitbox();

                if (Utils.checkCollision(charHitbox, obsHitbox)) {
                    // Check if can avoid by sliding
                    if (obs.canSlideUnder && obs.canSlideUnder() && character.isSliding) {
                        continue;
                    }
                    // Check if can avoid by jumping
                    if (obs.canJumpOver && obs.canJumpOver() && character.isJumping) {
                        continue;
                    }

                    hitObstacle = true;
                    break;
                }
            }
        }

        return { candiesCollected, hitObstacle };
    }

    isDragonReady() {
        return this.dragon.active && this.dragon.carrying;
    }

    draw() {
        // Draw candies
        this.candies.forEach(candy => candy.draw(this.ctx));

        // Draw obstacles
        this.obstacles.forEach(obs => obs.draw(this.ctx));

        // Draw dragon
        this.dragon.draw(this.ctx);
    }
}

// Export
window.ObstacleManager = ObstacleManager;
window.Candy = Candy;
window.Dragon = Dragon;
