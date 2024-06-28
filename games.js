const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Basic settings
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Load images
const pitcherImage = new Image();
const batterImage = new Image();
pitcherImage.src = 'src/assets/images/pitcher.png'; // Placeholder path
batterImage.src = 'src/assets/images/batter.png'; // Placeholder path

// Initial positions
const pitcher = { x: canvasWidth / 2 - 50, y: 50, width: 100, height: 100 };
const batter = { x: canvasWidth / 2 - 50, y: canvasHeight - 150, width: 100, height: 100 };

// Draw pitcher and batter
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw pitcher
    ctx.drawImage(pitcherImage, pitcher.x, pitcher.y, pitcher.width, pitcher.height);

    // Draw batter
    ctx.drawImage(batterImage, batter.x, batter.y, batter.width, batter.height);

    requestAnimationFrame(draw);
}

// Start drawing
draw();
