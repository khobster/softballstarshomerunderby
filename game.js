const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 524,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // Simulate gravity for ball trajectory
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

let batter, pitcher, ball, cursors, scoreText, outsText, startButton;
let gameState = 'waitingForPitch'; 
let score = 0;
let outs = 0;
let hitRegistered = false;
let outRegistered = false;

// Fence coordinates
const fenceLeftX = 100; 
const fenceRightX = 700;
const fenceTopY = 200;  

function preload() {
  this.load.image('field', 'field.png');
  this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
  this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
  this.load.image('ball', 'smallsoftball.png');

  this.load.on('complete', create, this); // Create after assets are loaded
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

  // Create invisible fence
  const fence = this.add.rectangle((fenceLeftX + fenceRightX) / 2, fenceTopY, fenceRightX - fenceLeftX, 10, 0xff0000).setOrigin(0.5, 1);
  this.physics.add.existing(fence);
  fence.body.immovable = true;
  fence.body.allowGravity = false;

  // Create invisible wall for out of bounds detection
  const outOfBoundsZone = this.add.rectangle(0, 0, 800, 10, 0x00ff00).setOrigin(0); // Green for visibility (remove later)
  this.physics.add.existing(outOfBoundsZone);
  outOfBoundsZone.body.immovable = true;
  outOfBoundsZone.body.allowGravity = false;

  this.physics.add.collider(ball, outOfBoundsZone, ballOut, null, this);

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

  const pitchSpeed = Phaser.Math.GetSpeed(500, 1);
  const pitchAngle = Phaser.Math.Between(-15, 5); 
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
  if (ball.x > fenceLeftX && ball.x < fenceRightX && ball.y < fenceTopY) {
    console.log("Home Run!");
    // Add any additional home run effects here (e.g., animation, sound)
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
  gameState = 'waitingForPitch';
}

function resetGame() {
  score = 0;
  outs = 0;
  scoreText.setText('Home Runs: 0');
  outsText.setText('Outs: 0');
  startButton.setVisible(true); // Show the start button again after game over
}
