/* eslint no-undef: "off" */
import { mat4 } from 'gl-matrix';

let Drawer = (function() {
  const SCENE_HEIGHT = 3;
  const CAM_POSITION = [0, 2, 3];
  const BACKGROUND = [0.156, 0.156, 0.156, 1];
  const SCENE_LINE_STEP = 2;

  let gl = null;
  let pMatrix = mat4.create();
  let shaderProgram;

  let gameData = {};
  let scene_position = SCENE_LINE_STEP;
  let last_tick = 0;

  function getShader(id) {
    let shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    let str = "";
    let k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType === 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    let shader;
    if (shaderScript.type === "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  function initShaders() {
    let fragmentShader = getShader("shader-fs");
    let vertexShader = getShader("shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  }

  function getInitialMatrix() {
    // Returns identity matrix with a camera setup
    let mvMatrix = mat4.create();
    let translateVector = CAM_POSITION.map((e) => -e);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, translateVector);

    return mvMatrix;
  }

  function setMatrixUniforms(mvMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
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

  function initBackground() {
    gl.clearColor.bind(gl).apply(null, BACKGROUND);
  }

  function init(canvas) {
    gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.log("Could not initialise WebGL");
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    initShaders();
    initBackground();
    gl.enable(gl.DEPTH_TEST);
  }

  function drawCuboid(x, y, z, width, height, depth) {
    let w = width / 2;
    let h = height / 2;
    let d = depth / 2;

    let mvMatrix = getInitialMatrix();
    mat4.translate(mvMatrix, mvMatrix, [x, y, z]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let vertices = [
      // Front
      -w,  h, d,   w,  h, d,
       w,  h, d,   w, -h, d,
       w, -h, d,  -w, -h, d,
      -w, -h, d,  -w,  h, d,

      // Back
      -w,  h, -d,   w,  h, -d,
       w,  h, -d,   w, -h, -d,
       w, -h, -d,  -w, -h, -d,
      -w, -h, -d,  -w,  h, -d,

      // Connect back & front
      -w,  h, d,  -w,  h, -d,
       w,  h, d,   w,  h, -d,
       w, -h, d,   w, -h, -d,
      -w, -h, d,  -w, -h, -d,

    ];
    let itemSize = 3;
    let items = 24;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(mvMatrix);
    gl.drawArrays(gl.LINES, 0, items);
  }

  function drawScene() {
    let w = (getGameVar('SCENE_LEFT_BORDER') - getGameVar('SCENE_RIGHT_BORDER')) / 2;
    let h = SCENE_HEIGHT;
    let d = getGameVar('SCENE_DEPTH');

    let mvMatrix = getInitialMatrix();

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let vertices = [
      // Back
      -w, h, -d,   w, h, -d,
       w, h, -d,   w, 0, -d,
       w, 0, -d,  -w, 0, -d,
      -w, 0, -d,  -w, h, -d,

      // Connect back & front
      -w, h,  d,  -w, h, -d,
       w, h,  d,   w, h, -d,
       w, 0,  d,   w, 0, -d,
      -w, 0,  d,  -w, 0, -d,
    ];
    let itemSize = 3;
    let items = 16;

    let current_tick = getGameVar('tick');
    let diff = current_tick - last_tick;
    if (diff < 0) {
      // Game was restarted
      diff = 0;
      scene_position = SCENE_LINE_STEP;
    }
    scene_position -= getGameVar('speed') * diff;
    if (scene_position <= 0) {
      scene_position = SCENE_LINE_STEP;
    }
    last_tick = current_tick;

    for (let i = -2; i < d; i += SCENE_LINE_STEP) {
      let d = -i - scene_position;
      vertices = vertices.concat([
        -w, 0, d,  -w, h, d,
        -w, h, d,   w, h, d,
         w, h, d,   w, 0, d,
         w, 0, d,  -w, 0, d,
      ]);
      items += 8;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(mvMatrix);
    gl.drawArrays(gl.LINES, 0, items);
  }

  function clear() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, Math.PI / 2, gl.viewportWidth / gl.viewportHeight, 0.1, getGameVar('SCENE_DEPTH'));
  }

  function drawObject(gameObject) {
    drawCuboid(gameObject.x, gameObject.y, -gameObject.z, gameObject.width, gameObject.height, gameObject.depth);
  }

  return {
    init: init,
    updateGameData: updateGameData,
    clear: clear,
    drawScene: drawScene,
    drawObject: drawObject,
  }
}());

export default Drawer;