// Matthew Vincent vince145 4716328
// CSCI 4611 Assignment #02


var canvas;
var gl;

var programId;
var program2dId;
var axisBufferId;

var mode = 0;
var numAngles = 8;
var stepsPerCurve =  6;
var vertexCount = [];

// ############################################################
// #
// #
// #


// Draw Variables for initilizing bezier Curve

var globalControlPoints = [];
var globalControlPointsL = [];
var startingDistance = 0.2;
var nControlPoints = 7;

var globalControlPointsMoving = [];

var bezierCurve = [];
var bezierCurveL = [];
var nBezierPoints = 2+stepsPerCurve-1;

var bezierCurve2 = [];
var bezierCurveL2 = [];
var consoleSpacer = 999;

// View Variables

var azimuth = 0;
var altitude = 0;
var zoom = 7.18342530408852;
var dragSpeed = 2;
var near = 0.6364973419107223;
var far = 15.692141883605013;
var radius = 4.0;
var dr = 5.0 * Math.PI/180.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio
var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


// #
// #
// #
// ############################################################

// Binds "on-change" events for the controls on the web page
function initControlEvents() {
    // Use one event handler for both of the shape controls
    document.getElementById("numAngles").onchange =
    document.getElementById("stepsPerCurve").onchange =
        function(e) {
            numAngles = parseFloat(document.getElementById("numAngles").value);
            stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value);
            // ############################################################


            nBezierPoints = 2+stepsPerCurve-1;


            // ############################################################
            // Regenerate the vertex data
            vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
        };
}

//The method that responds to the 'View/Draw' button click to change the mode.
function selectMode() {
    var elem = document.getElementById("myButton1");
    if (elem.value=="View Mode") {
        document.getElementById("demo").innerHTML = "View Mode";
        document.getElementById('anglesDiv').style.visibility = 'visible';
        document.getElementById('stepsDiv').style.visibility = 'visible';
        elem.value = "Draw Mode";    
        mode = 1;

        // Regenerate the vertex data
        vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
        
    } else {
        document.getElementById("demo").innerHTML = "Draw Mode";
        document.getElementById('anglesDiv').style.visibility = 'hidden';
        document.getElementById('stepsDiv').style.visibility = 'hidden';
        elem.value = "View Mode";
        mode = 0;
    }
}

// ########### Binds events for keyboard and mouse events --- ADD CODE HERE ###########
function initWindowEvents() {
    
    // Whether or not the mouse button is currently being held down for a drag.
    var mousePressed = false;

	// ############################################################
	// #
	// #
	// #

	var mousePos = vec2(0, 0);
  var mousePosOld = vec2(0, 0);
	
	// #
	// #
	// #
	// ############################################################
    
    canvas.onmousedown = function(e) {
        // A mouse drag started.
        mousePressed = true;
        // Log where the mouse drag started.
        // (This is an example of how to get the (x,y) coordinates from a mouse event.)
        //console.log('x = ' + e.clientX);
        //console.log('y = ' + e.clientY);
        // ############################################################
		// #
		// #
		// #
		
		mousePos = vec2(e.clientX / gl.canvas.width * 2 - 1.025, e.clientY / gl.canvas.height * -2 + 1.25);
		console.log(mousePos);
		//console.log(globalControlPoints[0][0]);
		
		// #
		// #
		// #
		// ############################################################

        // Differentiate between view mode and draw mode
        if (mode == 1) { 
        
            // Handle mouse down for view mode
            
        } else {
            
            // Handle mouse down for draw mode
            
			// ############################################################
			// #
			// #
			// #

			// oneVertexMoving ensures that the vertexes for the
			// bezier curve don't all accidently start moving together
			// when clicked on by the mouse, ideally the user would
			// only want to move one vertex at a time
			var oneVertexMoving = false;
			for (var i = 0; i < nControlPoints; i++) {
				if (!oneVertexMoving) {
					if (mousePos[0] - globalControlPoints[i][0] < 0.025 &&
						mousePos[0] - globalControlPoints[i][0] > -0.025 &&
						mousePos[1] - globalControlPoints[i][1] < 0.025 &&
						mousePos[1] - globalControlPoints[i][1] > -0.025) {
						globalControlPointsMoving[i] = true;
						oneVertexMoving = true;
					}
				}
				
			}
			
			// #
			// #
			// #
			// ############################################################
        }
    }

    canvas.onmousemove = function(e) {
        if (mousePressed) {
			
			
			// ############################################################
			mousePosOld = mousePos;
			mousePos = vec2(e.clientX / gl.canvas.width * 2 - 1.025, e.clientY / gl.canvas.height * -2 + 1.25);
			//console.log('new x = ' + (e.clientX / gl.canvas.width  *  2 - 1));
            //console.log('new y = ' + (e.clientY / gl.canvas.height * -2 + 1));
			
			// ############################################################
			
            // Differentiate between view mode and draw mode
            if (mode == 1) { 
                // Handle a mouse drag for view mode
                if ((mousePos[0] - mousePosOld[0]) > 0) {
                    azimuth = azimuth + (mousePos[0] - mousePosOld[0]) * dragSpeed;
                    //console.log('Azimuth1 = ' + azimuth);
                } else if ((mousePos[0] - mousePosOld[0]) < 0) {
                    azimuth = azimuth + (mousePos[0] - mousePosOld[0]) * dragSpeed;
                    //console.log('Azimuth2 = ' + azimuth);
                }
                var altitudeLimit = (85*(Math.PI/180));
                if ((altitude < altitudeLimit) 
                           && ((mousePos[1] - mousePosOld[1]) > 0)) {
                    altitude = altitude + (mousePos[1] - mousePosOld[1]) * dragSpeed;
                    if (altitude > altitudeLimit) {
                        altitude = altitudeLimit;
                    }
                    //console.log('Altitude1 = ' + altitude);
                } else if ((altitude > -altitudeLimit) 
                           && ((mousePos[1] - mousePosOld[1]) < 0)) {
                    altitude = altitude + (mousePos[1] - mousePosOld[1]) * dragSpeed;
                    if (altitude < -altitudeLimit) {
                        altitude = -altitudeLimit;
                    }
                    //console.log('Altitude2 = ' + altitude);
                }
            } else {
                
                // Handle a mouse drag for draw mode
                
				// ############################################################
				// #
				// #
				// #
				
				for (var i = 0; i < nControlPoints; i++) {
					if (globalControlPointsMoving[i]) {
						
						// adjust globalControlPoints[i] vertex x and y
						// update globalControlPointsBufferId
						globalControlPoints[i] = mousePos;
						
						gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsBufferId );
						gl.bufferData(gl.ARRAY_BUFFER, flatten(globalControlPoints), gl.DYNAMIC_DRAW);

					
						// adjust globalControlPointsL[i] vertex x and y
						// adjust globalControlPointsL[i+1] vertex x and y
						// update globalControlPointsLBufferId
						if (i == 0) {
							globalControlPointsL[i] = mousePos;
						} else if (i == nControlPoints-1) {
							globalControlPointsL[(nControlPoints*2)-3] = mousePos;
						} else {
							globalControlPointsL[(i*2)] = mousePos;
							globalControlPointsL[(i*2)-1] = mousePos;
						}
						gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsLBufferId );
						gl.bufferData(gl.ARRAY_BUFFER, flatten(globalControlPointsL), gl.DYNAMIC_DRAW);
						
					}
				}
				// #
				// #
				// #
				// ############################################################
            }
        }
    }

    window.onmouseup = function(e) {
        // A mouse drag ended.
        mousePressed = false;
        
        // Differentiate between view mode and draw mode
        if (mode == 1) { 
        
            // Handle mouse up for view mode
            
        } else {
            
            // Handle mouse up for draw mode
			
			// ############################################################
			// #
			// #
			// #
			
			for (var i = 0; i < nControlPoints; i++) {
				globalControlPointsMoving[i] = false;
			}
			
			// #
			// #
			// #
			// ############################################################
			
            
        }
    }
    
    window.onkeydown = function(e) {
        // Log the key code in the console.  Use this to figure out the key codes for the controls you need.
        console.log(e.keyCode);
        if (e.keyCode == 37) {
            if (zoom > 0) {
                zoom *= 0.95;
                near *= 1.1;
                far *= 0.909;
                //console.log('Zoom = ' + zoom);
                //console.log('Near = ' + near);
                //console.log('Far  = ' + far);
            }
        } else if (e.keyCode == 39) {
            zoom *= 1.05;
            far *= 1.1;
            near *= 0.909;
            console.log('Zoom = ' + zoom);
            console.log('Near = ' + near);
            console.log('Far  = ' + far);
        }
    }
}

// ########### Function for retrieving control points from "draw" mode --- ADD CODE HERE ###########
function getControlPoints() {
    
    var controlPoints = [];
    
    // ###### Hard-coded list of control points to support incremental development and testing. ######
    // ###### You should replace this with control points retrieved from "draw" mode.           ######
    controlPoints = globalControlPoints;
    
    return controlPoints;
}

// ########### Function for building a surface of revolution from a list of control points ###########
// ########### ADD CODE HERE                                                               ###########

function buildSurfaceOfRevolution(controlPoints, angles, steps) {
    var vertices = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer1 );
	  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    // ###### Hard-coded list of vertices to support incremental development and testing. ######
    // ###### You should replace this with vertices derived from the control points.      ######

    // ###### Update vertex buffer objects --- ADD CODE HERE ######

    // Lines
    
    
    var bezierCurveLV3 = [];
    var bezierCurveL2V3 = [];
    for (var i = 0; i < bezierCurveL.length; i++) {
        bezierCurveLV3[i] = vec3(bezierCurveL[i][0], bezierCurveL[i][1], 0);
        bezierCurveL2V3[i] = vec3(bezierCurveL2[i][0], bezierCurveL2[i][1], 0);
    }
    vertices = bezierCurveLV3.concat(bezierCurveL2V3);

    for (var j = 0; j < angles; j++) {
        console.log('Rotation performed = ' + j);
        var rotationAngle = (360/angles)*(j+1);
        var bezierCurveLR = [];
        var bezierCurveL2R = [];
        for (var i = 0; i < bezierCurveL.length; i++) {
            bezierCurveLR[i] = vec4(bezierCurveL[i][0], bezierCurveL[i][1], 0, 1);
            bezierCurveL2R[i] = vec4(bezierCurveL2[i][0], bezierCurveL2[i][1], 0, 1);
        }
        var translationMat = translate(0,0,0);
        var rotationMat = rotate(rotationAngle, vec3(0,1,0));
        for (var i = 0; i < bezierCurveLR.length; i++) {
            bezierCurveLR[i] = mult(rotationMat, bezierCurveLR[i]);
        }
        for (var i = 0; i < bezierCurveL2R.length; i++) {
            bezierCurveL2R[i] = mult(rotationMat, bezierCurveL2R[i]);
        }

        var bezierCurveLRV3 = [];
        var bezierCurveL2RV3 = [];
        for (var i = 0; i < bezierCurveLR.length; i++) {
            bezierCurveLRV3[i] = vec3(bezierCurveLR[i][0], bezierCurveLR[i][1], bezierCurveLR[i][2]);
            bezierCurveL2RV3[i] = vec3(bezierCurveL2R[i][0], bezierCurveL2R[i][1], bezierCurveL2R[i][2]);
        }

        vertices = vertices.concat(bezierCurveLRV3);
        vertices = vertices.concat(bezierCurveL2RV3);
        console.log('Rotation complete = ' + j);
    }

    var k = 0;
    var l = bezierCurveLRV3.length*2;
    for (var j = 0; j < angles; j++) {
        for (var i = 0; i < l; i++) {
            var connectorL = [];
            // Triangle 1


            // Line 2
            connectorL[k++] = vertices[((j+0)*l)+(i+0)];
            console.log('1 = ' + ((j+0)*l)+(i+0));
            console.log('2 = ' + ((j+1)*l)+(i+0));
            connectorL[k++] = vertices[((j+1)*l)+(i+0)];
            // Line 3
            connectorL[k++] = vertices[((j+0)*l)+(i+1)];
            connectorL[k++] = vertices[((j+1)*l)+(i+0)];
            
            // Triangle 2

            // Line 2
            connectorL[k++] = vertices[((j+0)*l)+(i+1)];
            connectorL[k++] = vertices[((j+1)*l)+(i+1)];
            k = 0;
            vertices = vertices.concat(connectorL);
        }
    }
    


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer1 );
	  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    // Return vertex count
    return vertices.length;
}

// ########### The 3D Mode for Viewing the Surface of Revolution --- ADD CODE HERE ###########

function viewMethod(vertexCount) {
    
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.9, 1.0, 0.9, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    // Use 3D program
    gl.useProgram(programId);

    gl.uniform3fv(gl.getUniformLocation(programId, "lineColor"), vec3(0.5, 0.5, 0.5));

    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer1);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, vertexCount);
    //console.log('vertexCount = ' + vertexCount);


    eye = vec3(zoom*Math.sin(azimuth)*Math.cos(altitude), zoom*Math.sin(altitude),
               zoom*Math.cos(azimuth)*Math.cos(altitude));

    mvMatrix = lookAt(eye, at , up); 
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );


}


// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod(controlPoints) {
    
    var vertices = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer1 );
	  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.9, 1.0, 1.0, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    // Use 2D program
    gl.useProgram(program2dId);
    
    // Set line color for "axis of revolution"
    gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));
    
    // Draw the "axis of revolution"
    var vPosition = gl.getAttribLocation(program2dId, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 20);
    
	// ############################################################
	// #
	// #
	// #
	bierzerCurve = [];
  bierzerCurve2 = [];
  bierzerCurveL = [];
  bierzerCurveL2 = [];


	
	// Draw bezier control points
	gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsBufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	var controlPointMovingI = -1;
	for (var i = 0; i < nControlPoints; i++) {
		if (globalControlPointsMoving[i]) {
			controlPointMovingI = i;
		}
	}
	//console.log('movingI = ' + controlPointMovingI);

	// Handles highlighting the moving control point with red while the others remain gray
	if (controlPointMovingI > 0 && controlPointMovingI < nControlPoints-1) {
		gl.drawArrays(gl.POINTS, 0, controlPointMovingI);
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(1.0, 0.0, 0.0));
		gl.drawArrays(gl.POINTS, controlPointMovingI, 1);
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));
		gl.drawArrays(gl.POINTS, controlPointMovingI+1, nControlPoints-controlPointMovingI-1);
		//console.log('ifStatement = 1 ');
	} else if (controlPointMovingI == 0) {
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(1.0, 0.0, 0.0));
		gl.drawArrays(gl.POINTS, 0, 1);
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));
		gl.drawArrays(gl.POINTS, 1, nControlPoints-1);
		//console.log('ifStatement = 2 ');
	} else if (controlPointMovingI == nControlPoints-1) {
		gl.drawArrays(gl.POINTS, 0, nControlPoints-1);
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(1.0, 0.0, 0.0));
		gl.drawArrays(gl.POINTS, nControlPoints-1, 1);
		gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));
		//console.log('ifStatement = 3 ');
	} else {
		gl.drawArrays(gl.POINTS, 0, nControlPoints);
		//console.log('ifStatement = 4 ');
	}
	
	// Draw lines between control points
	gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsLBufferId);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, (nControlPoints*2)-2);
	
	
	
	// Setup color for bezier curves
	gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.8, 0.8, 0.8));
	
	
	// Computing the bezier curve vertexes
	/*
	for (var i = 0; i < nBezierPoints; i++) {
		bezierCurve[i] = vec4(0,0,1,1);
	}
	*/
	var d = 1.0/(nBezierPoints-1.0);
	for (var i = 0; i < nBezierPoints; i++) {
		var r1 = vec4(globalControlPoints[0][0],globalControlPoints[1][0],globalControlPoints[2][0],globalControlPoints[3][0]);
		var r2 = vec4(globalControlPoints[0][1],globalControlPoints[1][1],globalControlPoints[2][1],globalControlPoints[3][1]);
		var r3 = vec4(1,1,1,1);
		var r4 = vec4(1,1,1,1);
		var m1 = mat4(r1,r2,r3,r4);
		var u = i*d;
		var a = 1-u;
		var m2 = vec4( a*a*a, 3*u*a*a, 3*u*u*a, u*u*u);
		bezierCurve[i] = mult ( m1, m2);
		//bezierCurve[i] = dot (bezierCurve[i], m1);
	}
	
/*
	if (consoleSpacer > 1000) {
		for (var i = 0; i < bezierCurve.length; i++) {
			//console.log(bezierCurve[i]);
		}
		for (var i = 0; i < bezierCurveL.length; i++) {
			console.log(bezierCurveL[i]);
		}
		//console.log(globalControlPoints.length);
		//console.log(globalControlPointsL.length);
		//console.log((nControlPoints*2)-2);
		//console.log(bezierCurve.length);
		//console.log(bezierCurveL.length);
		//console.log((nBezierPoints*2)-2);
    console.log('nBezierPoints = ' + nBezierPoints);
    console.log('bezierCurveL2.length = ' + bezierCurveL2.length);
		
		
		consoleSpacer = 0;
	} else {
		consoleSpacer++;
	}
*/
	
	// Computing the bezier curve vertexes
	var d = 1.0/(nBezierPoints-1.0);
	for (var i = 0; i < nBezierPoints; i++) {
		var r1 = vec4(globalControlPoints[0][0],globalControlPoints[1][0],globalControlPoints[2][0],globalControlPoints[3][0]);
		var r2 = vec4(globalControlPoints[0][1],globalControlPoints[1][1],globalControlPoints[2][1],globalControlPoints[3][1]);
		var r3 = vec4(1,1,1,1);
		var r4 = vec4(1,1,1,1);
		var m1 = mat4(r1,r2,r3,r4);
		var u = i*d;
		var a = 1-u;
		var m2 = vec4( a*a*a, 3*u*a*a, 3*u*u*a, u*u*u);
		bezierCurve[i] = mult ( m1, m2);
		//bezierCurve[i] = dot (bezierCurve[i], m1);
	}
	
	
	// Computing the bezier curve line vertexes
  bezierCurveL[0] = vec2(bezierCurve[0][0], bezierCurve[0][1]);
  var j = 1;
  for (var i = 1; i < (nBezierPoints-1); i++) {
    bezierCurveL[j++] = vec2(bezierCurve[i][0], bezierCurve[i][1]);
    bezierCurveL[j++] = vec2(bezierCurve[i][0], bezierCurve[i][1]);
  }
  bezierCurveL[j] = vec2(bezierCurve[nBezierPoints-1][0], bezierCurve[nBezierPoints-1][1]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveLBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bezierCurveL), gl.DYNAMIC_DRAW);
	
	// Draw lines between bezier vertexes for first bezier curve

	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveLBufferId);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, nBezierPoints*2-2);
	gl.drawArrays(gl.LINES, 0, nBezierPoints*2-2);
	
	// Computing the bezier curve vertexes for second bezier curve
	
	var d = 1.0/(nBezierPoints-1.0);
	for (var i = 0; i < nBezierPoints; i++) {
		var r1 = vec4(globalControlPoints[3][0],globalControlPoints[4][0],globalControlPoints[5][0],globalControlPoints[6][0]);
		var r2 = vec4(globalControlPoints[3][1],globalControlPoints[4][1],globalControlPoints[5][1],globalControlPoints[6][1]);
		var r3 = vec4(1,1,1,1);
		var r4 = vec4(1,1,1,1);
		var m1 = mat4(r1,r2,r3,r4);
		var u = i*d;
		var a = 1-u;
		var m2 = vec4( a*a*a, 3*u*a*a, 3*u*u*a, u*u*u);
		bezierCurve2[i] = mult ( m1, m2);
		//bezierCurve[i] = dot (bezierCurve[i], m1);
	}
	
	// Computing the bezier curve line vertexes for second bezier curve
  bezierCurveL2[0] = vec2(bezierCurve2[0][0], bezierCurve2[0][1]);
  j = 1;
  for (var i = 1; i < (nBezierPoints-1); i++) {
    bezierCurveL2[j++] = vec2(bezierCurve2[i][0], bezierCurve2[i][1]);
    bezierCurveL2[j++] = vec2(bezierCurve2[i][0], bezierCurve2[i][1]);
  }
  bezierCurveL2[j] = vec2(bezierCurve2[nBezierPoints-1][0], bezierCurve2[nBezierPoints-1][1]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveL2BufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bezierCurveL2), gl.DYNAMIC_DRAW);
	
	// Draw lines between bezier vertexes for second bezier curve

	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveL2BufferId);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, (nBezierPoints*2)-2);
  gl.drawArrays(gl.LINES, 0, (nBezierPoints*2)-2);
	


	// #
	// #
	// #
	// ############################################################
}

// Called automatically every 33 milliseconds to render the scene
function render() {
    if (mode == 1) {
        viewMethod(vertexCount);
    } else {
        drawMethod(getControlPoints());
    }
}

// Initializations
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
    program2dId = initShaders(gl, "vertex-shader-2d", "fragment-shader");
    
    // Setup axis of revolution to be rendered in draw mode
    var revolutionAxis = [];
    for (var i = 0; i < 20; i++) {
        revolutionAxis[i] = vec2(0.0, 2 * i / 19.0 - 1);
    }
    
    axisBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(revolutionAxis), gl.DYNAMIC_DRAW);
    
    // Enable the position attribute for our 2D shader program.
    gl.useProgram(program2dId);
    var vPosition = gl.getAttribLocation(program2dId, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    
    // Get the hardcoded control points
    var controlPoints = globalControlPoints;
    
    // ###### Create vertex buffer objects --- ADD CODE HERE ######
	// #
	// #
	// #
	
	
	
	
	
	// Setup globalControlPoints controlPoints
	for (var i = 0; i < nControlPoints; i++) {
		globalControlPoints[i] = vec2(0.5, ((nControlPoints * startingDistance)/2) - (i * startingDistance));
	}
	globalControlPointsBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(globalControlPoints), gl.DYNAMIC_DRAW);
	
	
	// Setup globalControlPoints line vertex points
	if (nControlPoints > 0) {
		globalControlPointsL[0] = vec2(0.5, ((nControlPoints * startingDistance)/2) - (0 * startingDistance));
	}
	var loc = 1;
	for (var i = 1; i < (nControlPoints*2)-2; i = i + 2) {
		globalControlPointsL[i] = vec2(0.5, ((nControlPoints * startingDistance)/2) - (loc * startingDistance));
		globalControlPointsL[i+1] = vec2(0.5, ((nControlPoints * startingDistance)/2) - (loc * startingDistance));
		loc++;
	}
	if (nControlPoints > 3) {
		globalControlPointsL[(nControlPoints*2)-3] = vec2(0.5, ((nControlPoints * startingDistance)/2) - ((nControlPoints-1) * startingDistance));
	}
	
	globalControlPointsLBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, globalControlPointsLBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(globalControlPointsL), gl.DYNAMIC_DRAW);
	
	
	// Setup globalControlPointsMoving[] for handling mouse input
	
	for (var i = 0; i < nControlPoints; i++) {
		globalControlPointsMoving[i] = false;
	}
	
	
	
	// Computing the bezier curve vertexes for first bezier curve
	
	var d = 1.0/(nBezierPoints-1.0);
	for (var i = 0; i < nBezierPoints; i++) {
		var r1 = vec4(globalControlPoints[0][0],globalControlPoints[1][0],globalControlPoints[2][0],globalControlPoints[3][0]);
		var r2 = vec4(globalControlPoints[0][1],globalControlPoints[1][1],globalControlPoints[2][1],globalControlPoints[3][1]);
		var r3 = vec4(1,1,1,1);
		var r4 = vec4(1,1,1,1);
		var m1 = mat4(r1,r2,r3,r4);
		var u = i*d;
		var a = 1-u;
		var m2 = vec4( a*a*a, 3*u*a*a, 3*u*u*a, u*u*u);
		bezierCurve[i] = mult ( m1, m2);
		//bezierCurve[i] = dot (bezierCurve[i], m1);
	}
	
	// Computing the bezier curve line vertexes for first bezier curve
  bezierCurveL[0] = vec2(bezierCurve[0][0], bezierCurve[0][1]);
  var j = 1;
  for (var i = 1; i < (nBezierPoints-1); i++) {
    bezierCurveL[j++] = vec2(bezierCurve[i][0], bezierCurve[i][1]);
    bezierCurveL[j++] = vec2(bezierCurve[i][0], bezierCurve[i][1]);
  }
  bezierCurveL[j] = vec2(bezierCurve[nBezierPoints-1][0], bezierCurve[nBezierPoints-1][1]);
	
	
	bezierCurveLBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveLBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bezierCurveL), gl.DYNAMIC_DRAW);
	
	
	// Computing the bezier curve vertexes for second bezier curve
	
	var d = 1.0/(nBezierPoints-1.0);
	for (var i = 0; i < nBezierPoints; i++) {
		var r1 = vec4(globalControlPoints[3][0],globalControlPoints[4][0],globalControlPoints[5][0],globalControlPoints[6][0]);
		var r2 = vec4(globalControlPoints[3][1],globalControlPoints[4][1],globalControlPoints[5][1],globalControlPoints[6][1]);
		var r3 = vec4(1,1,1,1);
		var r4 = vec4(1,1,1,1);
		var m1 = mat4(r1,r2,r3,r4);
		var u = i*d;
		var a = 1-u;
		var m2 = vec4( a*a*a, 3*u*a*a, 3*u*u*a, u*u*u);
		bezierCurve2[i] = mult ( m1, m2);
		//bezierCurve[i] = dot (bezierCurve[i], m1);
	}
	
	// Computing the bezier curve line vertexes for second bezier curve
 
  bezierCurveL2[0] = vec2(bezierCurve2[0][0], bezierCurve2[0][1]);
  j = 1;
  for (var i = 1; i < (nBezierPoints-1); i++) {
    bezierCurveL2[j++] = vec2(bezierCurve2[i][0], bezierCurve2[i][1]);
    bezierCurveL2[j++] = vec2(bezierCurve2[i][0], bezierCurve2[i][1]);
  }
  bezierCurveL2[j] = vec2(bezierCurve2[nBezierPoints-1][0], bezierCurve2[nBezierPoints-1][1]);


	bezierCurveL2BufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bezierCurveL2BufferId );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bezierCurveL2), gl.DYNAMIC_DRAW);
	
	
	
	
  vertexBuffer1 = gl.createBuffer();
	

  aspect = canvas.width/canvas.height;
  modelView = gl.getUniformLocation( programId, "modelView" );
  projection = gl.getUniformLocation( programId, "projection" );
	// #
	// #
	// #
	// ############################################################

	
    // Create the surface of revolution
    // (this should load the initial shape into one of the vertex buffer objects you just created)
    vertexCount = buildSurfaceOfRevolution(controlPoints, numAngles, stepsPerCurve);
    
    // Set up events for the HTML controls
    initControlEvents();

    // Setup mouse and keyboard input
    initWindowEvents();
    
    // Start continuous rendering
    window.setInterval(render, 33);
};
