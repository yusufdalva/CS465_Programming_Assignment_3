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
        this.sides[0] = (new Quad(this.vertices[1],this.vertices[0],this.vertices[3],this.vertices[2])); 
        this.sides[1] = (new Quad(this.vertices[2],this.vertices[3],this.vertices[7],this.vertices[6])); 
        this.sides[2] = (new Quad(this.vertices[3],this.vertices[0],this.vertices[4],this.vertices[7]));
        this.sides[3] = (new Quad(this.vertices[6],this.vertices[5],this.vertices[1],this.vertices[2]));  
        this.sides[4] = (new Quad(this.vertices[4],this.vertices[5],this.vertices[6],this.vertices[7])); 
        this.sides[5] = (new Quad(this.vertices[5],this.vertices[4],this.vertices[0],this.vertices[1])); 
    }
}