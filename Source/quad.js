class Quad{
    planeNormal;
    D;
    
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