class Material {
    constructor(ambient, diffuse, specular, shininess, density) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.density = density;
    }
}

class Object {
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