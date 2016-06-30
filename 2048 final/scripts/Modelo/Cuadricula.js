function Cuadricula(tamano, estadoPrevio){
    this.tamano = tamano;
    if(estadoPrevio){
        this.celdas = this.delEstado(estadoPrevio);
    }else{
        this.celdas = this.vacio();
    }
}

//inicializa el arreglo "celdas" con espacios vacios
Cuadricula.prototype.vacio = function(){
    var celdas = [];
    for(var x = 0; x<this.tamano; x++){
        var fila = celdas[x] = [];
    }
    return celdas;
};

//determina el estado de una celda
Cuadricula.prototype.delEstado = function(estado){
    var celdas = [];
    for(var x=0; x<this.tamano; x++){
        
        var fila = celdas[x] = [];
        
        for(var y=0; y<this.tamano; y++){
            var ficha = estado[x][y];
            if(ficha){
                row.push(new Ficha(ficha.posicion, ficha.valor));
            }else{
                row.push(null);
            }
        }
    }
    return celdas;
};

//encuentra el primer lugar para colocar las fichas de manera aleatoria
Cuadricula.prototype.celdaDisponibleAleatoria =function(){
    var celdas = this.celdasDisponibles();
    if(celdas.length){
        return celdas[Math.floor(Math.random()*celdas.length)];
    }
};

//determina que celdas estan libres
Cuadricula.prototype.celdasDisponibles = function(){
    var celdas = [];
    this.cadaCelda(function (x,y,ficha){
        if(!ficha){
            celdas.push({ x: x, y: y });
        }
    });
    return celdas;
};

//
Cuadricula.prototype.cadaCelda = function(callback){
    for(var x=0; x<this.tamano; x++){
        for(var y=0; y<this.tamano; y++){
            callback(x,y,this.celdas[x][y]);
        }
    }
};

//determina que celda esta disponible
Cuadricula.prototype.celdasDis = function(){
    return !!this.celdasDisponibles().length
}

//determina que celda esta disponible
Cuadricula.prototype.celdaDis = function(celda){
    return !this.celdaOcupada(celda);
}

//determina si una celda esta ocupada
Cuadricula.prototype.celdaOcupada = function(celda){
    return !!this.contenidoCelda(celda);
}

//determina el contenido de una celda
Cuadricula.prototype.contenidoCelda = function(celda){
    if(this.dentroLimites(celda)){
        return this.celdas[celda.x][celda.y];
    }
    else{
      return null;
    }
};

//inserta una nueva ficha
Cuadricula.prototype.insertarFicha = function(ficha){
    this.celdas[ficha.x][ficha.y] = ficha;
};

//remueve una ficha
Cuadricula.prototype.removerFicha = function(ficha){
    this.celdas[ficha.x][ficha.y] = null;
};

//determina que las fichas no se salgan de la cuadricula
Cuadricula.prototype.dentroLimites = function(posicion){
    return posicion.x >= 0 && posicion.x < this.tamano && posicion.y >=0 && posicion.y < this.tamano;
};


//unifica las propiedades de las celdas
Cuadricula.prototype.serializar = function(){
    var estadoCelda =[];
    for(var x=0; x<this.tamano; x++){
        var fila = estadoCelda[x]=[];
        
        for(var y=0; y<this.tamano; y++){
            if(this.celdas[x][y]){
                fila.push(this.celdas[x][y].serializar());
            }else{
                fila.push(null);
            }
        }
    }
    return{
        tamano: this.tamano,
        celdas: estadoCelda
    };
};


