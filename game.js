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

let batter, pitcher, ball, cursors, scoreText, outsText;
let score = 0;
let outs = 0;
let isSwinging = false;
let pitchInProgress = false;
let swingCompleted = true;
let pitchTimer;

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
        repeat: 0
    });

    this.anims.create({
        key: 'pitcher_throw',
        frames: this.anims.generateFrameNumbers('pitcher', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    // Add the batter and pitcher sprites with correct positions and scaling
    batter = this.physics.add.sprite(350, 410, 'batter').setScale(2.3).setOrigin(0.5, 1);
    pitcher = this.physics.add.sprite(400, 317, 'pitcher').setScale(1.5).setOrigin(0.5, 1);
    ball = this.physics.add.sprite(pitcher.x, pitcher.y, 'ball').setScale(1.5).setOrigin(0.5, 0.5);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(batter, ball, hitBall, null, this);

    // Score and outs display
    scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
    outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

    // Set initial pitch position and speed
    resetPitch();
    startPitchTimer();
}

function update() {
    // Detect swing (press space to swing)
    if (cursors.space.isDown && !isSwinging && swingCompleted) {
        isSwinging = true;
        swingCompleted = false;
        batter.anims.play('batter_swing');
    }

    // Reset swing animation
    if (isSwinging && batter.anims.currentFrame.index === batter.anims.getTotalFrames() - 1) {
        isSwinging = false;
        swingCompleted = true;
        batter.anims.stop();
        batter.setFrame(0);  // Reset to initial frame
        checkHit();
    }

    if (pitchInProgress) {
        ball.y += 5;  // Adjust the speed and direction as needed
        if (ball.y > 410) {
            pitchInProgress = false;
            ball.setVelocity(0); // Stop the ball
            if (!isSwinging) {
                ballOut();
            }
        }
    }
}

function startPitch() {
    if (pitchInProgress) return;
    pitchInProgress = true;

    pitcher.anims.play('pitcher_throw', true); // Play the throw animation

    // Wait for the pitcher's animation to complete before pitching the ball
    pitcher.on('animationcomplete', () => {
        ball.setPosition(pitcher.x, pitcher.y);
        pitchInProgress = true;
    });
}

function pitchBall() {
    pitchSpeed = Phaser.Math.Between(2000, 3000);  // Duration of the pitch in milliseconds

    // Ensure ball moves towards the batter
    this.tweens.add({
        targets: ball,
        x: batter.x,
        y: 410,  // Y-coordinate of the batter
        ease: 'Linear',
        duration: pitchSpeed,
        onComplete: () => {
            pitchInProgress = false;
            if (!isSwinging) ballOut();
        }
    });
}

function checkHit() {
    // Simple hit detection: Check if the ball is within a hit range
    if (ball.y > 450 && ball.y < 550 && Math.abs(ball.x - batter.x) < 50) {
        hitBall();
    } else {
        console.log('Missed!');
        resetPitch();
    }
}

function hitBall() {
    score += 1;
    scoreText.setText(`Home Runs: ${score}`);
    console.log(`Home Run! Score: ${score}, Outs: ${outs}`);
    resetPitch();
}

function ballOut() {
    outs += 1;
    outsText.setText(`Outs: ${outs}`);
    console.log(`Out! Score: ${score}, Outs: ${outs}`);
    if (outs >= 5) {
        console.log('Game Over!');
        this.add.text(400, 262, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
        resetGame();
    } else {
        resetPitch();
    }
}

function resetPitch() {
    ball.setPosition(pitcher.x, pitcher.y);
    pitchInProgress = false;
}

function resetGame() {
    score = 0;
    outs = 0;
    scoreText.setText('Home Runs: 0');
    outsText.setText('Outs: 0');
    startPitchTimer();
}

function startPitchTimer() {
    clearInterval(pitchTimer); // Clear any existing timer
    pitchTimer = setInterval(startPitch, 3000); // Pitch every 3 seconds
}
