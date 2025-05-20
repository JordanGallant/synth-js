const dial = new Nexus.Dial('#dial');
dial.value = 0.5;
dial.colorize("accent", "#ff0");
dial.colorize("fill", "#333");
document.body.style.backgroundColor = "#000";

const sequencer = new Nexus.Sequencer('#keys', {
  size: [1000, 700],
  mode: 'impulse',
  rows: 4,
  columns: 10,
});

sequencer.colorize("fill", "#333");
sequencer.colorize("accent", "#ff0");

const keyMap = {
  '1': {column: 0, row: 0},
  '2': {column: 1, row: 0},
  '3': {column: 2, row: 0},
  '4': {column: 3, row: 0},
  '5': {column: 4, row: 0},
  '6': {column: 5, row: 0},
  '7': {column: 6, row: 0},
  '8': {column: 7, row: 0},
  '9': {column: 8, row: 0},
  '0': {column: 9, row: 0},

  // Row 1: QWERTYUIOP
  'q': {row: 1, column: 0},
  'w': {row: 1, column: 1},
  'e': {row: 1, column: 2},
  'r': {row: 1, column: 3},
  't': {row: 1, column: 4},
  'y': {row: 1, column: 5},
  'u': {row: 1, column: 6},
  'i': {row: 1, column: 7},
  'o': {row: 1, column: 8},
  'p': {row: 1, column: 9},

  // Row 2: ASDFGHJKL;
  'a': {row: 2, column: 0},
  's': {row: 2, column: 1},
  'd': {row: 2, column: 2},
  'f': {row: 2, column: 3},
  'g': {row: 2, column: 4},
  'h': {row: 2, column: 5},
  'j': {row: 2, column: 6},
  'k': {row: 2, column: 7},
  'l': {row: 2, column: 8},
  ';': {row: 2, column: 9},

  // Row 3: ZXCVBNM,./
  'z': {row: 3, column: 0},
  'x': {row: 3, column: 1},
  'c': {row: 3, column: 2},
  'v': {row: 3, column: 3},
  'b': {row: 3, column: 4},
  'n': {row: 3, column: 5},
  'm': {row: 3, column: 6},
  ',': {row: 3, column: 7},
  '.': {row: 3, column: 8},
  '/': {row: 3, column: 9}
};

// Get the cell index from row and column
function getCellIndex(row, column) {
  return row * sequencer.columns + column;
}

// Listen for key presses
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (keyMap[key]) {
    const { row, column } = keyMap[key];
    toggleSequencerCell(row, column);
  }
});

// Initialize MIDI access after user interaction
window.initMIDI = function() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  } else {
    console.warn("Web MIDI API not supported.");
  }
};

function onMIDISuccess(midiAccess) {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = handleMIDIMessage;
  }
  console.log("MIDI connected.");
}

function onMIDIFailure() {
  console.warn("Failed to get MIDI access.");
}

function handleMIDIMessage(message) {
  const [status, note, velocity] = message.data;
  // MIDI implementation can be added here
}

function toggleSequencerCell(row, column) {
  // Make sure the row and column are valid
  if (row >= 0 && row < sequencer.rows && column >= 0 && column < sequencer.columns) {
    const current = sequencer.matrix.pattern[row][column];
    sequencer.matrix.set.cell(column,row, current ? 0 : 1);
  }
}

// For debugging
console.log("Sequencer configuration:", {
  rows: sequencer.rows,
  columns: sequencer.columns,
  totalCells: sequencer.rows * sequencer.columns
});