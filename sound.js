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
        decay: 0.1,
        sustain: 1,     // full sustain
        release: 1.5    // slow release
    }
}).toDestination();




function stopNote() {
    synth.triggerRelease();
}


const envelope = new Nexus.Envelope('#envelope', {
    size: [width, envelopeHeight],
});
envelope.colorize("accent", "#ff0");
envelope.colorize("fill", "#333");

const sequencer = new Nexus.Sequencer('#keys', {
    size: [width - 200, sequencerHeight],
    mode: 'impulse',
    rows: 4,
    columns: 10,
});
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

const keyMap = {
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

    // Row 1: QWERTYUIOP
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

    // Row 2: ASDFGHJKL;
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
    '/': { row: 3, column: 9 }
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



function toggleSequencerCell(row, column) {
    if (row >= 0 && row < sequencer.rows && column >= 0 && column < sequencer.columns) {
        const current = sequencer.matrix.pattern[row][column];
        sequencer.matrix.set.cell(column, row, current ? 0 : 1);

        // 🔊 Play sound when cell is turned on
        if (!current) {
            synth.triggerAttackRelease("C4", "8n");
        }
    }
}
document.querySelectorAll('rect').forEach(rect => {
    rect.addEventListener('click', async () => {
        await Tone.start(); // Resume audio context
        synth.triggerAttackRelease("C4", "8n");
    });
});



