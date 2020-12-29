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
        this.vertices = [
            vec4( -sideLength/2 + center[0], -sideLength/2 + center[1],  sideLength/2 + center[2], 1.0 ),
            vec4( -sideLength/2 + center[0],  sideLength/2 + center[1],  sideLength/2 + center[2], 1.0 ),
            vec4(  sideLength/2 + center[0],  sideLength/2 + center[1],  sideLength/2 + center[2], 1.0 ),
            vec4(  sideLength/2 + center[0], -sideLength/2 + center[1],  sideLength/2 + center[2], 1.0 ),
            vec4( -sideLength/2 + center[0], -sideLength/2 + center[1], -sideLength/2 + center[2], 1.0 ),
            vec4( -sideLength/2 + center[0],  sideLength/2 + center[1], -sideLength/2 + + center[2], 1.0 ),
            vec4(  sideLength/2 + center[0],  sideLength/2 + center[1], -sideLength/2 + center[2], 1.0 ),
            vec4(  sideLength/2 + center[0], -sideLength/2 + center[1], -sideLength/2 + center[2], 1.0 )
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
        this.planeNormal =normalize(cross(subtract(this.b,this.a),subtract(this.c,this.b)));
        this.planeNormal = vec4(this.planeNormal,0);
        console.log("FIRSST PLANE NORMAL ",this.planeNormal);
        //D is point on plane
        this.D =vec4((this.a[0]+this.c[0])/2,(this.a[1]+this.c[1])/2,(this.a[2]+this.c[2])/2,1);
        console.log("D is ",this.D);
        console.log("dot is ",dot(subtract(this.a,this.D),this.planeNormal));
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