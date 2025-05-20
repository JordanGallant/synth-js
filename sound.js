document.body.style.backgroundColor = "#000";
//Dynamic variables
let width = window.innerWidth;
let height = window.innerHeight;
let envelopeHeight = height * 0.2; // 20% of screen
let sequencerHeight = height * 0.7; // 70% of screen

//Tone
const synth = new Tone.Synth({
    envelope: {
        attack: 0.01,
        decay: 1.1,
        sustain: 1,     // full sustain
        release: 1.5    // slow release
    }
}).toDestination();

const envelope = new Nexus.Envelope('#envelope', {
    size: [width, envelopeHeight],
});
envelope.colorize("accent", "#ff0");
envelope.colorize("fill", "#333");

const sequencer = new Nexus.Sequencer('#keys', {
    size: [width - 200, sequencerHeight],
    mode: 'impulse',
    rows: 4,
    columns: 12, // Changed to 12 for full chromatic scale (one octave)
});

// Define the chromatic scales for each row
// Each row will have a complete chromatic scale starting from a different base note
const scales = {
    0: ["C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"],  // Row 1: C3 chromatic scale
    1: ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"],  // Row 2: C4 chromatic scale
    2: ["C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"],  // Row 3: C5 chromatic scale
    3: ["C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6"]   // Row 4: C6 chromatic scale
};

//dynamic 
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;

    envelopeHeight = height * 0.2;
    sequencerHeight = height * 0.7;

    envelope.resize(width, envelopeHeight);
    sequencer.resize(width - 20, sequencerHeight);
});

sequencer.colorize("fill", "#333");
sequencer.colorize("accent", "#ff0");

// Create a keyboard mapping for a 12-column grid
const keyMap = {
    // Row 0: Top row numbers
    '1': { column: 0, row: 0 },
    '2': { column: 1, row: 0 },
    '3': { column: 2, row: 0 },
    '4': { column: 3, row: 0 },
    '5': { column: 4, row: 0 },
    '6': { column: 5, row: 0 },
    '7': { column: 6, row: 0 },
    '8': { column: 7, row: 0 },
    '9': { column: 8, row: 0 },
    '0': { column: 9, row: 0 },
    '-': { column: 10, row: 0 },
    '=': { column: 11, row: 0 },

    // Row 1: QWERTYUIOP[]
    'q': { row: 1, column: 0 },
    'w': { row: 1, column: 1 },
    'e': { row: 1, column: 2 },
    'r': { row: 1, column: 3 },
    't': { row: 1, column: 4 },
    'y': { row: 1, column: 5 },
    'u': { row: 1, column: 6 },
    'i': { row: 1, column: 7 },
    'o': { row: 1, column: 8 },
    'p': { row: 1, column: 9 },
    '[': { row: 1, column: 10 },
    ']': { row: 1, column: 11 },

    // Row 2: ASDFGHJKL;'
    'a': { row: 2, column: 0 },
    's': { row: 2, column: 1 },
    'd': { row: 2, column: 2 },
    'f': { row: 2, column: 3 },
    'g': { row: 2, column: 4 },
    'h': { row: 2, column: 5 },
    'j': { row: 2, column: 6 },
    'k': { row: 2, column: 7 },
    'l': { row: 2, column: 8 },
    ';': { row: 2, column: 9 },
    "'": { row: 2, column: 10 },
    '\\': { row: 2, column: 11 },

    // Row 3: ZXCVBNM,./
    'z': { row: 3, column: 0 },
    'x': { row: 3, column: 1 },
    'c': { row: 3, column: 2 },
    'v': { row: 3, column: 3 },
    'b': { row: 3, column: 4 },
    'n': { row: 3, column: 5 },
    'm': { row: 3, column: 6 },
    ',': { row: 3, column: 7 },
    '.': { row: 3, column: 8 },
    '/': { row: 3, column: 9 },
    '`': { row: 3, column: 10 },
    ' ': { row: 3, column: 11 }
};

// Listen for key presses
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
        const { row, column } = keyMap[key];
        toggleSequencerCell(row, column);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
        const { row, column } = keyMap[key];
        // Release the note
        synth.triggerRelease();
        // Remove the highlight from the cell
        sequencer.matrix.set.cell(column, row, 0);
    }
});

// Function to toggle a sequencer cell and play the corresponding note
function toggleSequencerCell(row, column) {
    if (row >= 0 && row < sequencer.rows && column >= 0 && column < sequencer.columns) {
        const current = sequencer.matrix.pattern[row][column];
        sequencer.matrix.set.cell(column, row, current ? 0 : 1);

        // Play sound when cell is turned on - using the correct note from our scale
        if (!current) {
            const note = scales[row][column];
            playNote(note);
        }
    }
}

// Function to play a note
function playNote(note) {
    Tone.start().then(() => {
        synth.triggerAttackRelease(note, "1n");
    });
}

// When sequencer is clicked, play the appropriate note
sequencer.on('change', function(data) {
    if (data.state) {
        const note = scales[data.row][data.column];
        playNote(note);
    }
});

// Display note labels (optional - adds text labels to show which note is which)
function createNoteLabels() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.pointerEvents = 'none'; // Don't interfere with clicks
    
    for (let row = 0; row < sequencer.rows; row++) {
        for (let col = 0; col < sequencer.columns; col++) {
            const label = document.createElement('div');
            label.textContent = scales[row][col];
            label.style.position = 'absolute';
            label.style.color = '#fff';
            label.style.fontSize = '10px';
            label.style.textAlign = 'center';
            
            // Position calculations would depend on your actual sequencer layout
            // This is a simplified example
            const cellWidth = (width - 200) / sequencer.columns;
            const cellHeight = sequencerHeight / sequencer.rows;
            
            label.style.left = `${col * cellWidth + 5}px`;
            label.style.top = `${row * cellHeight + 5}px`;
            
            container.appendChild(label);
        }
    }
    
    document.body.appendChild(container);
}

// Initialize MIDI access after user interaction
window.initMIDI = function () {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("Web MIDI API not supported.");
    }
};

function onMIDISuccess() {
    console.log("MIDI connected.");
}

function onMIDIFailure() {
    console.warn("Failed to get MIDI access.");
}

// Add event listener to handle a click anywhere
document.addEventListener('click', async () => {
    await Tone.start(); // Resume audio context
    // Play a silent note to initialize audio
    synth.triggerAttackRelease("C4", "32n", undefined, 0);
});