const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load images for field, batter, and pitcher
    this.load.image('field', 'assets/field.png');
    this.load.spritesheet('batter', 'assets/batter.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('pitcher', 'assets/pitcher.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    // Add field background
    this.add.image(400, 300, 'field');
    // Add pitcher and batter
}

function update() {
    // Game logic here
}
