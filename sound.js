document.body.style.backgroundColor = "#000";

let width = window.innerWidth;
let height = window.innerHeight;
let envelopeHeight = height * 0.2;
let sequencerHeight = height * 0.7;

const synth = new Tone.PolySynth(Tone.Synth, {
    envelope: {
        attack: 0.01,
        decay: 1.1,
        sustain: 1,
        release: 1.5
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
    columns: 12,
});

const scales = {
    0: ["C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6"],
    1: ["C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"],
    2: ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"],
    3: ["C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"]
};

sequencer.colorize("fill", "#333");
sequencer.colorize("accent", "#ff0");

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    envelopeHeight = height * 0.2;
    sequencerHeight = height * 0.7;
    envelope.resize(width, envelopeHeight);
    sequencer.resize(width - 200, sequencerHeight);
    checkScrollTop();
});

const activeNotes = {};

const keyMap = {
    '1': { column: 0, row: 0 }, '2': { column: 1, row: 0 }, '3': { column: 2, row: 0 }, '4': { column: 3, row: 0 },
    '5': { column: 4, row: 0 }, '6': { column: 5, row: 0 }, '7': { column: 6, row: 0 }, '8': { column: 7, row: 0 },
    '9': { column: 8, row: 0 }, '0': { column: 9, row: 0 }, '-': { column: 10, row: 0 }, '=': { column: 11, row: 0 },
    'q': { row: 1, column: 0 }, 'w': { row: 1, column: 1 }, 'e': { row: 1, column: 2 }, 'r': { row: 1, column: 3 },
    't': { row: 1, column: 4 }, 'y': { row: 1, column: 5 }, 'u': { row: 1, column: 6 }, 'i': { row: 1, column: 7 },
    'o': { row: 1, column: 8 }, 'p': { row: 1, column: 9 }, '[': { row: 1, column: 10 }, ']': { row: 1, column: 11 },
    'a': { row: 2, column: 0 }, 's': { row: 2, column: 1 }, 'd': { row: 2, column: 2 }, 'f': { row: 2, column: 3 },
    'g': { row: 2, column: 4 }, 'h': { row: 2, column: 5 }, 'j': { row: 2, column: 6 }, 'k': { row: 2, column: 7 },
    'l': { row: 2, column: 8 }, ';': { row: 2, column: 9 }, "'": { row: 2, column: 10 }, '\\': { row: 2, column: 11 },
    '`': { row: 3, column: 0 }, 'z': { row: 3, column: 1 }, 'x': { row: 3, column: 2 }, 'c': { row: 3, column: 3 },
    'v': { row: 3, column: 4 }, 'b': { row: 3, column: 5 }, 'n': { row: 3, column: 6 }, 'm': { row: 3, column: 7 },
    ',': { row: 3, column: 8 }, '.': { row: 3, column: 9 }, '/': { row: 3, column: 10 }
};

document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
        const { row, column } = keyMap[key];
        const note = scales[row][column];
        activeNotes[key] = note;
        sequencer.matrix.set.cell(column, row, 1);
        Tone.start().then(() => synth.triggerAttack(note));
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
        const { row, column } = keyMap[key];
        if (activeNotes[key]) {
            const note = activeNotes[key];
            synth.triggerRelease(note);
            delete activeNotes[key];
        }
        sequencer.matrix.set.cell(column, row, 0);
    }
});

// Remove or comment out default play-on-change
sequencer.on('change', function (data) {
    // Do nothing for click-based play
});

function setupCellPointerEvents() {
    const sequencerElement = document.getElementById('keys');

    sequencerElement.addEventListener('pointerdown', (e) => {
        const rect = sequencerElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellWidth = rect.width / sequencer.columns;
        const cellHeight = rect.height / sequencer.rows;

        const column = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        if (row >= 0 && row < sequencer.rows && column >= 0 && column < sequencer.columns) {
            const note = scales[row][column];
            Tone.start().then(() => synth.triggerAttack(note));
            activeNotes['pointer'] = note;
            sequencer.matrix.set.cell(column, row, 1);
        }
    });

    ['pointerup', 'pointerleave'].forEach(evt => {
        sequencerElement.addEventListener(evt, () => {
            const note = activeNotes['pointer'];
            if (note) {
                synth.triggerRelease(note);
                delete activeNotes['pointer'];
            }
        });
    });
}

setupCellPointerEvents();

function stopAllSounds() {
    synth.releaseAll();
    for (const key in activeNotes) delete activeNotes[key];
    for (let row = 0; row < sequencer.rows; row++) {
        for (let col = 0; col < sequencer.columns; col++) {
            sequencer.matrix.set.cell(col, row, 0);
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') stopAllSounds();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAllSounds();
});

document.addEventListener('click', (e) => {
    if (e.button === 2) {
        stopAllSounds();
        e.preventDefault();
    }
});

window.initMIDI = function () {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("Web MIDI API not supported.");
    }
};

function onMIDISuccess(midiAccess) {
    console.log("MIDI connected.");
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIMessage(message) {
    const command = message.data[0] >> 4;
    const noteNumber = message.data[1];
    const velocity = message.data[2] / 127;
    const note = Tone.Frequency(noteNumber, "midi").toNote();

    if (command === 9 && velocity > 0) {
        synth.triggerAttack(note, Tone.now(), velocity);
    } else if (command === 8 || (command === 9 && velocity === 0)) {
        synth.triggerRelease(note);
    }
}

function onMIDIFailure() {
    console.warn("Failed to get MIDI access.");
}

function createNoteLabels() {
    const createLabels = () => {
        const existingContainer = document.getElementById('note-labels-container');
        if (existingContainer) existingContainer.remove();

        const sequencerElement = document.getElementById('keys');
        if (!sequencerElement) return;

        document.body.offsetHeight;

        const sequencerRect = sequencerElement.getBoundingClientRect();
        const container = document.createElement('div');
        container.id = 'note-labels-container';
        container.style.position = 'absolute';
        container.style.top = sequencerRect.top + 'px';
        container.style.left = sequencerRect.left + 'px';
        container.style.width = sequencerRect.width + 'px';
        container.style.height = sequencerRect.height + 'px';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1000';
        document.body.appendChild(container);

        const cellWidth = sequencerRect.width / sequencer.columns;
        const cellHeight = sequencerRect.height / sequencer.rows;

        for (let row = 0; row < sequencer.rows; row++) {
            for (let col = 0; col < sequencer.columns; col++) {
                const note = scales[row][col];
                const label = document.createElement('div');
                label.textContent = note;
                label.style.position = 'absolute';
                label.style.color = '#fff';
                label.style.fontSize = '10px';
                label.style.fontWeight = 'bold';
                label.style.textAlign = 'center';
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'center';
                label.style.left = (col * cellWidth) + 'px';
                label.style.top = (row * cellHeight) + 'px';
                label.style.width = cellWidth + 'px';
                label.style.height = cellHeight + 'px';
                label.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                label.style.textShadow = '1px 1px 1px #000';
                container.appendChild(label);
            }
        }
    };

    if (document.readyState === 'complete') {
        setTimeout(createLabels, 300);
    } else {
        window.addEventListener('load', () => setTimeout(createLabels, 300));
    }
}

function checkScrollTop() {
    if (window.scrollY === 0) createNoteLabels();
}

window.addEventListener('scroll', checkScrollTop);
