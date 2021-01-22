//STILL NEED RANDOM WALLS OPTION, VISUAL STEPS OPTION, MANUAL WALLS OPTION, and START AND END INPUTS.
window.onload=function() {
    canv= document.getElementById("display");
    form = document.querySelector(".form");
    donedraw = document.querySelector(".draw");
    refresh = document.querySelector(".refresh");
    display=canv.getContext("2d");
    state = null;
    startx=0;
    starty=0;
    endx=39;
    endy=39;
    randomwalls= 0;
    manualwalls= 0;
    visualstep = 0;
    isDrawing = false;
    let xx = 0;
    let yy = 0;
}

function validinput(){
    if (startx > 39|| starty > 39|| endx > 39 || endy > 39){
        document.getElementById("gamestate").innerHTML = "Invalid numbers, please keep values in range 0-39";
    }
    else{
            if (manualwalls == 1){
                form.classList.toggle("close");
                donedraw.classList.toggle("open");
            }
            document.getElementById("gamestate").innerHTML = "Running PathFinder";
            main();
    }
}
function main(){
    col=row=40;
    pixelsize=10;
    openset=[];
    closedset=[];
    path=[];
    let Array2D = (r,c) => [...Array(r)].map(x=>Array(c).fill(0));
    grid=Array2D(row,col);
    for (var y = 0; y < row; y++){
        for (var x = 0; x < col; x++){
            grid[y][x] = new node(x,y,randomwalls);
        }
    }
    start=grid[starty][startx];
    start.gvalue = 0;
    end = grid[endy][endx];
    openset.push(start);
    setNeighbors();
    visual();

}
function setNeighbors(){
    for (var y = 0; y < row; y++){
        for (var x = 0; x < col; x++){
            grid[y][x].addneighbors();
        }
    }
}


function visual(){

    display.fillStyle="lightyellow"; 
    display.fillRect(0,0,canv.width,canv.height); //sets background color of display
    for (var y = 0; y < row; y ++){
        for (var x = 0; x < col; x++){
            if (grid[y][x].wall == true){
                display.fillStyle= "black";
                display.fillRect(x*pixelsize, y*pixelsize, pixelsize, pixelsize); //sets walls as black
            }
        }
    }
    renamelater(); 
    if (manualwalls == 1){
        drawingWalls();
    }
    else{
        if (visualstep == 1){
            return startv2();
        }
        else{
            return startv1();
        }
    }
}

function findpath(){
    if (openset.length > 0){
        lowestindex = 0;

        //can use priority queue for openset to improve runtime
        for (var i = 0; i < openset.length; i++){
            if (openset[i].fvalue < openset[lowestindex].fvalue){
                lowestindex = i;
            }
        }
        tempnode = openset[lowestindex];
        if (tempnode == end){
            temp = end;
            while (temp != null){
                path.push(temp);
                temp = temp.previous;
            }
            renamelater2();
            renamelater();
            if (visualstep == 1){
                return endv2();
            }
            else{
                return endv1();
            }
        }
        else {
            openset.splice(lowestindex, 1);
            closedset.push(tempnode);

            tempnode.neighbors.forEach(element => {
                if ((!closedset.includes(element)) && (element.wall == false)){
                    if ((tempnode.gvalue + 1) < element.gvalue){
                        element.gvalue = tempnode.gvalue + 1;
                        element.hvalue = element.heuristic();
                        element.fvalue = element.gvalue + element.hvalue;
                        element.previous = tempnode;
                        if (!openset.includes(element)){
                            openset.push(element);
                        }
                    }
                }
            });
        }
    }
    else{
        console.log("No Solution");
        renamelater2();
        renamelater();
        if (visualstep == 1){
            return endv2();
        }
        else{
            return endv1();
        }
    }
    //visual step check
    if (visualstep == 1){
        renamelater2();
        renamelater();
    }
    return false;
}


//No visual steps (faster)
function startv1(){
    while (findpath() == false){
        continue;
    }
}
function endv1(){
    return true;
}
//For visual steps
function startv2(){
    
    if (state != null){
        endv2();
    }
    state = setInterval(findpath,1000/70);
}
function endv2(){
    clearInterval(state);
    return;
}


function renamelater(){
    display.fillStyle= "orange";
    display.fillRect(startx*pixelsize, starty*pixelsize, pixelsize, pixelsize); //start as green
    display.fillStyle= "orange";
    display.fillRect(endx*pixelsize, endy*pixelsize, pixelsize, pixelsize); //end as red
}

function renamelater2(){
    openset.forEach(element => {
        display.fillStyle= "green";
        display.fillRect(element.x*pixelsize, element.y*pixelsize, pixelsize, pixelsize);
    });
    closedset.forEach(element => {
        display.fillStyle= "red";
        display.fillRect(element.x*pixelsize, element.y*pixelsize, pixelsize, pixelsize);
    });
    path.forEach(element => {
        display.fillStyle= "blue";
        display.fillRect(element.x*pixelsize, element.y*pixelsize, pixelsize, pixelsize);
    });
}

class node{
    constructor (x, y, randwalls = 0){
        this.x = x;
        this.y = y;
        this.gvalue = Infinity;
        this.fvalue = Infinity;
        this.hvalue = 0;
        this.neighbors = [];
        this.previous = null;
        this.wall = false;

        /*generates random walls*/
        if (randwalls == 1){
            let rand = Math.floor(Math.random()*10);
            if (rand < 4 && this.check()){
                this.makewall();
            }
        }
    }
    makewall(){
        this.wall = true;
    }

    check(){
        return !((this.x == startx && this.y == starty) || (this.x == endx && this.y == endy));
    }

    addneighbors(){
        if (this.y < row-1){
            this.neighbors.push(grid[this.y + 1][this.x]);
        }
        if (this.y > 0){
            this.neighbors.push(grid[this.y - 1][this.x]);
        }
        if (this.x < col-1){
            this.neighbors.push(grid[this.y][this.x+1]);
        }
        if (this.x > 0){
            this.neighbors.push(grid[this.y][this.x - 1]);
        }
        if (this.y > 0 && this.x > 0){
            this.neighbors.push(grid[this.y -1][this.x - 1]);
        }
        if (this.y < row-1 && this.x < col-1){
            this.neighbors.push(grid[this.y +1][this.x + 1]);
        }
        if (this.y < row-1 && this.x > 0){
            this.neighbors.push(grid[this.y + 1][this.x - 1]);
        }
        if (this.y > 0 && this.x < col -1){
            this.neighbors.push(grid[this.y -1][this.x + 1]);
        }
    }
    heuristic(){
        return Math.sqrt((this.x - endx)*(this.x - endx) + (this.y - endy)*(this.y - endy));
    }
    
}

//prevents inputting anything other than numbers
function numberonly() {
    var e = event || window.event;  // get event object
    var key = e.keyCode || e.which; // get key cross-browser
    if ((key < 48 || key > 57) && key != 8) { //if it is not a number ascii code (excluding backspace)
        //Prevent default action, which is displaying character
        if (e.preventDefault) e.preventDefault(); //normal browsers
        e.returnValue = false; //IE
    }
}

function setRandomWalls(){
    if (randomwalls == 0){
        randomwalls = 1;
    }
    else{
        randomwalls = 0;
    }
}
function setManualWalls(){
    if (manualwalls == 0){
        manualwalls = 1;
    }
    else{
        manualwalls = 0;
    }
}
function setVisualSteps(){
    if (visualstep == 0){
        visualstep  = 1;
    }
    else{
        visualstep  = 0;
    }
}
function setStartx(){
    if (document.getElementById("startx").value != ""){
        startx = document.getElementById("startx").value;
    }
}
function setStarty(){
    if (typeof document.getElementById("startx").value != ""){
        starty = document.getElementById("starty").value;
    }
}
function setEndx(){
    if (typeof document.getElementById("startx").value != ""){
        endx = document.getElementById("endx").value;
    }
}
function setEndy(){
    if (typeof document.getElementById("startx").value != ""){
        endy = document.getElementById("endy").value;
    }
}

function drawingWalls(){
    
    canv.addEventListener('mousedown', foo, true);
      
    canv.addEventListener('mousemove', foo2, true);
      
    window.addEventListener('mouseup', foo3, true);
      
}
function foo(e){
    xx = e.offsetX;
    yy = e.offsetY;
    isDrawing = true;
}
function foo2(e){
    if (isDrawing === true) {
        drawLine(display, xx, yy, e.offsetX, e.offsetY);
        xx = e.offsetX;
        yy = e.offsetY;
    }
}
function foo3(e){
    if (isDrawing === true) {
        drawLine(display, xx, yy, e.offsetX, e.offsetY);
        xx = 0;
        yy = 0;
        isDrawing = false;
      }
}
function drawLine(context, x1, y1, x2, y2) {    
    if ( !(Math.floor(y1/pixelsize) == starty && Math.floor(x1/pixelsize) == startx) && 
    !(Math.floor(y1/pixelsize) == endy && Math.floor(x1/pixelsize) == endx)  ){
        grid[Math.floor(y1/pixelsize)][Math.floor(x1/pixelsize)].wall = 1;
        display.fillStyle= "black";
        display.fillRect(Math.floor(x1/pixelsize)*pixelsize, Math.floor(y1/pixelsize)*pixelsize, pixelsize, pixelsize);
    }
}
function donedrawing(){
    canv.removeEventListener('mousedown', foo, true);
    canv.removeEventListener('mousemove' , foo2, true);
    window.removeEventListener('mouseup', foo3, true);
    // form.classList.toggle("close");
    donedraw.classList.toggle("close");
    if (visualstep == 1){
        startv2();
    }
    else{
        startv1();
    }
    refresh.classList.toggle("open");
}