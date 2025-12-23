// ============================================
// 🎃 HALLOWEEN RUNNER - MAIN GAME ENGINE
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = GameConfig.WIDTH;
        this.canvas.height = GameConfig.HEIGHT;

        // Game state
        this.state = 'menu'; // menu, playing, gameover
        this.selectedCharacter = null;

        // Managers
        this.background = null;
        this.character = null;
        this.obstacleManager = null;

        // Stats
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = GameConfig.INITIAL_SPEED;
        this.startTime = 0;

        // Dragon power-up
        this.dragonMode = false;
        this.dragonEndTime = 0;

        // Particles
        this.particles = [];

        // UI Elements
        this.screens = {
            characterSelect: document.getElementById('character-select'),
            gameScreen: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over')
        };

        this.scoreDisplay = document.getElementById('score');
        this.distanceDisplay = document.getElementById('distance');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.finalDistanceDisplay = document.getElementById('final-distance');
        this.dragonIndicator = document.getElementById('dragon-indicator');

        // Initialize
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupCharacterSelection();
        this.setupControls();
        this.setupButtons();

        // Draw character previews
        this.drawCharacterPreviews();

        // Start render loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupCharacterSelection() {
        const cards = document.querySelectorAll('.character-card');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove selected from all
                cards.forEach(c => c.classList.remove('selected'));

                // Select this one
                card.classList.add('selected');
                this.selectedCharacter = card.dataset.character;

                // Start game after short delay
                setTimeout(() => this.startGame(), 300);
            });
        });
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state !== 'playing' || !this.character) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.character.moveLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.character.moveRight();
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    e.preventDefault();
                    this.character.jump();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.character.slide();
                    break;
            }
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.state !== 'playing' || !this.character) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            const minSwipe = 30;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > minSwipe) {
                    this.character.moveRight();
                } else if (diffX < -minSwipe) {
                    this.character.moveLeft();
                }
            } else {
                // Vertical swipe
                if (diffY < -minSwipe) {
                    this.character.jump();
                } else if (diffY > minSwipe) {
                    this.character.slide();
                }
            }
        });
    }

    setupButtons() {
        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('change-character').addEventListener('click', () => {
            this.showScreen('characterSelect');
            this.state = 'menu';
        });
    }

    drawCharacterPreviews() {
        const types = ['skeleton', 'kitty', 'miles'];

        types.forEach(type => {
            const preview = document.getElementById(`${type}-preview`);
            const canvas = document.createElement('canvas');
            canvas.width = 180;
            canvas.height = 220;
            preview.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            Character.drawPreview(ctx, type, 90, 110, 1.1);
        });
    }

    showScreen(screen) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screen].classList.add('active');
    }

    startGame() {
        if (!this.selectedCharacter) {
            this.selectedCharacter = 'skeleton'; // Default
        }

        // Initialize game objects
        this.background = new BackgroundManager(this.ctx, GameConfig.WIDTH, GameConfig.HEIGHT);
        this.character = new Character(this.selectedCharacter, this.ctx);
        this.character.x = this.character.getLaneX(1);
        this.obstacleManager = new ObstacleManager(this.ctx);
        this.obstacleManager.reset();

        // Reset stats
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = GameConfig.INITIAL_SPEED;
        this.startTime = Date.now();
        this.particles = [];
        this.dragonMode = false;

        // Update UI
        this.updateUI();

        // Show game screen
        this.showScreen('gameScreen');
        this.state = 'playing';
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'playing') {
            this.update(deltaTime);
        }

        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        const currentTime = Date.now();

        // Increase speed over time
        this.gameSpeed = Math.min(
            GameConfig.MAX_SPEED,
            GameConfig.INITIAL_SPEED + (currentTime - this.startTime) * GameConfig.SPEED_INCREMENT
        );

        // Update background
        this.background.update(this.gameSpeed);

        // Update character
        this.character.update();

        // Handle dragon mode
        if (this.dragonMode) {
            if (currentTime > this.dragonEndTime) {
                this.endDragonMode();
            }
        } else {
            // Check if dragon picked up character
            if (this.obstacleManager.isDragonReady()) {
                this.startDragonMode();
            }
        }

        // Update obstacles (don't spawn obstacles during dragon mode)
        if (!this.dragonMode) {
            this.obstacleManager.update(this.gameSpeed, currentTime);
        } else {
            // Only update existing obstacles and candies during dragon mode
            this.obstacleManager.candies.forEach(c => c.update(this.gameSpeed));
            this.obstacleManager.candies = this.obstacleManager.candies.filter(c => c.active);
            this.obstacleManager.dragon.update();
        }

        // Check collisions
        const collision = this.obstacleManager.checkCollisions(this.character);

        // Collect candies
        if (collision.candiesCollected > 0) {
            this.score += collision.candiesCollected * GameConfig.CANDY_POINTS;
            this.spawnCandyParticles(this.character.x, this.character.y - 50);
        }

        // Hit obstacle
        if (collision.hitObstacle && !this.dragonMode) {
            this.gameOver();
            return;
        }

        // Update distance
        this.distance += this.gameSpeed * GameConfig.DISTANCE_MULTIPLIER;

        // Update particles
        this.particles = this.particles.filter(p => {
            Utils.updateParticle(p);
            return p.life > 0;
        });

        // Update UI
        this.updateUI();
    }

    startDragonMode() {
        this.dragonMode = true;
        this.dragonEndTime = Date.now() + GameConfig.DRAGON_DURATION;
        this.character.startFlying();
        this.dragonIndicator.classList.remove('hidden');

        // Clear obstacles during dragon mode
        this.obstacleManager.obstacles = [];
    }

    endDragonMode() {
        this.dragonMode = false;
        this.character.stopFlying();
        this.dragonIndicator.classList.add('hidden');
        this.obstacleManager.dragon.active = false;
        this.obstacleManager.lastDragonTime = Date.now();
    }

    spawnCandyParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(Utils.createParticle(x, y, {
                color: Utils.randomChoice(Colors.candyColors),
                vx: Utils.randomFloat(-4, 4),
                vy: Utils.randomFloat(-6, -2),
                size: Utils.random(3, 6),
                decay: 0.03
            }));
        }
    }

    updateUI() {
        this.scoreDisplay.textContent = Math.floor(this.score);
        this.distanceDisplay.textContent = Math.floor(this.distance);
    }

    draw() {
        // Draw background
        if (this.background) {
            this.background.draw();
        }

        if (this.state === 'playing' || this.state === 'gameover') {
            // Draw obstacles and candies
            if (this.obstacleManager) {
                this.obstacleManager.draw();
            }

            // Draw character
            if (this.character) {
                this.character.draw();
            }

            // Draw particles
            this.particles.forEach(p => {
                Utils.drawParticle(this.ctx, p);
            });

            // Dragon carrying effect
            if (this.dragonMode && this.obstacleManager) {
                // Draw dragon above character
                this.ctx.save();
                this.ctx.translate(this.character.x - this.ctx.canvas.width / 2, -30);
                this.obstacleManager.dragon.draw(this.ctx);
                this.ctx.restore();
            }
        }
    }

    gameOver() {
        this.state = 'gameover';

        // Show game over screen
        setTimeout(() => {
            this.finalScoreDisplay.textContent = Math.floor(this.score);
            this.finalDistanceDisplay.textContent = Math.floor(this.distance);
            this.showScreen('gameOver');
        }, 500);

        // Spawn death particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(Utils.createParticle(this.character.x, this.character.y - 50, {
                color: Colors.accentOrange,
                vx: Utils.randomFloat(-6, 6),
                vy: Utils.randomFloat(-8, -2),
                size: Utils.random(4, 8),
                decay: 0.02
            }));
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
