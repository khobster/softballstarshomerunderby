var Field = (function() {
    var Field = function(container, game) {
        var box;
        if (typeof container === 'string') {
            box = document.getElementById(container);
        }

        this.reset = function() {
            // Reset to green
        };

        this.checkBases = function() {
            // Check and update bases
        };

        this.clearOutfield = function() {
            console.log('clearing');
            for (outfield = 0; outfield < 12; outfield++) {
                document.getElementById(outfield).classList.toggle('hit', false);
                document.getElementById(outfield).classList.toggle('outField', false);
                document.getElementById(outfield).classList.toggle('green', true);
                document.getElementById(outfield).innerHTML = '';
            }
        };

        this.placePlayer = function(where) {
            console.log('placing from field.js');
            console.log(where);
            document.getElementById(where).className = 'outField';
        };

        this.announce = function(was, announcement) {
            // Announcement logic
        };

        this.placeBall = function(was, is) {
            console.log('placing ball at ' + is);
            document.getElementById(was).classList.toggle('green', true);
            document.getElementById(was).classList.toggle('hit', false);
            document.getElementById(was).innerHTML = '';
            document.getElementById(is).classList.toggle('hit', true);
            document.getElementById(is).innerHTML = 'B';
            game.was = is;
        };

        this.updateBillboard = function(newScore) {
            document.getElementById('billboard').innerHTML = "Score: " + game.score + '<br>' + 'Outs: ' + game.outs;
        };

        this.displayGameOver = function(score) {
            var endGame = document.createElement('div');
            endGame.setAttribute('class', 'billboard');
            endGame.innerHTML = "Game Over! You scored " + game.score + ' runs. Reload to play again!';
            document.getElementById(container).appendChild(endGame);
            game.reset();
            game.resetBases();
            game.resetOutfield();
            setTimeout(function() {
                document.getElementById(container).removeChild(endGame);
            }, 2000);
        };

        this.render = function() {
            var diamond = document.createElement('table');
            diamond.setAttribute('id', 'grounds');
            box.appendChild(diamond);
            for (var row = 0; row < 7; row++) {
                var rows = document.createElement('tr');
                diamond.appendChild(rows);
                for (var cell = 0; cell < 5; cell++) {
                    var cells = document.createElement('td');
                    cells.setAttribute('id', (row * 5 + cell));
                    if (cells.id < 12) {
                        cells.className = 'green';
                    } else if (cells.id == 12 || cells.id == 20 || cells.id == 24 || cells.id == 32) {
                        cells.className = 'base';
                    } else if (cells.id == 22) {
                        cells.className = 'mound';
                    } else if (cells.id == 29) {
                        cells.className = 'batter-box';
                    } else {
                        cells.className = 'green';
                    }
                    rows.appendChild(cells);
                }
            }

            // Add pitcher image
            var pitcherCell = document.getElementById(22);
            var pitcherImage = new Image();
            pitcherImage.src = 'src/assets/images/pitcher.png';
            pitcherCell.appendChild(pitcherImage);

            // Add batter image
            var batterCell = document.getElementById(29);
            var batterImage = new Image();
            batterImage.src = 'src/assets/images/batter.png';
            batterCell.appendChild(batterImage);

            document.getElementById(29).onclick = function() { game.swing(); };
            document.getElementById(22).onclick = function() { game.resetOutfield(); };
            var billboard = document.createElement('div');
            billboard.classList.toggle('billboard', true);
            billboard.setAttribute('id', 'billboard');
            billboard.innerHTML = "Score: " + game.score + "<br>" + 'Outs: ' + game.outs;
            document.getElementById('field').appendChild(billboard);
        };
    };
    return Field;
})();

var doStuff = function() {
    game1 = new Mechanics();
    var rollOut = new Field('field', game1);
    rollOut.render();
    game1.gui(rollOut);
};

window.onload = doStuff;
