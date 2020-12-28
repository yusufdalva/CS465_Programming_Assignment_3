// WebGL setup parameters
let canvas;
let gl;
let program;

// Texture to send
let texture;

// View parameters
let radius = 1.5;
let theta  = 0.0;
let phi    = 0.0;

// LookAt parameters - Camera location
let eye = vec4(radius*Math.sin(theta)*Math.cos(phi),
    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta), 1.0);
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

// Grid dimensions for the canvas
let nRows = 512;
let nColumns = 512;

// Data for canvas pixels - traced by trace() function
let data = new Uint8ClampedArray(nRows * nColumns * 3);

// List of available materials
let materials = [
    new Material(vec4( 1.0, 1.0, 1.0, 1.0 ), vec4( 1.0, 0.8, 0.0, 1.0), vec4( 1.0, 0.8, 0.0, 1.0 ), 100.0, 0.9)
];

// Objects present in the scene
let objects = [
    {type: "sphere", center: vec3(0.0, 0.0, 0.0), radius: 1.0, materialIdx: 0}
];

// Ambient light
let lights = [
    new Light(vec4(1.0, 1.0, 1.0, 0.0 ), vec4(0.2, 0.2, 0.2, 1.0 ), vec4( 1.0, 1.0, 1.0, 1.0 ), vec4( 1.0, 1.0, 1.0, 1.0 ))
];

// Ray tracing iteration limit
const iterLimit = 2;
// Background Color
const backgroundColor = vec4(0.8, 0.8, 0.8, 1.0);
// Intersection threshold
let sphereEpsilon = 0.0;

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
    let b = 2 * ((p[0] - center[0]) * d[0] + (p[1] - center[1]) * d[1] + (p[2] - center[2]) * d[2]);
    let c = Math.pow(p[0] - center[0], 2) + Math.pow(p[1] - center[1], 2) + Math.pow(p[2] - center[2], 2) - Math.pow(r, 2);
    let delta = Math.pow(b, 2) - 4 * c;
    if (delta < sphereEpsilon) {
        return null;
    }
    let t1, t2;
    t1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * c)) / 2;
    t2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * c)) / 2;
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
    let l = normalize(subtract(point,p));
    return subtract(scale(2 * dot(l, normal), normal), l);
}

function transmit(point,normal,p,n1,n2){
    let n = n1/n2;
    let ray = subtract(point,p);
    let c1 = -dot(ray,normal);
    let c2 = Math.sqrt(1- n^2 * (1 - c1^2));
    return add(scale(n,ray),scale((n * c1 - c2),normal));
}

function phong(point, rayOrigin, normal, reflection, material, light) {
    console.assert(Math.sqrt(dot(normal, normal)) === 1.0); // Normalization check
    console.assert(Math.sqrt(dot(reflection, reflection)) === 1.0); // Normalization check
    // Computing the ambient term
    let ambient = mult(light.ambient, material.ambient);
    // Computing the diffuse term
    let illDir = normalize(subtract(point, rayOrigin)); // direction of I
    let sourceCos = dot(illDir, normal);
    let diffuse = mult(light.diffuse, material.diffuse);
    diffuse = scale(sourceCos, diffuse);
    // Computing the specular term
    let viewerDir = normalize(subtract(point,eye));
    let specular = mult(light.specular, material.specular);
    specular = scale(Math.max(Math.pow(dot(reflection, viewerDir), material.shininess), 0.0), specular);
    return add(add(ambient, diffuse), specular);
}

// Creating a cube as triangles. Will not be sent to shaders, just to determine the triangle surfaces
function createCube() {
    // Main structure: First define the triangle as a triad, then compute and store the normal

}

function findClosestIntersection(origin, dirVector) {
    // What to do:
    // Traverse through all the objects and compare the t values
    let t = Number.POSITIVE_INFINITY;
    let closestObject;
    let normal;
    let point;
    let intersection = null;
    for (let objIdx = 0; objIdx < objects.length; objIdx++) {
        if (objects[objIdx].type === "sphere") {
            let distance = getSphereIntersection(origin, dirVector, objects[objIdx].radius, objects[objIdx].center);
            if (distance !== null) {
                if (distance < t) {
                    t = distance;
                    closestObject = objects[objIdx];
                    point = add(origin, scale(t, dirVector));
                    normal = point;
                    intersection = {
                        point: point,
                        type: closestObject.type,
                        normal: normal,
                        material: materials[closestObject.materialIdx]
                    };
                }
            }
        }
    }
    // Will return an intersection data structure
    return intersection;
}

function rayTrace(origin, dirVector, light, iterCount) {
    // origin corresponds to p in p + t * d
    // dirVector corresponds to d in p + t * d
    if (iterCount > iterLimit) {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }
    let intersection = findClosestIntersection(origin, dirVector);
    // Intersection data structure:
    /* Object with:
    * point: Intersection point
    * type: "light" or object type (sphere, cone, cube)
    * normal: Normal vector of intersection
    * material: Material properties of the object
    * */
    if (intersection === null) {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }
    let normal = intersection.normal;
    let reflection = reflect(intersection.point, normalize(normal), origin);
    let transmission= transmit(intersection.point, normalize(normal), origin, 1.0, intersection.material.density);

    // point, rayOrigin, normal, reflection, material, light
    let local = phong(intersection.point, origin, normal, reflection, intersection.material, light);
    let reflected = rayTrace(intersection.point, reflection, light,iterCount + 1);
    let transmitted = rayTrace(intersection.point, transmission, light,iterCount + 1);

    return add(add(local, reflected), transmitted);
}

// Ray tracing function
function trace() {
    // Grid logic -> nRows x nColumns grid
    for (let colIdx = 0; colIdx < nColumns; colIdx++) {
        for (let rowIdx = 0; rowIdx < nRows; rowIdx++) {
            let p = vec4(2 * (rowIdx / nRows) - 1.0, 2 * (colIdx / nColumns) - 1.0, 0.0, 1.0);
            let d = normalize(subtract(p, eye));
            let color = rayTrace(p, d, lights[0],0);
            console.log(color);
            data[(colIdx * nRows + rowIdx) * 3] = 255 * color[0];
            data[(colIdx * nRows + rowIdx) * 3 + 1] = 255 * color[1];
            data[(colIdx * nRows + rowIdx) * 3 + 2] = 255 * color[2];
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
    gl.useProgram( program );

    // Texture vertices
    let pointsArray = [];
    let texCoords = [];

    // Texture Coordinates
    pointsArray.push(vec2(-1, -1));
    pointsArray.push(vec2(-1, 1));
    pointsArray.push(vec2(1, 1));
    pointsArray.push(vec2(1, -1));

    texCoords.push(vec2(0, 0));
    texCoords.push(vec2(0, 1));
    texCoords.push(vec2(1, 1));
    texCoords.push(vec2(1, 0));

    // Sending data to shaders
    // Texture coordinates
    let texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vTexCoord);

    // Vertex coordinates for texture
    let posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Texture setup
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Texture Parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    render();
}

function render() {
    trace();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        nColumns,
        nRows,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        data
    );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    //requestAnimFrame(render);
}

window.onload = init;