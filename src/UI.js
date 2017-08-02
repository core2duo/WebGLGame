let UI = (function () {
  const ANIMATION_DURATION = 100;
  const ANIMATION_START_Y = 120;

  const DEFAULT_COLOR = '#fff';
  const DEFAULT_FONT = '400 20px Roboto';
  const PADDING = 20;

  const SCORE_INC_COLOR = '#c3e88d';
  const SCORE_DEC_COLOR = '#e06c75';
  const SCORE_LEADING_ZEROES = 5;

  let ctx;
  let gameData = {};
  let animating = [];
  let canvasWidth, canvasHeight;

  function init(canvas) {
    ctx = canvas.getContext('2d');
    ctx.font = DEFAULT_FONT;
    ctx.fillStyle = DEFAULT_COLOR;
    canvasWidth = ctx.canvas.width;
    canvasHeight = ctx.canvas.height;
  }

  function updateGameData(data) {
    gameData = Object.assign(gameData, data);
  }

  function getGameVar(name) {
    let gameVar = gameData[name];
    if (typeof gameVar === 'undefined') {
      throw new Error('Variable name does not exist in the game variables');
    }
    return gameVar;
  }

  function drawDifficulty(difficulty) {
    let text = "Speed: " + (difficulty + 1);

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(text, PADDING, PADDING);
    ctx.restore();
  }

  function drawScore(score) {
    let text = score.toString().padStart(SCORE_LEADING_ZEROES, 0);

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvasWidth / 2, PADDING);
  }

  function drawMaxScore(score) {
    let text = "Max: " + score.toString().padStart(SCORE_LEADING_ZEROES, 0);

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    ctx.fillText(text, canvasWidth - PADDING, PADDING);
    ctx.restore();
  }

  function addScore(score) {
    let color = score > 0 ? SCORE_INC_COLOR : SCORE_DEC_COLOR;

    let scoreString = score.toString();
    if (score > 0) {
      scoreString = '+' + scoreString;
    }

    animating.push({
      text: scoreString,
      color: color,
      ticks: ANIMATION_DURATION,
      x: canvasWidth / 2,
      y: ANIMATION_START_Y,
    });
  }

  function drawAnimating() {
    let newAnimating = [];
    ctx.save();

    for (let a of animating) {
      a.ticks--;
      a.y--;

      if (a.ticks > 0) {
        newAnimating.push(a);
      }

      ctx.globalAlpha = a.ticks / ANIMATION_DURATION;
      ctx.fillStyle = a.color;
      ctx.fillText(a.text, a.x, a.y);
    }

    animating = newAnimating;
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawDifficulty(getGameVar('difficulty'));
    drawScore(getGameVar('score'));
    drawMaxScore(getGameVar('maxScore'));
    drawAnimating();
  }

  return {
    init: init,
    updateGameData: updateGameData,
    addScore: addScore,
    draw: draw,
  }
}());

export default UI;