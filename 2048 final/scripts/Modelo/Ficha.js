function Ficha (posicion, valor){
    this.x = posicion.x;
    this.y = posicion.y;
    this.valor = valor || 2;
    this.posicionPrevia = null;
    this.combinadaCon = null;
}


//guarda la posicion de la ficha
Ficha.prototype.guardarPosicion = function(){
    this.posicionPrevia = {x:this.x, y:this.y};
};


//actualiza la posicion de una ficha
Ficha.prototype.actualizarPosicion = function(posicion){
    this.x = posicion.x;
    this.y = posicion.y;
};

//retorna la posicion y valor actualizados de la ficha
Ficha.prototype.serializar = function(){
    return{
        posicion:{
            x: this.x,
            y: this.y
        },
        value: this.valor
    };
};
