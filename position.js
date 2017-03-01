function Position(xx, yy){
    this.x = xx;
    this.y = yy;
}

Position.prototype.getX = function(){
    return this.x;
}

Position.prototype.getY = function(){
    return this.y;
}

Position.prototype.setX = function(xx){
    this.x = xx;
}

Position.prototype.setY = function(yy){
    this.y = yy;
}
