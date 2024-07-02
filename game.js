const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 524,
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

let batter, pitcher, ball;
let cursors;
let score = 0;
let outs = 0;
let isSwinging = false;
let pitchSpeed = 2;
let pitchPosition;

function preload() {
    // Load assets
    this.load.image('field', 'field.png');
    this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
    this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
    this.load.image('ball', 'smallsoftball.png');
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
    batter = this.physics.add.sprite(350, 370, 'batter').setScale(1.8).setOrigin(0.5, 1);
    pitcher = this.physics.add.sprite(400, 311, 'pitcher').setScale(1.8).setOrigin(0.5, 1);
    ball = this.physics.add.sprite(400, 500, 'ball').setScale(1.5).setOrigin(0.5, 0.5);

    batter.anims.play('batter_swing');
    pitcher.anims.play('pitcher_throw');

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(batter, ball, hitBall, null, this);

    // Set initial pitch position and speed
    resetPitch();
}

function update() {
    // Move the ball (pitching logic)
    ball.y += pitchSpeed;

    // Check if the ball goes out of bounds (counts as an out)
    if (ball.y > 600) {
        ballOut();
    }

    // Detect swing (press space to swing)
    if (cursors.space.isDown && !isSwinging) {
        isSwinging = true;
        batter.anims.play('batter_swing');
        checkHit();
    }

    if (isSwinging && batter.anims.currentFrame.index === batter.anims.getTotalFrames() - 1) {
        isSwinging = false;
    }
}

function checkHit() {
    // Simple hit detection: Check if the ball is within a hit range
    if (ball.y > 450 && ball.y < 550 && Math.abs(ball.x - batter.x) < 50) {
        hitBall();
    } else {
        console.log('Missed!');
    }
}

function hitBall() {
    score += 1;
    console.log(`Home Run! Score: ${score}, Outs: ${outs}`);
    resetPitch();
}

function ballOut() {
    outs += 1;
    console.log(`Out! Score: ${score}, Outs: ${outs}`);
    if (outs >= 10) {
        console.log('Game Over!');
        resetGame();
    } else {
        resetPitch();
    }
}

function resetPitch() {
    ball.y = 200;
    ball.x = Phaser.Math.Between(100, 700);
    pitchSpeed = Phaser.Math.Between(2, 5);
    pitchPosition = Phaser.Math.Between(100, 700);
    ball.x = pitchPosition;
}

function resetGame() {
    score = 0;
    outs = 0;
    resetPitch();
}
