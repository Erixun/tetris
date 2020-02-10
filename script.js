
// select area to fill
const area = document.querySelector("div#container");

// create pixels
for(let i = 30; i > 0; i--) {
    for( let j = 1; j < 21; j++) {
        div = document.createElement("div");
        div.setAttribute("xy", j+","+i);
        div.setAttribute("level", +i);
        //div.setAttribute("x", j);
        div.style.width = "18px";
        div.style.height = "18px";
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

// shape-codes
const shapeCodes = [
    [1,3,5,7],  //straight
    [1,3,4,5]//,  //left club
    [0,2,4,5],  //right club
    [1,2,3,5],  //protrusion
    [1,2,3,4],  //right Z
    [0,2,4,5],  //left Z
    [0,1,2,3]   //cube
]
const shapes = ["straight","left club","right club","protrusion","right Z","left Z","cube"]

// select start-area
const startArea = Array.from( document.querySelectorAll("div.start") )
const topline = Array.from( document.querySelectorAll(".topline") )
// create shape
let ix;
let currentShape;
let rotation;
function createBlock() {
    rotation = 0;
    ix = Math.trunc(Math.random()*10 % 7); // random index
    for( let num of shapeCodes[ ix ] ) { //choose random shape-code
        startArea[num].classList.add("block");
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
    temp = Array.from( document.querySelectorAll("[xy=\'" + newBlockCoords[0] + "\'],[xy=\'"+newBlockCoords[1]+"\'],[xy=\'"+newBlockCoords[2]+"\'],[xy=\'"+newBlockCoords[3]+"\']") );
    if( temp.map( input => input.classList.contains("landed") ).includes(true) ) {
        return; 
    } else {
        newBlock = temp;
        block.forEach( input => input.classList.remove("block") );
        newBlock.forEach( input => input.classList.add("block") );
    }
}

let block = [];
let blockCoords;
let newBlock;
let newBlockCoords;
let speed = 200;
createBlock();
function fallStep() {

    setTimeout( () => {
        // if there's any "landed" pixel in topline it's game over
        if(topline.map( pixel => pixel.classList.contains("landed") ).includes(true) ) {
            alert("Game Over");
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
        
        // does any pixel of newBlock contain class "landed"? if so, stop falling
        if( newBlock.map( input => input.classList.contains("landed") ).includes(true) ) {
            landBlockTop();
            return;
        } else { 
            block.forEach( input => input.classList.remove("block") );
            newBlock.forEach( input => input.classList.add("block") );
        }

        // get y-coordinates of the new block
        let yCoords;
        yCoords = newBlockCoords.map( input => { return input.split(",")[1]; })
        // is the new block not at bottom level? if so, keep falling
        if( !yCoords.includes("1") ) {
            fallStep();
        } else { // make it landed
            landBlockBottom();
        };
    }, speed)
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function landBlockTop() {
    await sleep(200);
    block.forEach( pixel => {
        pixel.classList.add("landed");
        pixel.classList.remove("block");
    });

    checkLevels(); // any level filled? if so, clear it, then drop the blocks above
    if( indices.length > 0) { 
        clearLevels(); 
        await sleep(120);
        dropLevels(); 
    };
    indices = [];
    await sleep(100);
    createBlock();
    fallStep();
}
async function landBlockBottom() {
    await sleep(200);
    newBlock.forEach( pixel => {
        pixel.classList.add("landed");
        pixel.classList.remove("block");
    });
    checkLevels();
    if( indices.length > 0) { 
        clearLevels(); 
        await sleep(120);
        dropLevels(); 
    };
    indices = [];
    await sleep(100);
    createBlock();
    fallStep();
}

let xChange;
window.addEventListener("keydown", (e) => {
    console.log(e.key);
    if( e.key === "a" || e.key === "ArrowLeft" ) {
        xChange = -1;
        moveHorizontally();
    } else if( e.key === "d" || e.key === "ArrowRight" ) {
        xChange = 1;
        moveHorizontally();
    } else if( e.key === "s" || e.key === "ArrowDown") {
        speed = 10;
    }
})
window.addEventListener("keyup", (e) => {
    if( e.key === "s" || e.key === "ArrowDown") {
        speed = 200;
    }
})

const levels = [];
for( let i = 1; i<31; i++) {
    levels.push( Array.from( document.querySelectorAll("[level=\'"+ i +"\']") ) );
}


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


async function clearLevels() {

    for( let index of indices ) {
        levels[index].forEach( input => input.classList.remove("landed") );
        levels[index].forEach( input => input.classList.add("cleared") );
    }
    await sleep(100);
    for( let index of indices ) {
        levels[index].forEach( input => input.classList.remove("cleared") );
    }

    levelsCleared = indices
}
let levelsCleared;
let airBlocks;
let nrOfBlocks;
let airBlockCoords;
let droppedBlockCoords;
let dropBlocks;
let landed;
let drop;
function dropLevels() {
    
    drop = levelsCleared.length;
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

        pixel.classList.remove("landed");
        pixel.classList.remove("airblock")
    });
    dropBlocks.forEach( pixel => {
        pixel.classList.add("landed");

    });
}

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
    } else if( currentShape == "left club" ) {

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
    } else if( currentShape == "right club" ) {
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
    } else if( currentShape == "right Z" ) {
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
    } else if( currentShape == "left Z" ) {
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

    console.log(rotatedBlockCoords)

    rotatedBlock = Array.from( document.querySelectorAll("[xy=\'" + rotatedBlockCoords[0] + "\'],[xy=\'"+rotatedBlockCoords[1]+"\'],[xy=\'"+rotatedBlockCoords[2]+"\'],[xy=\'"+rotatedBlockCoords[3]+"\']") );
    
    block.forEach( pixel => pixel.classList.remove("block") );
    rotatedBlock.forEach( pixel => pixel.classList.add("block") );


}

window.addEventListener("keydown", (e) => {
    if( e.key === " ") {
        // rotate current block...
        rotation = (rotation + 1) % 4;
        rotate();
    }
    console.log(rotation);
})
