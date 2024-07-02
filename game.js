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

let batter, pitcher, ball, cursors, pitchButton, scoreText, outsText;
let score = 0;
let outs = 0;
let isSwinging = false;
let pitchInProgress = false;
let swingCompleted = true;

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

    // Pitch button
    pitchButton = this.add.text(650, 480, 'Pitch', { fontSize: '24px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', startPitch);

    // Score and outs display
    scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
    outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

    // Set initial pitch position and speed
    resetPitch();
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

    // Update ball position
    if (pitchInProgress) {
        ball.y += pitchSpeed;
        if (ball.y >= 550) {
            pitchInProgress = false;
            ballOut();
        }
    }
}

function startPitch() {
    pitcher.anims.play('pitcher_throw', true); // Play the throw animation
    pitchButton.disableInteractive(); // Disable the button during the pitch

    // Wait for the pitcher's animation to complete before pitching the ball
    pitcher.on('animationcomplete', () => {
        pitchBall();
    });
}

function pitchBall() {
    pitchInProgress = true;
    pitchSpeed = Phaser.Math.Between(2, 5);

    // Ensure ball moves towards the batter
    ball.setPosition(pitcher.x, pitcher.y - 30); // Start the ball at the pitcher's hand
    game.scene.scenes[0].tweens.add({
        targets: ball,
        y: 550,  // Y-coordinate of the batter
        ease: 'Linear',
        duration: 1000 / pitchSpeed,  // Duration inversely proportional to pitch speed
        onComplete: () => {
            pitchInProgress = false;
            if (!isSwinging) ballOut();
            pitchButton.setInteractive(); // Re-enable the button
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
    ball.setPosition(pitcher.x, pitcher.y - 30);
    pitchInProgress = false;
}

function resetGame() {
    score = 0;
    outs = 0;
    scoreText.setText('Home Runs: 0');
    outsText.setText('Outs: 0');
    pitchButton.setInteractive(); // Re-enable the button
}
