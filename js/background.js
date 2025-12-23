// ============================================
// 🎃 HALLOWEEN RUNNER - BACKGROUND SYSTEM (ENHANCED)
// ============================================

class BackgroundManager {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.offset = 0;

        // Background layers - MORE decorations
        this.stars = this.generateStars(150);
        this.clouds = this.generateClouds(12);
        this.dragons = this.generateDragons(5);
        this.monsters = this.generateMonsters(15); // Many more monsters

        // NEW: Falling Halloween items
        this.fallingItems = this.generateFallingItems(20);

        // NEW: Side decorations
        this.sideCreatures = this.generateSideCreatures(8);

        // Fog particles - more fog
        this.fogParticles = this.generateFog(50);

        // Lane properties - for perspective running effect
        this.laneOffset = 0;
        this.perspectiveSpeed = 0;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Utils.random(0, this.width),
                y: Utils.random(0, this.height * 0.6),
                size: Utils.randomFloat(0.5, 2.5),
                twinkle: Utils.random(0, 100),
                speed: Utils.randomFloat(0.3, 1), // Slower twinkle
                color: Utils.randomChoice(['#ffffff', '#ffe6ff', '#e6e6ff', '#ffffe6'])
            });
        }
        return stars;
    }

    generateClouds(count) {
        const clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Utils.random(-100, this.width + 100),
                y: Utils.random(30, 220),
                width: Utils.random(80, 200),
                height: Utils.random(30, 70),
                speed: Utils.randomFloat(0.1, 0.3), // SLOWER clouds
                opacity: Utils.randomFloat(0.1, 0.35)
            });
        }
        return clouds;
    }

    generateDragons(count) {
        const dragons = [];
        for (let i = 0; i < count; i++) {
            dragons.push({
                x: Utils.random(0, this.width),
                y: Utils.random(60, 200),
                size: Utils.random(35, 80),
                speed: Utils.randomFloat(0.3, 0.7), // SLOWER dragons
                wingPhase: Utils.random(0, 100),
                breathPhase: Utils.random(0, 200),
                isBreathing: false
            });
        }
        return dragons;
    }

    generateMonsters(count) {
        const monsters = [];
        for (let i = 0; i < count; i++) {
            monsters.push({
                x: Utils.random(0, this.width),
                y: Utils.random(80, 300),
                size: Utils.random(15, 50),
                speed: Utils.randomFloat(0.15, 0.5), // SLOWER monsters
                floatPhase: Utils.random(0, 100),
                type: Utils.random(0, 5) // More monster types
            });
        }
        return monsters;
    }

    generateFallingItems(count) {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push({
                x: Utils.random(0, this.width),
                y: Utils.random(-200, this.height),
                type: Utils.randomChoice(['pumpkin', 'bat', 'skull', 'candy', 'spider', 'leaf']),
                size: Utils.random(10, 25),
                speed: Utils.randomFloat(0.3, 0.8), // SLOW falling
                rotation: Utils.random(0, 360),
                rotationSpeed: Utils.randomFloat(-2, 2),
                sway: Utils.random(0, 100)
            });
        }
        return items;
    }

    generateSideCreatures(count) {
        const creatures = [];
        for (let i = 0; i < count; i++) {
            creatures.push({
                x: Utils.randomChoice([Utils.random(20, 100), Utils.random(this.width - 100, this.width - 20)]),
                y: Utils.random(300, 450),
                type: Utils.randomChoice(['scarecrow', 'zombie_hand', 'eyeball', 'pumpkin_stack']),
                phase: Utils.random(0, 100)
            });
        }
        return creatures;
    }

    generateFog(count) {
        const fog = [];
        for (let i = 0; i < count; i++) {
            fog.push({
                x: Utils.random(0, this.width),
                y: Utils.random(this.height * 0.5, this.height),
                size: Utils.random(40, 180),
                opacity: Utils.randomFloat(0.04, 0.12),
                speed: Utils.randomFloat(0.05, 0.2) // SLOWER fog
            });
        }
        return fog;
    }

    update(gameSpeed) {
        this.offset += gameSpeed;
        this.laneOffset = (this.laneOffset + gameSpeed * 1.5) % 60; // Faster lane movement for running feel
        this.perspectiveSpeed = gameSpeed;

        // Update clouds - SLOWER
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * 0.5;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.width + 50;
                cloud.y = Utils.random(30, 220);
            }
        });

        // Update dragons - SLOWER
        this.dragons.forEach(dragon => {
            dragon.x -= dragon.speed * 0.5;
            dragon.wingPhase += 3;
            dragon.breathPhase++;

            if (dragon.breathPhase > 150) {
                dragon.isBreathing = Math.random() > 0.9;
                if (dragon.isBreathing) dragon.breathPhase = 0;
            }

            if (dragon.x + dragon.size < 0) {
                dragon.x = this.width + Utils.random(50, 300);
                dragon.y = Utils.random(60, 200);
            }
        });

        // Update monsters - SLOWER
        this.monsters.forEach(monster => {
            monster.x -= monster.speed * 0.5;
            monster.floatPhase += 1.5;

            if (monster.x + monster.size < 0) {
                monster.x = this.width + Utils.random(50, 200);
                monster.y = Utils.random(80, 300);
                monster.type = Utils.random(0, 5);
            }
        });

        // Update falling items - SLOW falling
        this.fallingItems.forEach(item => {
            item.y += item.speed;
            item.rotation += item.rotationSpeed;
            item.sway += 0.02;
            item.x += Math.sin(item.sway) * 0.5;

            if (item.y > this.height + 50) {
                item.y = -50;
                item.x = Utils.random(0, this.width);
                item.type = Utils.randomChoice(['pumpkin', 'bat', 'skull', 'candy', 'spider', 'leaf']);
            }
        });

        // Update side creatures
        this.sideCreatures.forEach(creature => {
            creature.phase += 0.05;
        });

        // Update fog - SLOWER
        this.fogParticles.forEach(fog => {
            fog.x -= fog.speed * 0.3;
            if (fog.x + fog.size < 0) {
                fog.x = this.width + fog.size;
            }
        });

        // Twinkle stars - SLOWER
        this.stars.forEach(star => {
            star.twinkle += star.speed * 0.5;
        });
    }

    draw() {
        // Draw sky gradient
        this.drawSky();

        // Draw moon
        this.drawMoon();

        // Draw stars
        this.drawStars();

        // Draw clouds
        this.drawClouds();

        // Draw distant mountains/hills
        this.drawHills();

        // Draw monsters
        this.drawMonsters();

        // Draw dragons
        this.drawDragons();

        // Draw falling items
        this.drawFallingItems();

        // Draw lanes with perspective
        this.drawLanes();

        // Draw side creatures
        this.drawSideCreatures();

        // Draw fog
        this.drawFog();
    }

    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#050208');
        gradient.addColorStop(0.2, '#0a0612');
        gradient.addColorStop(0.4, '#1a0a2e');
        gradient.addColorStop(0.7, '#2d1b4e');
        gradient.addColorStop(1, '#1a0a2e');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Multiple eerie glows
        const glowGradient = this.ctx.createRadialGradient(
            this.width * 0.75, 80, 0,
            this.width * 0.75, 80, 250
        );
        glowGradient.addColorStop(0, 'rgba(155, 77, 202, 0.35)');
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Orange glow (like distant fire)
        const fireGlow = this.ctx.createRadialGradient(
            this.width * 0.2, 150, 0,
            this.width * 0.2, 150, 200
        );
        fireGlow.addColorStop(0, 'rgba(255, 100, 50, 0.15)');
        fireGlow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = fireGlow;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawMoon() {
        const moonX = this.width * 0.85;
        const moonY = 80;
        const moonRadius = 40;

        // Moon glow
        const glowGradient = this.ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 3);
        glowGradient.addColorStop(0, 'rgba(255, 230, 200, 0.3)');
        glowGradient.addColorStop(0.5, 'rgba(255, 200, 150, 0.1)');
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Moon body
        this.ctx.fillStyle = '#ffe6cc';
        this.ctx.beginPath();
        this.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Moon craters
        this.ctx.fillStyle = 'rgba(200, 180, 160, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(moonX - 10, moonY - 8, 8, 0, Math.PI * 2);
        this.ctx.arc(moonX + 12, moonY + 5, 6, 0, Math.PI * 2);
        this.ctx.arc(moonX - 5, moonY + 12, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Bat silhouette crossing moon occasionally
        const batPhase = (Date.now() * 0.0003) % 1;
        if (batPhase < 0.3) {
            this.ctx.fillStyle = '#000';
            const batX = moonX - moonRadius + batPhase * moonRadius * 3;
            this.drawBatSilhouette(batX, moonY - 5, 15);
        }
    }

    drawBatSilhouette(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        const wingFlap = Math.sin(Date.now() * 0.02) * 0.4;

        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Wings
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-size * 0.3, -size * 0.2 - wingFlap * size, -size * 0.6, size * 0.05);
        this.ctx.quadraticCurveTo(-size * 0.3, size * 0.1, 0, 0);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(size * 0.3, -size * 0.2 - wingFlap * size, size * 0.6, size * 0.05);
        this.ctx.quadraticCurveTo(size * 0.3, size * 0.1, 0, 0);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinkle * 0.03) * 0.5 + 0.5;
            this.ctx.fillStyle = star.color.replace('ff', Math.floor(180 + twinkle * 75).toString(16));
            this.ctx.globalAlpha = 0.3 + twinkle * 0.7;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = `rgba(30, 15, 45, ${cloud.opacity})`;

            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.ellipse(
                    cloud.x + i * cloud.width * 0.22,
                    cloud.y + Math.sin(i * 0.8) * 8,
                    cloud.width * 0.28,
                    cloud.height * 0.6,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    drawHills() {
        // Far distant hills
        this.ctx.fillStyle = '#080510';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 320);
        for (let x = 0; x <= this.width; x += 40) {
            const y = 320 + Math.sin((x + this.offset * 0.05) * 0.015) * 40;
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Distant spooky hills with spires
        this.ctx.fillStyle = '#0c0815';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 350);
        for (let x = 0; x <= this.width; x += 35) {
            let y = 350 + Math.sin((x + this.offset * 0.08) * 0.02) * 30;
            // Add occasional spires
            if (x % 140 < 35) {
                y -= 25;
            }
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Closer hills
        this.ctx.fillStyle = '#120a1c';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 385);
        for (let x = 0; x <= this.width; x += 25) {
            const y = 385 + Math.sin((x + this.offset * 0.15) * 0.025) * 20;
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawMonsters() {
        this.monsters.forEach(monster => {
            const floatY = monster.y + Math.sin(monster.floatPhase * 0.025) * 12;

            switch (monster.type) {
                case 0:
                    this.ctx.fillStyle = 'rgba(60, 30, 80, 0.5)';
                    this.drawBat(monster.x, floatY, monster.size);
                    break;
                case 1:
                    this.ctx.fillStyle = 'rgba(80, 70, 100, 0.4)';
                    this.drawGhostSilhouette(monster.x, floatY, monster.size);
                    break;
                case 2:
                    this.ctx.fillStyle = 'rgba(50, 25, 70, 0.5)';
                    this.drawDemonSilhouette(monster.x, floatY, monster.size);
                    break;
                case 3:
                    this.drawFloatingSkull(monster.x, floatY, monster.size);
                    break;
                case 4:
                    this.drawWitch(monster.x, floatY, monster.size);
                    break;
                case 5:
                    this.drawFlyingPumpkin(monster.x, floatY, monster.size, monster.floatPhase);
                    break;
            }
        });
    }

    drawBat(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);

        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.25, size * 0.18, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const wingFlap = Math.sin(Date.now() * 0.015) * 0.35;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-size * 0.4, -size * 0.25 + wingFlap * size, -size * 0.8, size * 0.08);
        this.ctx.quadraticCurveTo(-size * 0.4, size * 0.15, 0, 0);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(size * 0.4, -size * 0.25 + wingFlap * size, size * 0.8, size * 0.08);
        this.ctx.quadraticCurveTo(size * 0.4, size * 0.15, 0, 0);
        this.ctx.fill();

        // Little ears
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.1, -size * 0.15);
        this.ctx.lineTo(-size * 0.15, -size * 0.28);
        this.ctx.lineTo(-size * 0.05, -size * 0.18);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.1, -size * 0.15);
        this.ctx.lineTo(size * 0.15, -size * 0.28);
        this.ctx.lineTo(size * 0.05, -size * 0.18);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawGhostSilhouette(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size);
        const waveOffset = Math.sin(Date.now() * 0.003) * 3;
        this.ctx.quadraticCurveTo(x - size * 0.5, y + size * 0.5 + waveOffset, x - size * 0.4, y);
        this.ctx.quadraticCurveTo(x, y - size * 0.6, x + size * 0.4, y);
        this.ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.5 - waveOffset, x, y + size);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(x - size * 0.12, y - size * 0.1, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
        this.ctx.ellipse(x + size * 0.12, y - size * 0.1, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawDemonSilhouette(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);

        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Horns
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.2, -size * 0.35);
        this.ctx.quadraticCurveTo(-size * 0.35, -size * 0.5, -size * 0.45, -size * 0.65);
        this.ctx.quadraticCurveTo(-size * 0.25, -size * 0.45, -size * 0.1, -size * 0.38);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.2, -size * 0.35);
        this.ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.45, -size * 0.65);
        this.ctx.quadraticCurveTo(size * 0.25, -size * 0.45, size * 0.1, -size * 0.38);
        this.ctx.fill();

        // Wings
        const wingFlap = Math.sin(Date.now() * 0.008) * 0.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.25, 0);
        this.ctx.quadraticCurveTo(-size * 0.6, -size * 0.3 - wingFlap * size, -size * 0.7, size * 0.1);
        this.ctx.quadraticCurveTo(-size * 0.4, size * 0.2, -size * 0.25, size * 0.1);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.25, 0);
        this.ctx.quadraticCurveTo(size * 0.6, -size * 0.3 - wingFlap * size, size * 0.7, size * 0.1);
        this.ctx.quadraticCurveTo(size * 0.4, size * 0.2, size * 0.25, size * 0.1);
        this.ctx.fill();

        // Glowing eyes
        this.ctx.fillStyle = 'rgba(255, 50, 50, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.1, -size * 0.1, size * 0.05, 0, Math.PI * 2);
        this.ctx.arc(size * 0.1, -size * 0.1, size * 0.05, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawFloatingSkull(x, y, size) {
        this.ctx.fillStyle = 'rgba(200, 190, 180, 0.4)';

        // Skull shape
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Jaw
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + size * 0.3, size * 0.25, size * 0.15, 0, 0, Math.PI);
        this.ctx.fill();

        // Eye sockets
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.ellipse(x - size * 0.15, y - size * 0.05, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.ellipse(x + size * 0.15, y - size * 0.05, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Glowing eyes
        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.15, y - size * 0.05, size * 0.06, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.15, y - size * 0.05, size * 0.06, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawWitch(x, y, size) {
        this.ctx.fillStyle = 'rgba(30, 20, 40, 0.6)';

        // Body on broom
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.25, size * 0.35, 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Hat
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.3, y - size * 0.3);
        this.ctx.lineTo(x, y - size * 0.8);
        this.ctx.lineTo(x + size * 0.3, y - size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();

        // Hat brim
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - size * 0.3, size * 0.35, size * 0.08, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Broom
        this.ctx.strokeStyle = 'rgba(80, 50, 30, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.5, y + size * 0.2);
        this.ctx.lineTo(x + size * 0.6, y + size * 0.1);
        this.ctx.stroke();

        // Broom bristles
        this.ctx.strokeStyle = 'rgba(120, 80, 40, 0.5)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + size * 0.5, y + size * 0.1);
            this.ctx.lineTo(x + size * 0.8, y + size * 0.05 + i * 3);
            this.ctx.stroke();
        }
    }

    drawFlyingPumpkin(x, y, size, phase) {
        const glow = Math.sin(phase * 0.05) * 0.2 + 0.5;

        // Glow
        this.ctx.fillStyle = `rgba(255, 150, 50, ${glow * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Pumpkin
        this.ctx.fillStyle = 'rgba(200, 100, 30, 0.6)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Face
        this.ctx.fillStyle = `rgba(255, 200, 100, ${glow})`;
        // Eyes
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.15, y - size * 0.05);
        this.ctx.lineTo(x - size * 0.1, y - size * 0.15);
        this.ctx.lineTo(x - size * 0.05, y - size * 0.05);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(x + size * 0.15, y - size * 0.05);
        this.ctx.lineTo(x + size * 0.1, y - size * 0.15);
        this.ctx.lineTo(x + size * 0.05, y - size * 0.05);
        this.ctx.closePath();
        this.ctx.fill();

        // Mouth
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.15, y + size * 0.1);
        this.ctx.lineTo(x - size * 0.1, y + size * 0.05);
        this.ctx.lineTo(x, y + size * 0.12);
        this.ctx.lineTo(x + size * 0.1, y + size * 0.05);
        this.ctx.lineTo(x + size * 0.15, y + size * 0.1);
        this.ctx.stroke();
    }

    drawDragons() {
        this.dragons.forEach(dragon => {
            this.drawDragon(dragon);
        });
    }

    drawDragon(dragon) {
        const { x, y, size, wingPhase, isBreathing } = dragon;

        this.ctx.save();
        this.ctx.translate(x, y);

        this.ctx.fillStyle = 'rgba(35, 18, 45, 0.85)';

        // Body
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.55, size * 0.22, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Neck and Head
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.45, -size * 0.12, size * 0.22, size * 0.16, -0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Snout
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.6, -size * 0.15, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Tail
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.45, 0);
        this.ctx.quadraticCurveTo(-size * 0.7, size * 0.15, -size * 0.9, -size * 0.08);
        this.ctx.quadraticCurveTo(-size * 0.75, size * 0.02, -size * 0.5, size * 0.08);
        this.ctx.fill();

        // Wings
        const wingOffset = Math.sin(wingPhase * 0.08) * size * 0.35;

        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.15, -size * 0.08);
        this.ctx.quadraticCurveTo(-size * 0.1, -size * 0.5 - wingOffset, size * 0.25, -size * 0.35 - wingOffset * 0.6);
        this.ctx.quadraticCurveTo(size * 0.05, -size * 0.18, -size * 0.15, -size * 0.08);
        this.ctx.fill();

        // Spikes on back
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.3 + i * size * 0.15, -size * 0.18);
            this.ctx.lineTo(-size * 0.25 + i * size * 0.15, -size * 0.32);
            this.ctx.lineTo(-size * 0.2 + i * size * 0.15, -size * 0.18);
            this.ctx.fill();
        }

        // Fire breath
        if (isBreathing || Math.random() > 0.97) {
            this.drawFireBreath(size * 0.7, -size * 0.12, size * 0.6);
        }

        // Eye
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.shadowColor = '#ff6b35';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(size * 0.52, -size * 0.18, size * 0.045, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.restore();
    }

    drawFireBreath(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x + size, y, size);
        gradient.addColorStop(0, 'rgba(255, 255, 180, 0.9)');
        gradient.addColorStop(0.2, 'rgba(255, 180, 50, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 30, 0.5)');
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.35, x + size, y);
        this.ctx.quadraticCurveTo(x + size * 0.4, y + size * 0.35, x, y);
        this.ctx.fill();

        // Sparks
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
        for (let i = 0; i < 4; i++) {
            const sparkX = x + size * 0.3 + Math.random() * size * 0.5;
            const sparkY = y + (Math.random() - 0.5) * size * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawFallingItems() {
        this.fallingItems.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(Utils.degToRad(item.rotation));
            this.ctx.globalAlpha = 0.6;

            switch (item.type) {
                case 'pumpkin':
                    this.ctx.fillStyle = '#cc6600';
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, item.size * 0.5, item.size * 0.4, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#442200';
                    this.ctx.fillRect(-2, -item.size * 0.5, 4, item.size * 0.15);
                    break;

                case 'bat':
                    this.ctx.fillStyle = '#1a1a2a';
                    this.drawBatSilhouette(0, 0, item.size);
                    break;

                case 'skull':
                    this.ctx.fillStyle = '#ddd8cc';
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, item.size * 0.4, item.size * 0.45, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#222';
                    this.ctx.beginPath();
                    this.ctx.arc(-item.size * 0.12, -item.size * 0.05, 3, 0, Math.PI * 2);
                    this.ctx.arc(item.size * 0.12, -item.size * 0.05, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case 'candy':
                    this.ctx.fillStyle = Utils.randomChoice(['#ff69b4', '#00d4ff', '#ffd700', '#ff6b35']);
                    Utils.roundRect(this.ctx, -item.size * 0.4, -item.size * 0.25, item.size * 0.8, item.size * 0.5, 3);
                    this.ctx.fill();
                    break;

                case 'spider':
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, item.size * 0.2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#1a1a1a';
                    this.ctx.lineWidth = 1;
                    for (let i = 0; i < 4; i++) {
                        const angle = Utils.degToRad(-60 + i * 40);
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, 0);
                        this.ctx.lineTo(Math.cos(angle) * item.size * 0.5, Math.sin(angle) * item.size * 0.5);
                        this.ctx.stroke();
                    }
                    break;

                case 'leaf':
                    this.ctx.fillStyle = Utils.randomChoice(['#8B4513', '#A0522D', '#D2691E', '#CD853F']);
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, item.size * 0.3, item.size * 0.5, 0.3, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
            }

            this.ctx.globalAlpha = 1;
            this.ctx.restore();
        });
    }

    drawLanes() {
        const laneStartY = 415;
        const laneEndY = this.height;
        const centerX = this.width / 2;
        const laneWidth = GameConfig.LANE_WIDTH;
        const lanes = [-1, 0, 1];

        // Ground with running lines effect
        const groundGradient = this.ctx.createLinearGradient(0, laneStartY, 0, laneEndY);
        groundGradient.addColorStop(0, '#180d22');
        groundGradient.addColorStop(0.3, '#251535');
        groundGradient.addColorStop(0.6, '#2a1a3a');
        groundGradient.addColorStop(1, '#180d22');

        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, laneStartY, this.width, laneEndY - laneStartY);

        // Running lines (perspective effect - lines moving towards us)
        this.ctx.strokeStyle = 'rgba(155, 77, 202, 0.15)';
        this.ctx.lineWidth = 1;

        const lineCount = 15;
        for (let i = 0; i < lineCount; i++) {
            const lineY = laneStartY + ((i * 15 + this.laneOffset) % (laneEndY - laneStartY));
            const widthScale = (lineY - laneStartY) / (laneEndY - laneStartY);
            const lineWidth = 100 + widthScale * 300;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX - lineWidth, lineY);
            this.ctx.lineTo(centerX + lineWidth, lineY);
            this.ctx.stroke();
        }

        // Lane dividers with perspective
        lanes.forEach((lane, index) => {
            const laneX = centerX + lane * laneWidth;

            if (index < lanes.length - 1) {
                const dividerX = laneX + laneWidth / 2;
                this.ctx.strokeStyle = 'rgba(155, 77, 202, 0.35)';
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([25, 25]);
                this.ctx.lineDashOffset = -this.laneOffset * 2.5;

                this.ctx.beginPath();
                this.ctx.moveTo(dividerX, laneStartY);
                this.ctx.lineTo(dividerX, laneEndY);
                this.ctx.stroke();
            }
        });

        this.ctx.setLineDash([]);

        // Side decorations
        this.drawSideDecorations(laneStartY);
    }

    drawSideCreatures() {
        this.sideCreatures.forEach(creature => {
            const bobY = Math.sin(creature.phase) * 3;

            switch (creature.type) {
                case 'scarecrow':
                    this.drawScarecrow(creature.x, creature.y + bobY);
                    break;
                case 'zombie_hand':
                    this.drawZombieHand(creature.x, creature.y + bobY, creature.phase);
                    break;
                case 'eyeball':
                    this.drawFloatingEyeball(creature.x, creature.y + bobY, creature.phase);
                    break;
                case 'pumpkin_stack':
                    this.drawPumpkinStack(creature.x, creature.y);
                    break;
            }
        });
    }

    drawScarecrow(x, y) {
        // Post
        this.ctx.fillStyle = '#3d2817';
        this.ctx.fillRect(x - 4, y, 8, 80);

        // Cross bar
        this.ctx.fillRect(x - 25, y + 15, 50, 6);

        // Head (pumpkin or sack)
        this.ctx.fillStyle = '#c67030';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 12, 14, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Hat
        this.ctx.fillStyle = '#2a1a0a';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 18, 15, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        Utils.roundRect(this.ctx, x - 10, y - 35, 20, 18, 3);
        this.ctx.fill();
    }

    drawZombieHand(x, y, phase) {
        const wiggle = Math.sin(phase * 3) * 3;

        this.ctx.fillStyle = '#5a8a5a';

        // Arm coming from ground
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6, y + 20);
        this.ctx.quadraticCurveTo(x + wiggle, y, x + wiggle * 0.5, y - 20);
        this.ctx.lineTo(x + 6 + wiggle * 0.5, y - 18);
        this.ctx.quadraticCurveTo(x + 6 + wiggle, y, x + 6, y + 20);
        this.ctx.closePath();
        this.ctx.fill();

        // Fingers
        for (let i = -2; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * 4 + wiggle * 0.5, y - 18);
            this.ctx.lineTo(x + i * 5 + wiggle, y - 30 - Math.abs(i) * 3);
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = '#5a8a5a';
            this.ctx.stroke();
        }
    }

    drawFloatingEyeball(x, y, phase) {
        const floatY = y + Math.sin(phase * 2) * 8;

        // Eye white
        this.ctx.fillStyle = '#f0e8e0';
        this.ctx.beginPath();
        this.ctx.arc(x, floatY, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Iris
        this.ctx.fillStyle = '#2a6030';
        this.ctx.beginPath();
        this.ctx.arc(x + Math.sin(phase) * 3, floatY, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupil
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + Math.sin(phase) * 3, floatY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Blood vessels
        this.ctx.strokeStyle = 'rgba(180, 50, 50, 0.5)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2 + phase * 0.1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, floatY);
            this.ctx.lineTo(x + Math.cos(angle) * 10, floatY + Math.sin(angle) * 10);
            this.ctx.stroke();
        }
    }

    drawPumpkinStack(x, y) {
        // Bottom pumpkin (largest)
        this.ctx.fillStyle = '#d06020';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 15, 20, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Middle pumpkin
        this.ctx.beginPath();
        this.ctx.ellipse(x + 3, y - 5, 15, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Top pumpkin (smallest, with face)
        this.ctx.beginPath();
        this.ctx.ellipse(x - 2, y - 22, 10, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Glowing face on top
        const glow = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(255, 200, 100, ${glow})`;
        // Eyes
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 24, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 1, y - 24, 2, 0, Math.PI * 2);
        this.ctx.fill();
        // Mouth
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 19, 3, 0, Math.PI);
        this.ctx.stroke();
    }

    drawSideDecorations(startY) {
        // Left side lanterns
        for (let i = 0; i < 4; i++) {
            const y = startY + 40 + i * 50 - (this.laneOffset % 50);
            if (y > startY && y < this.height) {
                this.drawLantern(70, y);
            }
        }

        // Right side lanterns
        for (let i = 0; i < 4; i++) {
            const y = startY + 65 + i * 50 - (this.laneOffset % 50);
            if (y > startY && y < this.height) {
                this.drawLantern(this.width - 70, y);
            }
        }

        // Occasional tombstones on sides
        for (let i = 0; i < 2; i++) {
            const y = startY + 30 + i * 100 - (this.laneOffset % 100);
            if (y > startY && y < this.height) {
                this.drawSmallTombstone(40, y);
                this.drawSmallTombstone(this.width - 40, y);
            }
        }
    }

    drawSmallTombstone(x, y) {
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 12, y + 15);
        this.ctx.lineTo(x - 12, y - 10);
        this.ctx.quadraticCurveTo(x - 12, y - 25, x, y - 25);
        this.ctx.quadraticCurveTo(x + 12, y - 25, x + 12, y - 10);
        this.ctx.lineTo(x + 12, y + 15);
        this.ctx.closePath();
        this.ctx.fill();

        // RIP text
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.font = '8px serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RIP', x, y - 5);
    }

    drawLantern(x, y) {
        // Lantern glow
        const flickerIntensity = 0.3 + Math.sin(Date.now() * 0.008 + x) * 0.1;
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 35);
        glowGradient.addColorStop(0, `rgba(255, 150, 50, ${flickerIntensity})`);
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(x - 35, y - 35, 70, 70);

        // Lantern post
        this.ctx.fillStyle = '#2a1a1a';
        this.ctx.fillRect(x - 3, y, 6, 45);

        // Lantern body
        this.ctx.fillStyle = '#3a2a20';
        Utils.roundRect(this.ctx, x - 10, y - 18, 20, 24, 4);
        this.ctx.fill();

        // Metal frame
        this.ctx.strokeStyle = '#1a1010';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 10, y - 18, 20, 24);

        // Flame
        const flameHeight = 8 + Math.sin(Date.now() * 0.015 + x) * 2;
        this.ctx.fillStyle = `rgba(255, ${180 + Math.sin(Date.now() * 0.02) * 40}, 50, 0.95)`;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 6, 5, flameHeight, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner flame
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 5, 2, flameHeight * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawFog() {
        this.fogParticles.forEach(fog => {
            const gradient = this.ctx.createRadialGradient(
                fog.x, fog.y, 0,
                fog.x, fog.y, fog.size
            );
            gradient.addColorStop(0, `rgba(90, 70, 110, ${fog.opacity})`);
            gradient.addColorStop(0.5, `rgba(80, 60, 100, ${fog.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(fog.x, fog.y, fog.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Export
window.BackgroundManager = BackgroundManager;
