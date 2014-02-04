//
//  spaceInvadersExample.js
//  hifi
//
//  Created by Brad Hefta-Gaub on 1/30/14.
//  Copyright (c) 2014 HighFidelity, Inc. All rights reserved.
//
//  This is an example script that demonstrates a simple space invaders style of game
//

var iteration = 0;

var gameOver = false;

// horizontal movement of invaders
var invaderStepsPerCycle = 120; // the number of update steps it takes then invaders to move one column to the right
var invaderStepOfCycle = 0; // current iteration in the cycle
var invaderMoveDirection = 1; // 1 for moving to right, -1 for moving to left

var itemLifetimes = 60 * 2; // 2 minutes


// position the game to be basically near the avatar running the game...
var gameSize = { x: 10, y: 20, z: 1 };
var positionFromAvatarZ = 10;

var avatarX = MyAvatar.position.x;
var avatarY = MyAvatar.position.y;
var avatarZ = MyAvatar.position.z;
var gameAtX = avatarX;
var gameAtY = avatarY;
var gameAtZ = avatarZ;

// move the game to be "centered" on our X
if (gameAtX > (gameSize.x/2)) {
    gameAtX -= (gameSize.x/2);
}

// move the game to be "offset slightly" on our Y
if (gameAtY > (gameSize.y/4)) {
    gameAtY -= (gameSize.y/4);
}


// move the game to be positioned away on our Z
if (gameAtZ > positionFromAvatarZ) {
    gameAtZ -= positionFromAvatarZ;
}

var gameAt = { x: gameAtX, y: gameAtY, z: gameAtZ };
var middleX = gameAt.x + (gameSize.x/2);
var middleY = gameAt.y + (gameSize.y/2);

var shipSize = 0.2;
var missileSize = 0.1;
var myShip;
var myShipProperties;

// create the rows of space invaders
var invaders = new Array();
var numberOfRows = 5;
var invadersPerRow = 8;
var emptyColumns = 2; // number of invader width columns not filled with invaders
var invadersBottomCorner = { x: gameAt.x, y: middleY , z: gameAt.z };
var rowHeight = ((gameAt.y + gameSize.y) - invadersBottomCorner.y) / numberOfRows;
var columnWidth = gameSize.x / (invadersPerRow + emptyColumns);

// vertical movement of invaders
var invaderRowOffset = 0;
var stepsPerRow = 20; // number of steps before invaders really move a whole row down.
var yPerStep = rowHeight/stepsPerRow;
var stepsToGround = (middleY - gameAt.y) / yPerStep;
var maxInvaderRowOffset=stepsToGround;

// missile related items
var missileFired = false;
var myMissile;

// sounds
var hitSound = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/hit.raw");
var shootSound = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/shoot.raw");
var moveSounds = new Array();
moveSounds[0] = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/Lo1.raw");
moveSounds[1] = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/Lo2.raw");
moveSounds[2] = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/Lo3.raw");
moveSounds[3] = new Sound("http://highfidelity-public.s3-us-west-1.amazonaws.com/sounds/Space%20Invaders/Lo4.raw");
var currentMoveSound = 0;
var numberOfSounds = 4;
var stepsPerSound = invaderStepsPerCycle / numberOfSounds;

function initializeMyShip() {
    myShipProperties = {
                                position: { x: middleX , y: gameAt.y, z: gameAt.z },
                                velocity: { x: 0, y: 0, z: 0 },
                                gravity: { x: 0, y: 0, z: 0 },
                                damping: 0,
                                radius: shipSize,
                                color: { red: 0, green: 255, blue: 0 },
                                lifetime: itemLifetimes
                            };
    myShip = Particles.addParticle(myShipProperties);
}

// calculate the correct invaderPosition for an column row
function getInvaderPosition(row, column) {
    var xBasePart = invadersBottomCorner.x + (column * columnWidth);
    var xMovePart = 0;
    if (invaderMoveDirection > 0) {
        xMovePart = (invaderMoveDirection * columnWidth * (invaderStepOfCycle/invaderStepsPerCycle));
    } else {
        xMovePart = columnWidth + (invaderMoveDirection * columnWidth * (invaderStepOfCycle/invaderStepsPerCycle));
    }

    var y = invadersBottomCorner.y + (row * rowHeight) - (invaderRowOffset * rowHeight/stepsPerRow);

    var invaderPosition = { 
                    x:  xBasePart + xMovePart, 
                    y: y,
                    z: invadersBottomCorner.z };
    
    return invaderPosition;
}

function initializeInvaders() {
    for (var row = 0; row < numberOfRows; row++) {
        invaders[row] = new Array();
        for (var column = 0; column < invadersPerRow; column++) {
            invaderPosition = getInvaderPosition(row, column);
            invaders[row][column] = Particles.addParticle({
                        position: invaderPosition,
                        velocity: { x: 0, y: 0, z: 0 },
                        gravity: { x: 0, y: 0, z: 0 },
                        damping: 0,
                        radius: shipSize,
                        color: { red: 255, green: 0, blue: 0 },
                        modelURL: "http://highfidelity-public.s3-us-west-1.amazonaws.com/meshes/Feisar_Ship.FBX",
                        lifetime: itemLifetimes
                    });
                
            print("invaders[row][column].creatorTokenID=" + invaders[row][column].creatorTokenID);
        }
    }
}

function moveInvaders() {
    for (var row = 0; row < numberOfRows; row++) {
        for (var column = 0; column < invadersPerRow; column++) {
            props = Particles.getParticleProperties(invaders[row][column]);
            if (props.isKnownID) {
                invaderPosition = getInvaderPosition(row, column);
                Particles.editParticle(invaders[row][column], 
                        { 
                            position: invaderPosition,
                            velocity: { x: 0, y: 0, z: 0 } // always reset this, incase they got collided with
                        });
            }
        }
    }
}

function displayGameOver() {
    gameOver = true;
    print("Game over...");
}

function update() {
    if (!gameOver) {
        //print("updating space invaders... iteration="+iteration);
        iteration++;

        if (invaderStepOfCycle % stepsPerSound == 0) {
            // play the move sound
            var options = new AudioInjectionOptions(); 
            options.position = getInvaderPosition(invadersPerRow / 2, numberOfRows / 2);
            options.volume = 10.0;
            Audio.playSound(moveSounds[currentMoveSound], options);
            
            // get ready for next move sound
            currentMoveSound = (currentMoveSound+1) % numberOfSounds;
        }

        invaderStepOfCycle++;
        
        
        if (invaderStepOfCycle > invaderStepsPerCycle) {
            // handle left/right movement
            invaderStepOfCycle = 0;
            if (invaderMoveDirection > 0) {
                invaderMoveDirection = -1;
            } else {
                invaderMoveDirection = 1;
            }

            // handle downward movement
            invaderRowOffset++; // move down one row
            //print("invaderRowOffset="+invaderRowOffset);
        
            // check to see if invaders have reached "ground"...
            if (invaderRowOffset > maxInvaderRowOffset) {
                displayGameOver();
                return;
            }
        
        }
        moveInvaders();
    }
}

// register the call back so it fires before each data send
Script.willSendVisualDataCallback.connect(update);

function cleanupGame() {
    print("cleaning up game...");
    Particles.deleteParticle(myShip);
    print("cleanupGame() ... Particles.deleteParticle(myShip)... myShip.id="+myShip.id);
    for (var row = 0; row < numberOfRows; row++) {
        for (var column = 0; column < invadersPerRow; column++) {
            Particles.deleteParticle(invaders[row][column]);
            print("cleanupGame() ... Particles.deleteParticle(invaders[row][column])... invaders[row][column].id="
                    +invaders[row][column].id);
        }
    }
    
    // clean up our missile
    if (missileFired) {
        Particles.deleteParticle(myMissile);
    }
    Script.stop();
}
Script.scriptEnding.connect(cleanupGame);

function endGame() {
    print("ending game...");
    Script.stop();
}

function moveShipTo(position) {
    myShip = Particles.identifyParticle(myShip);
    Particles.editParticle(myShip, { position: position });
}

function fireMissile() {
    // we only allow one missile at a time...
    var canFire = false;

    // If we've fired a missile, then check to see if it's still alive
    if (missileFired) {
        var missileProperties = Particles.getParticleProperties(myMissile);
        print("missileProperties.isKnownID=" + missileProperties.isKnownID);
    
        if (!missileProperties.isKnownID) {
            print("canFire = true");
            canFire = true;
        }    
    } else {
        canFire = true;
    }
    
    if (canFire) {
        print("firing missile");
        var missilePosition = { x: myShipProperties.position.x, 
                                y: myShipProperties.position.y + (2* shipSize), 
                                z: myShipProperties.position.z };
                            
        myMissile = Particles.addParticle(
                        { 
                            position: missilePosition,
                            velocity: { x: 0, y: 5, z: 0},
                            gravity: { x: 0, y: 0, z: 0 },
                            damping: 0,
                            radius: missileSize,
                            color: { red: 0, green: 0, blue: 255 },
                            lifetime: 5
                        });

        var options = new AudioInjectionOptions(); 
        options.position = missilePosition;
        options.volume = 1.0;
        Audio.playSound(shootSound, options);

        missileFired = true;
    }
}

function keyPressEvent(key) {
    //print("keyPressEvent key.text="+key.text);
    if (key.text == ",") {
        myShipProperties.position.x -= 0.1;
        if (myShipProperties.position.x < gameAt.x) {
            myShipProperties.position.x = gameAt.x;
        }
        moveShipTo(myShipProperties.position);
    } else if (key.text == ".") {
        myShipProperties.position.x += 0.1;
        if (myShipProperties.position.x > gameAt.x + gameSize.x) {
            myShipProperties.position.x = gameAt.x + gameSize.x;
        }
        moveShipTo(myShipProperties.position);
    } else if (key.text == " ") {
        fireMissile();
    } else if (key.text == "q") {
        endGame();
    }
}

// remap the keys...
Controller.keyPressEvent.connect(keyPressEvent);
Controller.captureKeyEvents({text: " "});

function deleteIfInvader(possibleInvaderParticle) {
    for (var row = 0; row < numberOfRows; row++) {
        for (var column = 0; column < invadersPerRow; column++) {
            invaders[row][column] = Particles.identifyParticle(invaders[row][column]);
            if (invaders[row][column].isKnownID) {
                if (invaders[row][column].id == possibleInvaderParticle.id) {
                    Particles.deleteParticle(possibleInvaderParticle);
                    Particles.deleteParticle(myMissile);

                    // play the hit sound
                    var options = new AudioInjectionOptions(); 
                    var invaderPosition = getInvaderPosition(row, column);
                    options.position = invaderPosition;
                    options.volume = 1.0;
                    Audio.playSound(hitSound, options);
                }
            }
        }
    }
}

function particleCollisionWithParticle(particleA, particleB) {
    print("particleCollisionWithParticle() a.id="+particleA.id + " b.id=" + particleB.id);
    if (missileFired) {
        myMissile = Particles.identifyParticle(myMissile);
        if (myMissile.id == particleA.id) {
            deleteIfInvader(particleB);
        } else if (myMissile.id == particleB.id) {
            deleteIfInvader(particleA);
        }
    }
}
Particles.particleCollisionWithParticle.connect(particleCollisionWithParticle);


// initialize the game...
initializeMyShip();
initializeInvaders();

