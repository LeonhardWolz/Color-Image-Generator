function Color(rr, gg, bb){
    this.r = rr;
    this.g = gg;
    this.b = bb;    
}

Color.prototype.getR = function(){
    return this.r;
}

Color.prototype.getG = function(){
    return this.g;
}

Color.prototype.getB = function(){
    return this.b;
}