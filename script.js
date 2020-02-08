
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
    [1,3,4,5],  //left club
    [0,2,4,5],  //right club
    [1,2,3,5],  //protrusion
    [1,2,3,4],  //right Z
    [0,2,4,5],  //left Z
    [0,1,2,3]   //cube
]

// select start-area
const startArea = Array.from( document.querySelectorAll("div.start") )
const topline = Array.from( document.querySelectorAll(".topline") )
// create shape
function createBlock() {
    for( let num of shapeCodes[ Math.trunc(Math.random()*10 % 7) ] ) { //choose random shape-code
        startArea[num].classList.add("block");
    }
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

    
    newBlockCoords = blockCoords.map( input => {
        let newX = +input.split(",")[0] + xChange;
        return newX + "," + input.split(",")[1];
        })
    console.log(newBlockCoords)

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
        
        // does any pixel of newBlock contain class "landed"? if so, stop
        if( newBlock.map( input => input.classList.contains("landed") ).includes(true) ) {
            block.forEach( pixel => {
                pixel.classList.add("landed");
                pixel.classList.remove("block");
            });
            checkLevels();
            if( indices.length > 0) { clearLevels(); indices = []; };
            createBlock();
        } else { 
            block.forEach( input => input.classList.remove("block") );
            newBlock.forEach( input => input.classList.add("block") );
        }

        // is the new block at bottom level? if so, make it landed
        let yCoords;
        yCoords = newBlockCoords.map( input => { return input.split(",")[1]; })

        if( !yCoords.includes("1") ) {
            fallStep();
        } else {
            landBlock();
        };
    }, speed)
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function landBlock() {
    await sleep(250);
    newBlock.forEach( pixel => {
        pixel.classList.add("landed");
        pixel.classList.remove("block");
    });
    checkLevels();
    if( indices.length > 0) { clearLevels() };
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


function clearLevels() {

    for( let index of indices ) {
        levels[index].forEach( input => input.classList.remove("landed") );
    }
 
}