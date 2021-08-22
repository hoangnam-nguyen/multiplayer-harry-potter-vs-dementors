import { config } from "./config.mjs";

class Collectible {
  constructor({x = 10, y = 20, w = 15, h = 15, value = 0, id, speedX = 5, speedY = 5}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
    this.id = id;
    this.speedX = speedX;
    this.speedY = speedY;
  }

  moveItem(speedX, speedY) {
    if (this.y - config.playAreaMinY < 0 || config.itemAreaMaxY - this.y - this.h < 0) {
      this.speedY = -speedY;
    };
    if (this.x - config.playAreaMinX < 0 || config.itemAreaMaxX - this.x - this.w < 0) {
      this.speedX = -speedX;
    };
    this.x += this.speedX;
    this.y += this.speedY;
  }

  draw(ctx, imgObj) {
    this.moveItem(this.speedX, this.speedY);
    if (this.value === 1 || this.value === 3 || this.value === 5) {
      ctx.drawImage(imgObj.snitchImg, this.x, this.y);
    } else if (this.speedX > 0 && this.speedY < 0) {
      ctx.drawImage(imgObj.spikedBallImgRight, this.x, this.y, this.w, this.h);
    } else if (this.speedX > 0 && this.speedY > 0) {
      ctx.drawImage(imgObj.spikedBallImgRightDown, this.x, this.y, this.w, this.h);
    } else if (this.speedX < 0 && this.speedY > 0) {
      ctx.drawImage(imgObj.spikedBallImgLeftDown, this.x, this.y, this.w, this.h);
    } else {
      ctx.drawImage(imgObj.spikedBallImg, this.x, this.y, this.w, this.h);
    }     
  }
}

try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
