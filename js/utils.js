// ============================================
// 🎃 HALLOWEEN RUNNER - UTILITY FUNCTIONS
// ============================================

const Utils = {
    // Random number between min and max (inclusive)
    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Random float between min and max
    randomFloat: (min, max) => Math.random() * (max - min) + min,

    // Random item from array
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],

    // Clamp value between min and max
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),

    // Linear interpolation
    lerp: (start, end, t) => start + (end - start) * t,

    // Ease out cubic
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),

    // Ease in out quad
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

    // Check collision between two rectangles
    checkCollision: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    },

    // Distance between two points
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    // Convert degrees to radians
    degToRad: (degrees) => degrees * (Math.PI / 180),

    // HSL to CSS string
    hsl: (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`,

    // Create color gradient
    createGradient: (ctx, x1, y1, x2, y2, colors) => {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        return gradient;
    },

    // Draw rounded rectangle
    roundRect: (ctx, x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    // Particle system helper
    createParticle: (x, y, options = {}) => ({
        x,
        y,
        vx: options.vx || Utils.randomFloat(-2, 2),
        vy: options.vy || Utils.randomFloat(-2, 2),
        size: options.size || Utils.random(2, 5),
        color: options.color || '#ff6b35',
        life: options.life || 1,
        decay: options.decay || 0.02,
        gravity: options.gravity || 0.1
    }),

    // Update particle
    updateParticle: (particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.life -= particle.decay;
        return particle.life > 0;
    },

    // Draw particle
    drawParticle: (ctx, particle) => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
};

// Halloween color palette
const Colors = {
    // Main colors
    bgDark: '#0a0612',
    bgPurple: '#1a0a2e',
    accentOrange: '#ff6b35',
    accentPurple: '#9b4dca',
    accentGreen: '#4ade80',

    // Character specific
    skeletonBone: '#e8dcc8',
    skeletonDark: '#2a1f14',
    kittyPink: '#ff69b4',
    kittyWhite: '#ffffff',
    milesBlack: '#1a1a2e',
    milesRed: '#dc2626',

    // Candy colors
    candyColors: ['#ff69b4', '#00d4ff', '#ffd700', '#ff6b35', '#4ade80', '#9b4dca'],

    // Obstacle colors
    truckOrange: '#e55a2b',
    truckBlack: '#1a1a1a',
    tunnelGreen: '#166534',
    tunnelBrown: '#5c3d2e',
    tombstoneGray: '#4a4a4a',
    pumpkinOrange: '#f97316',
    ghostWhite: '#e8e8ff',
    webGray: '#888888'
};

// Game constants
const GameConfig = {
    // Canvas
    WIDTH: 800,
    HEIGHT: 600,

    // Lanes
    LANE_COUNT: 3,
    LANE_WIDTH: 120,
    LANE_Y: 480, // Ground level

    // Character
    CHAR_WIDTH: 60,
    CHAR_HEIGHT: 100,
    JUMP_FORCE: -18,
    GRAVITY: 0.8,
    SLIDE_DURATION: 500, // ms

    // Game speed - SLOWER for better gameplay
    INITIAL_SPEED: 3.5,
    MAX_SPEED: 10,
    SPEED_INCREMENT: 0.0005,

    // Spawning
    CANDY_INTERVAL: 2000, // 2 seconds
    OBSTACLE_INTERVAL: 3000, // 3 seconds (more time between obstacles)
    DRAGON_INTERVAL: 25000, // 25 seconds
    DRAGON_DURATION: 4000, // 4 seconds

    // Scoring
    CANDY_POINTS: 10,
    DISTANCE_MULTIPLIER: 0.1
};

// Export for use in other files
window.Utils = Utils;
window.Colors = Colors;
window.GameConfig = GameConfig;
