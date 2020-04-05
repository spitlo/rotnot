const { WaveFile } = require('wavefile')

const { loadFile, saveFile } = require('./files')

const setRootNote = async (filePath, midiNote) => {
  try {
    const file = await loadFile(filePath)
    const wav = new WaveFile(file)
    const {
      smpl: { dwMIDIUnityNote },
    } = wav
    if (dwMIDIUnityNote === midiNote) {
      return {
        filePath,
        status: 'skip',
      }
    } else {
      wav.smpl.chunkId = 'smpl' // Needed for changes to sticks
      wav.smpl.dwMIDIUnityNote = midiNote
      await saveFile(filePath, wav.toBuffer())
      return {
        filePath,
        status: 'success',
      }
    }
  } catch (error) {
    return {
      error,
      filePath,
      status: 'error',
    }
  }
}

module.exports = {
  setRootNote,
}
