class Material {
    constructor(ambient, diffuse, specular, shininess, density) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.density = density;
    }
}

class Primitive {
    constructor(type, objData, materialIdx) {
        this.type = type;
        this.objData = objData; // Specification of that object
        this.materialIdx = materialIdx;
    }
}

class Light {
    constructor(position, ambient, diffuse, specular) {
        this.position = position;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

class Cube{
    constructor(center, sideLength){
        this.center = center;
        this.sideLength = sideLength;
        this.vertices = [
            vec3( -sideLength/2 + center[0], -sideLength/2 + center[1],  sideLength/2 + center[2]),
            vec3( -sideLength/2 + center[0],  sideLength/2 + center[1],  sideLength/2 + center[2]),
            vec3(  sideLength/2 + center[0],  sideLength/2 + center[1],  sideLength/2 + center[2]),
            vec3(  sideLength/2 + center[0], -sideLength/2 + center[1],  sideLength/2 + center[2]),
            vec3( -sideLength/2 + center[0], -sideLength/2 + center[1], -sideLength/2 + center[2]),
            vec3( -sideLength/2 + center[0],  sideLength/2 + center[1], -sideLength/2 + + center[2]),
            vec3(  sideLength/2 + center[0],  sideLength/2 + center[1], -sideLength/2 + center[2]),
            vec3(  sideLength/2 + center[0], -sideLength/2 + center[1], -sideLength/2 + center[2])
        ];
        this.sides = [];
        this.sides[0] = (new Quad(this.vertices[1],this.vertices[0],this.vertices[3],this.vertices[2]));
        this.sides[1] = (new Quad(this.vertices[2],this.vertices[3],this.vertices[7],this.vertices[6]));
        this.sides[2] = (new Quad(this.vertices[3],this.vertices[0],this.vertices[4],this.vertices[7]));
        this.sides[3] = (new Quad(this.vertices[6],this.vertices[5],this.vertices[1],this.vertices[2]));
        this.sides[4] = (new Quad(this.vertices[4],this.vertices[5],this.vertices[6],this.vertices[7]));
        this.sides[5] = (new Quad(this.vertices[5],this.vertices[4],this.vertices[0],this.vertices[1]));
    }
}

class Quad{
    constructor(a1,b1,c1,d1){
        this.a = a1;
        this.b = b1;
        this.c = c1;
        this.d = d1;
        this.planeNormal =cross(subtract(this.b,this.a),subtract(this.c,this.b));
        //D is point on plane
        this.D =vec3((this.a[0]+this.c[0])/2,(this.a[1]+this.c[1])/2,(this.a[2]+this.c[2])/2);
    }
}

class Sphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
}

class Cone {
    constructor(center, radius, height) {
        this.center = center;
        this.radius = radius;
        this.height = height;
    }
}