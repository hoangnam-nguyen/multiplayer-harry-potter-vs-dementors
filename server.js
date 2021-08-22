require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet());
app.use(nocache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));
app.use(cors({ origin: '*' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Set up socket.io
const io = socket(server);
const Collectible = require('./public/Collectible');
const { config, startPosition } = require('./public/config');

function createRandomItem(spike) {
  const random = Math.random();
  let itemValue, speedX, speedY;
  if (random < 0.5) {
    itemValue = 1;
    speedX = 3;
    speedY = 3;
  } else if (random < 0.7) {
    itemValue = 3;
    speedX = 4;
    speedY = 4;
  } else {
    itemValue = 5;
    speedX = 5;
    speedY = 5;
  }
  if (!spike) {
    return new Collectible({
      x: startPosition(config.playAreaMinX, config.playAreaMaxX, 5),          // multiple == 5 can change
      y: startPosition(config.playAreaMinY, config.playAreaMaxY, 5),
      speedX: speedX,
      speedY: speedY,
      value: itemValue,
      id: Date.now()
    });
  } else {
    return new Collectible({
      x: startPosition(config.playAreaMinX, config.playAreaMaxX, 4),          // multiple == 5 can change
      y: startPosition(config.playAreaMinY, config.playAreaMaxY, 4),
      w: 30,
      h: 30,
      speedX: speedX,
      speedY: speedY,
      id: Date.now()
    });
  }
  
}

let currPlayers = [],
    takenItems = [],
    item = createRandomItem(false),
    spike1 = createRandomItem(true),
    spike2 = createRandomItem(true),
    spike3 = createRandomItem(true),
    spikes = [spike1, spike2, spike3];

io.sockets.on('connection', socket => {
  
  // Report new connection
  console.log(`New connection: ${socket.id}`);

  socket.emit('init', { id: socket.id, players: currPlayers, item, spikes});

  socket.on('new-player', obj => {
    obj.id = socket.id;
    currPlayers.push(obj);
    socket.broadcast.emit('new-player', obj);
  });

  socket.on('move-player', (dir, obj) => {
    const movingPlayer = currPlayers.find(player => player.id === socket.id);
    if (movingPlayer) {
      movingPlayer.x = obj.x;
      movingPlayer.y = obj.y;
      socket.broadcast.emit('move-player', { id: socket.id, dir, posObj: { x: movingPlayer.x, y: movingPlayer.y } });
    }
  });

  socket.on('stop-player', (dir, obj) => {
    const stoppingPlayer = currPlayers.find(player => player.id === socket.id);
    if (stoppingPlayer) {
      stoppingPlayer.x = obj.x;
      stoppingPlayer.y = obj.y;
      socket.broadcast.emit('stop-player', { id: socket.id, dir, posObj: { x: stoppingPlayer.x, y: stoppingPlayer.y } });
    }
  });

  socket.on('taken-item', ({ playerId, itemValue, itemId }) => {
    if (!takenItems.includes(itemId)) {
      const scoringPlayer = currPlayers.find(player => player.id === playerId);
      const sock = io.sockets.connected[scoringPlayer.id];
      scoringPlayer.score += itemValue;
      item = createRandomItem(false);
      io.emit('new-item', item);
      takenItems.push(itemId);
      io.emit('update-player', scoringPlayer);

      if (scoringPlayer.score >= 100) {
        sock.emit('end-game', 'win');
        sock.broadcast.emit('end-game', 'lose');
      }
    }
  });

  socket.on('destroyed-player', ({ playerId }) => {
    const destroyedPlayer = currPlayers.find(player => player.id === playerId);
    const sock = io.sockets.connected[destroyedPlayer.id];
    destroyedPlayer.score = 0;
    destroyedPlayer.lifeCounter ++;
    io.emit('update-player', destroyedPlayer);

    if (destroyedPlayer.lifeCounter === 10) {
      socket.emit('end-game', 'lose');
  }
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('remove-player', socket.id);
    currPlayers = currPlayers.filter(player => player.id !== socket.id);
  });
});

module.exports = app; // For testing
