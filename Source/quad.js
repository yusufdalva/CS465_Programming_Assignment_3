class Quad{
    planeNormal;
    D;
    constructor(a,b,c,d){
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.planeNormal =normalize(cross(subtract(b-a),subtract(c-a)));
        this.D = distance((a),(0,0,0));
    }
}