import Drawer from './Drawer';
import UI from './UI';

let Game = (function () {
  const TICKS_PER_SECOND = 200;
  const SCENE_LEFT_BORDER = -3;
  const SCENE_RIGHT_BORDER = 3;
  const SCENE_DEPTH = 30;

  const Z_DESTROY_THRESHOLD = -2;

  const CAR_WIDTH = 0.5;
  const CAR_HEIGHT = 0.2;
  const CAR_DEPTH = 0.7;
  const OBSTACLE_WIDTH = 1;
  const OBSTACLE_HEIGHT = 1;
  const OBSTACLE_DEPTH = 1;
  const HUMAN_WIDTH = 0.2;
  const HUMAN_HEIGHT = 0.4;
  const HUMAN_DEPTH = 0.1;

  const OBJECT_TYPE_CAR = 0;
  const OBJECT_TYPE_OBSTACLE = 1;
  const OBJECT_TYPE_HUMAN = 2;

  const TURN_LEFT_KEY = 37;
  const TURN_RIGHT_KEY = 39;

  const DIFFICULTY_UPDATE_INTERVAL = 750;
  const MAX_DIFFICULTY = 9;

  const FIRST_OBSTACLE_TICK = 1000;
  const INITIAL_OBSTACLE_INTERVAL = 500;
  const OBSTACLE_INTERVAL_DECREMENT = -30;
  const SCALE_LOW_MIN_OBSTACLES_COUNT = 1;
  const SCALE_HIGH_MIN_OBSTACLES_COUNT = 4;
  const SCALE_LOW_MAX_OBSTACLES_COUNT = 1;
  const SCALE_HIGH_MAX_OBSTACLES_COUNT = 5;

  const FIRST_HUMAN_TICK = 500;
  const MIN_HUMAN_INTERVAL = 5;
  const MAX_HUMAN_INTERVAL = 300;
  const HUMAN_MIN_SPEED = 0.005;
  const HUMAN_MAX_SPEED = 0.02;

  const INITIAL_SPEED = 0.04;
  const SPEED_INCREMENT = 0.007;
  const INITIAL_STRAFE_SPEED = 0.025;
  const STRAFE_SPEED_INCREMENT = 0.0015;

  const MODE_ROBOCAR = 0;
  const MODE_CARMAGEDDON = 1;

  const MODE_SCORE_INCREMENT = 50;
  const MODE_SCORE_DECREMENT = -200;

  let gameDataCallback;

  let gameInterval;
  let animationFrame;
  let canvas;

  let score;
  let maxScore = 0;
  let isGameOver;
  let tickIndex;
  let gameObjects;
  let toDestroy = [];
  let gameObjectId;
  let gameMode;

  let leftKeyPressed;
  let rightKeyPressed;

  let difficulty;
  let nextObstacleIn, obstacleInterval;
  let nextHumanIn;
  let speed;
  let strafeSpeed;

  function createGameObject(gameObj) {
    gameObjects[gameObjectId] = gameObj;
    gameObj.id = gameObjectId.toString();
    gameObjectId++;
  }

  function destroyGameObject(gameObj) {
    // Mark objects for destroying
    toDestroy.push(gameObj.id);
  }

  /** Classes */
  let GameObject = function (type, width, height, depth) {
    this.id = null;
    this.type = type;
    this.x = 0;
    this.y = height / 2;
    this.z = 0;
    this.width = width;
    this.height = height;
    this.depth = depth;

    this.toRectPoints = function () {
      // Note: x, y, z of a gameObject represent its center
      // We play this game on XZ plane. Since Y is only for height, we can ignore it here.
      let w = this.width / 2;
      let d = this.depth / 2;
      return [
        [this.x - w, this.z - d],
        [this.x + w, this.z + d],
      ]
    };

    this.onCollide = function (anotherObj) {
    };
  };

  let Obstacle = function (x, z) {
    this.x = x;
    this.z = z;
  };
  Obstacle.prototype = new GameObject(OBJECT_TYPE_OBSTACLE, OBSTACLE_WIDTH, OBSTACLE_HEIGHT, OBSTACLE_DEPTH);

  let Human = function (x, z, speed) {
    this.x = x;
    this.z = z;
    this.speed = speed;

    this.onCollide = function (anotherObj) {
      if (anotherObj.type === OBJECT_TYPE_OBSTACLE) {
        this.speed *= -1;
      }
    };
  };
  Human.prototype = new GameObject(OBJECT_TYPE_HUMAN, HUMAN_WIDTH, HUMAN_HEIGHT, HUMAN_DEPTH);

  let Car = function () {
    this.onCollide = function (anotherObj) {
      if (anotherObj.type === OBJECT_TYPE_OBSTACLE) {
        // Game over
        stop();
      }
      if (anotherObj.type === OBJECT_TYPE_HUMAN) {
        let inc = gameMode === MODE_ROBOCAR ? MODE_SCORE_DECREMENT : MODE_SCORE_INCREMENT;
        score += inc;
        UI.addScore(inc);
        destroyGameObject(anotherObj);
      }
    };
  };
  Car.prototype = new GameObject(OBJECT_TYPE_CAR, CAR_WIDTH, CAR_HEIGHT, CAR_DEPTH);

  /** Helpers */
  function getCar() {
    // Car is always first
    return gameObjects[1];
  }

  function getGameData() {
    return {
      SCENE_LEFT_BORDER: SCENE_LEFT_BORDER,
      SCENE_RIGHT_BORDER: SCENE_RIGHT_BORDER,
      SCENE_DEPTH: SCENE_DEPTH,
      speed: speed,
      score: Math.floor(score),
      tick: tickIndex,
      maxScore: maxScore,
      difficulty: difficulty,
      gameOver: +isGameOver,
    }
  }

  function loadMaxScore() {
    maxScore = 0;

    if (window.localStorage) {
      let storageScore = window.localStorage.getItem('maxScore');
      if (storageScore !== null) {
        maxScore = storageScore;
      }
    }
  }

  function saveMaxScore() {
    if (window.localStorage) {
      window.localStorage.setItem('maxScore', maxScore);
    }
  }

  function random(min, max) {
    if (typeof max === 'undefined') {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max));
  }

  function randomBool() {
    return Math.random() < 0.5;
  }

  function shuffle(array) {
    for (let i = array.length; i; i--) {
      let j = randomInt(i);
      [array[i - 1], array[j]] = [array[j], array[i - 1]];
    }
  }

  /** Event listeners */
  function onKeyDown(e) {
    if (e.target === canvas) {
      if (e.keyCode === TURN_LEFT_KEY) leftKeyPressed = true;
      if (e.keyCode === TURN_RIGHT_KEY) rightKeyPressed = true;
      e.stopPropagation();
    }
  }

  function onKeyUp(e) {
    if (e.target === canvas) {
      if (e.keyCode === TURN_LEFT_KEY) leftKeyPressed = false;
      if (e.keyCode === TURN_RIGHT_KEY) rightKeyPressed = false;
      e.stopPropagation();
    }
  }

  function addEventListeners() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    gameInterval = setInterval(tick, 1000 / TICKS_PER_SECOND);
    animationFrame = requestAnimationFrame(draw);
  }

  function removeEventListeners() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    clearInterval(gameInterval);
    cancelAnimationFrame(animationFrame);
  }

  /** Gameplay */
  function updateDifficulty() {
    let new_difficulty = Math.floor(tickIndex / DIFFICULTY_UPDATE_INTERVAL);
    if (new_difficulty <= MAX_DIFFICULTY && new_difficulty > difficulty) {
      difficulty = new_difficulty;

      speed += SPEED_INCREMENT;
      strafeSpeed += STRAFE_SPEED_INCREMENT;

      obstacleInterval += OBSTACLE_INTERVAL_DECREMENT;
    }
  }

  function updateCar() {
    let car = getCar();

    if (leftKeyPressed) car.x -= strafeSpeed;
    if (rightKeyPressed) car.x += strafeSpeed;

    // Bind car to the scene
    car.x = Math.max(SCENE_LEFT_BORDER + car.width / 2,
      Math.min(SCENE_RIGHT_BORDER - car.width / 2, car.x));
  }

  function updateObstacles() {
    if (tickIndex < FIRST_OBSTACLE_TICK) {
      return;
    }
    nextObstacleIn--;

    // Create a new obstacle
    if (nextObstacleIn <= 0) {
      // Linear interpolation of obstacles count by difficulty
      let min = ((SCALE_HIGH_MIN_OBSTACLES_COUNT - SCALE_LOW_MIN_OBSTACLES_COUNT) / MAX_DIFFICULTY) * difficulty + SCALE_LOW_MIN_OBSTACLES_COUNT;
      let max = ((SCALE_HIGH_MAX_OBSTACLES_COUNT - SCALE_LOW_MAX_OBSTACLES_COUNT) / MAX_DIFFICULTY) * difficulty + SCALE_LOW_MAX_OBSTACLES_COUNT;

      min = Math.round(min);
      max = Math.round(max);

      let count = randomInt(min, max + 1);
      let max_obstacles_count = Math.floor((SCENE_RIGHT_BORDER - SCENE_LEFT_BORDER) / OBSTACLE_WIDTH);

      // Randomize obstacles position
      let obstacles = [];
      for (let i = 0; i < max_obstacles_count; i++) {
        obstacles.push(i < count ? 1 : 0)
      }
      shuffle(obstacles);

      let stairLike = randomBool();
      for (let i = 0; i < max_obstacles_count; i++) {
        if (obstacles[i]) {
          let x = SCENE_LEFT_BORDER + OBSTACLE_WIDTH / 2 + OBSTACLE_WIDTH * i;
          let z = SCENE_DEPTH;

          if (stairLike) {
            let inc = OBSTACLE_WIDTH * i;
            if (randomBool()) {
              inc *= -1;
            }
            z += inc;
          }

          createGameObject(new Obstacle(x, z));
          nextObstacleIn = obstacleInterval;
        }
      }
    }
  }

  function updateHumans() {
    if (tickIndex < FIRST_HUMAN_TICK) {
      return;
    }
    nextHumanIn--;

    // Create a new human
    if (nextHumanIn <= 0) {
      let max = SCENE_RIGHT_BORDER - HUMAN_WIDTH / 2;
      let min = SCENE_LEFT_BORDER + HUMAN_WIDTH / 2;
      let x = random(min, max);
      let z = SCENE_DEPTH;
      let human_speed = random(HUMAN_MIN_SPEED, HUMAN_MAX_SPEED);
      if (randomBool()) {
        human_speed *= -1;
      }

      // Check if it collides with an existing obstacle
      // No one likes to be stuck in a box
      let human = new Human(x, z, human_speed);
      let collisionDetected = false;
      Object.keys(gameObjects).forEach((id) => {
        let gameObj = gameObjects[id];
        if (gameObj.type === OBJECT_TYPE_OBSTACLE) {
          if (checkCollision(human, gameObj)) {
            collisionDetected = true;
          }
        }
      });

      if (!collisionDetected) {
        createGameObject(human);
        nextHumanIn = randomInt(MIN_HUMAN_INTERVAL, MAX_HUMAN_INTERVAL);
      }
    }

    // Move existing humans by their speed and make them change direction on wall collide
    Object.keys(gameObjects).forEach((id) => {
      let gameObj = gameObjects[id];
      if (gameObj.type === OBJECT_TYPE_HUMAN) {
        gameObj.x += gameObj.speed;

        if (gameObj.x < SCENE_LEFT_BORDER + HUMAN_WIDTH / 2) {
          gameObj.x = SCENE_LEFT_BORDER + HUMAN_WIDTH / 2;
          gameObj.speed *= -1;
        }
        if (gameObj.x > SCENE_RIGHT_BORDER - HUMAN_WIDTH / 2) {
          gameObj.x = SCENE_RIGHT_BORDER - HUMAN_WIDTH / 2;
          gameObj.speed *= -1;
        }
      }
    });
  }

  function updateGameObjects() {
    Object.keys(gameObjects).forEach((id) => {
      let car = getCar();
      if (id === car.id) {
        return;
      }
      gameObjects[id].z -= speed;
    });
  }

  function handleCollisions() {
    let keys = Object.keys(gameObjects);
    if (keys.length < 2) {
      return;
    }

    keys.forEach((i) => {
      keys.forEach((k) => {
        if (k <= i) {
          return;
        }
        let obj1 = gameObjects[i];
        let obj2 = gameObjects[k];

        if (checkCollision(obj1, obj2)) {
          obj1.onCollide(obj2);
          obj2.onCollide(obj1);
        }
      });
    });
  }

  function checkCollision(obj1, obj2) {
    let [[o1x1, o1y1], [o1x2, o1y2]] = obj1.toRectPoints();
    let [[o2x1, o2y1], [o2x2, o2y2]] = obj2.toRectPoints();

    return o1x1 < o2x2 && o1x2 > o2x1 && o1y1 < o2y2 && o1y2 > o2y1;
  }

  function updateScore() {
    score += (difficulty + 1) / 10;
    score = Math.max(0, score);

    if (score > maxScore) {
      maxScore = Math.floor(score);
    }
  }

  function clearGameObjects() {
    // Clear objects which are too far by Z axis
    Object.keys(gameObjects).forEach((id) => {
      let gameObj = gameObjects[id];
      if (gameObj.z < Z_DESTROY_THRESHOLD) {
        destroyGameObject(gameObj);
      }
    });

    // Actually delete marked objects
    for (let id of toDestroy) {
      delete gameObjects[id];
    }
    toDestroy = [];
  }

  function init(canvas3d, canvasUI) {
    canvas = canvas3d;
    Drawer.init(canvas3d);
    UI.init(canvasUI);

    loadMaxScore();
  }

  function setCallback(callback) {
    gameDataCallback = callback;
  }

  function start(mode) {
    gameMode = mode === MODE_CARMAGEDDON ? MODE_CARMAGEDDON : MODE_ROBOCAR;
    gameObjects = {};
    gameObjectId = 1;
    isGameOver = false;
    tickIndex = 0;
    score = 0;

    difficulty = 0;
    nextObstacleIn = nextHumanIn = 0;
    obstacleInterval = INITIAL_OBSTACLE_INTERVAL;
    speed = INITIAL_SPEED;
    strafeSpeed = INITIAL_STRAFE_SPEED;

    createGameObject(new Car());

    leftKeyPressed = rightKeyPressed = false;
    addEventListeners();
    canvas.focus();
  }

  function stop() {
    isGameOver = true;
    removeEventListeners();
    saveMaxScore();

    // Draw UI again to make sure its data updated
    drawUI();

    if (typeof gameDataCallback === 'function') {
      gameDataCallback(getGameData());
    }
  }

  function restart(mode) {
    stop();
    start(mode);
  }

  function drawUI() {
    UI.updateGameData(getGameData());
    UI.draw();
  }

  function draw() {
    Drawer.updateGameData(getGameData());
    Drawer.clear();
    Drawer.drawScene();
    Object.keys(gameObjects).forEach((id) => {
      Drawer.drawObject(gameObjects[id]);
    });

    drawUI();

    animationFrame = requestAnimationFrame(draw);
  }

  function tick() {
    tickIndex++;

    updateDifficulty();
    updateCar();
    updateObstacles();
    updateHumans();
    updateGameObjects();
    handleCollisions();
    updateScore();
    clearGameObjects();
  }

  return {
    init: init,
    start: start,
    stop: stop,
    restart: restart,
    setCallback: setCallback,
  }
}());

export default Game;