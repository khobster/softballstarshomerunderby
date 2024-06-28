const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Basic settings
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Load images
const pitcherImage = new Image();
const batterImage = new Image();
pitcherImage.src = 'src/assets/images/pitcher.png'; // Path to pitcher image
batterImage.src = 'src/assets/images/batter.png'; // Path to batter image

// Initial positions
const pitcher = { x: canvasWidth / 2 - 50, y: 50, width: 32, height: 64 };
const batter = { x: canvasWidth / 2 - 50, y: canvasHeight - 150, width: 32, height: 64 };

// Ball properties
const ball = { x: pitcher.x + pitcher.width / 2, y: pitcher.y + pitcher.height, radius: 5, speed: 5, inMotion: false };

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw pitcher
    ctx.drawImage(pitcherImage, pitcher.x, pitcher.y, pitcher.width, pitcher.height);

    // Draw batter
    ctx.drawImage(batterImage, batter.x, batter.y, batter.width, batter.height);

    // Draw ball
    if (ball.inMotion) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        // Move ball
        ball.y += ball.speed;
        if (ball.y > canvasHeight) {
            ball.inMotion = false;
            ball.y = pitcher.y + pitcher.height;
        }
    }

    requestAnimationFrame(draw);
}

// Pitch function
function pitchBall() {
    if (!ball.inMotion) {
        ball.inMotion = true;
        ball.x = pitcher.x + pitcher.width / 2;
        ball.y = pitcher.y + pitcher.height;
    }
}

// Event listener for pitching
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        pitchBall();
    }
});

// Start drawing
draw();
