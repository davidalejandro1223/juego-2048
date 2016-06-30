function EntradaDeTeclado(){
    this.eventos={};
    this.listen();
}

//recibe el evento y lo vincula con la funcion necesaria
EntradaDeTeclado.prototype.on = function(evento, callback){
    if(!this.eventos[evento]){
        this.eventos[evento]=[];
    }
    this.eventos[evento].push(callback);
};

//vincula el evento y la informacion del mismo con la funcion a responder por el evento
EntradaDeTeclado.prototype.emitir=function(evento, info){  //Antes data
    var callbacks=this.eventos[evento];
    if(callbacks){
        callbacks.forEach(function(callback){
            callback(info);
        });
    }  
};


//Asigna listeners sobre acciones del teclado a la pagina
EntradaDeTeclado.prototype.listen=function(){
    var self=this;
    var mapa={
        38:0, //arriba
        39:1, //derecha
        40:2, //abajo
        37:3, //izquierda
    };
    //Responde a las flechas
    document.addEventListener("keydown", function(event){
        var teclaPresionada= mapa[event.which];            //Antes mapped
        
        if(teclaPresionada !== undefined){
            event.preventDefault();
            self.emitir("mover",teclaPresionada);
        }
    });    

    //responde a los botones presionados
    this.botonPresionado(".boton-reintentar", this.reiniciar);
    this.botonPresionado(".reiniciar", this.reiniciar);
    this.botonPresionado(".boton-seguir-jugando", this.mantenerJugando );
};

//emite el evento "reiniciar" para reiniciar el juego
EntradaDeTeclado.prototype.reiniciar = function(evento){
    evento.preventDefault();
    this.emitir("reiniciar");
};

//emite el evento "seguirJugando" para seguir luego de alcanzar la ficha 2048
EntradaDeTeclado.prototype.mantenerJugando= function(evento){
    evento.preventDefault();
    this.emitir("mantenerJugando")
};

//agrega un listener a los botones en pantalla
EntradaDeTeclado.prototype.botonPresionado=function(selector, fn){
    var boton= document.querySelector(selector);
    boton.addEventListener("click", fn.bind(this));
};