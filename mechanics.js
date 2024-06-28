var Mechanics = (function() {
    var Mechanics = function() {
        // Initialize properties
        this.outs = 0;
        this.score = 0;
        this.strikes = 0;
        this.onFirst = false;
        this.onSecond = false;
        this.onThird = false;
        this.onBase = 0;
        this.was = 0;
        this.player1Pos = null;
        this.player2Pos = null;
    };

    Mechanics.prototype.swing = function() {
        // Logic for swinging the bat
        console.log("Swinging the bat");
        var swung = Math.floor(Math.random() * 100);
        if (swung < 50) {
            this.moveBatter();
            console.log("Hit!");
        } else {
            this.strikes++;
            console.log("Miss!");
            if (this.strikes >= 3) {
                this.outs++;
                console.log("Out!");
                this.strikes = 0;
                if (this.outs >= 3) {
                    this.gameOver();
                }
            }
        }
    };

    Mechanics.prototype.moveBatter = function() {
        // Logic to move the batter
        if (this.onBase < 3) {
            this.onBase++;
        }
        if (this.onThird) {
            this.score++;
            this.onThird = false;
        }
        if (this.onSecond) {
            this.onThird = true;
            this.onSecond = false;
        }
        if (this.onFirst) {
            this.onSecond = true;
            this.onFirst = false;
        }
        this.onFirst = true;
    };

    Mechanics.prototype.gameOver = function() {
        // Logic for game over
        console.log("Game Over! Final Score: " + this.score);
        this.reset();
    };

    Mechanics.prototype.reset = function() {
        // Reset game state
        this.outs = 0;
        this.score = 0;
        this.strikes = 0;
        this.onFirst = false;
        this.onSecond = false;
        this.onThird = false;
        this.onBase = 0;
    };

    return Mechanics;
})();
