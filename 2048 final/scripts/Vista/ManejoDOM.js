function ManejoDOM(){
    this.contenedorFicha = document.querySelector(".contenedor-ficha");
    this.puntajeActual = document.querySelector(".puntaje-actual");
    this.mensajeFinal = document.querySelector(".mensaje-final");
    this.puntaje =0;
}


//realiza los cambios en el dom luego del movimiento de las fichas
ManejoDOM.prototype.cambio = function(cuadricula, infoJuego){
    var self = this;
    window.requestAnimationFrame(function(){
        self.limpiarContenedor(self.contenedorFicha);
        cuadricula.celdas.forEach(function(columna){
            columna.forEach(function(celda){
                if(celda){
                    self.agregarFicha(celda);
                }
            });
        });
        
        self.actualizarPuntaje(infoJuego.puntaje);
        if(infoJuego.terminado){
            if(infoJuego.perdio){
                self.mensaje(false);
            }else if(infoJuego.gano){
                self.mensaje(true);
            }
        }
        
    });
};


//continua el juego
ManejoDOM.prototype.continuarJuego = function(){
    this.quitarMensajeFinal();
};


//elimina el primer nodo hijo del div que se le pase
ManejoDOM.prototype.limpiarContenedor = function(contenedor){
    while(contenedor.firstChild){
        contenedor.removeChild(contenedor.firstChild);
    }
};



//agrega las nuevas fichas al la cuadricula
ManejoDOM.prototype.agregarFicha = function(ficha){
    var self = this;
    
    var caja = document.createElement("div");
    var contenido = document.createElement("div");
    var posicion = ficha.posicionPrevia || { x: ficha.x, y: ficha.y };
    var clasePosicion = this.clasePosicion(posicion);
    var clases = ["ficha", "ficha-"+ficha.valor, clasePosicion];
    
    if(ficha.valor > 2048) clases.push("ficha-super");
    
    this.aplicarClases(caja,clases);
    
    contenido.classList.add("contenido-ficha");
    contenido.textContent = ficha.valor;
    
    if(ficha.posicionPrevia){
        window.requestAnimationFrame(function(){
            clases[2] = self.clasePosicion({ x: ficha.x, y: ficha.y });
            self.aplicarClases(caja,clases);
        });
    }else if(ficha.combinadaCon){
        clases.push("combinacion-ficha");
        this.aplicarClases(caja,clases);
        ficha.combinadaCon.forEach(function(combinada){
            self.agregarFicha(combinada);
        });
    }else{
        clases.push("nueva-ficha");
        this.aplicarClases(caja, clases);
    }
    
    caja.appendChild(contenido);
    this.contenedorFicha.appendChild(caja);
};


//pone el atrubuto clase y su valor a los div generados durante el juego
ManejoDOM.prototype.aplicarClases = function(elemento, clases){
    elemento.setAttribute("class",clases.join(" "));
};


//determina la posicion final de la ficha en la cuadricula
ManejoDOM.prototype.posicionFinal = function(posicion){
    return { x: posicion.x + 1, y: posicion.y + 1 };
};



//completa la clase del div de la ficha correspondiente a la posicion ingresada
ManejoDOM.prototype.clasePosicion = function(posicion){
    posicion = this.posicionFinal(posicion);
    return "posicion-ficha-" + posicion.x + "-" + posicion.y;
};



//actualiza el puntaje
ManejoDOM.prototype.actualizarPuntaje = function(puntaje){
    this.limpiarContenedor(this.puntajeActual);
    this.puntajeActual.textContent = puntaje;
};


//determina que mensaje final se debe mostrar al terminar la partida
ManejoDOM.prototype.mensaje = function(gano){
    var tipo;
    var mensaje;
    if(gano){
        tipo = "juego-ganado";
        mensaje = "Ganaste";
    }else{
        tipo = "juego-perdido";
        mensaje = "Perdiste";
    }
    
    this.mensajeFinal.classList.add(tipo);
    this.mensajeFinal.getElementsByTagName("p")[0].textContent = mensaje;
};



//quita el mensaje final cuando se termina la partida para seguir jugando
ManejoDOM.prototype.quitarMensajeFinal = function(){
    this.mensajeFinal.classList.remove("juego-ganado");
    this.mensajeFinal.classList.remove("juego-perdido");
};



















