const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 524,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Set gravity to zero for a simple 2D game
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let batter, pitcher, ball, scoreText, outsText, startButton;
let gameState = 'waitingForPitch';
let score = 0;
let outs = 0;
let hitRegistered = false;
let pitchInProgress = false;
let ballInFlight = false;

function preload() {
  this.load.image('field', 'field.png');
  this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
  this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
  this.load.image('ball', 'smallsoftball.png');

  this.load.on('complete', () => {
    console.log('Assets loaded successfully!');
  });
}

function create() {
  this.add.image(400, 262, 'field');

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
  ball.body.allowGravity = false;

  batter.body.setSize(30, 10, true);
  batter.body.setOffset(25, 20);

  this.physics.add.collider(ball, batter, checkHit, null, this);

  scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
  outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

  startButton = this.add.text(400, 300, 'Start Game', { fill: '#fff' })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', startGame, this);

  this.input.on('pointerdown', () => {
    if (gameState === 'pitching') {
      gameState = 'swinging';
      batter.anims.play('batter_swing');
    }
  });
}

function update() {
  if (batter.anims.isPlaying && batter.anims.getProgress() === 1) {
    batter.setFrame(0);
    gameState = 'waitingForPitch';
  }

  if (pitchInProgress && ball.y > 550 && !ballInFlight) {
    ballOut.call(this);
  }
}

function startGame() {
  startButton.setVisible(false);
  this.time.addEvent({ delay: 2000, callback: startPitch, callbackScope: this, loop: true });
}

function startPitch() {
  if (gameState !== 'waitingForPitch') return;

  gameState = 'pitching';
  pitchInProgress = true;
  hitRegistered = false;
  ballInFlight = false;
  ball.setPosition(pitcher.x, pitcher.y);
  pitcher.anims.play('pitcher_throw');
  pitcher.once('animationcomplete', () => {
    pitchBall.call(this);
  });
}

function pitchBall() {
  ball.setActive(true).setVisible(true);
  ball.setVelocity(0);

  const pitchSpeed = 300; // Adjusted speed (pixels per second)
  const pitchAngle = Phaser.Math.Between(-5, 5); // Slight angle variation
  this.physics.velocityFromRotation(Phaser.Math.DegToRad(90 + pitchAngle), pitchSpeed, ball.body.velocity);

  pitchInProgress = true;
}

function checkHit() {
  if (gameState === 'swinging' && this.physics.overlap(batter, ball) && !hitRegistered) {
    hitRegistered = true;
    hitBall.call(this);
  }
}

function hitBall() {
  score += 1;
  scoreText.setText(`Home Runs: ${score}`);
  ball.setActive(false).setVisible(false);
  ballInFlight = true;

  simulateBallFlight.call(this);
  this.time.delayedCall(500, resetPitch, [], this);
}

function simulateBallFlight() {
  const ballFlightSpeed = Phaser.Math.Between(300, 400); // Adjust speed
  const ballFlightAngle = Phaser.Math.Between(-10, 10); // Adjust angle for a more realistic trajectory
  ball.setPosition(batter.x, batter.y - 50);
  ball.setActive(true).setVisible(true);
  ball.body.allowGravity = true;
  this.physics.velocityFromRotation(Phaser.Math.DegToRad(90 + ballFlightAngle), ballFlightSpeed, ball.body.velocity);
}

function ballOut() {
  if (!pitchInProgress) return;

  outs += 1;
  outsText.setText(`Outs: ${outs}`);
  if (outs >= 5) {
    this.add.text(400, 262, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
    this.time.addEvent({ delay: 2000, callback: resetGame, callbackScope: this });
  } else {
    this.time.addEvent({ delay: 500, callback: resetPitch, callbackScope: this });
  }
  pitchInProgress = false;
}

function resetPitch() {
  ball.setPosition(pitcher.x, pitcher.y);
  ball.setVelocity(0);
  ball.body.allowGravity = false;
  pitchInProgress = false;
  gameState = 'waitingForPitch';
}

function resetGame() {
  score = 0;
  outs = 0;
  scoreText.setText('Home Runs: 0');
  outsText.setText('Outs: 0');
  startButton.setVisible(true);
}
