class Quad{
    planeNormal;
    D;
    
    constructor(a1,b1,c1,d1){
        this.a = a1;
        this.b = b1;
        this.c = c1;
        this.d = d1;
        this.planeNormal =normalize(cross(subtract(this.b,this.a),subtract(this.c,this.b)));
        this.planeNormal = vec4(this.planeNormal,1);
        console.log("FIRSST PLANE NORMAL ",this.planeNormal);
        //let pointOnPlane = vec4((this.a[0] + this.b[0])/2,(this.a[1]+this.b[1])/2,this.a[2],1);
        this.D =this.a;
        
       /* let diff = 0;
        for(let i = 0; i < 3; i++){
            diff = (pointOnPlane[i])^2;
        }
        this.D = Math.sqrt(diff);*/

    }
}