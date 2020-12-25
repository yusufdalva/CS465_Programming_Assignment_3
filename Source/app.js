// WebGL setup parameters
let canvas;
let gl;
let program;

// LookAt parameters - Camera location
let eye;
let at;
let up;

// Grid dimensions for the canvas
let nRows = 128;
let nColumns = 128;

// Data for canvas pixels - traced by trace() function
let data = [];

// List of available materials
let materials = [
    {diffuse: vec4( 1.0, 0.8, 0.0, 1.0), specular: vec4( 1.0, 0.8, 0.0, 1.0 )}
];

// Objects present in the scene
let objects = [
    {type: "sphere", center: vec3(0.0, 0.0, 0.0), radius: 1.0, materialIdx: 0}
];

// Ambient light
let ambient;

// Ray tracing iteration limit
const iterLimit = 5;

/*
* vertex data structure:
* { normal: 3D point
*   point: 3D point, the vertex itself
* }
* */

// Assumed that the base is on x-z plane
function getSphereIntersection(p, d, r, center) {
    // Sphere eqn: (x-x0)^2 + (y-y0)^2 + (z - z0)^2 - r^2 = 0
    console.assert(Math.pow(d[0], 2) + Math.pow(d[1], 2) + Math.pow(d[2], 2) === 1.0);
    let a = 1;
    let b = 2 * ((p[0] - center[0]) * d[0] + (p[1] - center[1]) * d[1] + (p[2] - center[2]) * d[2]);
    let c = Math.pow(p[0] - center[0], 2) + Math.pow(p[1] - center[1], 2) + Math.pow(p[2] - center[2], 2) - Math.pow(r, 2);
    let delta = Math.pow(b, 2) - 4 * c;
    if (delta < 0) {
        return null;
    }
    let t1, t2;
    t1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * c)) / (2 * a);
    t2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * c)) / (2 * a);
    if (t1 < 0 && t2 < 0) {
        return null;
    }
    let nearest = Math.min(t1, t2);
    if (nearest > 0) {
        return nearest;
    }
    return Math.max(t1, t2);
}

function getConeIntersection(x, z, r, h, z0) {
    // Cone eqn: (x^2 + z^2) / c^2 = (y - h)^2
    // c = r/h
}

// Tests whether the point is inside a triangle - for polygonal prism in app
function pointInTriangleTest(a, b, c, x) {
    // a,b,c - sides of triangle
    // x - point to check
}

function getCubeIntersection() {

}

function generateCubeVertices(center) {

}

// Creating a cube as triangles. Will not be sent to shaders, just to determine the triangle surfaces
function createCube() {
    // Main structure: First define the triangle as a triad, then compute and store the normal

}

function rayTrace(origin, dirVector) {
    // origin corresponds to p in p + t * d
    // dirVector corresponds to d in p + t * d
    return 0
}

// Ray tracing function
function trace() {
    // Grid logic -> nRows x nColumns grid
    for (let rowIdx = 0; rowIdx < nRows; rowIdx++) {
        data[rowIdx] = [];
        for (let colIdx = 0; colIdx < nColumns; colIdx++) {
            // TODO - Compute starting p and d
            data[rowIdx][colIdx] = rayTrace();
        }
    }
}

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

function render() {

}

window.onload = init;