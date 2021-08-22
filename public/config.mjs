const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const BORDER_PADDING = 5;
const INFO_BAR = 45;

const config = {
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    playAreaWidth: CANVAS_WIDTH - 2 * BORDER_PADDING,
    playAreaHeight: CANVAS_HEIGHT - 2 * BORDER_PADDING - INFO_BAR,
    playAreaMinX: BORDER_PADDING,
    playAreaMaxX: CANVAS_WIDTH - BORDER_PADDING - PLAYER_WIDTH,
    itemAreaMaxX: CANVAS_WIDTH - BORDER_PADDING,
    playAreaMinY: INFO_BAR + BORDER_PADDING,
    playAreaMaxY: CANVAS_HEIGHT - BORDER_PADDING - PLAYER_HEIGHT,
    itemAreaMaxY: CANVAS_HEIGHT - BORDER_PADDING
};

const startPosition = (min, max, multiple) => {
    return Math.floor(Math.random() * ((max - min) / multiple)) * multiple + min;
};

export {
    config,
    startPosition
};
