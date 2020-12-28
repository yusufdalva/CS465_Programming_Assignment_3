class Cube{
    vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];
    sides = [];
    constructor(){
        this.sides.append(new quad(this.vertices[1],this.vertices[0],this.vertices[3],this.vertices[2])); 
        this.sides.append(new quad(this.vertices[2],this.vertices[3],this.vertices[7],this.vertices[6])); 
        this.sides.append(new quad(this.vertices[3],this.vertices[0],this.vertices[4],this.vertices[7]));
        this.sides.append(new quad(this.vertices[6],this.vertices[5],this.vertices[1],this.vertices[2]));  
        this.sides.append(new quad(this.vertices[4],this.vertices[5],this.vertices[6],this.vertices[7])); 
        this.sides.append(new quad(this.vertices[5],this.vertices[4],this.vertices[0],this.vertices[1])); 
    }
}