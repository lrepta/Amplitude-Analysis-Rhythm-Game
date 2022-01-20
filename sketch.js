// The background is a bit uninteresting. Maybe try adding some 3d elements, or even just 2d background to spice it up. -> I agree, but I just don't want it to be too distracting since you have to pay attention to the notes

// Maybe to sync up the notes you can play a second copy of the song really quietly about ~2-3 seconds ahead of the actually audible song so it seems like you are actually playing the notes, rather than being behind.

// There is a log version of the fft analysis, that allows you to better capture the higher frequencies, maybe try using that so that the notes are less clumped up towards the center

let song;
let preSong;
let fft;
let spectrum;
let mic;
let currTime;
let timeBetweenNotes = 2000; // Milliseconds
let noteArr = [];
let xSpacer;
let middleKeys = 0.82
let noteVel;
let noteStreak = 0;
let bestStreak = 0;
let numMistakes = 0;
let score = 0;
let scoreMultiplier = 0;
let extraCanvas;
// const average = arr => arr.reduce((acc,v) => acc + v) / arr.length

function average(inputArr) {
  const total = inputArr.reduce((acc, c) => acc + c, 0);
  return total / inputArr.length;
}

let keyNoteMap = new Map();

class Note {
  constructor(inFreq, inAmp, inVel, xPos, yPos) {
    this.freq = inFreq;
    this.amp = inAmp;
    this.velocity = inVel;
    this.x = xPos;
    this.y = yPos;
    this.notePressed = false;
    this.noteCorrect = false;
    // this.index = noteIndex;
  }
  
  updatePos() {
    this.y += this.velocity;
  }
}

function preload() {
  soundFormats('mp3')
  song = loadSound('clair-de-lune.mp3')
  preSong = loadSound('clair-de-lune.mp3')
}

function setup() {
  
  createCanvas(windowWidth, 520);
  extraCanvas = createGraphics(windowWidth, 450);
  fft = new p5.FFT(0.9);
  currTime = millis();
  xSpacer = extraCanvas.width/15;
  noteVel = 1.00;
  
  // mic = new p5.AudioIn();
  // mic.start();
  
  fft.setInput(preSong)
  // song.setVolume(0.04)
  // preSong.setVolume(0.0001)
  preSong.play()
  preSong.setVolume(0.01)
  song.play(4.5);
  // songDelay();
  
  keyNoteMap.set(48, 0);
  keyNoteMap.set(50, 1);
  keyNoteMap.set(52, 2);
  
  keyNoteMap.set(53, 3);
  keyNoteMap.set(55, 4);
  keyNoteMap.set(57, 5);
  keyNoteMap.set(59, 6);
  
  keyNoteMap.set(60, 7);
  keyNoteMap.set(62, 8);
  keyNoteMap.set(64, 9);
  
  keyNoteMap.set(65, 10);
  keyNoteMap.set(67, 11);
  keyNoteMap.set(69, 12);
  keyNoteMap.set(71, 13);
  
  keyNoteMap.set(72, 14);
}

function songDelay() {
  while(millis - currTime < 7000) {
    background(220)
    text(width/2, height/2, "Song starting, please wait one moment")
  }
}

function draw() {
  scoreMultiplier = (1 + (noteStreak/50)) * noteVel
  image(extraCanvas, 0, 0)
  let millisecond = millis();
  bestStreak = max(noteStreak, bestStreak);
  spectrum = fft.analyze();
  
  if (millisecond - currTime >= timeBetweenNotes) {
    currTime = millis();
    // print("Entered if")
    let freq = int(map(spectrum.indexOf(Math.max(...spectrum)), 0, 45, 0, 15))

    let noteAmp = Math.max(...spectrum)
    
    // could make the note shorter in the y axis the faster it is going
    // 1.5*spacer / noteVel
    currNote = new Note(freq, noteAmp, noteVel, freq*xSpacer, -1.5*xSpacer)
    noteArr.push(currNote)
    
    // print("Length of arr:", noteArr.length)
  }
  extraCanvas.background(200, 200, 240)
  background(160, 160, 200);
  // line(0.8*windowWidth, 0, 0.8*windowWidth, height)
  
  notesToRemove = [];
  for (let i = 0; i < noteArr.length; i++) {
    // rectMode(RIGHT)
    
    push();
    if (noteArr[i].notePressed) {
      // print("A note should be red now")
        fill(255,0,0)
        // MISSED A NOTE
        if (noteArr[i].noteCorrect) {
          // PRESSED CORRECT NOTE
          fill(0,255,0)
        }
    } else {
      // push();
      // The object interaction portion of the project:
      // The color of each note depends 3/4th's on its own
      // frequency, but 1/4 of it's color comes from
      // the average adjusted color of all other non-played
      // notes on the screen.
      // The significance factor is such that notes closer
      // to the current node have a greater impact on
      // its overall color than those further away
      colorMode(HSB);
      let noteHue = map(noteArr[i].freq, 0, 14, 0, 360);
      // Note frequency accounts for 3/4ths of the color

      // average the hue of all the other notes
      // but adjust them for significance
      let cumulativeHue = 0;
      let hues = [];
      for (let j = 0; j < noteArr.length; j++) {
        if (i == j || noteArr[j].notePressed) {
          continue;
        }
        let hueMix = map(noteArr[j].freq, 0, 14, 0, 360);
        let noteDist = abs(noteArr[i].freq - noteArr[j].freq);
        // let mixingFactor = Math.pow(0.95, noteDist);
        let hueSignificance = 15-noteDist;
        for (let k = 0; k < hueSignificance; k++) {
          hues.push(hueMix);
        }
        // hues.push(mixingFactor * hueMix)
        // cumulativeHue += hueSignificance * hueMix;
      }
      cumulativeHue = average(hues);
      noteHue = average([noteHue, noteHue, noteHue, cumulativeHue]);
      fill(noteHue, 100, 80);
      // pop();
    }
    rect(noteArr[i].x, noteArr[i].y, xSpacer, 1.5*xSpacer);
    if (noteArr[i].notePressed) {
      fill(0);
      strokeWeight(3);
      line(noteArr[i].x, noteArr[i].y, noteArr[i].x+xSpacer, noteArr[i].y + 1.5*xSpacer);
      line(noteArr[i].x + xSpacer, noteArr[i].y, noteArr[i].x, noteArr[i].y + 1.5*xSpacer);
    }
    pop();
    noteArr[i].updatePos();
    
    
    // Remove the note once it is off screen
    if (noteArr[i].y >= extraCanvas.height) {
      // notesToRemove.push(i);
      
      // If a note was not pressed in time before going
      // offscreen, that counts as a miss
      if (!noteArr[i].noteCorrect) {
        missNote();
      } else {
        score += scoreMultiplier * 100;
      }
      noteArr.splice(i, 1);
      i--;
    }
  }
    
  for (let i = 0; i < 15; i++) {
    push()
    noFill()
    rect(i*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer, 1.5*xSpacer)
    pop()
  }
  fill(0)
  rect((0+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((1+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)

  rect((3+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((4+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((5+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)

  rect((7+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((8+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)

  rect((10+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((11+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  rect((12+middleKeys)*xSpacer, extraCanvas.height-1.5*xSpacer, xSpacer/3, 1.0*xSpacer)
  fill(255)
  // for (let i = 0; i < 15; i++) {
  //   fill(0)
  //   rect(i*xSpacer, height-1.5*xSpacer, xSpacer/3, 1.5*xSpacer)
  //   fill(255)
  // }
  push();
  rect(0, height-(height-extraCanvas.height), width, height-(height-extraCanvas.height))
  fill(0)
  text("Current Streak:" + noteStreak, 20, height-(height-extraCanvas.height)+15);
  text("Best Streak:" + bestStreak, 20, height-(height-extraCanvas.height)+35);
  text("Notes Missed:" + numMistakes, 20, height-(height-extraCanvas.height)+55);
  
  text("Note Speed:" + round(noteVel, 2), 0.7*width, height-(height-extraCanvas.height)+20);
  text("Note Frequency: Every " + round(timeBetweenNotes/1000, 2) + " seconds", 0.7*width, height-(height-extraCanvas.height)+40);
  
  text("Score Multiplier:" + round(scoreMultiplier, 4), 0.39*width, height-(height-extraCanvas.height)+55);
  textSize(18);
  text("Score:" + round(score, 2), 0.4*width, height-(height-extraCanvas.height)+35);
  pop();
}

// function mouseClicked() {
//   if (song.isPlaying()) {
//     song.pause();
//   } else {
//     song.play();
//   }
  
// }

let note, vel, on;


if (navigator.requestMIDIAccess) {
  console.log('This browser supports WebMIDI!');
} else {
  console.log('WebMIDI is not supported in this browser.');
}

navigator.requestMIDIAccess()
  .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
  console.log(midiAccess);

  var inputs = midiAccess.inputs;
  var outputs = midiAccess.outputs;
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

function onMIDISuccess(midiAccess) {
  for (var input of midiAccess.inputs.values()) {
    input.onmidimessage = getMIDIMessage;
    console.log(input);
  }
}

function getMIDIMessage(midiMessage) {
  vel = midiMessage.data[2];
  note = midiMessage.data[1];

  on = midiMessage.data[0];
  
  let noteIncorrect = true;

  // console.log(midiMessage);
  print(note)
  midiToNote = keyNoteMap.get(note)
  for (let i = 0; i < noteArr.length; i++) {
    
    if (noteArr[i].y > extraCanvas.height-3*xSpacer) {
      if (noteArr[i].notePressed) {
        continue;
      }
      
      if (noteArr[i].freq == midiToNote) {
        noteArr[i].notePressed = true;
        noteArr[i].noteCorrect = true;

        // If you got the note right, make the game slightly harder
        timeBetweenNotes-= 10;
        noteVel+=0.01
        noteIncorrect = false;
        noteStreak++;
      } else {
        noteArr[i].notePressed = true;
        noteArr[i].noteCorrect = false;
      }
      
    }
  }
  
  // missNote gets called seemingly whenever I let go of a key
  // Its probably due to button debouncing, but I couldn't
  // find out a way to fix. Instead if you play the wrong key
  // for a note, it will just turn red, and not allow you to fix it
  // and then when it goes off screen then it it gets counted
  // as a miss.
  if (noteIncorrect) {
     // missNote();
  }

}

function missNote() {
  numMistakes++;
  noteStreak = 0;
  timeBetweenNotes+=50
  noteVel-=0.05
  if (timeBetweenNotes > 2000) {
    timeBetweenNotes = 2000
  }
  if (noteVel < 1) {
    noteVel = 1;
  }
}