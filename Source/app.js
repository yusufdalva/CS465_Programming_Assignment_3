// WebGL setup parameters
let canvas;
let gl;
let program;

// Texture to send
let texture;

// LookAt parameters - Camera location
//let eye = vec4(radius*Math.sin(theta)*Math.cos(phi),
  //  radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta), 1.0);
let eye = vec3(0.5, 0.0,-2.0);

// Grid dimensions for the canvas
let nRows = 512;
let nColumns = 512;

// Data for canvas pixels - traced by trace() function
let data = new Uint8ClampedArray(nRows * nColumns * 3);

// List of available materials
let materials = [
    new Material(vec3( 0.5, 1.0, 1.0), vec3( 0.2, 0.5, 0.3), vec3( 0.8, 0.9, 0.7), 50.0, 0.2),
    new Material(vec3( 0.5, 1.0, 1.0), vec3( 0.2, 0.2, 0.2), vec3( 0.3, 0.9, 0.7), 50.0, 0.9),
    new Material(vec3( 0.5, 0.5, 0.5), vec3( 0.6, 0.0, 0.7), vec3( 0.3, 0.3, 0.4), 50.0, 0.2),
    new Material(vec3( 0.5, 1.0, 1.0), vec3( 0.2, 0.5, 0.3), vec3( 0.8, 0.9, 0.7), 50.0, 0.2)
];

// Objects present in the scene
let objects = [
    new Primitive("sphere", new Sphere(vec3(0.0, 0.0, 0.0), 0.5), 2),
    new Primitive("cube", new Cube(vec3(-1.5, 0.0, 0.0), 0.5), 1),
    new Primitive("cone", new Cone(vec3(1.0, 0.0, 0.0), 0.5, 1.0), 0)
];

// Ambient light
let lights = [
    new Light(vec3(1.0, 1.0, -5.0), vec3(0.2, 0.2, 0.2), vec3( 1.0, 1.0, 1.0), vec3( 1.0, 1.0, 1.0))
];

// Ray tracing iteration limit
const iterLimit = 3;
// Intersection threshold
let sphereEpsilon = 0.0;

/*
* vertex data structure:
* { normal: 3D point
*   point: 3D point, the vertex itself
* }
* */

function createSaveJSON() {
    let mat = [];
    for (let i = 0; i < materials.length; i++) {
        let material = {
            ambient: materials[i].ambient,
            diffuse: materials[i].diffuse,
            specular: materials[i].specular,
            shininess: materials[i].shininess,
            density: materials[i].density
        };
        mat.push(material);
    }
    let light = [];
    for (let i = 0; i < lights.length; i++) {
        let l = {
            position: lights[i].position,
            ambient: lights[i].ambient,
            diffuse: lights[i].diffuse,
            specular: lights[i].specular
        };
        light.push(l);
    }
    let shapes = [];
    for (let i = 0; i < objects.length; i++) {
        let shape = {
            type: objects[i].type,
            materialIdx: objects[i].materialIdx
        };
        if (shape.type === "sphere") {
            shape.objData = {
                center: objects[i].objData.center,
                radius: objects[i].objData.radius
            };
        } else if (shape.type === "cone") {
            shape.objData = {
                center: objects[i].objData.center,
                radius: objects[i].objData.radius,
                height: objects[i].objData.height
            }
        } else if (shape.type === "cube") {
            console.log("HERE");
            console.log(objects[i].objData);
            shape.objData = {
                center: objects[i].objData.center,
                sideLength: objects[i].objData.sideLength
            };
            console.log(shape.objData);
        }
        shapes.push(shape);
    }
    return {
        cop: [eye[0], eye[1], eye[2]],
        materials: mat,
        lights: light,
        shapes: shapes
    };
}

function parseData(data) {
    let json = JSON.parse(data.toString());
    eye = vec3(json.cop);
    materials = [];
    for (let i = 0; i < json.materials.length; i++) {
        materials.push(new Material(json.materials[i].ambient, json.materials[i].diffuse,
            json.materials[i].specular, json.materials[i].shininess, json.materials[i].density));
    }
    lights = [];
    for (let i = 0; i < json.lights.length; i++) {
        lights.push(new Light(json.lights[i].position, json.lights[i].ambient, json.lights[i].diffuse, json.lights[i].specular));
    }
    objects = [];
    for (let i = 0; i < json.shapes.length; i++) {
        let obj;
        if (json.shapes[i].type === "sphere") {
            obj = new Sphere(json.shapes[i].objData.center, json.shapes[i].objData.radius);
        } else if (json.shapes[i].type === "cone") {
            obj = new Cone(json.shapes[i].objData.center, json.shapes[i].objData.radius, json.shapes[i].objData.height);
        } else if (json.shapes[i].type === "cube") {
            obj = new Cube(json.shapes[i].objData.center, json.shapes[i].objData.sideLength);
        }
        objects.push(new Primitive(json.shapes[i].type, obj, json.shapes[i].materialIdx));
    }
}

function saveData(data) {
    let el = document.createElement("a");
    let docData = JSON.stringify(data);
    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(docData));
    el.setAttribute("download", "data.txt");
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

// Assumed that the base is on x-z plane
function getSphereIntersection(p, d, r, center) {
    // Sphere eqn: (x-x0)^2 + (y-y0)^2 + (z - z0)^2 - r^2 = 0
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

function getConeIntersection(p, d, center, r, h) {
  // Cone eqn: (x^2 + z^2) / c^2 = (y - h)^2
  // c = r/h
    if (!h) {
        return null;
    }
    let k = r / h;
    let x = p[0] - center[0];
    let y = p[1] - center[1];
    let z = p[2] - center[2];
    let a = Math.pow(d[0], 2) + Math.pow(d[2], 2) - (Math.pow(k, 2) * Math.pow(d[1], 2));
    let b = 2 * (d[0] * x + d[2] * z - Math.pow(k, 2) * y * d[1]);
    let c = (x * x) + (z * z) + ((k * k) * (y * y));
    let delta = Math.pow(b, 2) - 4 * a * c;
    if (delta < 0) {
        return null;
    }
    let t1, t2;
    t1 = (-b + Math.sqrt(delta)) / (2 * a);
    t2 = (-b - Math.sqrt(delta)) / (2 * a);
    if (t1 < 0 && t2 < 0) {
        return null;
    }
    let nearest = Math.min(t1, t2);
    let result;
    if (nearest > 0) {
        result = nearest;
    } else {
        result = Math.max(t1, t2);
    }
    let intersect = add(p, scale(result, d));
    let yDiff = intersect[1] - center[1];
    if (yDiff > 0) {
        return null;
    }
    if (!yDiff) {
        return [result, vec3(0, -1, 0)];
    }
    if ((yDiff * yDiff) > (h * h)) {
        return null;
    }
    return [result, vec3(intersect[0], Math.sqrt(intersect[0] * intersect[0] + intersect[2] * intersect[2]) * k, intersect[2])];
}

// Tests whether the point is inside a triangle - for polygonal prism in app
function pointInTriangleTest(a, b, c, point) {
    // a,b,c - sides of triangle
    // x - point to check
    // Compute vectors     
  //console.log("POINTS ",a,b,c,point);
  let v0 = subtract(c,a);
  let v1 = subtract(b,a);
  let v2 = subtract(point, a);

  // Compute dot products
  let dot00 = dot(v0, v0);
  let dot01 = dot(v0, v1);
  let dot02 = dot(v0, v2);
  let dot11 = dot(v1, v1);
  let dot12 = dot(v1, v2);

  // Compute barycentric coordinates
  let denominator = (dot00 * dot11 - dot01 * dot01);
  let u = (dot11 * dot02 - dot01 * dot12) / denominator;
  let v = (dot00 * dot12 - dot01 * dot02) /denominator;
  //u = subtract(mult(dot11,dot02),mult(dot01,dot12))/denominator;
  //v = subtract(mult(dot00,dot12),mult(dot01,dot02))/denominator;
 // console.log("U is ",u);
  //console.log("v is ",v);
  // Check if point is in triangle
  //console.log("returnn ",(u >= 0) && (v >= 0) && (u + v < 1));
  return (u >= 0) && (v >= 0) && (u + v < 1)
}

function getRayPlaneIntersection(rayOrigin,rayDir,planeNormal,D){
    
  let denominator = dot(planeNormal,rayDir);
  if(denominator> 1e-6){
    //console.log("bigs",D);
    let a = subtract(rayOrigin,D);
    let t = -dot(a,planeNormal)/denominator;
    let point = add(add(a,scale(t,rayDir)),D);
    return [t,point];
  }
  return null;
}
function findDistance(v1,v2){
  let diff = 0;
  for(let i = 0; i < 3; i++){
    diff += Math.pow(subtract(v1[i],v2[i]), 2);
  }
  return Math.sqrt(diff);
}
function getCubeIntersection(rayOrigin,rayDir,cube){
  //for every plane check if ray intersects with the plane
  
  let minDis = 10000;
  let a,b,c,vd,interPoint,interPlane;

  let i;
  for(i = 0; i < 6; i++){
    let struct = getRayPlaneIntersection(rayOrigin,rayDir,cube.sides[i].planeNormal, cube.sides[i].D);
    
    if( struct != null){
      let point = struct[1];
      let how_far = struct[0];
        if(how_far<minDis){
          minDis = how_far;
          a = cube.sides[i].a;
          b = cube.sides[i].b;
          c = cube.sides[i].c;
          vd = cube.sides[i].d;
          interPlane= cube.sides[i].planeNormal;
          interPoint = point;
        }
    }
    
  }
  if(minDis != 10000){
    //check for two triangles in that plane
    if(pointInTriangleTest(a,b,c,interPoint) || pointInTriangleTest(a,c,vd,interPoint)){
      return [interPoint,interPlane];
    }
  }
  return null;
}


function reflect(point, normal, p){
  let l = normalize(subtract(point,p));
  return subtract(l,scale(2 * dot(l, normal), normal));
}
function cubeReflect(point, normal, rayDir){
    let c1 = -dot(normal,rayDir);
    return add(rayDir,scale(2,scale(c1,normal)));
}

function transmit(point,normal,p,n1,n2){
    let n = n1/n2;
    let ray = subtract(point,p);
    let c1 = -dot(ray,normal);
    let c2 = Math.sqrt(1- n^2 * (1 - c1^2));
    return add(scale(n,ray),scale(subtract(n * c1,c2),normal));
}

function phong(point, rayOrigin, normal, reflection, material, light) {
    let ambient = mult(light.ambient, material.ambient);
    ambient = subtract(ambient,vec3(0,0,0));
    // Computing the diffuse term
    
    let illDir = normalize(subtract(light.position,point)); // direction of I
    illDir = add(illDir,vec3(0,0,0));
    let sourceCos = Math.max(dot(normal,illDir),0.0);
    let diffuse = mult(light.diffuse, material.diffuse);
    diffuse = scale(sourceCos, diffuse);
    
    // Computing the specular term
    let viewerDir = normalize(subtract(point,eye));
    let specular = mult(light.specular, material.specular);
    specular = scale(Math.pow(Math.max(dot(reflection, viewerDir),0.0), material.shininess), specular);
    //specular = scale(Math.max(Math.pow(dot(reflection, viewerDir), material.shininess), 0.0), specular);
    return add(add(ambient,diffuse),specular);
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
            let distance = getSphereIntersection(origin, dirVector, objects[objIdx].objData.radius, objects[objIdx].objData.center);
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
                        material: materials[closestObject.materialIdx],
                    };
                }
            }
        }
        else if(objects[objIdx].type === "cube"){
          let struct = getCubeIntersection(origin,dirVector,objects[objIdx].objData);
          if(struct != null){
            let point = struct[0];
            let cubeDist = findDistance(point,origin);
            if(cubeDist< t){
              t = cubeDist;
              closestObject = objects[objIdx];
              normal = struct[1];
              intersection = {
                point: point,
                type: closestObject.type,
                normal: normal,
                material: materials[closestObject.materialIdx],
              };
            }
          }
        }
        if(objects[objIdx].type === "cone") {
          let distance = getConeIntersection(origin, dirVector, objects[objIdx].objData.center, objects[objIdx].objData.radius, objects[objIdx].objData.height);
          if (distance !== null) {
              if (distance[0] < t) {
                  t = distance[0];
                  closestObject = objects[objIdx];
                  point = add(origin, scale(t, dirVector));
                  normal = distance[1]; // Will change this
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
        return vec3(0.0, 0.0, 0.0);
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
        if (!iterCount) {
            return vec3(0.0, Math.abs(origin[1]), Math.abs(origin[0]));
        }
        return vec3(0.0, 0.0, 0.0);
    }
    let normal = intersection.normal;
    let reflection = reflect(intersection.point, normalize(normal), origin);

    // point, rayOrigin, normal, reflection, material, light
    let local = phong(intersection.point, origin, normal, reflection, intersection.material, light);
    let reflected = rayTrace(intersection.point, reflection, light,iterCount + 1);
/*
    if (intersection.type !== "cube") {
        let transmission= transmit(intersection.point, normalize(normal), origin, 1.0, intersection.material.density);
        let transmitted = rayTrace(intersection.point, transmission, light,iterCount + 1);
        return add(add(local, reflected), transmitted);
    }
 */
    return add(local, reflected);
}

// Ray tracing function
function trace() {
    // Grid logic -> nRows x nColumns grid
    for (let colIdx = 0; colIdx < nColumns; colIdx++) {
        for (let rowIdx = 0; rowIdx < nRows; rowIdx++) {
          let p = vec3(2 * (rowIdx / nRows) - 1.0, 1.0 - 2 * (colIdx / nColumns),-1.0);
          let d = normalize(subtract(p, eye));
          let color = rayTrace(p, d, lights[0],0);
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

    document.getElementById("download-button").addEventListener("click", function () {
        data = createSaveJSON();
        saveData(data);
    });

    let loadButton = document.getElementById("upload-button");
    loadButton.addEventListener("input", function () {
        let reader = new FileReader();
        let data = loadButton.files[0];
        reader.readAsText(data);
        reader.onload = function () {
            parseData(reader.result);
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            // Texture Parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            render();
            alert("LOADED");
        }
    });

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
}

window.onload = init;