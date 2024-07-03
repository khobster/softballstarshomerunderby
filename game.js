const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 524,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // No gravity for the batter and pitcher
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
let pitchInProgress = false;
let hitRegistered = false;

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

  batter = this.physics.add.sprite(350, 410, 'batter').setScale(2.3).setOrigin(0.5, 1).setImmovable(true);
  pitcher = this.physics.add.sprite(400, 317, 'pitcher').setScale(1.5).setOrigin(0.5, 1).setImmovable(true);
  ball = this.physics.add.sprite(pitcher.x, pitcher.y, 'ball').setScale(1.5).setOrigin(0.5, 0.5);
  ball.body.allowGravity = false;

  this.physics.add.overlap(batter, ball, checkHit, null, this);

  // Create the green line at the top of the fence
  const greenLine = this.add.line(0, 0, 0, 200, 800, 200, 0x00ff00).setOrigin(0, 0);
  this.physics.add.existing(greenLine, true);

  // Create the red line at the height of the pitcher's head
  const redLineY = pitcher.y - 57; // Adjust as needed
  const redLine = this.add.line(0, 0, 0, redLineY, 800, redLineY, 0xff0000).setOrigin(0, 0);
  this.physics.add.existing(redLine, true);

  this.physics.add.collider(ball, redLine, ballOut, null, this);

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
    checkHit();
  }

  if (pitchInProgress && ball.y > 550) {
    ballOut();
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
  pitcher.anims.play('pitcher_throw');
  pitcher.once('animationcomplete', () => {
    pitchBall.call(this);
  });
}

function pitchBall() {
  ball.setActive(true).setVisible(true);
  ball.setPosition(pitcher.x, pitcher.y);
  ball.setVelocity(0);

  const pitchSpeed = Phaser.Math.Between(200, 300);
  const pitchAngle = Phaser.Math.Between(-5, 5);
  this.physics.velocityFromRotation(Phaser.Math.DegToRad(90 + pitchAngle), pitchSpeed, ball.body.velocity);

  pitchInProgress = true;
}

function checkHit() {
  if (gameState === 'swinging' && this.physics.overlap(batter, ball) && !hitRegistered) {
    hitRegistered = true;
    hitBall();
  }
}

function hitBall() {
  score += 1;
  scoreText.setText(`Home Runs: ${score}`);
  ball.setActive(false).setVisible(false);

  // Check if the ball went over the fence
  if (ball.y < redLine.y) {
    console.log("Home Run!");
  } else {
    console.log("Not a home run");
  }

  this.time.delayedCall(500, resetPitch, [], this);
}

function ballOut() {
  if (!pitchInProgress) return;

  outs += 1;
  outsText.setText(`Outs: ${outs}`);
  if (outs >= 5) {
    this.add.text(400, 262, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
    this.time.delayedCall(2000, resetGame, [], this);
  } else {
    this.time.delayedCall(500, resetPitch, [], this);
  }
  pitchInProgress = false;
}

function resetPitch() {
  ball.setPosition(pitcher.x, pitcher.y);
  ball.setVelocity(0);
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
