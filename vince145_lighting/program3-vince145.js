// Matthew Vincent vince145 4716328
// CSCI 4611 Assignment #03

// Light should rotate in same fashion that
// the viewing camera rotates by holding shift
// while dragging the mouse

var canvas;
var gl;
var programId;

var numAngles = 8;
var stepsPerCurve = 6;
var shape = "profile1";
var spacer = 100;

// The OpenGL ID of the vertex buffer containing the current shape
var positionBufferId;

// The number of vertices in the current vertex buffer
var vertexCount;

var lightPosition = vec4(9.651822423049309, -0.4997916927067836, 2.5675926814477155, 0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 0.0, 0.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 0.0, 0.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;


// Textures


var textureOn = -1.0;
var texSize = 64;
var numRows = 8;
var numCols = 8;

var myTexels = new Uint8Array(4*texSize*texSize);

for (var i = 0; i < texSize; ++i) {
  for (var j = 0; j < texSize; ++j) {
     var patchx = Math.floor(i/(texSize/numRows));
     var patchy = Math.floor(j/(texSize/numRows));

     var c = (patchx%2 !== patchy%2 ? 255 : 0);

     myTexels[4*i*texSize+4*j]     = c;
     myTexels[4*i*texSize+4*j+1]   = c;
     myTexels[4*i*texSize+4*j+2]   = c; 
     myTexels[4*i*texSize+4*j+3]   = 255;
  }
}


// Binds "on-change" events for the controls on the web page
function initControlEvents() {
    // Use one event handler for all of the shape controls
    document.getElementById("shape-select").onchange = 
    document.getElementById("numAngles").onchange =
    document.getElementById("stepsPerCurve").onchange =
        function(e) {
            shape = document.getElementById("shape-select").value;
            numAngles = parseFloat(document.getElementById("numAngles").value);
            stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value);
            
            // Regenerate the vertex data
            vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
        };
        
    // Event handler for the material control
    document.getElementById("material").onchange = 
    document.getElementById("textureType").onchange = 
        function(e) {
            updateMaterial(getMaterial(), getTexture());
        };
}

// The current view matrix
var viewMatrix;

// Sets up keyboard and mouse events
function initWindowEvents() {
    
    // Whether or not the mouse button is currently being held down for a drag.
    var mousePressed = false;
    
    // Affects how much the camera moves when the mouse is dragged.
    var sensitivity = 0.01;
    
    var theta = 0, phi = 0, radius = 5;
    var thetaL = 0, phiL = 0, radiusL = 10;
    
    // The place where a mouse drag was started.
    var prevX, prevY;
    
    var grabbedPoint;
    
    canvas.onmousedown = function(e) {
        // A mouse drag started.
        mousePressed = true;
        
        // Remember where the mouse drag started.
        prevX = e.clientX;
        prevY = e.clientY;
    }

    canvas.onmousemove = function(e) {
        if (mousePressed) {
            
            if (e.shiftKey) {
                // Handle light movement here.
                thetaL += (e.clientX - prevX) * sensitivity;
                phiL += (e.clientY - prevY) * sensitivity;
                
                /*
                if (thetaL < -2 * Math.PI) {
                    thetaL += 2 * Math.PI;
                } else if (thetaL > 2 * Math.PI) {
                    thetaL -= 2 * Math.PI;
                }
                
                
                if (phiL < -Math.PI / 2) {
                    phiL = -Math.PI / 2;
                } else if (phiL > Math.PI / 2) {
                    phiL = Math.PI / 2;
                }
                */
                
                lightPosition[0] = radiusL * Math.cos(thetaL) * Math.cos(phiL);
                lightPosition[1] = radiusL * Math.sin(phiL);
                lightPosition[2] = radiusL * Math.sin(thetaL) * Math.cos(phiL);
                
                //lightPosition[0] = lightPosition[0] + ((e.clientX - prevX) * sensitivity * 2);
                //lightPosition[1] = lightPosition[1] + ((e.clientY - prevY) * sensitivity * 2);
                if (spacer == 100) {
                    console.log("lightPos, x = " + lightPosition[0]);
                    console.log("lightPos, y = " + lightPosition[1]);
                    console.log("lightPos, z = " + lightPosition[2]);
                    spacer = 0;
                } else {
                    spacer++;
                }
                //lightPosition = vec4(1.0, 5.0, 1.0, 0.0 );
//                + vec4(e.clientX - prevX, e.clientY - prevY, 0.0, 0.0);
                gl.uniform4fv(gl.getUniformLocation(programId, "LightPosition"), flatten(lightPosition) );

            } else {
            
                // Handle a mouse drag
                theta += (e.clientX - prevX) * sensitivity;
                phi += (e.clientY - prevY) * sensitivity;
                
                
                if (theta < -2 * Math.PI) {
                    theta += 2 * Math.PI;
                } else if (theta > 2 * Math.PI) {
                    theta -= 2 * Math.PI;
                }
                
                if (phi < -Math.PI / 2) {
                    phi = -Math.PI / 2;
                } else if (phi > Math.PI / 2) {
                    phi = Math.PI / 2;
                }
                
                
                // Update the model-view matrix.
                gl.useProgram(programId);
                updateModelView(lookAt(
                    vec3(radius * Math.cos(theta) * Math.cos(phi), 
                         radius * Math.sin(phi), 
                         radius * Math.sin(theta) * Math.cos(phi)),
                    vec3(0), vec3(0, 1, 0)));
            }
                
            prevX = e.clientX;
            prevY = e.clientY;
        }
    }

    window.onmouseup = function(e) {
        // A mouse drag ended.
        mousePressed = false;
    }
    
    var speed = 0.1; // Affects how fast the camera "zooms"
    
    window.onkeydown = function(e) {
        
        if (e.keyCode === 190) { // '>' key
            // "Zoom" in
            radius -= speed;
        }
        else if (e.keyCode === 188) { // '<' key
            // "Zoom" out
            radius += speed;
        }
        
        // Update the model-view matrix.
        gl.useProgram(programId);
        updateModelView(lookAt(
            vec3(radius * Math.cos(theta) * Math.cos(phi), 
                 radius * Math.sin(phi), 
                 radius * Math.sin(theta) * Math.cos(phi)),
            vec3(0), vec3(0, 1, 0)));
    }
}

function getControlPoints1() {
    
    var controlPoints = [];
    
    // Initialize control point data
    for (var i = 0; i < 7; i++)
    {
        controlPoints[i] = vec4(0.5, i / 6.0 * 1.6 - 0.8, 0, 1);
    }
    
    return controlPoints;
}

function getControlPoints2() {

    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.3, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.4, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.45,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.5,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.7,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.9,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints3() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.9, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.7, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.5, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.5,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.5,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.7,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.9,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints4() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.5, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.7, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.7,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.7,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.5,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.1,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints5() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.5, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.3, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.2,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.1,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.1,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.1,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints() {
    
    if (shape == "profile1") {
        return getControlPoints1()
    }
    else if (shape == "profile2") {
        return getControlPoints2()
    }
    else if (shape == "profile3") {
        return getControlPoints3()
    }
    else if (shape == "profile4") {
        return getControlPoints4()
    }
    else if (shape == "profile5") {
        return getControlPoints5()
    }
}

function getTVector(vt)
{
    // Compute value of each basis function
    var mt = 1.0 - vt;
    return vec4(mt * mt * mt, 3 * vt * mt * mt, 3 * vt * vt * mt, vt * vt * vt);
}

function dotProduct(pnt1, pnt2, pnt3, pnt4, tVal)
{
    // Take dot product between each basis function value and the x, y, and z values
    // of the control points
    return vec3(pnt1[0]*tVal[0] + pnt2[0]*tVal[1] + pnt3[0]*tVal[2] + pnt4[0]*tVal[3],
                pnt1[1]*tVal[0] + pnt2[1]*tVal[1] + pnt3[1]*tVal[2] + pnt4[1]*tVal[3],
                pnt1[2]*tVal[0] + pnt2[2]*tVal[1] + pnt3[2]*tVal[2] + pnt4[2]*tVal[3]);
}


// You will want to edit this function to compute the additional attribute data
// for texturing and lighting

function buildSurfaceOfRevolution(controlPoints, angles, steps)
{
    if (steps % 2 == 1) {
        steps++;
    }
    
    var dt = 2.0 / steps;
    var da = 360.0 / (angles);
    
    var vertices = [];
    var texCoordsArray = [ ];
    var p = 0;
    for (var i = 0; i < 2; i++)
    {
        var bp1 = controlPoints[i * 3 + 0];
        var bp2 = controlPoints[i * 3 + 1];
        var bp3 = controlPoints[i * 3 + 2];
        var bp4 = controlPoints[i * 3 + 3];
        
        for (var t = 0; t < steps / 2; t++) {
            var p1 = dotProduct(bp1, bp2, bp3, bp4, getTVector(t * dt));
            var p2 = dotProduct(bp1, bp2, bp3, bp4, getTVector((t + 1) * dt));
            
            var savedP = p;
            for (var a = 0; a < angles; a++) {
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p1[0]);
                texCoordsArray[p] = vec2(a/angles, t/(steps/2));
                p++;
                
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p2[0]);
                texCoordsArray[p] = vec2(a/angles, (t+1)/(steps/2));
                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p1[0]);
                texCoordsArray[p] = vec2((a+1)/angles, (t)/(steps/2));
                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p1[0]);
                texCoordsArray[p] = vec2((a+1)/angles, (t)/(steps/2));
                p++;
                
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p2[0]);
                texCoordsArray[p] = vec2((a)/angles, (t+1)/(steps/2));
                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p2[0]);
                texCoordsArray[p] = vec2((a+1)/angles, (t+1)/(steps/2));
                p++;
            }
        }
    }
    
    // ############################################################
    // #
    // #
    // #
    
    
    var normalsArray = [];
    
    var p = 0;
    //var numberOfTriangles = vertices / 3;
    for (var i = 0; i < vertices.length; i += 3) {
        var t1 = subtract(vertices[i+1], vertices[i]);
        var t2 = subtract(vertices[i+2], vertices[i]);
        
        var normal = normalize(cross(t1, t2));
        var normal = vec3(normal);
        normalsArray[p] = normal;
        p++;
        normalsArray[p] = normal;
        p++;
        normalsArray[p] = normal;
        p++;
    }
    
    
    // Pass the new set of textures to the graphics card
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    

    
    // Pass the new set of normals to the graphics card
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    
    /*
    var pointArray = [];
    
    pointArray[0] = lightPosition.xyz;
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArray), gl.STATIC_DRAW);
    
    gl.drawArrays(gl.POINTS, 0, 1);
    */
    
    // #
    // #
    // #
    // ############################################################
   
    // Pass the new set of vertices to the graphics card
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    
    return vertices.length;
}

// Render the scene
function viewMethod(vertexCount) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Use 3D program
    gl.useProgram(programId);
    

    
    // Associate vertex buffers with vertex attributes
    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    
    
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    
}

function render() {
    viewMethod(vertexCount);
}

// The locations of the required GLSL uniform variables.
var locations = {};

// Looks up the locations of uniform variables once.
function findShaderVariables() {
    locations.modelView = gl.getUniformLocation(programId, "modelView");
    locations.projection = gl.getUniformLocation(programId, "projection");
    locations.triangleColor = gl.getUniformLocation(programId, "triangleColor");
}

// Pass an updated model-view matrix to the graphics card.
function updateModelView(modelView) {
    gl.uniformMatrix4fv(locations.modelView, false, flatten(modelView));
}

// Pass an updated projection matrix to the graphics card.
function updateProjection(projection) {
    gl.uniformMatrix4fv(locations.projection, false, flatten(projection));
}

// Function for querying the current material
// Returns "plastic", "brass", or "texture"
function getMaterial() {
    return document.getElementById("material").value;
}
 
// Function for querying the current material
// Returns "plastic", "brass", or "texture"
function getTexture() {
    return document.getElementById("textureType").value;
}
 
// Function called when the material changes
// Parameter will be one of "plastic", "brass", or "texture"
function updateMaterial(material, textureType) {
    
    // Add your code here to handle a material change.
    
    if (material == "plastic") {
        // Yellow RGB == 1.0, 1.0, 0.0
        textureOn = -1.0;
        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
        lightDiffuse = vec4( 1.0, 1.0, 0.0, 0.0 ); // Turned off for plastics
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 1.0, 0.0, 1.0);
        materialSpecular = vec4( 1.0, 1.0, 0.0, 0.0 ); // Turned off for plastics
        materialShininess = 100.0;
    } else if (material == "brass") {
        // Brass RGB == 0.71, 0.651, 0.259
        textureOn = -1.0;
        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
        lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
        lightSpecular = vec4( 1.0, 1.0, 1.0, 0.0 ); // Turned off for metals

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 0.71, 0.651, 0.259, 1.0 );
        materialSpecular = vec4( 0.71, 0.651, 0.259, 1.0 );
        materialShininess = 100.0;
    } else {
        textureOn = 1.0;
        
        if (textureType == "tile") {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            var imageElement = document.getElementById("tile-img");
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageElement );
        } else if (textureType == "wood") {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            var imageElement = document.getElementById("wood-img");
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageElement );
        }
        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
        lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
        
        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
        materialShininess = 100.0;
    }
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    console.log("ambientProduct = " + ambientProduct);
    console.log("diffuseProduct = " + diffuseProduct);
    console.log("specularProduct = " + specularProduct);

    gl.uniform4fv(gl.getUniformLocation(programId, "AmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(programId, "DiffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(programId, "SpecularProduct"), flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(programId, "LightPosition"), flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(programId, "Shininess"),materialShininess);
    gl.uniform1f(gl.getUniformLocation(programId, "TextureOn"), textureOn);
}

window.onload = function() {
    
    // Get initial angles and steps
    numAngles = parseFloat(document.getElementById("numAngles").value);
    stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value);
    
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    
    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
    gl.enable(gl.DEPTH_TEST);
    
    // Load shaders
    programId = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(programId);
    
    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    
    // ############################################################
    // #
    // #
    // #
    
    /*
    var pointArray = [];
    
    pointArray[0] = lightPosition.xyz;
    
    pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArray), gl.STATIC_DRAW);
    
    */
    
    // Lighting
    var junkArray = [];
    for (var i = 0; i < 10; i++) {
        junkArray[i] = 1;
    }
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(junkArray), gl.STATIC_DRAW);
    
    vNormal = gl.getAttribLocation( programId, "vNormal" );
    gl.enableVertexAttribArray(vNormal);
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(programId, "AmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(programId, "DiffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(programId, "SpecularProduct"), flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(programId, "LightPosition"), flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(programId, "Shininess"),materialShininess);
    
    // Textures
    
    var junkArray2 = [];
    for (var i = 0; i < 10; i++) {
        junkArray2[i] = 1;
    }
    
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(junkArray2), gl.STATIC_DRAW);

    
    vTexCoord = gl.getAttribLocation(programId, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    
    
    texture = gl.createTexture();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.uniform1i(gl.getUniformLocation( programId, "texMap"), 0);

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 
                                   0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels );

    gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    
    gl.uniform1f(gl.getUniformLocation(programId, "TextureOn"), textureOn);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    var imageElement = document.getElementById("tile-img");
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageElement );
    
    // #
    // #
    // #
    // ############################################################
    
    
    // Create a vertex buffer object for position
    positionBufferId = gl.createBuffer();

    // Enable the shader variable for position for use with a vertex buffer.
    vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    
    
    
    // Find all of the shader uniform variables that we need.
    findShaderVariables();
    
    
    // Initialize the view matrix
    viewMatrix = lookAt(vec3(0,0,5), vec3(0,0,0), vec3(0,1,0));
    updateModelView(viewMatrix);
    
    // Initialize the projection matrix
    updateProjection(perspective(50, 1.28, 0.01, 100));
    
    // Initialize the triangle color
    gl.uniform3fv(locations.triangleColor, vec3(1,1,0));
    
    // Create the surface of revolution
    // (this should load the initial shape into one of the vertex buffer objects you just created)
    vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
    
    // Set up events for the HTML controls
    initControlEvents();

    // Setup mouse and keyboard input
    initWindowEvents();

    // Start continuous rendering
    window.setInterval(render, 33);
};
