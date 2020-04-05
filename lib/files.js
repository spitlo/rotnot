const fs = require('fs').promises
const globby = require('globby')
const path = require('path')
const untildify = require('untildify')

const getBasename = (file) => path.basename(file, '.wav')
const getParentDir = (file) => path.dirname(file).split(path.sep).pop()
const getWavFilesInDirectory = async (dirPath) =>
  globby(path.posix.join(untildify(dirPath), '*.{wav,WAV}'))
const loadFile = (filePath) => fs.readFile(filePath)
const saveFile = (filePath, file) => fs.writeFile(filePath, file)

module.exports = {
  getBasename,
  getParentDir,
  getWavFilesInDirectory,
  loadFile,
  saveFile,
}
