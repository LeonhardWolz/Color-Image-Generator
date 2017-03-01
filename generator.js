//Algorithm settings
var imageWidth = 256, imageHeight = 256;
var NUMCOLORS = 48;
var newPixelsPerDraw = 20;

//Header settings
var headerHeight = 210;
var title = 'All RGB Colors Image Generator';
var titleFontSize = 40;
var titleBounds;
var titleX,titleY;
var myFont;
var imageWidthInput, imageHeightInput;
var pixelsPerDrawSlider, numcolorsSlider;
var startB, saveB;
var colorSortDropdown;
var colorSortAlgorithms = ['Iterate RGB'];
var currentColorSortAlgorithm;
var algorithmDropdown;
var algorithms = ['RandomWalk8D_V1', 'RandomWalk8D_V2'];
var currentAlgorithm;

var lastEmptyX = 0, lastEmptyY = 0;
var imageCanvas;
var colors = [];
var visited = [];
var currPos;
var currColorIndex = 0;
var directions = ['up', 'upright', 'right', 'downright', 'down', 'downleft', 'left', 'upleft'];
var generating = false;

function preload(){
    myFont = loadFont('GlacialIndifference-Regular.otf');
}
function setup(){
    
    //Create Empty Image
    this.imageCanvas = createGraphics(imageWidth, imageHeight);
    this.imageCanvas.background(100);
    createCanvas(innerWidth, innerHeight);
    
    //Title setup
    titleBounds = myFont.textBounds(title, 0, 0, titleFontSize);
    titleX = innerWidth / 2 - titleBounds.w / 2;
    titleY = 45;
    
    //create NUMCOLORS Slider
    numcolorsSlider = createSlider(0, 255, NUMCOLORS);
    numcolorsSlider.position(20,95);
    
    //Create colorSortAlgorithms Dropdown
    colorSortDropdown = colorSortAlgorithms[0];
    colorSortDropdown = createElement('select');
    for(var i = 0; i < colorSortAlgorithms.length; i++){
        var option = createElement('option');
        option.attribute('value', colorSortAlgorithms[i]);
        option.html(colorSortAlgorithms[i]);
        option.parent(colorSortDropdown);
    }
    colorSortDropdown.position(20, 170);
    
    //Create newPixelsPerDraw Slider
    pixelsPerDrawSlider = createSlider(1, 500, newPixelsPerDraw);
    pixelsPerDrawSlider.position(250, 95);
    
    //Create imageWidth Input Field
    imageWidthInput = createInput();
    imageWidthInput.position(400, 95);
    imageWidthInput.value(imageWidth);
    
    //Create imageHeight Input Field
    imageHeightInput = createInput();
    imageHeightInput.position(400, 170);
    imageHeightInput.value(imageHeight);
    
    //Create currentAlgorithm Dropdown
    currentAlgorithm = algorithms[0];
    algorithmDropdown = createElement('select');
    for(var i = 0; i < algorithms.length; i++){
        var option = createElement('option');
        option.attribute('value', algorithms[i]);
        option.html(algorithms[i]);
        option.parent(algorithmDropdown);
    }
    algorithmDropdown.position(625, 95);
    
    //Create saveButton
    saveB = createButton('Save Image');
    saveB.position(innerWidth - 171, 170);
    saveB.mousePressed(saveImage);
    
    //Create GenerateButton
    startB = createButton('Generate');
    startB.position(innerWidth - 77, 170);
    startB.mousePressed(generateImage);
    
}

function draw(){
//    console.log(currPos);    
    background(51);
    
    push();
    fill(80);
    noStroke();
    rect(0, 0, innerWidth, headerHeight);
    pop();
    
    push();
    fill(255);
    textFont(myFont);
    textSize(titleFontSize);
    text(title, titleX , titleY);
    titleX = innerWidth / 2 - titleBounds.w / 2;
    
    pop();  
    
    numcolorsSlider.position(20,95);
    pixelsPerDrawSlider.position(210, 95);
    imageWidthInput.position(400, 95);
    imageHeightInput.position(400, 170);
    algorithmDropdown.position(625,95);
    saveB.position(innerWidth - 190, 170);
    startB.position(innerWidth - 87, 170);
    
    push();
    fill(196);
    textSize(20);
    textFont(myFont);
    text('Colors', 20, 85);
    text(numcolorsSlider.value().toString() , 160, 115);
    text('Color Sort Algrm.', 20, 160);
    text('Speed', 210, 85);
    text(pixelsPerDrawSlider.value().toString(), 350, 115);
    text('Image Width(In Pixels)', 400, 85);
    text('Image Height(In Pixels)', 400, 160);
    text('Algorithm', 625, 85);
    pop();
    
    push(); 
    console.log(generating);
    if(this.generating){
        
        for(var i = 0; i < this.newPixelsPerDraw; i++){   
            var myColor = colors[this.currColorIndex];
            increaseColorIndex();
            imageCanvas.stroke(myColor.getR(), myColor.getG(), myColor.getB());
            imageCanvas.noFill();
            imageCanvas.point(currPos.getX(),currPos.getY());

            getNewPos();
            if(!this.generating)break;
        }
    }
    image(imageCanvas, innerWidth/2 - imageWidth/2 ,innerHeight/2 - imageHeight / 2 + headerHeight/2); 
    pop();
}

function generateImage(){
    if(!generating){
        
        currentAlgorithm = algorithmDropdown.elt.value;
        currentColorSortAlgorithm = colorSortDropdown.elt.value;
        
        newPixelsPerDraw = pixelsPerDrawSlider.value();
        NUMCOLORS = numcolorsSlider.value();
        imageWidth = parseInt(imageWidthInput.value());
        imageHeight = parseInt(imageHeightInput.value());

        imageCanvas = createGraphics(imageWidth, imageHeight);
        imageCanvas.background(100);
        currColorIndex = 0;
        lastEmptyX = 0;
        lastEmptyY = 0;

        createColorArray();
        createVistitedArray();
        if(currentAlgorithm != 'RandomWalk8D_V1'){
            currPos = getRandomStart();
        }else{
            currPos = new Position(0,0);
        }
        generating = !generating;

        console.log('Start Drawing :' + generating);
    }
}

function createColorArray(){
    colors = [];
    var color;
    for(var r = 0; r < NUMCOLORS; r++){
        for(var g = 0; g < NUMCOLORS; g++){
            for(var b = 0; b < NUMCOLORS; b++){
                color = new Color(floor(r * 255/(this.NUMCOLORS -1)), floor(g * 255 / (this.NUMCOLORS - 1)), floor(b * 255 / (this.NUMCOLORS - 1)));
                colors.push(color);
            }
        }
    }
//    shuffleArray(colors);    
}

function getRandomStart(){
    var randomX = floor(random(imageWidth));
    var randomY = floor(random(imageHeight));
    return new Position(randomX, randomY);
}

function getNewPos(){
    visited[currPos.getX()][currPos.getY()] = true;
    
    switch(currentAlgorithm){
        case algorithms[0]:
            randomWalk8DV1();
            break;
            
        case algorithms[1]:
            randomWalk8DV2();
            break;
            
    }
}

function saveImage(){
    if(!generating){
        save(imageCanvas, 'myImage.png');
    }
}

function randomWalk8DV1(){
    var newX = currPos.getX();
    var newY = currPos.getY();
    var randomDir;
    
    var mydirections = ['up', 'upright', 'right', 'downright', 'down', 'downleft', 'left', 'upleft'];
    var attempts = 0;
    
    while(visited[newX][newY] && generating){
        
        randomDir = random(mydirections);
        newX = currPos.getX();
        newY = currPos.getY();
        
        if(hasFreeNeighbours8D()){

            switch(randomDir){
                case 'up':
                    newY = decreasePosY(newY);
                    break;

                case 'upright':            
                    newX = increasePosX(newX);
                    newY = decreasePosY(newY);
                    break;

                case 'right':
                    newX = increasePosX(newX);
                    break;

                case 'downright':
                    newX = increasePosX(newX);
                    newY = increasePosY(newY);
                    break;

                case 'down':
                    newY = increasePosY(newY);
                    break;

                case 'downleft':
                    if(newX != 0){
                        newX = decreasePosX(newX);
                        newY = increasePosY(newY);
                    }
                    break;

                case 'left':
                    if(newX != 0){                    
                        newX = decreasePosX(newX);
                    }
                    break;

                case 'upleft':
                    if(newX != 0){
                        newX = decreasePosX(newX);
                        newY = decreasePosY(newY);
                    }
                    break;
            }
        
        }else{
//            console.log('attempt to find a free pixel');
            var foundFreePixel = false;
            for(var i = lastEmptyX; i < imageWidth; i++){
                for(var j = 0; j < imageHeight; j++){
//                    if(i == lastEmptyX)j = lastEmptyY;
                    if(!visited[i][j]){
//                        console.log('found free pixel');
                        foundFreePixel = true;
                        newX = i;
                        lastEmptyX = i;
                        newY = j;
                        lastEmptyY = j;
                        break;
                    }
                }
                if(foundFreePixel)break;
            }
            if(!foundFreePixel){
                generating = false;
//                console.log('isFinished: ' + !generating);
            }
        }
    }    
    console.log(/*'LastDir:' + randomDir + */'NewX:' + newX + ' NewY:' + newY);
    this.currPos.setX(newX);
    this.currPos.setY(newY);
}

function randomWalk8DV2(){
    var newX = currPos.getX();
    var newY = currPos.getY();
    var randomDir;
    
    var mydirections = ['up', 'upright', 'right', 'downright', 'down', 'downleft', 'left', 'upleft'];
    var attempts = 0;
    
    randomDir = random(mydirections);
    
    while(visited[newX][newY] && generating){
        
        attempts++;
        
        if(attempts < imageHeight && attempts < imageWidth){

            switch(randomDir){
                case 'up':
                    newY = decreasePosY(newY);
                    break;

                case 'upright':            
                    newX = increasePosX(newX);
                    newY = decreasePosY(newY);
                    break;

                case 'right':
                    newX = increasePosX(newX);
                    break;

                case 'downright':
                    newX = increasePosX(newX);
                    newY = increasePosY(newY);
                    break;

                case 'down':
                    newY = increasePosY(newY);
                    break;

                case 'downleft':
                    newX = decreasePosX(newX);
                    newY = increasePosY(newY);
                    break;

                case 'left':
                    newX = decreasePosX(newX);
                    break;

                case 'upleft':
                    newX = decreasePosX(newX);
                    newY = decreasePosY(newY);
                    break;
            }
        
        }else{
//            console.log('attempt to find a free pixel');
            var foundFreePixel = false;
            for(var i = 0; i < imageWidth; i++){
                for(var j = 0; j < imageHeight; j++){
                    if(!visited[i][j]){
//                        console.log('found free pixel');
                        foundFreePixel = true;
                        newX = i;
                        newY = j;
                        break;
                    }
                }
                if(foundFreePixel)break;
            }
            if(!foundFreePixel){
                generating = false;
//                console.log('isFinished: ' + !generating);
            }
        }
    }    
    console.log(/*'LastDir:' + randomDir + */'NewX:' + newX + ' NewY:' + newY);
    this.currPos.setX(newX);
    this.currPos.setY(newY);
}

function hasFreeNeighbours8D(){
    var xmin1 = decreasePosX(currPos.getX());
    var x = currPos.getX();
    var xplu1 = increasePosX(currPos.getX());
    var ymin1 = decreasePosY(currPos.getY());
    var y = currPos.getY();
    var yplu1 = increasePosY(currPos.getY());
    
    if(         x > 0 &&
                visited[xmin1][ymin1]&&
                visited[xmin1][y]&&
                visited[xmin1][yplu1]&&
                visited[x][yplu1]&&
                visited[xplu1][yplu1]&&
                visited[xplu1][y]&&
                visited[xplu1][ymin1]&&
                visited[x][ymin1]){
        return false;
    }else if(   x == 0 &&
                visited[x][yplu1]&&
                visited[xplu1][yplu1]&&
                visited[xplu1][y]&&
                visited[xplu1][ymin1]&&
                visited[x][ymin1]){
        return false;
        
    }
    else{
        return true;
    }
}

function increasePosX(myX){
    if(myX == imageWidth-1){
        return 0;
    }else{
        return myX+1;
    }
}

function decreasePosX(myX){
    if(myX == 0){
        return imageWidth-1;
    }else{
        return myX - 1;
    }
}

function increasePosY(myY){
    if(myY == imageHeight-1){
        return 0;
    }else{
        return myY + 1;
    }
}

function decreasePosY(myY){
    if(myY == 0){
        return imageHeight - 1;
    }else{
        return myY - 1;
    }    
}

function createVistitedArray(){
    visited = [];
    for(var x = 0; x < imageWidth; x++){
        var visRow = [];
        for(var y = 0; y < imageHeight; y++){
            visRow.push(false);
        }
        visited.push(visRow);
    }
}

function increaseColorIndex(){
    currColorIndex++;
    if(currColorIndex==colors.length)currColorIndex = 0;
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}