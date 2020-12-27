// WebGL setup parameters
let canvas;
let gl;
let program;

// View parameters
let radius = 1.5;
let theta  = 0.0;
let phi    = 0.0;

// LookAt parameters - Camera location
let eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

// Grid dimensions for the canvas
let nRows = 128;
let nColumns = 128;

// Data for canvas pixels - traced by trace() function
let data = [];

// List of available materials
let materials = [
    new Material(vec4( 1.0, 1.0, 1.0, 1.0 ), vec4( 1.0, 0.8, 0.0, 1.0), vec4( 1.0, 0.8, 0.0, 1.0 ), 100.0)
];

// Objects present in the scene
let objects = [
    {type: "sphere", center: vec3(0.0, 0.0, 0.0), radius: 1.0, materialIdx: 0}
];

// Ambient light
let lights = [
    new Light(vec4(1.0, 1.0, 1.0, 0.0 ), vec4(0.2, 0.2, 0.2, 1.0 ), vec4( 1.0, 1.0, 1.0, 1.0 ))
];

// Ray tracing iteration limit
const iterLimit = 5;
// Background Color
const backgroundColor = vec4(0.8, 0.8, 0.8, 1.0);

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

function reflect(point, normal, p){
    let l = normalize(point - p);
    return 2 * normal * dot(l, normal) - l;
}

function transmit(point,normal,p,n1,n2){
    let n = n1/n2;
    let ray = point - p;
    let c1 = -dot(ray,normal);
    let c2 = Math.sqrt(1- n^2 * (1 - c1^2));
    return (n * ray) + (n * c1 - c2) * normal;
}

function phong(point, rayOrigin, normal, reflection, material, light) {
    console.assert(Math.sqrt(dot(normal, normal)) === 1.0); // Normalization check
    console.assert(Math.sqrt(dot(reflection, reflection)) === 1.0); // Normalization check
    // Computing the ambient term
    let ambient = mult(light.ambient, material.ambient);
    // Computing the diffuse term
    let illDir = normalize(point - rayOrigin); // direction of I
    let sourceCos = dot(illDir, normal);
    let diffuse = mult(light.diffuse, material.diffuse);
    diffuse = scale(sourceCos, diffuse);
    // Computing the specular term
    let viewerDir = normalize(point - eye);
    let specular = mult(light.specular, material.specular);
    specular = scale(Math.max(Math.pow(dot(reflection, viewerDir), material.shininess), 0.0), specular);
    return ambient + diffuse + specular;
}

// Creating a cube as triangles. Will not be sent to shaders, just to determine the triangle surfaces
function createCube() {
    // Main structure: First define the triangle as a triad, then compute and store the normal

}

function findClosestIntersection(origin, dirVector) {
    // What to do:
    // Traverse through all the objects and compare the t values
    for (let objIdx = 0; objIdx < objects.length; objIdx++) {
        // TODO - Find distances as t and take the min
        if (objects[objIdx].type === "sphere") {

        } else if (objects[objIdx].type === "cone") {

        } else if (objects[objIdx].type === "triangle") {

        }
    }
    // Will return an intersection data structure
    let intersection = {
        point: null,
        type: null,
        normal: null,
        ambient: null,
        diffuse: null,
        specular: null,
    };
    return vec3();
}

function rayTrace(origin, dirVector, iterCount) {
    // origin corresponds to p in p + t * d
    // dirVector corresponds to d in p + t * d
    if (iterCount > iterLimit) {
        return backgroundColor; // Background Color
    }
    // TODO - Implement Ray Casting for each ray
    let intersection = findClosestIntersection(origin, dirVector);
    // Intersection data structure:
    /* Object with:
    * point: Intersection point
    * type: "light" or object type (sphere, cone, cube)
    * normal: Normal vector of intersection
    * ambient: Ambient component of material or light
    * diffuse: Diffuse component of material or light
    * specular: Specular component of material or light
    * */
    if (intersection.type === "light") {
        return [intersection.ambient, intersection.diffuse, intersection.specular];
    }
    if (!intersection) {
        return backgroundColor; // Background Color
    }
    let normal = intersection.normal;
    let reflection = reflect(intersection, normal);
    let transmission= transmit(intersection, normal);

    let local = phong(intersection.point, normal, transmission);
    let reflected = rayTrace(intersection.point, reflection, iterCount + 1);
    let transmitted = rayTrace(intersection.point, transmission, iterCount + 1);

    return (local + reflected + transmitted);
}

// Ray tracing function
function trace() {
    // Grid logic -> nRows x nColumns grid
    for (let rowIdx = 0; rowIdx < nRows; rowIdx++) {
        data[rowIdx] = [];
        for (let colIdx = 0; colIdx < nColumns; colIdx++) {
            let p = vec3(2 * (rowIdx / nRows) - 1.0, 2 * (colIdx / nColumns) - 1.0, 0.0);
            let d = normalize(p - eye);
            data[rowIdx][colIdx] = rayTrace(p, d, 0);
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