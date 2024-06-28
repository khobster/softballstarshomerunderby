var Mechanics = (function() {
    var Mechanics = function() {
        this.outs = 0;
        this.score = 0;
        this.strikes = 0;
        this.onFirst = false;
        this.onSecond = false;
        this.onThird = false;
        this.onBase = 0;
        this.was = 0;
        this.guiInstance = null;
    };

    Mechanics.prototype.gui = function(guiInstance) {
        this.guiInstance = guiInstance;
    };

    Mechanics.prototype.swing = function() {
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
        this.guiInstance.updateBillboard();
    };

    Mechanics.prototype.moveBatter = function() {
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
        this.guiInstance.checkBases();
    };

    Mechanics.prototype.gameOver = function() {
        console.log("Game Over! Final Score: " + this.score);
        this.guiInstance.displayGameOver();
        this.reset();
    };

    Mechanics.prototype.reset = function() {
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
