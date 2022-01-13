"use strict"


function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader ){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    
}


let rotationAngle = 0;
let modelMatrix = new Matrix4();
let lightBrown = new Vector3([170.0/256, 130.0/256, 65.0/256]);
let brown = new Vector3([100.0/256,65.0/256,25.0/256]);
let gray = new Vector3([190.0/256, 190.0/256, 190.0/256]);
let black = new Vector3([10.0/256, 10.0/256, 10.0/256]);
let white = new Vector3([1.0,1.0,1.0]);

function main() {
    let canvas = document.getElementById('canvas');
    let gl = canvas.getContext('webgl');

    const vertexShaderSource = document.getElementById('vertex-shader').textContent;
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    
    const fragmentShaderSource = document.getElementById('fragment-shader').textContent;
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    let program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    gl.program = program
    
    gl.canvas.width = 600;
    gl.canvas.height = 600;
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0,0,0,0);
    gl.enable(gl.DEPTH_TEST);
    
    
    let u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    let u_ViewProjMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjMatrix');
    let u_Color = gl.getUniformLocation(gl.program, 'u_Color');
    
    
    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, canvas.width/canvas.height,1.0,100.0);
    viewProjMatrix.lookAt(0, 20, 70, 0.0, 0, 0.0, 0.0, 1.0,0.0);
    
    let rotationFactor = 1000;
    let rotation = 0.0;
    let n = bindBlockData(gl);
    let oldTime = 0.0;
    let elapsedTime = 0.0;

    function rotate(ev) {
        switch (ev.keyCode) {
            case 37: //left
                rotationAngle -= 10;
                break;
            case 39: //right
                rotationAngle += 10;
                break;
            default:
                return;
        }
        draw();
    }

    document.addEventListener('keydown',function(ev){
        rotate(ev);
    });
    draw();

    function draw(newTime) {
        
        if (newTime) {
            newTime = newTime * 0.001;
            elapsedTime = newTime - oldTime;
            oldTime = newTime;
            rotation += elapsedTime * rotationFactor % 360;
        }
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        modelMatrix.setRotate(rotationAngle, 0, 1, 0);
        light(0,20,2*Math.sin(rotation/360));
        blackboard();
        floorAndWalls();

        pushMatrix(modelMatrix)
        modelMatrix.translate(-10,0,-Math.sin(rotation/360));
        desk();
        modelMatrix = popMatrix();

        pushMatrix(modelMatrix)
        modelMatrix.translate(0,0,-15);
        chair();
        modelMatrix = popMatrix();

        pushMatrix(modelMatrix)
        modelMatrix.translate(15,0,-15);
        modelMatrix.rotate(rotation/10, 0, 1, 0);
        chair();
        modelMatrix = popMatrix();

        pushMatrix(modelMatrix)
        modelMatrix.translate(15,0,0);
        chair();
        modelMatrix = popMatrix();

        pushMatrix(modelMatrix)
        
        modelMatrix.translate(0,0,0);
        chair();
        modelMatrix = popMatrix();

        requestAnimationFrame(draw);

    }
    
    function chair() {
        
        pushMatrix(modelMatrix);
        modelMatrix.translate(1.5,6,-3);
        drawBlock(4,3,1,brown);
        modelMatrix=popMatrix();

        pushMatrix(modelMatrix);
        modelMatrix.translate(1.5,5,-1.5);
        drawBlock(4,1,4, brown);
        modelMatrix=popMatrix();

        pushMatrix(modelMatrix);
        modelMatrix.translate(0,0,-3);
        drawBlock(1,5,1, brown);
        modelMatrix=popMatrix();

        pushMatrix(modelMatrix);
        modelMatrix.translate(3,0,-3);
        drawBlock( 1,5,1, brown);
        modelMatrix=popMatrix();

        pushMatrix(modelMatrix);
        modelMatrix.translate(3,0,0);
        drawBlock( 1,5,1, brown);
        modelMatrix=popMatrix();

        pushMatrix(modelMatrix);
        modelMatrix.translate(0,0,0);
        drawBlock(1,5,1, brown);
        modelMatrix=popMatrix();

        
    }

    function desk() {

        pushMatrix(modelMatrix);
        modelMatrix.scale(2,1.25,1.5);
        
            pushMatrix(modelMatrix);
            modelMatrix.translate(1.5,5,-1.5);
            drawBlock(4,1,4,lightBrown);
            modelMatrix=popMatrix();

            pushMatrix(modelMatrix);
            modelMatrix.translate(0,0,-3);
            drawBlock(1,5,1,lightBrown);
            modelMatrix=popMatrix();

            pushMatrix(modelMatrix);
            modelMatrix.translate(3,0,-3);
            drawBlock(1,5,1,lightBrown);
            modelMatrix=popMatrix();

            pushMatrix(modelMatrix);
            modelMatrix.translate(3,0,0);
            drawBlock(1,5,1,lightBrown);
            modelMatrix=popMatrix();

            pushMatrix(modelMatrix);
            modelMatrix.translate(0,0,0);
            drawBlock(1,5,1,lightBrown);
            modelMatrix=popMatrix();

        modelMatrix=popMatrix();
    }


    function light(x,y,z) {
        pushMatrix(modelMatrix);
        modelMatrix.translate(x,y+0.5,z);
        drawBlock( 0.5, 0.5, 0.5, white)
        gl.uniform3f(u_LightPosition, x, y, z);
        modelMatrix = popMatrix();
    }

    function blackboard(size=40){
        pushMatrix(modelMatrix);
        modelMatrix.translate(0,2,size/2-0.5);
        drawBlock(20,12,1, black);
        modelMatrix=popMatrix();
    }

    function floorAndWalls(size=40, height=15){

        //wall2
        pushMatrix(modelMatrix);
        modelMatrix.translate(0,0,size/2);
        drawBlock(size,height,1, gray);
        modelMatrix=popMatrix();
        //wall 1 (clockwise)
        pushMatrix(modelMatrix);
        modelMatrix.translate(-size/2, 0 ,0);
        drawBlock(1,height,size, gray);
        modelMatrix=popMatrix();
        //floor
        pushMatrix(modelMatrix);
        modelMatrix.translate(0,-1,0);
        drawBlock(size,1,size, gray);
        modelMatrix=popMatrix();
    }



    function bindBlockData(gl){
        //copied from MultiJointModel.js
        var vertices = new Float32Array([
            0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
            0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
            0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
            -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
            -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
            0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
        ]);
        
        // Normal
        var normals = new Float32Array([
            0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
            1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
            0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
            0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
            0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
        ]);

        // Indices of the vertices
        var indices = new Uint8Array([
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // down
            20,21,22,  20,22,23     // back
        ]);

        bindAttribute(gl, 'a_Position', vertices, 3);
        bindAttribute(gl, 'a_Normal', normals, 3);

        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return indices.length
    }

    function bindAttribute(gl, attributeName, data, size) {
        let a_Attribute = gl.getAttribLocation(gl.program, attributeName);

        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Attribute, size, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(a_Attribute);
    }

    function drawBlock(width, height, depth, color = gray){

        pushMatrix(modelMatrix);
        modelMatrix.scale(width, height, depth);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);
        
        gl.uniform3fv(u_Color, color.elements);

        let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
        modelMatrix = popMatrix();
    }
}





// copied from MultiJointModel.js
var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

main();