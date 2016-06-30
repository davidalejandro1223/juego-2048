function AdministradorJuego(tamano, Teclado, ManejoDOM){
    this.tamano = tamano;
    this.teclado = new Teclado;
    this.manejoDOM = new ManejoDOM;
    this.primerasFichas = 2;
    this.teclado.on("mover", this.mover.bind(this));
    this.teclado.on("reiniciar", this.reiniciar.bind(this));
    this.teclado.on("mantenerJugando", this.mantenerJugando.bind(this));
    this.lanzador();
}


//Genera el tablero inicial
AdministradorJuego.prototype.reiniciar = function(){
    this.manejoDOM.continuarJuego();
    this.lanzador();
};

// Seguir jugando despues de ganar (llegar a 2048)
AdministradorJuego.prototype.mantenerJugando = function(){
    this.mantenerJugando = true;
    this.manejoDOM.continuarJuego();
};

//Terminar el juego al llegar a 2048
AdministradorJuego.prototype.juegoTerminado = function(){
    return this.perdio || (this.gano && !this.mantenerJugando);
};

//Configura el juego
AdministradorJuego.prototype.lanzador = function(){
    this.cuadricula = new Cuadricula(this.tamano);
    this.puntaje =0;
    this.perdio = false;
    this.gano = false;
    this.mantenerJugando=false;
    this.fichaInicial();
    this.cambio();
};

//inicia el juego con el numero de fichas
AdministradorJuego.prototype.fichaInicial= function(){
    for(var i=0; i < this.primerasFichas; i++){
        this.agregarFichaAleatoria();
    }
};


//Agrega las fichas aleatoriamente al empezar (ficha 2 o 4)
AdministradorJuego.prototype.agregarFichaAleatoria = function(){
    if(this.cuadricula.celdasDis()){
        var valor;
        if(Math.random()<0.9){
            valor = 2;
        }
        else{ 
            valor = 4;
        }
        var ficha = new Ficha(this.cuadricula.celdaDisponibleAleatoria(), valor);
        this.cuadricula.insertarFicha(ficha);
    }
};

//realiza los cambios y las comprobaciones luego de cada movimiento
AdministradorJuego.prototype.cambio= function(){
    this.manejoDOM.cambio(this.cuadricula,{
        puntaje: this.puntaje,
        perdio: this.perdio,
        gano: this.gano,
        terminado: this.juegoTerminado()
    });
};


//unifica los atributos principales del juego
AdministradorJuego.prototype.serializar=function(){
    return{
        cuadricula: this.cuadricula.serializar(),
        puntaje: this.puntaje,
        perdio: this.perdio,
        gano: this.gano,
        mantenerJugando: this.mantenerJugando
    };
};

// guarda las posiciones de las fichas y quita informacion de combinacion previa
AdministradorJuego.prototype.prepararFichas= function(){
    this.cuadricula.cadaCelda(function(x, y, ficha){
        if(ficha){
            ficha.combinadaCon = null;
            ficha.guardarPosicion();
        }
    });
};

// mueve la ficha y su representacion
AdministradorJuego.prototype.moverFicha= function(ficha, celda){
    this.cuadricula.celdas[ficha.x][ficha.y] = null;
    this.cuadricula.celdas[celda.x][celda.y] = ficha;
    ficha.actualizarPosicion(celda);
};

// mueve las fichas en la direccion respectiva
AdministradorJuego.prototype.mover=function(direccion){
    var self = this;
    if(this.juegoTerminado()) return;
    var celda, ficha;
    
    var vector= this.vectorMovimiento(direccion);
    var recorridos= this.recorridos(vector);
    var movido=false;
    
    this.prepararFichas();
    
      // recorre las fichas en la cuadricula en la direccion correcta
      recorridos.x.forEach(function(x){
        recorridos.y.forEach(function(y){
            celda = { x: x, y: y };
            ficha = self.cuadricula.contenidoCelda(celda);
            
            if(ficha){
                var posiciones=self.posicionMasLejana(celda, vector);
                var proximo=self.cuadricula.contenidoCelda(posiciones.siguente);
                
            // realiza solo una fusion por fila o columna
                if(proximo && proximo.valor == ficha.valor && !proximo.combinadaCon){
                    var combinado = new Ficha(posiciones.siguente, ficha.valor * 2);
                    combinado.combinadoCon = [ficha, proximo];
                
                    self.cuadricula.insertarFicha(combinado);
                    self.cuadricula.removerFicha(ficha);
                
                    ficha.actualizarPosicion(posiciones.siguente);
                     // actualiza el puntaje
                    self.puntaje += combinado.valor;
                
                    // Se declara el tope para ganar (se puede modificar para efectos de pruebas)
                    if(combinado.valor === 2048){
                        self.gano = true;
                    }
                }else{
                    self.moverFicha(ficha, posiciones.maximo);
                }
                if(!self.posicionesIguales(celda, ficha)){
                    movido=true;
                }
            }
        });
    });
      
      if (movido){
        this.agregarFichaAleatoria();
        if(!this.movimientosDisponibles()){
            this.perdio=true;// Si no quedan movimientos se declara el juego como perdido
        }
            this.cambio();
    }   
};


//define el vector de movimiento de acuerdo a la flecha presionada
AdministradorJuego.prototype.vectorMovimiento = function(direccion){
    var mapa ={
        0: { x: 0, y: -1 },
        1: { x: 1, y: 0 },
        2: { x: 0, y: 1 },
        3: { x: -1, y: 0 }
    };
    
    return mapa[direccion];
};


//crea los recorridos de extremo a extremo de acuerdo al vector de movimiento
AdministradorJuego.prototype.recorridos = function(vector){
    var recorridos = { x: [], y: [] };
    
    for(var pos = 0; pos < this.tamano; pos++){
        recorridos.x.push(pos);
        recorridos.y.push(pos);
    }
    if(vector.x === 1){
        recorridos.x = recorridos.x.reverse();
    } 
    if(vector.y === 1){
        recorridos.y = recorridos.y.reverse();
    }
    
    return recorridos;
};


//determina cual es la posicion mas lejana posible de alcanzar
AdministradorJuego.prototype.posicionMasLejana = function(celda, vector){
    var anterior;
    do{
        anterior = celda;
        celda = {x: anterior.x + vector.x, y: anterior.y + vector.y};
    }while(this.cuadricula.dentroLimites(celda)&& this.cuadricula.celdaDis(celda));
    
    return{
        maximo: anterior,
        siguente: celda
    };
};


//determina si hay movimientos disponibles o no para continuar o terminar el juego
AdministradorJuego.prototype.movimientosDisponibles = function(){
    return this.cuadricula.celdasDis() || this.unionesDisponibles();
};


//determina que fichas estan en condiciones de combinarse para continuar o no el juego
AdministradorJuego.prototype.unionesDisponibles = function(){
    var self = this;
    var ficha;
    
    for (var x = 0; x < this.tamano; x++){
        for(var y = 0; y<this.tamano; y++){
            ficha = this.cuadricula.contenidoCelda({x: x, y: y});
        
            if(ficha){
               for(var dir =0; dir<4; dir++){
                   var vector = self.vectorMovimiento(dir);
                   var celda = { x: x + vector.x, y: y + vector.y }
                   
                   var otro = self.cuadricula.contenidoCelda(celda);
                   
                   if(otro && otro.valor === ficha.valor){
                       return true;
                   }
               } 
            }
        }
    }
    return false;
};


//
AdministradorJuego.prototype.posicionesIguales = function(p1,p2){
    return p1.x === p2.x && p1.y===p2.y;
};










