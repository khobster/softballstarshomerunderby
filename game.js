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

function preload() {
    this.load.image('field', 'field.png');
    this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
    this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
    this.load.image('ball', 'smallsoftball.png');
}

function create() {
    this.add.image(400, 262, 'field');  // Centered field image

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

    batter = this.physics.add.sprite(350, 410, 'batter').setScale(2.3).setOrigin(0.5, 1);
    pitcher = this.physics.add.sprite(400, 317, 'pitcher').setScale(1.5).setOrigin(0.5, 1);
    ball = this.physics.add.sprite(pitcher.x, pitcher.y, 'ball').setScale(1.5).setOrigin(0.5, 0.5);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(batter, ball, hitBall, null, this);

    scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
    outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

    this.time.addEvent({
        delay: 2000,  // Pitch every 2 seconds
        callback: startPitch,
        callbackScope: this,
        loop: true
    });
}

function update() {
    if (cursors.space.isDown && !isSwinging && !pitchInProgress) {
        isSwinging = true;
        batter.anims.play('batter_swing');
    }

    if (isSwinging && batter.anims.getProgress() === 1) {
        isSwinging = false;
        batter.setFrame(0);
        checkHit();
    }

    if (pitchInProgress) {
        ball.y += 5;  // Adjust speed for realistic pitching
        if (ball.y > 550) {
            pitchInProgress = false;
            ball.setVelocity(0);
            ballOut();
        }
    }
}

function startPitch() {
    if (pitchInProgress) return;

    pitcher.anims.play('pitcher_throw');
    pitcher.once('animationcomplete', () => {
        pitchBall();
    });
}

function pitchBall() {
    ball.setPosition(pitcher.x, pitcher.y); // Reset ball position

    pitchInProgress = true;
}

function checkHit() {
    if (this.physics.overlap(batter, ball)) {
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
}
