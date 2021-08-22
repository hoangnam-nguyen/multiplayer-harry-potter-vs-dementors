import { config, startPosition } from "./config.mjs";

class Player {
  constructor({x = 20, y = 20, w = 25, h = 25, score = 0, main, id}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.score = score;
    this.isMain = main;
    this.id = id;
    this.speed = 6;
    this.movementDirection = {};
    this.destroyed = false;
    this.lifeCounter = 0;
  }
  
  draw(ctx, items, imgObj, currPlayers) {
    const currDir = Object.keys(this.movementDirection).filter(dir => this.movementDirection[dir]);
    currDir.forEach(dir => this.movePlayer(dir, this.speed));
    if (this.isMain === "main") {  
      ctx.font = `13px 'Press Start 2P'`;
      ctx.fillText(this.showLifeCounter(), config.playAreaMinX + 60, 32.5);
      ctx.fillText(this.calculateRank(currPlayers), config.canvasWidth - 82, 32.5);
      ctx.font = `16px 'Press Start 2P'`;
      ctx.fillText(this.showScore(), config.canvasWidth / 2, 32.5);

      if (currDir.includes('left') && currDir.includes('down')) {
        ctx.drawImage(imgObj.mainPlayerImgLeftDown, this.x, this.y);
      } else if (currDir.includes('left') && currDir.includes('up')) {
        ctx.drawImage(imgObj.mainPlayerImgLeftUp, this.x, this.y);
      } else if (currDir.includes('right') && currDir.includes('up')) {
        ctx.drawImage(imgObj.mainPlayerImgRightUp, this.x, this.y); 
      } else if (currDir.includes('right') && currDir.includes('down')) {
        ctx.drawImage(imgObj.mainPlayerImgRightDown, this.x, this.y); 
      } else if (currDir.includes('left')) {
        ctx.drawImage(imgObj.mainPlayerImgLeft, this.x, this.y); 
      } else if (currDir.includes('up')) {
        ctx.drawImage(imgObj.mainPlayerImgUp, this.x, this.y); 
      } else if (currDir.includes('down')) {
        ctx.drawImage(imgObj.mainPlayerImgDown, this.x, this.y); 
      } else {
        ctx.drawImage(imgObj.mainPlayerImg, this.x, this.y);
      }

    } else {
      if (currDir.includes('left') && currDir.includes('down')) {
        ctx.drawImage(imgObj.otherPlayerImgLeftDown, this.x, this.y);
      } else if (currDir.includes('left') && currDir.includes('up')) {
        ctx.drawImage(imgObj.otherPlayerImgLeftUp, this.x, this.y);
      } else if (currDir.includes('right') && currDir.includes('up')) {
        ctx.drawImage(imgObj.otherPlayerImgRightUp, this.x, this.y); 
      } else if (currDir.includes('right') && currDir.includes('down')) {
        ctx.drawImage(imgObj.otherPlayerImgRightDown, this.x, this.y); 
      } else if (currDir.includes('left')) {
        ctx.drawImage(imgObj.otherPlayerImgLeft, this.x, this.y); 
      } else if (currDir.includes('up')) {
        ctx.drawImage(imgObj.otherPlayerImgUp, this.x, this.y); 
      } else if (currDir.includes('down')) {
        ctx.drawImage(imgObj.otherPlayerImgDown, this.x, this.y); 
      } else {
        ctx.drawImage(imgObj.otherPlayerImg, this.x, this.y);
      }
    }
    for (let item of items) {
      if (this.collision(item)) {
        if (item.value === 0) {
          this.x = startPosition(config.playAreaMinX, config.playAreaMaxX, 5);
          this.y = startPosition(config.playAreaMinY, config.playAreaMaxY, 5);
          this.destroyed = true;
          this.lifeCounter ++;
          if (item.w <= 50) item.w += 10;
          if (item.h <= 50) item.h += 10;
        } else {
          item.taken = this.id;
        }
      }
    }
  }

  moveDir(dir) {
    this.movementDirection[dir] = true;
  }

  stopDir(dir) {
    this.movementDirection[dir] = false;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case "up":
        this.y - config.playAreaMinY >= speed ? this.y -= speed : this.y -= 0;
        break;
      case "down":
        config.playAreaMaxY - this.y >= speed ? this.y += speed : this.y += 0;
        break;
      case "left":
        this.x - config.playAreaMinX >= speed ? this.x -= speed : this.x -= 0;
        break;
      case "right":
        config.playAreaMaxX - this.x >= speed ? this.x += speed : this.x += 0;
    }
  }

  collision(item) {
    if (this.x <= item.x + item.w && 
        this.x + this.w >= item.x &&
        this.y <= item.y + item.h &&
        this.y + this.h >= item.y) {
          return true;
        }
    return false;
  }

  showScore() {
    return `Score: ${this.score}`;
  }

  showLifeCounter() {
    return `Life: ${10 - this.lifeCounter}`
  }

  calculateRank(arr) {
    let playerRank = this.score === 0 ? arr.length : findRanking(arr).filter(player => player.id === this.id)[0]['rank'];
    return `Rank: ${playerRank} / ${arr.length}`;
  }

}

function findRanking(arrPlayers) {
  let ranking = new Map(),
      rank = 1,
      arrSortedScore = arrPlayers.sort((a, b) => b.score - a.score),
      result = arrPlayers.slice(0);
  for (let i = 0; i < arrSortedScore.length; i++) {
    if (!ranking.has(arrSortedScore[i])) {
      ranking.set(arrSortedScore[i], rank);
      rank ++;
    }
  }
  for (let i = 0; i < arrPlayers.length; i++) {
    result[i]['rank'] = ranking.get(arrPlayers[i]);
  }
  return result;
}

export default Player;
