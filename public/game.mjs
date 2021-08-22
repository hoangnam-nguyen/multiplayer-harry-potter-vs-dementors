import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import controls from './controls.mjs';
import { startPosition, config } from './config.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d', { alpha: false });

const loadImage = src => {
    const img = new Image();
    img.src = src;
    return img;
}

const snitchImg = loadImage('./assets/snitch.png');
const mainPlayerImg = loadImage('./assets/default.png');
const mainPlayerImgLeft = loadImage('./assets/default-left.png');
const mainPlayerImgUp = loadImage('./assets/default-up.png');
const mainPlayerImgDown = loadImage('./assets/default-down.png');
const mainPlayerImgLeftUp = loadImage('./assets/default-left-up.png');
const mainPlayerImgLeftDown = loadImage('./assets/default-left-down.png');
const mainPlayerImgRightUp = loadImage('./assets/default-right-up.png');
const mainPlayerImgRightDown = loadImage('./assets/default-right-down.png');

const otherPlayerImg = loadImage('./assets/default.png');
const otherPlayerImgUp = loadImage('./assets/default-up.png');
const otherPlayerImgDown = loadImage('./assets/default-down.png');
const otherPlayerImgLeft = loadImage('./assets/default-left.png');
const otherPlayerImgLeftUp = loadImage('./assets/default-left-up.png');
const otherPlayerImgLeftDown = loadImage('./assets/default-left-down.png');
const otherPlayerImgRightUp = loadImage('./assets/default-right-up.png');
const otherPlayerImgRightDown = loadImage('./assets/default-right-down.png');

const spikedBallImg = loadImage('./assets/dementor.png');
const spikedBallImgRight = loadImage('./assets/dementor-right.png');
const spikedBallImgLeftDown = loadImage('./assets/dementor-left-down.png');
const spikedBallImgRightDown = loadImage('./assets/dementor-right-down.png');

let tick, 
    currPlayers = [], 
    newItem,
    newSpike1, 
    newSpike2, 
    newSpike3, 
    endGame;

socket.on('init', ({ id, players, item, spikes }) => {
    
    // Confirm new player
    console.log(`Connected: ${id}`);

    ////
    cancelAnimationFrame(tick);
    
    const mainPlayer = new Player({
        x: startPosition(config.playAreaMinX, config.playAreaMaxX, 5),
        y: startPosition(config.playAreaMinY, config.playAreaMaxY, 5),
        id,
        main: "main"
    });

    controls(mainPlayer, socket);

    socket.emit('new-player', mainPlayer);

    socket.on('new-player', obj => {
        const playerIds = currPlayers.map(player => player.id);
        if (!playerIds.includes(obj.id)) currPlayers.push(new Player(obj));
    });

    socket.on('move-player', ({ id, dir, posObj }) => {
        const movingPlayer = currPlayers.find(player => player.id === id);
        movingPlayer.moveDir(dir);
        movingPlayer.x = posObj.x;
        movingPlayer.y = posObj.y;
    });

    socket.on('stop-player', ({ id, dir, posObj }) => {
        const stoppingPlayer = currPlayers.find(player => player.id === id);
        stoppingPlayer.stopDir(dir);
        stoppingPlayer.x = posObj.x;
        stoppingPlayer.y = posObj.y;
    });

    socket.on('new-item', item => {
        newItem = new Collectible(item);
    });

    socket.on('end-game', result => endGame = result);
    socket.on('update-player', playerObj => {
        const player = currPlayers.find(player => player.id === playerObj.id);
        player.score = playerObj.score;
    });

    socket.on('remove-player', id => {
        console.log(`${id} has disconnected.`)
        currPlayers = currPlayers.filter(player => player.id !== id);
    });

    currPlayers = players.map(val => new Player(val)).concat(mainPlayer);
    newItem = new Collectible(item);

    newSpike1 = new Collectible(spikes[0]);
    newSpike2 = new Collectible(spikes[1]);
    newSpike3 = new Collectible(spikes[2]);
    draw();
});

function draw() {
    ctx.clearRect(0, 0 , canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#220';
    ctx.strokeRect(config.playAreaMinX, config.playAreaMinY, config.playAreaWidth, config.playAreaHeight);
    ctx.fillStyle = '#220';
    ctx.textAlign = 'center';
    
    let entities = [newItem, newSpike1, newSpike2, newSpike3];
    
    currPlayers.forEach(player => {
        player.draw(ctx, entities, { mainPlayerImg, 
                                    mainPlayerImgLeft,
                                    mainPlayerImgUp,
                                    mainPlayerImgDown,
                                    mainPlayerImgLeftUp,
                                    mainPlayerImgLeftDown, 
                                    mainPlayerImgRightUp,
                                    mainPlayerImgRightDown,
                                    otherPlayerImg, 
                                    otherPlayerImgUp,
                                    otherPlayerImgDown,
                                    otherPlayerImgLeft,
                                    otherPlayerImgLeftUp,
                                    otherPlayerImgLeftDown,
                                    otherPlayerImgRightUp, 
                                    otherPlayerImgRightDown }, currPlayers);
        if (player.destroyed) {
            socket.emit('destroyed-player', { playerId: player.id });
        }
        player.destroyed = false;
    });

    for (let i = 0; i < entities.length; i++) {
        entities[i].draw(ctx, { snitchImg, spikedBallImg, spikedBallImgRight, spikedBallImgLeftDown, 
            spikedBallImgRightDown });
    }

    if (newItem.taken) socket.emit('taken-item', { playerId: newItem.taken, itemValue: newItem.value, itemId: newItem.id});
  
    if (endGame) {
        ctx.fillStyle = '#220';
        ctx.font = `13px 'Press Start 2P`;
        ctx.fillText(`You ${endGame}! Wanna try again?`, config.canvasWidth / 2, 80);
    } else {
        tick = requestAnimationFrame(draw);
    }
}
