// WebGL setup parameters
let canvas;
let gl;
let program;

// LookAt parameters - Camera location
let eye;
let at;
let up;

// Grid dimensions for the canvas
const nRows = 512;
const nColumns = 512;

function init() {
    // WebGL Setup
    canvas = document.getElementById("app-canvas");
    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("WebGL not available!"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Connecting Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
}

window.onload = init;