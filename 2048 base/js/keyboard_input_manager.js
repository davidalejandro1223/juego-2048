function KeyboardInputManager() {
  this.events = {};
  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};


//asigna listeners sobre acciones del teclado a la pagina
KeyboardInputManager.prototype.listen = function () {
  var self = this;
  var map = {
    38: 0, // arriba
    39: 1, // derecha
    40: 2, // abajo
    37: 3, // izquierda
    //87: 0, // W
    //68: 1, // D
    //83: 2, // S
    //65: 3  // A
  };
  // Responde a las flechas
  document.addEventListener("keydown", function (event) {
    //var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    //event.shiftKey;
    var mapped    = map[event.which];
    
    //if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    //}
  });
  // Responde a los botones presionados
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
  // Responde al cambio de eventos

};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
