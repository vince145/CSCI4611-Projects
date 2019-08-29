// Matthew Vincent vince145 4716328
// CSCI 4611 Assignment #01

// File name of currently loaded example (rendered on the bottom of the
// screen for your convenience).
String currentFile;


/*****************************************************
 * Place variables for describing the L-System here. *
 * These might include the final expansion of turtle *
 * commands, the step size d, etc.                   *
 *****************************************************/
String[] spec;
double lineSize = 1.5;
int nStart;
int n; // number of production rule applications
double angle; // angle increment in degrees
String axiom;
String produceF; // production rule for F (nil if none)
String produceX; // production rule for X (nil if none)
String produceY; // production rule for Y (nil if none)
String turtleSteps;
double imgX = 100;
double imgY = 450;
/*
 * This method is automatically called when ever a new L-System is
 * loaded (either by pressing 1 - 6, or 'o' to open a file dialog).
 *
 * The lines array will contain every line from the selected 
 * description file. You can assume it's a valid description file,
 * so it will have a length of 6:
 *
 *   lines[0] = number of production rule applications
 *   lines[1] = angle increment in degrees
 *   lines[2] = initial axiom
 *   lines[3] = production rule for F (or the string 'nil')
 *   lines[4] = production rule for X (or the string 'nil')
 *   lines[5] = production rule for Y (or the string 'nil')
 */
void processLSystem(String[] lines) {
  // You should write code within this method to process the L-system
  // and produce whatever data structures you'll need to use to
  // draw the L-system when drawLSystem() is called.
  spec = lines;
  n = Integer.parseInt(spec[0]);
  nStart = n;
  angle = Double.parseDouble(spec[1]);
  axiom = spec[2];
  produceF = spec[3];
  produceX = spec[4];
  produceY = spec[5];
  turtleSteps = "";

  if (n > 0) {
    int axiomLength = axiom.length();
    for (int i = 0; i < axiomLength; i++) {
      if (axiom.charAt(i) == 'F') {
        turtleSteps += produceF;
      } else if (axiom.charAt(i) == 'X') {
        turtleSteps += produceX;
      } else if (axiom.charAt(i) == 'Y') {
        turtleSteps += produceY;
      } else if (axiom.charAt(i) == '+') {
        turtleSteps += '+';
      } else if (axiom.charAt(i) == '-') {
        turtleSteps += '-';
      } else if (axiom.charAt(i) == '[') {
        turtleSteps += '[';
      } else if (axiom.charAt(i) == ']') {
        turtleSteps += ']';
      }
    }
    while (n > 0) {
      String newTurtleSteps = "";
      int turtleStepsLength = turtleSteps.length();
      for (int i = 0; i < turtleStepsLength; i++) {
        if (turtleSteps.charAt(i) == 'F') {
          newTurtleSteps += produceF;
        } else if (turtleSteps.charAt(i) == 'X') {
          newTurtleSteps += produceX;
        } else if (turtleSteps.charAt(i) == 'Y') {
          newTurtleSteps += produceY;
        } else if (turtleSteps.charAt(i) == '+') {
          newTurtleSteps += '+';
        } else if (turtleSteps.charAt(i) == '-') {
          newTurtleSteps += '-';
        } else if (turtleSteps.charAt(i) == '[') {
          newTurtleSteps += '[';
        } else if (turtleSteps.charAt(i) == ']') {
          newTurtleSteps += ']';
        }
      }
      n--;
      turtleSteps = "";
      turtleSteps += newTurtleSteps;
    }
  } 
}

/*
 * This method is called every frame after the background has been
 * cleared to white, but before the current file name is written to
 * the screen.
 *
 * It is not called if there is no loaded file.
 */
void drawLSystem() {
  // Implement your LSystem rendering here 
  for (int i = 0; i < 6; i++) {
    text(spec[i], 10, 20 + 15 * i);
  }
  //text(turtleSteps, 5, 470);
  pushMatrix();
  translate((float)imgX,(float)imgY);
  
  int turtleStepsLength = turtleSteps.length();
  for (int i = 0; i < turtleStepsLength; i++) {
    char step = turtleSteps.charAt(i);
    if (step == 'F') {
      line(0,0,0,(float)(-lineSize));
      translate(0,(float)(-lineSize));
    } else if (step == '+') {
      rotate(radians((float) angle));
    } else if (step == '-') {
      rotate(radians(-(float) angle));
    } else if (step == '[') {
      pushMatrix();
    } else if (step == ']') {
      popMatrix();
    }
  }
  popMatrix();
}

void settings() {
  size(500, 500);
}

void draw() {
  background(255);

  if (currentFile != null) {
    drawLSystem();
  }

  fill(0);
  stroke(0);
  textSize(15);
  if (currentFile == null) {
    text("Press [1-7] to load an example, or 'o' to open a dialog", 5, 495);
    text("Press q or e keys to small adjust d, step size.",5,475);
    text("Press z or c keys to large adjust d, step size.",5,450);
    text("Press w,a,s,d to adjust image translation.",5,425);
  } else {
    text("Current l-system: " + currentFile, 5, 495);
  }
}

void keyReleased() {
  /*********************************************************
   * The examples loaded by pressing 1 - 6 must be placed  *
   * in the data folder within your sketch directory.      *
   * The same goes for any of your own files you'd like to *
   * load with relative paths.                             *
   *********************************************************/
   
  if (key == 'o' || key == 'O') {
    // NOTE: This option will not work if you're running the
    // Processing sketch with JavaScript and your browser.
    selectInput("Select a file to load:", "fileSelected");
  } else if (key == '1') {
    loadLSystem("example1.txt");
  } else if (key == '2') {
    loadLSystem("example2.txt");
  } else if (key == '3') {
    loadLSystem("example3.txt");
  } else if (key == '4') {
    loadLSystem("example4.txt");
  } else if (key == '5') {
    loadLSystem("example5.txt");
  } else if (key == '6') {
    loadLSystem("example6.txt");
  } else if (key == '7') {
    loadLSystem("sierpinski.txt");
  }
  // else modify the above code to include
  // keyboard shortcuts for your own examples
}

void keyPressed() {
  if (key == 'q') {
    lineSize += 0.02;
  } else if (key == 'e') {
    lineSize -= 0.02;
  } else if (key == 'z') {
    lineSize += 1;
  } else if (key == 'c') {
    lineSize -= 1;
  } else if (key == 'w') {
    imgY -= 2;
  } else if (key == 's') {
    imgY += 2;
  } else if (key == 'a') {
    imgX -= 2;
  } else if (key == 'd') {
    imgX += 2;
  }
}

import java.io.File;
void fileSelected(File selection) {
  if (selection == null) {
    println("File selection cancelled."); 
  } else {
    loadLSystem(selection.getAbsolutePath()); 
  }
}

void loadLSystem(String filename) {
  String[] contents = loadStrings(filename);
  processLSystem(contents);
  currentFile = filename;
}
