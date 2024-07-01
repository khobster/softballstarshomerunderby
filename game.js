const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

let batter;
let pitcher;
let ball;
let cursors;
let score = 0;
let outs = 0;
let isSwinging = false;

function preload() {
    // Load assets
    this.load.image('field', 'path_to_your_field_image.png');
    this.load.spritesheet('batter', 'path_to_your_batter_sprite_sheet.png', { frameWidth: 64, frameHeight: 68 });
    this.load.spritesheet('pitcher', 'path_to_your_pitcher_sprite_sheet.png', { frameWidth: 64, frameHeight: 57 });
    this.load.image('ball', 'path_to_your_ball_image.png');
}

function create() {
    // Add the field background
    this.add.image(400, 262, 'field');  // Centered field image

    // Create animations
    this.anims.create({
        key: 'batter_swing',
        frames: this.anims.generateFrameNumbers('batter', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'pitcher_throw',
        frames: this.anims.generateFrameNumbers('pitcher', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    // Add the batter and pitcher sprites with correct positions and scaling
    batter = this.physics.add.sprite(400, 520, 'batter').setScale(1).setOrigin(0.5, 1);
    pitcher = this.physics.add.sprite(400, 100, 'pitcher').setScale(1).setOrigin(0.5, 1);
    ball = this.physics.add.sprite(400, 150, 'ball').setScale(1).setOrigin(0.5, 0.5);

    batter.anims.play('batter_swing');
    pitcher.anims.play('pitcher_throw');

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(batter, ball, hitBall, null, this);
}

function update() {
    if (cursors.space.isDown && !isSwinging) {
        isSwinging = true;
        batter.anims.play('batter_swing');
        // Implement logic to determine if the ball is hit
    }

    // Update ball position and check for out conditions
    ball.y += 2;

    if (ball.y > 600) {
        ball.y = 150;
        ball.x = Phaser.Math.Between(100, 700);
        outs += 1;
        if (outs >= 10) {
            // End game logic
        }
    }

    if (isSwinging) {
        // Check if ball is hit
        // Update score
        isSwinging = false;
    }
}

function hitBall(batter, ball) {
    score += 1;
    ball.y = 150;
    ball.x = Phaser.Math.Between(100, 700);
    console.log(`Score: ${score}, Outs: ${outs}`);
}
