const notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
const noteMap = {
  db: 'c#',
  eb: 'd#',
  gb: 'f#',
  ab: 'g#',
  bb: 'a#',
}
const middleOctave = 3

const getNoteFromCode = (code) => {
  const octaveBase = 12 * (middleOctave - 1)
  const noteIndex = (code - octaveBase) % 12
  const note = notes[noteIndex]
  return note ? `${note.toUpperCase()}${(code - noteIndex) / 12}` : '--'
}

const getMidiNote = (noteNames) => {
  for (const noteName of noteNames) {
    let note = noteName.match(/[^\d]+/gi)
    note = note ? note[0] : ''
    let octave = noteName.match(/\d+/gi)
    octave = octave ? octave[0] : middleOctave // Default to Ableton middle
    octave = parseInt(octave)
    if (note) {
      let noteNumber = notes.indexOf(note.toLowerCase())
      if (noteNumber < 0) {
        // Try again with alternative name
        noteNumber = notes.indexOf(noteMap[note.toLowerCase()])
      }
      if (noteNumber > -1) {
        const octaveBase = 12 * (octave + (middleOctave - 1))
        const midiNote = noteNumber + octaveBase
        if (midiNote > -1 && midiNote < 128) {
          return [note, midiNote]
        }
      }
    } else {
      // This might be a MIDI code already, suggest it
      if (octave > -1 && octave < 128) {
        note = getNoteFromCode(octave)
        return [note, octave]
      }
    }
  }
  return -1
}

module.exports = {
  getMidiNote,
}
