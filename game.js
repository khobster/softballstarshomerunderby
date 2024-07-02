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
let hitRegistered = false;
let outRegistered = false;
let pitchSpeed = 200;

function preload() {
  this.load.image('field', 'field.png');
  this.load.spritesheet('batter', 'battersmallsprite.png', { frameWidth: 64, frameHeight: 68 });
  this.load.spritesheet('pitcher', 'pitchersmallsprite.png', { frameWidth: 64, frameHeight: 57 });
  this.load.image('ball', 'smallsoftball.png');
}

function create() {
  // ... (same as before)
}

function update() {
  if (cursors.space.isDown && !isSwinging && !pitchInProgress) {
    isSwinging = true;
    hitRegistered = false; 
    batter.anims.play('batter_swing');
  }

  if (isSwinging && batter.anims.getProgress() === 1) {
    isSwinging = false;
    batter.setFrame(0);
  }

  if (pitchInProgress && !outRegistered && ball.y > 550) { 
    ballOut(); 
  }
}

function startPitch() {
  if (pitchInProgress) return;

  outRegistered = false; 
  pitcher.anims.play('pitcher_throw');
  pitcher.once('animationcomplete', () => {
    pitchBall();
  });
}

function pitchBall() {
  ball.setActive(true).setVisible(true);
  ball.setPosition(pitcher.x, pitcher.y); 

  const pitchSpeed = Phaser.Math.GetSpeed(500, 1);
  const pitchAngle = Phaser.Math.Between(-15, 15);
  this.physics.velocityFromAngle(pitchAngle, pitchSpeed, ball.body.velocity);
  pitchInProgress = true;
}

function checkHit() {
  if (this.physics.overlap(batter, ball) && !hitRegistered) {
    hitRegistered = true; 
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
  outRegistered = true; 
  outs += 1;
  outsText.setText(`Outs: ${outs}`);
  if (outs >= 5) {
    this.add.text(400, 262, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
    resetGame();
  } else {
    this.time.delayedCall(500, resetPitch, [], this); 
  }
}

function resetPitch() {
  ball.setPosition(pitcher.x, pitcher.y);
  ball.setVelocity(0);
  pitchInProgress = false;
}

function resetGame() {
  score = 0;
  outs = 0;
  scoreText.setText('Home Runs: 0');
  outsText.setText('Outs: 0');
}
