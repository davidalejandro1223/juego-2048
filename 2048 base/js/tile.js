function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; 
}

//guarda la poscicion de una ficha

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

//actualiza la poscision de una ficha

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

//retorna los nuevos valores de poscicion como de valor de la ficha

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};
