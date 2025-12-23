// ============================================
// 🎃 HALLOWEEN RUNNER - CHARACTER SYSTEM (BACK VIEW)
// ============================================

class Character {
    constructor(type, ctx) {
        this.type = type;
        this.ctx = ctx;

        // Position
        this.lane = 1; // 0 = left, 1 = center, 2 = right
        this.targetLane = 1;
        this.x = 0;
        this.y = GameConfig.LANE_Y;
        this.baseY = GameConfig.LANE_Y;

        // Dimensions
        this.width = GameConfig.CHAR_WIDTH;
        this.height = GameConfig.CHAR_HEIGHT;

        // Physics
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;

        // Animation
        this.runFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 4;

        // Dragon lift
        this.isFlying = false;
        this.flyY = 150;

        // Lane switching animation
        this.laneTransitionSpeed = 15;

        // Running effect
        this.leanAngle = 0;
    }

    getLaneX(laneIndex) {
        const centerX = GameConfig.WIDTH / 2;
        return centerX + (laneIndex - 1) * GameConfig.LANE_WIDTH;
    }

    update() {
        const targetX = this.getLaneX(this.targetLane);
        this.x = Utils.lerp(this.x, targetX, 0.2);
        this.lane = this.targetLane;

        if (this.isJumping && !this.isFlying) {
            this.velocityY += GameConfig.GRAVITY;
            this.y += this.velocityY;

            if (this.y >= this.baseY) {
                this.y = this.baseY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }

        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }

        if (this.isFlying) {
            this.y = Utils.lerp(this.y, this.flyY, 0.1);
        }

        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            this.runFrame = (this.runFrame + 1) % 8;
        }

        this.leanAngle = Math.sin(Date.now() * 0.01) * 0.02;
    }

    jump() {
        if (!this.isJumping && !this.isSliding && !this.isFlying) {
            this.isJumping = true;
            this.velocityY = GameConfig.JUMP_FORCE;
        }
    }

    slide() {
        if (!this.isJumping && !this.isSliding && !this.isFlying) {
            this.isSliding = true;
            this.slideTimer = 30;
        }
    }

    moveLeft() {
        if (this.targetLane > 0) {
            this.targetLane--;
        }
    }

    moveRight() {
        if (this.targetLane < 2) {
            this.targetLane++;
        }
    }

    startFlying() {
        this.isFlying = true;
        this.isJumping = false;
        this.isSliding = false;
    }

    stopFlying() {
        this.isFlying = false;
        this.y = this.baseY - 100;
        this.isJumping = true;
        this.velocityY = 0;
    }

    getHitbox() {
        const slideOffset = this.isSliding ? this.height * 0.5 : 0;
        return {
            x: this.x - this.width / 2 + 10,
            y: this.y - this.height + slideOffset + 10,
            width: this.width - 20,
            height: this.height - slideOffset - 20
        };
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);

        // Apply slight lean for running feel
        if (!this.isSliding && !this.isJumping && !this.isFlying) {
            this.ctx.rotate(this.leanAngle);
        }

        const bobOffset = Math.sin(this.runFrame * Math.PI / 4) * 4;

        if (this.isSliding) {
            this.ctx.rotate(-Math.PI / 5);
            this.ctx.translate(0, -15);
        } else if (this.isJumping || this.isFlying) {
            this.ctx.translate(0, bobOffset * 0.5);
        } else {
            this.ctx.translate(0, -Math.abs(bobOffset));
        }

        // Draw character BACK VIEW based on type
        switch (this.type) {
            case 'skeleton':
                this.drawSkeletonBack();
                break;
            case 'kitty':
                this.drawKittyBack();
                break;
            case 'miles':
                this.drawMilesBack();
                break;
        }

        this.ctx.restore();
    }

    // ==========================================
    // SKELETON - BACK VIEW
    // ==========================================
    drawSkeletonBack() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const runCycle = this.runFrame / 8;
        const legSwing = Math.sin(runCycle * Math.PI * 2) * 35;
        const armSwing = Math.sin(runCycle * Math.PI * 2) * 25;

        // LEGS (bone structure from behind)
        ctx.fillStyle = '#e8dcc8';

        // Left leg
        ctx.save();
        ctx.translate(-w * 0.12, 0);
        ctx.rotate(Utils.degToRad(legSwing));
        ctx.fillRect(-4, 0, 8, h * 0.12);
        ctx.beginPath();
        ctx.arc(0, h * 0.12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3, h * 0.12, 6, h * 0.1);
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(w * 0.12, 0);
        ctx.rotate(Utils.degToRad(-legSwing));
        ctx.fillRect(-4, 0, 8, h * 0.12);
        ctx.beginPath();
        ctx.arc(0, h * 0.12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3, h * 0.12, 6, h * 0.1);
        ctx.restore();

        // BOOTS
        const bootOffsetL = Math.sin(runCycle * Math.PI * 2) * 8;
        const bootOffsetR = -Math.sin(runCycle * Math.PI * 2) * 8;

        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(-w * 0.12 + bootOffsetL, h * 0.18, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.12 + bootOffsetR, h * 0.18, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Boot heels (visible from back)
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(-w * 0.12 + bootOffsetL - 5, h * 0.12, 10, 6);
        ctx.fillRect(w * 0.12 + bootOffsetR - 5, h * 0.12, 10, 6);

        // DUNGAREES (Back view - showing back straps)
        ctx.fillStyle = '#4a6fa5';

        // Main body of overalls
        ctx.beginPath();
        ctx.moveTo(-w * 0.28, -h * 0.5);
        ctx.lineTo(w * 0.28, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.1);
        ctx.lineTo(w * 0.15, -h * 0.1);
        ctx.lineTo(w * 0.15, h * 0.05);
        ctx.lineTo(-w * 0.15, h * 0.05);
        ctx.lineTo(-w * 0.15, -h * 0.1);
        ctx.lineTo(-w * 0.3, -h * 0.1);
        ctx.closePath();
        ctx.fill();

        // Back straps (X pattern)
        ctx.fillStyle = '#4a6fa5';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#4a6fa5';
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, -h * 0.65);
        ctx.lineTo(w * 0.15, -h * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.2, -h * 0.65);
        ctx.lineTo(-w * 0.15, -h * 0.5);
        ctx.stroke();

        // Back pocket
        ctx.fillStyle = '#3d5a8a';
        ctx.fillRect(-w * 0.1, -h * 0.3, w * 0.2, h * 0.1);
        ctx.strokeStyle = '#2a4570';
        ctx.lineWidth = 1;
        ctx.strokeRect(-w * 0.1, -h * 0.3, w * 0.2, h * 0.1);

        // SPINE (visible from back)
        ctx.fillStyle = '#e8dcc8';

        // Spine vertebrae
        for (let i = 0; i < 8; i++) {
            const spineY = -h * 0.65 + i * 8;
            ctx.beginPath();
            ctx.ellipse(0, spineY, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shoulder blades
        ctx.beginPath();
        ctx.ellipse(-w * 0.15, -h * 0.55, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.15, -h * 0.55, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // ARMS (from behind)
        ctx.fillStyle = '#e8dcc8';

        // Left arm
        ctx.save();
        ctx.translate(-w * 0.3, -h * 0.58);
        ctx.rotate(Utils.degToRad(-20 + armSwing));
        ctx.fillRect(-4, 0, 8, h * 0.18);
        ctx.beginPath();
        ctx.arc(0, h * 0.18, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3, h * 0.18, 6, h * 0.15);
        for (let f = -1.5; f <= 1.5; f++) {
            ctx.fillRect(f * 3 - 1, h * 0.33, 2, h * 0.05);
        }
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(w * 0.3, -h * 0.58);
        ctx.rotate(Utils.degToRad(20 - armSwing));
        ctx.fillRect(-4, 0, 8, h * 0.18);
        ctx.beginPath();
        ctx.arc(0, h * 0.18, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3, h * 0.18, 6, h * 0.15);
        for (let f = -1.5; f <= 1.5; f++) {
            ctx.fillRect(f * 3 - 1, h * 0.33, 2, h * 0.05);
        }
        ctx.restore();

        // SKULL (Back of head)
        ctx.fillStyle = '#e8dcc8';

        // Back of skull (rounder)
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.78, w * 0.24, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skull crack detail on back
        ctx.strokeStyle = '#c8bca8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-w * 0.05, -h * 0.88);
        ctx.lineTo(-w * 0.08, -h * 0.78);
        ctx.lineTo(-w * 0.03, -h * 0.72);
        ctx.stroke();

        // HAT (from behind)
        ctx.fillStyle = '#2a1a0a';

        // Hat brim
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.92, w * 0.32, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat top
        Utils.roundRect(ctx, -w * 0.2, -h - 8, w * 0.4, h * 0.18, 8);
        ctx.fill();

        // Hat band (orange)
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(-w * 0.2, -h * 0.95, w * 0.4, 8);
    }

    // ==========================================
    // KITTY CAT - BACK VIEW
    // ==========================================
    drawKittyBack() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const runCycle = this.runFrame / 8;
        const legSwing = Math.sin(runCycle * Math.PI * 2) * 30;
        const armSwing = Math.sin(runCycle * Math.PI * 2) * 20;
        const tailWag = Math.sin(runCycle * Math.PI * 2) * 20;

        // LEGS from behind
        // Left leg
        ctx.save();
        ctx.translate(-w * 0.12, -h * 0.08);
        ctx.rotate(Utils.degToRad(legSwing));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.06, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-6, h * 0.1, 12, h * 0.08);
        // Pink shoe
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.18, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shoe heel
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(-4, h * 0.12, 8, 5);
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(w * 0.12, -h * 0.08);
        ctx.rotate(Utils.degToRad(-legSwing));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.06, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-6, h * 0.1, 12, h * 0.08);
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.18, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(-4, h * 0.12, 8, 5);
        ctx.restore();

        // DRESS (Back view with big bow)
        const gradient = ctx.createLinearGradient(0, -h * 0.55, 0, -h * 0.05);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(0.5, '#ff85c1');
        gradient.addColorStop(1, '#ff69b4');
        ctx.fillStyle = gradient;

        // Dress body
        ctx.beginPath();
        ctx.moveTo(-w * 0.22, -h * 0.52);
        ctx.quadraticCurveTo(-w * 0.35, -h * 0.2, -w * 0.4, -h * 0.08);
        ctx.lineTo(w * 0.4, -h * 0.08);
        ctx.quadraticCurveTo(w * 0.35, -h * 0.2, w * 0.22, -h * 0.52);
        ctx.closePath();
        ctx.fill();

        // Dress frills at bottom
        ctx.strokeStyle = '#ffb6c1';
        ctx.lineWidth = 3;
        for (let layer = 0; layer < 3; layer++) {
            const y = -h * 0.12 + layer * 8;
            for (let i = -5; i <= 5; i++) {
                ctx.beginPath();
                ctx.arc(i * 8, y, 10, 0, Math.PI);
                ctx.stroke();
            }
        }

        // BIG BOW on back of dress (main feature!)
        ctx.fillStyle = '#ff1493';

        // Left bow loop
        ctx.beginPath();
        ctx.ellipse(-w * 0.2, -h * 0.4, 18, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right bow loop
        ctx.beginPath();
        ctx.ellipse(w * 0.2, -h * 0.4, 18, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Center knot
        ctx.beginPath();
        ctx.arc(0, -h * 0.4, 10, 0, Math.PI * 2);
        ctx.fill();

        // Ribbon tails hanging down
        ctx.beginPath();
        ctx.moveTo(-5, -h * 0.35);
        ctx.quadraticCurveTo(-12, -h * 0.2, -8, -h * 0.08);
        ctx.lineTo(-2, -h * 0.08);
        ctx.quadraticCurveTo(-8, -h * 0.22, 0, -h * 0.35);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, -h * 0.35);
        ctx.quadraticCurveTo(12, -h * 0.2, 8, -h * 0.08);
        ctx.lineTo(2, -h * 0.08);
        ctx.quadraticCurveTo(8, -h * 0.22, 0, -h * 0.35);
        ctx.fill();

        // ARMS from behind
        // Left arm
        ctx.save();
        ctx.translate(-w * 0.28, -h * 0.48);
        ctx.rotate(Utils.degToRad(-15 + armSwing));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.1, 8, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.22, 8, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(w * 0.28, -h * 0.48);
        ctx.rotate(Utils.degToRad(15 - armSwing));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.1, 8, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.22, 8, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // TAIL (prominent from behind!)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.15);
        ctx.quadraticCurveTo(
            tailWag * 0.5, -h * 0.35,
            tailWag, -h * 0.55
        );
        ctx.stroke();

        // Tail tip (pink)
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(tailWag, -h * 0.55, 8, 0, Math.PI * 2);
        ctx.fill();

        // HEAD (Back of head)
        ctx.fillStyle = '#ffffff';

        // Back of head
        ctx.beginPath();
        ctx.arc(0, -h * 0.72, w * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy back of head
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.68, w * 0.25, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // EARS (from behind)
        ctx.beginPath();
        ctx.moveTo(-w * 0.22, -h * 0.88);
        ctx.lineTo(-w * 0.15, -h - 10);
        ctx.lineTo(-w * 0.05, -h * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.22, -h * 0.88);
        ctx.lineTo(w * 0.15, -h - 10);
        ctx.lineTo(w * 0.05, -h * 0.85);
        ctx.closePath();
        ctx.fill();

        // Inner ears (pink)
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.moveTo(-w * 0.19, -h * 0.88);
        ctx.lineTo(-w * 0.15, -h * 0.98);
        ctx.lineTo(-w * 0.08, -h * 0.86);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.19, -h * 0.88);
        ctx.lineTo(w * 0.15, -h * 0.98);
        ctx.lineTo(w * 0.08, -h * 0.86);
        ctx.closePath();
        ctx.fill();

        // BOW on ear (visible from behind)
        ctx.fillStyle = '#ff1493';
        ctx.save();
        ctx.translate(w * 0.2, -h * 0.95);
        ctx.rotate(0.2);
        ctx.beginPath();
        ctx.ellipse(-8, 0, 10, 6, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, 0, 10, 6, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ==========================================
    // MILES MORALES - BACK VIEW
    // ==========================================
    drawMilesBack() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const runCycle = this.runFrame / 8;
        const legSwing = Math.sin(runCycle * Math.PI * 2) * 35;
        const armSwing = Math.sin(runCycle * Math.PI * 2) * 30;

        // LEGS from behind
        // Left leg
        ctx.save();
        ctx.translate(-w * 0.1, -h * 0.12);
        ctx.rotate(Utils.degToRad(legSwing));
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.lineTo(8, h * 0.12);
        ctx.lineTo(-8, h * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-6, h * 0.1, 12, h * 0.1);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.2, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-8, h * 0.15, 16, 4);
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(w * 0.1, -h * 0.12);
        ctx.rotate(Utils.degToRad(-legSwing));
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.lineTo(8, h * 0.12);
        ctx.lineTo(-8, h * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-6, h * 0.1, 12, h * 0.1);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.2, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-8, h * 0.15, 16, 4);
        ctx.restore();

        // BODY (Back of suit)
        ctx.fillStyle = '#1a1a2e';

        // Torso
        ctx.beginPath();
        ctx.moveTo(-w * 0.24, -h * 0.58);
        ctx.lineTo(w * 0.24, -h * 0.58);
        ctx.lineTo(w * 0.22, -h * 0.12);
        ctx.lineTo(-w * 0.22, -h * 0.12);
        ctx.closePath();
        ctx.fill();

        // RED SPIDER LOGO ON BACK (Main feature!)
        ctx.fillStyle = '#dc2626';

        // Spider body (large on back)
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.4, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.32, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spider legs (8 legs spread out)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Upper legs
        for (let side = -1; side <= 1; side += 2) {
            // Top legs
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.42);
            ctx.quadraticCurveTo(side * 15, -h * 0.5, side * 25, -h * 0.55);
            ctx.stroke();

            // Upper middle legs
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.4);
            ctx.quadraticCurveTo(side * 18, -h * 0.42, side * 28, -h * 0.48);
            ctx.stroke();

            // Lower middle legs
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.36);
            ctx.quadraticCurveTo(side * 18, -h * 0.34, side * 28, -h * 0.28);
            ctx.stroke();

            // Bottom legs
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.32);
            ctx.quadraticCurveTo(side * 15, -h * 0.28, side * 25, -h * 0.2);
            ctx.stroke();
        }

        // Web pattern on suit
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;

        // Curved lines across back
        for (let i = 0; i < 4; i++) {
            const y = -h * 0.55 + i * 12;
            ctx.beginPath();
            ctx.moveTo(-w * 0.2, y);
            ctx.quadraticCurveTo(0, y + 5, w * 0.2, y);
            ctx.stroke();
        }

        // ARMS from behind
        // Left arm
        ctx.save();
        ctx.translate(-w * 0.26, -h * 0.52);
        ctx.rotate(Utils.degToRad(-25 + armSwing));
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.08, 9, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, h * 0.22, 7, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.3, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(w * 0.26, -h * 0.52);
        ctx.rotate(Utils.degToRad(25 - armSwing));
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.08, 9, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, h * 0.22, 7, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.3, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // HEAD (Back of Spider-Man mask)
        ctx.fillStyle = '#1a1a2e';

        // Back of head
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.74, w * 0.24, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Web pattern on back of head
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;

        // Radial lines from center
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.74);
            ctx.lineTo(
                Math.cos(angle) * w * 0.2,
                -h * 0.74 + Math.sin(angle) * h * 0.15
            );
            ctx.stroke();
        }

        // Motion blur effect when running fast
        if (Math.abs(armSwing) > 15) {
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.2)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-w * 0.3 - i * 10, -h * 0.4);
                ctx.lineTo(-w * 0.5 - i * 15, -h * 0.35);
                ctx.stroke();
            }
        }
    }

    // Static method to draw character preview (FRONT VIEW for selection)
    static drawPreview(ctx, type, x, y, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const tempChar = new Character(type, ctx);
        tempChar.x = 0;
        tempChar.y = 0;
        tempChar.runFrame = 2;

        ctx.translate(0, 60);

        // Draw FRONT view for character selection preview
        switch (type) {
            case 'skeleton':
                tempChar.drawSkeletonFront();
                break;
            case 'kitty':
                tempChar.drawKittyFront();
                break;
            case 'miles':
                tempChar.drawMilesFront();
                break;
        }

        ctx.restore();
    }

    // FRONT VIEW for previews only
    drawSkeletonFront() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dungarees
        ctx.fillStyle = '#4a6fa5';
        ctx.beginPath();
        ctx.moveTo(-w * 0.28, -h * 0.5);
        ctx.lineTo(w * 0.28, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.1);
        ctx.lineTo(-w * 0.3, -h * 0.1);
        ctx.closePath();
        ctx.fill();

        // Straps and buttons
        ctx.fillRect(-w * 0.2, -h * 0.65, 8, h * 0.18);
        ctx.fillRect(w * 0.12, -h * 0.65, 8, h * 0.18);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-w * 0.16, -h * 0.5, 4, 0, Math.PI * 2);
        ctx.arc(w * 0.16, -h * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Skull
        ctx.fillStyle = '#e8dcc8';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.78, w * 0.24, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ff3333';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-w * 0.09, -h * 0.8, 4, 0, Math.PI * 2);
        ctx.arc(w * 0.09, -h * 0.8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Teeth
        ctx.fillStyle = '#e8dcc8';
        for (let i = -3; i <= 3; i++) {
            ctx.fillRect(i * 4 - 2, -h * 0.62, 3, 6);
        }

        // Hat
        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.92, w * 0.32, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        Utils.roundRect(ctx, -w * 0.2, -h - 8, w * 0.4, h * 0.18, 8);
        ctx.fill();
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(-w * 0.2, -h * 0.95, w * 0.4, 8);
    }

    drawKittyFront() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dress
        const gradient = ctx.createLinearGradient(0, -h * 0.55, 0, -h * 0.05);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(1, '#ff85c1');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-w * 0.22, -h * 0.52);
        ctx.quadraticCurveTo(-w * 0.35, -h * 0.2, -w * 0.4, -h * 0.08);
        ctx.lineTo(w * 0.4, -h * 0.08);
        ctx.quadraticCurveTo(w * 0.35, -h * 0.2, w * 0.22, -h * 0.52);
        ctx.closePath();
        ctx.fill();

        // Ribbon
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.ellipse(-12, -h * 0.48, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -h * 0.48, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -h * 0.48, 6, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -h * 0.72, w * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-w * 0.22, -h * 0.88);
        ctx.lineTo(-w * 0.15, -h - 10);
        ctx.lineTo(-w * 0.05, -h * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.22, -h * 0.88);
        ctx.lineTo(w * 0.15, -h - 10);
        ctx.lineTo(w * 0.05, -h * 0.85);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#4a2f7f';
        ctx.beginPath();
        ctx.ellipse(-w * 0.1, -h * 0.73, 8, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.1, -h * 0.73, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-w * 0.08, -h * 0.76, 4, 0, Math.PI * 2);
        ctx.arc(w * 0.12, -h * 0.76, 4, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.63, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -h * 0.58);
        ctx.quadraticCurveTo(0, -h * 0.55, 6, -h * 0.58);
        ctx.stroke();

        // Blush
        ctx.fillStyle = 'rgba(255, 150, 180, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-w * 0.18, -h * 0.62, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.18, -h * 0.62, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bow on ear
        ctx.fillStyle = '#ff1493';
        ctx.save();
        ctx.translate(w * 0.2, -h * 0.95);
        ctx.beginPath();
        ctx.ellipse(-8, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawMilesFront() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 5, w * 0.35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(-w * 0.24, -h * 0.58);
        ctx.lineTo(w * 0.24, -h * 0.58);
        ctx.lineTo(w * 0.22, -h * 0.12);
        ctx.lineTo(-w * 0.22, -h * 0.12);
        ctx.closePath();
        ctx.fill();

        // Spider logo on chest
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.4, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.35, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spider legs
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        for (let side = -1; side <= 1; side += 2) {
            for (let leg = 0; leg < 4; leg++) {
                ctx.beginPath();
                ctx.moveTo(0, -h * 0.4);
                ctx.lineTo(side * 18, -h * 0.4 + leg * 4 - 5);
                ctx.stroke();
            }
        }

        // Head
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.74, w * 0.24, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-w * 0.17, -h * 0.74);
        ctx.quadraticCurveTo(-w * 0.14, -h * 0.84, -w * 0.05, -h * 0.78);
        ctx.quadraticCurveTo(-w * 0.08, -h * 0.68, -w * 0.17, -h * 0.74);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.17, -h * 0.74);
        ctx.quadraticCurveTo(w * 0.14, -h * 0.84, w * 0.05, -h * 0.78);
        ctx.quadraticCurveTo(w * 0.08, -h * 0.68, w * 0.17, -h * 0.74);
        ctx.fill();
    }
}

// Export
window.Character = Character;
