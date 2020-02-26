
// select area to fill
const area = document.querySelector("div#container");

// create pixels
for(let i = 30; i > 0; i--) {
    for( let j = 1; j < 21; j++) {
        div = document.createElement("div");
        div.setAttribute("level", +i);
        div.setAttribute("xy", j+","+i);
        div.setAttribute("x", +j);
        div.setAttribute("y", +i);
        div.style.width = "1.5vw";
        div.style.height = "1.5vw";
        // set creation-site-div's
        if( (j==10 || j==11) && i > 26 ) {
            div.classList.add("start");
        };
        if( i == 27 ) {
            div.classList.add("topline");
        }
        area.appendChild(div);
    }
}

// save the default state...
defaultState = area.innerHTML;

// shape-codes & types
const shapeCodes = [
    [1,3,5,7],  //straight
    [1,3,4,5],  //left club
    [0,2,4,5],  //right-club
    [1,2,3,5],  //protrusion
    [1,2,3,4],  //right-Z
    [0,2,3,5],  //left-Z
    [0,1,2,3]   //cube
]
const shapes = ["straight","left-club","right-club","protrusion","right-Z","left-Z","cube"]

// select start-area & topline
let startArea = Array.from( document.querySelectorAll("div.start") )
let topline = Array.from( document.querySelectorAll(".topline") )

// create shape
let ix;
let currentShape;
let rotation;
function createBlock() {
    rotation = 0; //default rotation
    ix = Math.trunc(Math.random()*10 % 7); // random index
    //choose random shape-code:
    for( let num of shapeCodes[ ix ] ) { 
        startArea[num].classList.add("block", shapes[ ix ]);
    }
    currentShape = shapes[ix];
}


//-------------- Gameplay

function moveHorizontally() {
    // get current block
    block = Array.from( document.querySelectorAll("div.block") );

    // get current block-coords
    blockCoords = [];
    for( let i = 0; i<4; i++) {
        blockCoords.push( block[i].getAttribute("xy") );
    }
    // create new block-coords
    newBlockCoords = blockCoords.map( input => {
        let newX = +input.split(",")[0] + xChange;
        return newX + "," + input.split(",")[1];
        })

    let xCoords;
    xCoords = newBlockCoords.map( input => {
        return input.split(",")[0];
    })
    if( xCoords.includes("0") || xCoords.includes("21") ) return;
    
    // fill new block-pixels
    movedBlock = Array.from( document.querySelectorAll("[xy=\'" + newBlockCoords[0] + "\'],[xy=\'"+newBlockCoords[1]+"\'],[xy=\'"+newBlockCoords[2]+"\'],[xy=\'"+newBlockCoords[3]+"\']") );
    if( movedBlock.map( input => input.classList.contains("landed") ).includes(true) ) {
        return; 
    } else {
        //newBlock = movedBlock;
        block.forEach( input => input.classList.remove("block", currentShape ) );
        movedBlock.forEach( input => input.classList.add("block", currentShape) );
        block = movedBlock;
    }
}

let block = [];
let blockCoords;
let newBlock;
let newBlockCoords;
let speed = 300;
let currentSpeed = speed;

function fallStep() {

    setTimeout( () => {
        // if there's any "landed" pixel in topline it's game over
        if(topline.map( pixel => pixel.classList.contains("landed") ).includes(true) ) {
            alert("Game Over");
            return;
        } else if( restart ) { 
            return;
        }
        // get current block
        block = Array.from( document.querySelectorAll("div.block") );

        // get current block-coords
        blockCoords = [];
        for( let i = 0; i<4; i++) {
            blockCoords.push( block[i].getAttribute("xy") );
        }

        // get new block-coords
        newBlockCoords = blockCoords.map( input => {
            let newY = +input.split(",")[1] - 1;
            return input.split(",")[0] + "," + newY;
            })

        // fill new block-pixels?
        newBlock = Array.from( document.querySelectorAll("[xy=\'" + newBlockCoords[0] + "\'],[xy=\'"+newBlockCoords[1]+"\'],[xy=\'"+newBlockCoords[2]+"\'],[xy=\'"+newBlockCoords[3]+"\']") );
        let yCoords;
        yCoords = newBlockCoords.map( input => { return input.split(",")[1]; })
        // does any pixel of newBlock contain class "landed"? if so, stop falling
        if( newBlock.map( input => input.classList.contains("landed") ).includes(true) ) {
            landBlock();
            return;
        } else if( yCoords.includes("0") ) {
            landBlock();
        } else { 
            block.forEach( input => input.classList.remove("block", currentShape) );
            newBlock.forEach( input => input.classList.add("block", currentShape ) );
            fallStep();
        }
    }, speed)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function landBlock() {
    await sleep(300);
    newBlock = block;
    newBlock.forEach( pixel => {
        pixel.classList.remove("block", currentShape);
        pixel.classList.add("landed", currentShape);
    });

    checkLevels(); // any level filled? if so, clear it, then drop the blocks above
    if( indices.length > 0) { 
        clearLevels(); 
        playSound('TETRISLevel.mp3')
        await sleep(120);
        dropLevels(); 
    };
    indices = [];
    await sleep(100);
    createBlock();
    fallStep();
}

// check if any level(s) are filled
let levelsFilled;
let indices = [];
function checkLevels() {
    levelsFilled = levels.map( level => !level.map( pixel => pixel.classList.contains("landed") ).includes(false) );
    for(let i=0; i<30; i++) {
        if(levelsFilled[i] == true) {
            indices.push(i);
        }
    }
    return indices;
}

// clear any filled level(s)
async function clearLevels() {
    
    for( let index of indices ) {
        levels[index].forEach( input => input.classList.remove("landed", currentShape) );
        levels[index].forEach( input => input.classList.add("cleared") );
    }
    await sleep(100);
    for( let index of indices ) {
        levels[index].forEach( input => input.removeAttribute("class") );
    }

    levelsCleared = indices
    currentSpeed -= 20*levelsCleared.length;
}

let levelsCleared;
let airBlocks;
let nrOfBlocks;
let airBlockCoords;
let droppedBlockCoords;
let dropBlocks;
let landed;
let drop;
topScore = document.querySelector("div#top output")
topScore.textContent = "0"
currentScore = document.querySelector("div#current output")
currentScore.textContent = "0"
function dropLevels() {
    
    drop = levelsCleared.length;
    currentScore.textContent = +( (+currentScore.textContent) + drop*100);
    if( +currentScore.textContent > +topScore.textContent) {
        topScore.textContent = +( (+topScore.textContent) + drop*100);
    }
    landed = Array.from( document.querySelectorAll("div.landed") );

    for( let div of landed ) {
        if( +div.getAttribute("level") > levelsCleared[drop-1] ) {
            div.classList.add("airblock");
        }
    }
    airBlocks = Array.from( document.querySelectorAll("div.airblock") );

    // get current airblock-coords
    nrOfBlocks = airBlocks.length;
    airBlockCoords = [];
    for( let i = 0; i < nrOfBlocks; i++) {
        airBlockCoords.push( airBlocks[i].getAttribute("xy") );
    }
    // get coords to drop to
    droppedBlockCoords = airBlockCoords.map( input => {
        let newY = +input.split(",")[1] - drop;
        return input.split(",")[0] + "," + newY;
        })

    let coordSet; // coords as a string to select with
    for( let coord of droppedBlockCoords) {
        coordSet += ",[xy=\'" + coord + "\']";
    }

    // selected pixels to drop to
    dropBlocks = Array.from( document.querySelectorAll(coordSet) );
    

    airBlocks.forEach( pixel => {
        pixel.classList.remove("landed", "airblock");
        //pixel.classList.remove("airblock")
    });
    let shapesList = airBlocks.map( pixel => pixel.getAttribute("class") );
    airBlocks.forEach( pixel => {
        pixel.removeAttribute("class");
        //pixel.classList.remove("airblock")
    });
    // for each dropblock, add corresponding airblock shape 
    let shapesListLength = shapesList.length;
    for( let i = 0; i < shapesListLength; i++ ){
        dropBlocks[i].classList.add( shapesList[i] );
    }
    dropBlocks.forEach( pixel => {
        pixel.classList.add("landed")//, currentShape);

    });
}
let classLanded;
function rotate() {
    // get current block
    block = Array.from( document.querySelectorAll("div.block") );

    // get current block-coords. or the whole "sphere" ?
    blockCoords = [];
    for( let i = 0; i<4; i++) {
        blockCoords.push( block[i].getAttribute("xy") );
    }

    // create rotated block-coords
    let newX;
    let newY;
    rotatedBlockCoords = []; // get current shape
    if( currentShape == "straight" ) {
        for( let i = 0; i < 4; i++ ) {
            newX = +blockCoords[i].split(",")[0] - (i-1);
            newY = +blockCoords[i].split(",")[1] + (i-1);
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "left-club" ) {

        if( rotation == 1) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1] + 2;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 2) {
            newX = +blockCoords[0].split(",")[0] + 2;
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] + 1;
            newY = +blockCoords[1].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 3) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1] - 2;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if( rotation == 0 ) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] - 1;
            newY = +blockCoords[2].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 2;
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "right-club" ) {
        if( rotation == 1) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] - 1;
            newY = +blockCoords[2].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 2;
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 2) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] - 1;
            newY = +blockCoords[2].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0];
            newY = +blockCoords[3].split(",")[1] + 2;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 3) {
            newX = +blockCoords[0].split(",")[0] + 2;
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] + 1;
            newY = +blockCoords[1].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if( rotation == 0 ) {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1] - 2;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] + 1;
            newY = +blockCoords[1].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "protrusion" ) {
        if( rotation == 1) {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] + 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 2) {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] + 1;
            newY = +blockCoords[1].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0];
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        } else if(rotation == 3) {
            newX = +blockCoords[0].split(",")[0] - 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0];
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        } else if( rotation == 0 ) {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] - 1;
            newY = +blockCoords[2].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0];
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "right-Z" ) {
        if( rotation == 1 || rotation == 3) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] + 1;
            newY = +blockCoords[1].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0];
            newY = +blockCoords[3].split(",")[1] + 2;
            rotatedBlockCoords.push( newX + "," + newY );
        } else {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1] - 2;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] - 1;
            newY = +blockCoords[1].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0];
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "left-Z" ) {
        if( rotation == 1 || rotation == 3) {
            newX = +blockCoords[0].split(",")[0] + 1;
            newY = +blockCoords[0].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0];
            newY = +blockCoords[1].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] - 1;
            newY = +blockCoords[2].split(",")[1] - 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] - 2;
            newY = +blockCoords[3].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
        } else {
            newX = +blockCoords[0].split(",")[0];
            newY = +blockCoords[0].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[1].split(",")[0] - 1;
            newY = +blockCoords[1].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[2].split(",")[0] + 2;
            newY = +blockCoords[2].split(",")[1];
            rotatedBlockCoords.push( newX + "," + newY );
            newX = +blockCoords[3].split(",")[0] + 1;
            newY = +blockCoords[3].split(",")[1] + 1;
            rotatedBlockCoords.push( newX + "," + newY );
        }
    } else if( currentShape == "cube" ) {
        return;
    }


    rotatedBlock = Array.from( document.querySelectorAll("[xy=\'" + rotatedBlockCoords[0] + "\'],[xy=\'"+rotatedBlockCoords[1]+"\'],[xy=\'"+rotatedBlockCoords[2]+"\'],[xy=\'"+rotatedBlockCoords[3]+"\']") );
    let xCoords = rotatedBlockCoords.map( coord => coord.split(",")[0] );
    let yCoords = blockCoords.map( coord => coord.split(",")[1] );
    classLanded = rotatedBlock.reduce( (total, div) => { 
        return (total || div.classList.contains("landed") ) ;
    }, false)
    if( xCoords.includes("0") || xCoords.includes("21") ) { 
        return; // unables rotation into walls
    } else if( classLanded ) { // does to rotated block to be contain any landed pixel? if so, return, don't rotate
        return; // unables rotation into other blocks
    } else if( yCoords.includes("1") ) {
        return;
    }
    newBlockCoords = rotatedBlockCoords;
    block.forEach( pixel => pixel.classList.remove("block", currentShape) );
    rotatedBlock.forEach( pixel => pixel.classList.add("block", currentShape) );


}

window.addEventListener("keydown", (e) => {
    if( e.key === "w" || e.key === "ArrowUp" ) {
        // rotate current block...
        rotation = (rotation + 1) % 4;
        rotate();
    }

})

let xChange;
quickSpeed = 20;
superSpeed = 4;
window.addEventListener("keydown", (e) => {

    if( e.key === "a" || e.key === "ArrowLeft" ) {
        xChange = -1;
        moveHorizontally();
    } else if( e.key === "d" || e.key === "ArrowRight" ) {
        xChange = 1;
        moveHorizontally();
    } else if( e.key === "s" || e.key === "ArrowDown") {
        speed = quickSpeed;
    } else if ( e.key === " ") {
        speed = superSpeed;
    };
})

window.addEventListener("keyup", (e) => {
    if( e.key === "s" || e.key === "ArrowDown") {
        speed = currentSpeed;
    } else if( e.key === " ") {
        speed = currentSpeed;
    }
})

const button = document.querySelector("button");
let restart = false;
// create array of levels
let levels = [];

button.addEventListener("click", () => { 
    if( button.textContent == "Play!") {

        for( let i = 1; i<31; i++) {
        levels.push( Array.from( document.querySelectorAll("[level=\'"+ i +"\']") ) );
        }
        createBlock();
        button.textContent = "Reset";
        restart = false;   
        fallStep();
        a = playSound("Calibre-BelfastGrammar-_If_you_wait.mp3");
    } else if( button.textContent == "Reset") {

        currentScore.textContent = "0";
        stopSound(a);
        area.innerHTML = defaultState;
        speed = 250;
        startArea = Array.from( document.querySelectorAll("div.start") );
        topline = Array.from( document.querySelectorAll(".topline") );
        button.textContent = "Play!"
        restart = true;
        block = [];
        levels = [];
    }

});

let a;
function playSound(url) { // in use
        a = new Audio(url);
        a.play();
    return a;
}

function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

async function playAudio() { // not in use
    var audio = new Audio('https://file-examples.com/wp-content/uploads/2017/11/file_example_WAV_1MG.wav');  
    audio.type = 'audio/wav';
  
    try {
      await audio.play();
      console.log('Playing...');
    } catch (err) {
      console.log('Failed to play...' + error);
    }
  }

