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
    this.load.spritesheet('batter', 'path_to_your_batter_sprite_sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('pitcher', 'path_to_your_pitcher_sprite_sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('ball', 'path_to_your_ball_image.png');
}

function create() {
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

    batter = this.physics.add.sprite(400, 500, 'batter').setScale(2);
    pitcher = this.physics.add.sprite(400, 100, 'pitcher').setScale(2);
    ball = this.physics.add.sprite(400, 200, 'ball');

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
        ball.y = 200;
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
    ball.y = 200;
    ball.x = Phaser.Math.Between(100, 700);
}
