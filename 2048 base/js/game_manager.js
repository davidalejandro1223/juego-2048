function GameManager(size, InputManager, Actuator) {
  this.size           = size; // Tamaño de la cuadricula
  this.inputManager   = new InputManager;
  this.actuator       = new Actuator;
  this.startTiles     = 2;
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restaura el juego
GameManager.prototype.restart = function () {
  this.actuator.continueGame(); 
  this.setup();
};

// Seguir jugando despues de ganar (llegar a 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); 
};
// Terminar el juego al llegar a 2048
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// configura el juego 
GameManager.prototype.setup = function () {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // agrega las dos fichas iniciales
    this.addStartTiles();
  //}

  // actualiza el accionador
  this.actuate();
};

// inicia el juego con el numero de fichas
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Agrega las fichas aleatoriamente al empezar (ficha 2 o 4)
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

GameManager.prototype.actuate = function () {

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    terminated: this.isGameTerminated()
  });

};

// representa la partida como un objeto
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// guarda las posiciones de las fichas y quita informacion de combinacion
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// mueve la ficha y su representacion
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// mueve las fichas en la direccion respectiva
GameManager.prototype.move = function (direction) {
  var self = this;

  if (this.isGameTerminated()) return; // hace que no se mueva si el juego se acabo

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  this.prepareTiles();

  // recorre las fichas en la cuadricula en la direccion correcta
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // realiza solo una fusion por fila o columna
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          tile.updatePosition(positions.next);

          // actualiza el puntaje
          self.score += merged.value;

          // Se declara juego ganado cuando se llega a la ficha 2048
          if (merged.value === 32) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; 
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Si no quedan movimientos se declara el juego como perdido
    }

    this.actuate();
  }
};

GameManager.prototype.getVector = function (direction) {
  // se representa el movimiento dandole una direccion
  var map = {
    0: { x: 0,  y: -1 }, // arriba
    1: { x: 1,  y: 0 },  // izquierda
    2: { x: 0,  y: 1 },  // abajo
    3: { x: -1, y: 0 }   // derecha
  };

  return map[direction];
};

// crea una lista de posiciones para recorrer en el orden correcto
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // hace que se recorra desde la ficha mas alejada en la direccion correcta
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Permite avanzar hasta toparse con un obstaculo
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell 
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// mira la posible union entre las fichas
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;
  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // Indica que las fichas se pueden combinar
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
