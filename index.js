#!/usr/bin/env node

const chalk = require('chalk')
const minimist = require('minimist')
const ora = require('ora')
const { table } = require('table')

const options = minimist(process.argv.slice(2), {
  alias: {
    directory: 'd',
    all: 'a',
  },
})

const {
  askForDirectory,
  askForConfirmation,
  getBatchList,
} = require('./lib/dialogs')
const { getMidiNote } = require('./lib/midi')
const { getBasename, getWavFilesInDirectory } = require('./lib/files')
const { setRootNote } = require('./lib/wavefile')
const { version } = require('./package.json')
const config = require('./config')

const { log } = console

const logo = `
                                                  #######
 .::: Note detection for multi samples            ############.
                                                  ##         ###
'########:::'#######::'########:'##::: ##:::::::: ##:'########:
 ##.... ##:'##.... ##:... ##..:: ###:: ##:::::::: ##:... ##..::
 ##:::: ##: ##:::: ##:::: ##:::: ####: ##:: ########:::: ##::::
 ########:: ##:::: ##:::: ##:::: ## ## ##: #########:::: ##::::
 ##.. ##::: ##:::: ##:::: ##:::: ##. ####: #########:::: ##::::
 ##::. ##:: ##:::: ##:::: ##:::: ##:. ###: #########:::: ##::::
 ##:::. ##:. #######::::: ##:::: ##::. ##:. #######::::: ##::::
..:::::..:::.......::::::..:::::..::::..:::.......::::::..:::::
                                                         v${version}
`

const handleFiles = async (files, midiNotes) => {
  let batchResults
  let spinner
  const successes = []
  const fails = []
  const skips = []
  spinner = ora({
    text: `Handling ${files.length} files, hold on!`,
  }).start()
  batchResults = await Promise.all(
    files.map((file, index) => setRootNote(file, midiNotes[index][1]))
  )
  spinner.stop()
  for (result of batchResults) {
    const { status } = result
    if (status === 'success') {
      successes.push(result)
    } else if (status === 'error') {
      fails.push(result)
    } else if (status === 'skip') {
      skips.push(result)
    }
  }
  return { successes, fails, skips }
}

/*
 * Takes results from handleFiles and returns a formatted and colored
 * string summary. */
const getSummary = (results) => {
  const { successes, skips, fails } = results
  return `${chalk.green(successes.length)} succeeded, ${chalk.yellow(
    skips.length
  )} were skipped, and ${chalk.red(fails.length)} failed.`
}

/*
 * Takes a list of samples picked by users and find the corresponding
 * files in the original list. */
const resolveSamples = (samples, files) => {
  const filePaths = samples.map((sample) => {
    const cleanSample = sample.split(' (')[0]
    return files.find((file) => file.includes(cleanSample))
  })
  return filePaths
}

const main = async () => {
  // Print logo and get started
  log(chalk.yellowBright(logo))
  let directory
  if (options.directory) {
    directory = options.directory
  } else {
    const dirReply = await askForDirectory()
    directory = dirReply.directory
  }
  const files = await getWavFilesInDirectory(directory)

  if (files.length) {
    log(`Found ${files.length} samples:`)
    const midiNotes = []
    for (const file of files) {
      let name = getBasename(file)
      const possibleNotes = name.match(/[a-h][#b]?[0-9]|[0-9]{3}/gi)
      if (possibleNotes) {
        const midiNote = getMidiNote(possibleNotes)
        midiNotes.push(midiNote)
      } else {
        midiNotes.push(-1)
      }
    }

    // Print a table of suggested changes
    const estimates = files.map((file, index) => [
      chalk.blueBright(getBasename(file)),
      chalk.green(midiNotes[index][0]),
      chalk.yellow(midiNotes[index][1]),
    ])
    estimates.unshift(['Sample name', 'Guess', 'MIDI note'])
    log(table(estimates, config.table))

    // Ask user for action if --all flag is not set.
    // Choices: Abort, do all or do some
    let action
    let results
    if (options.all) {
      action = 'all'
    } else {
      log('We found the above matches.')
      const confReply = await askForConfirmation()
      action = confReply.action
    }

    switch (action) {
      case 'abort':
        log('Ok, aborting! Have a nice day :)')
        process.exit(0)
        break

      case 'all':
        results = await handleFiles(files, midiNotes)
        log(`Done! Out of ${files.length} files in folder:`)
        log(getSummary(results))
        break

      case 'some':
        log('Pick the samples you want to update in the list below:')
        const allResults = await getBatchList(files, midiNotes)
        const { samples } = allResults
        const someFiles = resolveSamples(samples, files)
        results = await handleFiles(someFiles, midiNotes)
        log(`Done! Out of the ${files.length} files you picked:`)
        log(getSummary(results))

      default:
        process.exit(1)
    }
  }
}

main()
