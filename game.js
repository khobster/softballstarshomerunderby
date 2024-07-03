const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 524,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
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

// Fence coordinates
const redLineY = 190; // Move the red line to 190 on the y-axis
const fenceTopY = 0; // Green line position at the very top for rare home runs

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

  batter = this.add.sprite(350, 410, 'batter').setScale(2.3).setOrigin(0.5, 1);
  pitcher = this.add.sprite(400, 317, 'pitcher').setScale(1.5).setOrigin(0.5, 1);
  ball = this.physics.add.sprite(pitcher.x, 220, 'ball').setScale(1.5).setOrigin(0.5, 0.5);
  ball.body.allowGravity = false;

  // Create visible red line (home run line)
  const redLine = this.add.rectangle(400, redLineY, 800, 10, 0xff0000).setOrigin(0.5, 0.5);
  this.physics.add.existing(redLine);
  redLine.body.immovable = true;
  redLine.body.allowGravity = false;

  // Create visible green line for out of bounds detection
  const greenLine = this.add.rectangle(400, fenceTopY, 800, 10, 0x00ff00).setOrigin(0.5, 0.5);
  this.physics.add.existing(greenLine);
  greenLine.body.immovable = true;
  greenLine.body.allowGravity = false;

  this.physics.add.collider(ball, greenLine, handleBallHitZone, null, this);
  this.physics.add.collider(ball, redLine, handleBallHitZone, null, this);

  scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
  outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

  // Start Button
  startButton = this.add.text(400, 300, 'Start Game', { fill: '#fff' })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', startGame, this);

  // Add event listener for mouse click
  this.input.on('pointerdown', () => {
    if (gameState === 'pitching') {
      gameState = 'swinging';
      batter.anims.play('batter_swing');
      checkHit.call(this); // Ensure checkHit is called with the correct context
    }
  });
}

function update() {
  if (pitchInProgress && ball.y > 550) {
    ballOut.call(this);
  }

  if (batter.anims.isPlaying && batter.anims.getProgress() === 1) {
    batter.setFrame(0);
    gameState = 'waitingForPitch';
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
  ball.setPosition(pitcher.x, 220); // Ensure ball starts with the pitcher
  ball.setVelocity(0);

  const pitchSpeed = 300; // Adjust pitch speed if needed
  const pitchAngle = Phaser.Math.Between(-5, 5);
  this.physics.velocityFromRotation(Phaser.Math.DegToRad(90 + pitchAngle), pitchSpeed, ball.body.velocity);

  pitchInProgress = true;
}

function checkHit() {
  if (this.physics.overlap(batter, ball) && !hitRegistered) {
    hitRegistered = true;
    hitBall.call(this);
  }
}

function hitBall() {
  ball.setVelocity(Phaser.Math.Between(-200, 200), -500);

  // Check if the ball went over the red line for home run logic
  if (ball.y < redLineY && ball.y > fenceTopY) {
    score += 1;
    scoreText.setText(`Home Runs: ${score}`);
  } else {
    ballOut.call(this);
  }
}

function handleBallHitZone(ball, line) {
  if (line.fillColor === 0xff0000 && ball.y < redLineY && ball.y > fenceTopY) {
    // Ball hit the red line
    score += 1;
    scoreText.setText(`Home Runs: ${score}`);
  } else if (line.fillColor === 0x00ff00 && ball.y < fenceTopY) {
    // Ball hit the green line
    score += 1;
    scoreText.setText(`Home Runs: ${score}`);
  } else if (ball.y > redLineY) {
    ballOut.call(this);
  }
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
  ball.setPosition(pitcher.x, 220); // Reset ball to the pitcher's position
  ball.setVelocity(0);
  pitchInProgress = false;
  gameState = 'waitingForPitch';
}

function resetGame() {
  score = 0;
  outs = 0;
  scoreText.setText('Home Runs: 0');
  outsText.setText('Outs: 0');
  startButton.setVisible(true); // Show the start button again after game over
  gameState = 'waitingForPitch'; // Reset game state to allow starting a new game
}
