function ricarica(){ window.location.href = "./indexRemixMode.html";}
var canvas = document.getElementById("myCanvasRemix");
var ctx = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
var canvasW = canvas.width;
var canvasH = canvas.height;
var w = canvasW;
var h = canvasH;

var coloreSfondo="#212121";
var coloreSfondoAlter="#EDE7F6";
var coloreSnake="#9B26AF";
var coloreFood="#68EFAD";

var storage = window.localStorage;
var tempo=0;
var xTemp, yTemp;

//Lets save the cell width in a variable for easy control
var cw = 15;
var d;
var food;
var bonus;
var score;
var scoreTemp=0;
var record=0;

//Lets create the snake now
var snake_array; //an array of cells to make up the snake
var nx, ny;
var vel=90;

var trasparenza=0;
var giocando=true;
var isBonus=false;
var bonusContatore=0;
var timerBonus=0;
var bonusTempoLimite=100;
var bonusDurata=500;
var pausa=false;
var pausaX=canvasW-35;
var pausaY=20;
var pausaW=20;
var pausaImg= new Image();
pausaImg.src="./img/pausa.png";

var suonoCibo = new Audio("./sound/Eat.mp3");
var suonoBonus = new Audio("./sound/Bonus.mp3");
var suonoCuore = new Audio("./sound/Heartbeat.mp3");

var enemy=[];
var contatoreEnemy=0;
var contatoreEnemyTemp=0;

function init()
{
    d = "down"; //default direction
    create_snake();
    create_food(); //Now we can see the food particle
    create_bonus();
    nx = snake_array[0].x;
    ny = snake_array[0].y;
    //finally lets display the score
    vel=90;
    score = 0;
    scoreTemp=0;
    clearInterval(intervallo);
    record=storage.getItem('record');
    enemy[0]={x: 0, y: h};
}
init();

function create_snake()
{
    var length = 5; //Length of the snake
    snake_array = []; //Empty array to start with
    for(var i = length-1; i>=0; i--)
    {
        //This will create a horizontal snake starting from the top left
        snake_array.push({x: i, y:0});
    }
}

//Lets create the food now
function create_food()
{
    food = {
        x: Math.round(Math.random()*(w-cw)/cw), 
        y: Math.round(Math.random()*((h-cw)/cw-1)+1), 
    };
    //This will create a cell with x/y between 0-44
    //Because there are 45(450/10) positions accross the rows and columns
}
function create_bonus()
{
    bonus = {
        x: Math.round(Math.random()*(w-cw)/cw), 
        y: Math.round(Math.random()*(h-cw)/cw), 
    };
}

function create_enemy()
{
    if(contatoreEnemy>=contatoreEnemyTemp+12*cw)
    {
        var lungTemp=enemy.length;
        contatoreEnemyTemp=contatoreEnemy;
        for(var i=lungTemp;i<lungTemp+3;i++)
        {
            enemy[i]={x: cw*Math.round(Math.random()*(w-cw)/cw),  y: h};
        }
    }
    contatoreEnemy++;
}

//Lets paint the snake now
function paint()
{
    if(giocando)
    {
        if(score>=scoreTemp+5 && vel>=50)
        {
            scoreTemp=score;
            vel-=10;
            bonusTempoLimite+=100;
            bonusDurata+=100;
            clearInterval(intervallo);
            intervallo=setInterval(paint,vel);
        }
        if(score>=scoreTemp+10 && vel>=40 && vel<50)
        {
            scoreTemp=score;
            vel-=5;
            bonusTempoLimite+=100;
            bonusDurata+=100;
            clearInterval(intervallo);
            intervallo=setInterval(paint,vel);
        }
        //To avoid the snake trail we need to paint the BG on every frame
        //Lets paint the canvas now
        ctx.beginPath();
        ctx.fillStyle = coloreSfondo;
        ctx.fillRect(0, 0, w, h);
        //ctx.strokeStyle = "#691A99";
        //ctx.strokeRect(0, 0, w, h);
        ctx.closePath();

        //The movement code for the snake to come here.
        //The logic is simple
        //Pop out the tail cell and place it infront of the head cell
        nx = snake_array[0].x;
        ny = snake_array[0].y;
        xTemp=nx;
        yTemp=ny;
        //These were the position of the head cell.
        //We will increment it to get the new head position
        //Lets add proper direction based movement now
        if(d == "right")
        {
            nx++;
        }
        else if(d == "left")
        {
            nx--;
        }
        else if(d == "up")
        {
            ny--;
        }
        else if(d == "down")
        {
            ny++;
        }

        //Lets add the game over clauses now
        //This will restart the game if the snake hits the wall
        //Lets add the code for body collision
        //Now if the head of the snake bumps into its body, the game will restart
        // sommo mezza casella + cw/(2*cw)
        if(nx < 0 || nx + cw/(2*cw)> canvasW/cw || ny <0 || ny > canvasH/cw || check_collision(nx, ny, snake_array) || check_collision_enemy(nx, ny, snake_array, enemy))
        {
            salva(score);
            //restart game
            init();
            // salva
            ricarica();
            //Lets organize the code a bit now.
            return;
        }
        //Lets write the code to make the snake eat the food
        //The logic is simple
        //If the new head position matches with that of the food,
        //Create a new head instead of moving the tail
        if(nx == food.x && ny == food.y)
        {
            var tail = {x: nx, y: ny};
            score++;
            suonoCibo.play();
            //Create new food
            create_food();
        }
        else
        {
            var tail = snake_array.pop(); //pops out the last cell
            tail.x = nx; tail.y = ny;
        }
        //The snake can now eat the food.

        snake_array.unshift(tail); //puts back the tail as the first cell

        for(var i = 0; i < snake_array.length; i++)
        {
            var c = snake_array[i];
            //Lets paint 10px wide cells
            paint_cell(c.x, c.y);
        }
        
        /// BONUS
        var bonusRandom=Math.floor(Math.random() * 10) + 1; // prob 1/10
        timerBonus++;
        if( bonusRandom <=1 && !isBonus && timerBonus>=bonusTempoLimite) 
        {
            timerBonus=0;
            create_bonus();
            isBonus=true;
        }
        
        if(isBonus)
        {
            bonusContatore+=10;
            paint_bonus(bonus.x, bonus.y);
            if(bonusContatore>=bonusDurata)
            {
                bonusContatore=0;
                isBonus=false;
                bonus.x=-50;
                bonus.y=-50;
            }
        }
        if(nx == bonus.x && ny == bonus.y)
        {
            score+=10;
            suonoBonus.play();
            isBonus=false;
            bonus.x=-50;
            bonus.y=-50;
        }

        //Lets paint the food
        paint_food(food.x, food.y);
        
        drawPausa();
        drawScore();
        //requestAnimationFrame(paint);

        if(score>record && score>40)
        {
            suonoCuore.play();
        }
        create_enemy();
        paint_enemy();
    }
    if(pausa)
    {
        giocando=false;
        ctx.beginPath();
        ctx.rect(0, 0, canvasW, canvasH/2);
        ctx.shadowOffsetX=1;
        ctx.shadowOffsetY=1;
        ctx.fillStyle=coloreSnake;
        ctx.globalAlpha=trasparenza;
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.rect(0, canvasH/2, canvasW, canvasH);
        ctx.fillStyle=coloreFood;
        ctx.globalAlpha=trasparenza;
        ctx.shadowOffsetX=1;
        ctx.shadowOffsetY=1;
        ctx.fill();
        ctx.font = "30px Arial";
        ctx.fillStyle = coloreSfondo;
        ctx.shadowOffsetX=1;
        ctx.shadowOffsetY=1;
        ctx.shadowColor = "transparent";
        ctx.textAlign = "center";
        ctx.fillText("Resume", canvas.width/2, canvas.height/4);
        ctx.fillText("Restart", canvas.width/2, 3*canvas.height/4);
        ctx.closePath();
        trasparenza+=0.1;
        
        drawScore();
    }
}
var intervallo=setInterval(paint,vel); ///////////////////////////////////////////////////

//paint();
//Lets first create a generic function to paint cells
var servePerRestore=false;
function paint_cell(x, y)
{
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = coloreSnake;
    ctx.rect(x*cw, y*cw, cw, cw);
    ctx.fill();
    ctx.closePath();
    ctx.save();
    //ctx.strokeStyle = "#691A99";
    //ctx.strokeRect(x*cw, y*cw, cw, cw);
}
function paint_food(x, y)
{
    ctx.beginPath();
    ctx.fillStyle = coloreFood;
    ctx.rect(x*cw, y*cw, cw, cw);
    ctx.shadowColor="#424242";
    ctx.shadowBlur=20;
    ctx.shadowOffsetX=0;
    ctx.shadowOffsetY=1;
    ctx.fill();
    ctx.closePath();
    //ctx.strokeStyle = "#691A99";
    //ctx.strokeRect(x*cw, y*cw, cw, cw);
}
var bonusAlt=1;
function paint_bonus(x, y)
{
    if(bonusAlt>0)
    {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.rect(x*cw, y*cw, cw, cw);
        ctx.shadowColor="#424242";
        ctx.shadowBlur=20;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=1;
        ctx.fill();
        ctx.closePath();
    }
    if(bonusAlt<0)
    {
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.rect(x*cw, y*cw, cw, cw);
        ctx.shadowColor="#424242";
        ctx.shadowBlur=20;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=1;
        ctx.fill();
        ctx.closePath();
    }
    bonusAlt=bonusAlt*(-1);
    
}

function check_collision(x, y, array)
{
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for(var i = 0; i < array.length; i++)
    {
        if(array[i].x == x && array[i].y == y)
         return true;
    }
    return false;
}

function check_collision_enemy(x, y, snake, enemy)
{
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for(var s=0; s<snake.length; s++)
    {
    for(var i = 0; i < enemy.length; i++)
    {
        var yTemp=enemy[i].y/cw;
        var xTemp=enemy[i].x/cw;
        if(x==xTemp && y>= yTemp && y<= yTemp+3 || (snake[s].x==xTemp && yTemp>=snake[s].y && yTemp<=snake[s].y+1 ))
        {
            return true;
        }
    }
    }
    return false;
}

function paint_enemy()
{
    for(var i=0; i<enemy.length;i++)
    {
        ctx.beginPath();
        ctx.fillStyle="red";
        ctx.fillRect(enemy[i].x, enemy[i].y--, cw, cw*3);
        ctx.closePath();
    }
}

function drawScore()
{
    //Lets paint the score
    var score_text = "" + score;
    ctx.beginPath();
    ctx.fillStyle=coloreFood;
    ctx.font = "30px Arial";
    ctx.fillText(score_text, canvasW/2-10, 40);
    ctx.closePath();
}

function drawPausa()
{
    ctx.drawImage(pausaImg, pausaX, pausaY);
}

//salva
function salva(score)
{
    storage.removeItem('lastScore_remix');
    storage.setItem('lastScore_remix', score);
    if(score>storage.getItem('record_remix'))
        {
            storage.removeItem('record_remix'); // Pass a key name to remove that key from storage.
            storage.setItem('record_remix', score); // Pass a key name and its value to add or update that key.
        }
}

// C O M M M M A N D S

// T O U C H
document.addEventListener("touchstart", touchStart, false);
document.addEventListener("touchmove", touchMove, false);
//document.addEventListener("touchend", touchEnd, false);

var toccoX, toccoY;

function touchStart(e)
{
    if(e.touches) 
    {
        toccoX = e.touches[0].pageX - canvas.offsetLeft;
        toccoY = e.touches[0].pageY - canvas.offsetTop;
        
        if(pausa && toccoY<canvasH/2)
        {
            pausa=false;
            giocando=true;
        }
        if(pausa && toccoY>canvasH/2)
        {
            ricarica();
        }
        
        if(toccoX>=pausaX && toccoY<=pausaY+pausaW && giocando)
        {
            pausa=true;
        }
    }
    e.preventDefault();
}

function touchMove(e)
{
    if(e.touches) 
    {
        var newToccoX = e.touches[0].pageX - canvas.offsetLeft;
        var newToccoY = e.touches[0].pageY - canvas.offsetTop;
        
        if((newToccoX-toccoX)*(newToccoX-toccoX)>(newToccoY-toccoY)*(newToccoY-toccoY))
        {
            if(newToccoX>toccoX && d!="left" && d!="right" && nx>=xTemp)
            {
                d="right";
            }

            if(newToccoX<toccoX && d!="right" && d!="left" && nx<=xTemp) 
            {
                d="left";
            } 
        }
        else
        {
            if(newToccoY>toccoY && d!="up" && d!="down" && ny>=yTemp) // controllo che non stesse salendo
            {
                d="down";
            }

            if(newToccoY<toccoY && d!="down" && d!="up" && ny<=yTemp)// controllo che non stesse scendendo
            {
                d="up";
            }
        }
    }
    e.preventDefault();
}
