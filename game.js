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
      gravity: { y: 0 }, // No gravity for this game
      debug: false 
    }
  }
};

const game = new Phaser.Game(config);

let batter, pitcher, ball, cursors, scoreText, outsText;
let gameState = 'waitingForPitch'; // Initial game state
let score = 0;
let outs = 0;

function preload() {
  this.load.image('field', 'field.png');
  this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
  this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
  this.load.image('ball', 'smallsoftball.png');
}

function create() {
  this.add.image(400, 262, 'field'); 

  // Create animations (same as before)
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

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.overlap(batter, ball, checkHit, null, this); // Use overlap for hit detection

  scoreText = this.add.text(16, 16, 'Home Runs: 0', { fontSize: '24px', fill: '#fff' });
  outsText = this.add.text(16, 50, 'Outs: 0', { fontSize: '24px', fill: '#fff' });

  this.time.addEvent({ delay: 2000, callback: startPitch, callbackScope: this, loop: true });
}

function update() {
  if (cursors.space.isDown && gameState === 'waitingForPitch') {
    gameState = 'swinging';
    batter.anims.play('batter_swing');
  }

  if (batter.anims.isPlaying && batter.anims.getProgress() === 1) {
    batter.setFrame(0);
    gameState = 'waitingForPitch';
  }

  if (pitchInProgress && ball.y > 550) { // Ball past batter
    ballOut(); 
  }
}

function startPitch() {
  if (gameState !== 'waitingForPitch') return;

  gameState = 'pitching';
  pitcher.anims.play('pitcher_throw');
  pitcher.once('animationcomplete', () => {
    pitchBall();
  });
}

function pitchBall() {
  ball.setActive(true).setVisible(true);
  ball.setPosition(pitcher.x, pitcher.y);

  // Tween for ball movement with realistic arc
  this.tweens.add({
    targets: ball,
    x: batter.x,
    y: batter.y - 50, // Adjust for bat height
    ease: 'Cubic.Out',
    duration: 500,  
    onComplete: () => {
      if (gameState !== 'hit') {
        gameState = 'waitingForPitch';
        ballOut();
      }
    }
  });
  pitchInProgress = true;
}

function checkHit() {
  if (gameState === 'swinging' && this.physics.overlap(batter, ball)) {
    gameState = 'hit';
    hitBall();
  }
}

function hitBall() {
  score += 1;
  scoreText.setText(`Home Runs: ${score}`);
  ball.setActive(false).setVisible(false);
  this.time.delayedCall(500, resetPitch, [], this);
}

function ballOut() {
  outs += 1;
  outsText.setText(`Outs: ${outs}`);
  if (outs >= 5) {
    this.add.text(400, 262, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
    this.time.delayedCall(2000, resetGame, [], this);
  } else {
    this.time.delayedCall(500, resetPitch, [], this); 
  }
  pitchInProgress = false; // Reset pitch flag
}

function resetPitch() {
  ball.setPosition(pitcher.x, pitcher.y);
  ball.setVelocity(0); // Make sure to reset velocity
  gameState = 'waitingForPitch';
}

function resetGame() {
  score = 0;
  outs = 0;
  scoreText.setText('Home Runs: 0');
  outsText.setText('Outs: 0');
  startPitch();
}
