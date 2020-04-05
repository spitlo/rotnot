#!/usr/bin/env node

const chalk = require('chalk')
const { table } = require('table')
const ora = require('ora')

const {
  askForDirectory,
  askForConfirmation,
  getBatchList,
} = require('./lib/dialogs')
const { getMidiNote } = require('./lib/midi')
const { getBasename, getWavFilesInDirectory } = require('./lib/files')
const { setRootNote } = require('./lib/wavefile')

const { log } = console

const logo = `
'########:::'#######::'########:'##::: ##::'#######::'########:
 ##.... ##:'##.... ##:... ##..:: ###:: ##:'##.... ##:... ##..::
 ##:::: ##: ##:::: ##:::: ##:::: ####: ##: ##:::: ##:::: ##::::
 ########:: ##:::: ##:::: ##:::: ## ## ##: ##:::: ##:::: ##::::
 ##.. ##::: ##:::: ##:::: ##:::: ##. ####: ##:::: ##:::: ##::::
 ##::. ##:: ##:::: ##:::: ##:::: ##:. ###: ##:::: ##:::: ##::::
 ##:::. ##:. #######::::: ##:::: ##::. ##:. #######::::: ##::::
..:::::..:::.......::::::..:::::..::::..:::.......::::::..:::::
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

const main = async () => {
  // Print logo and get started
  log(chalk.yellowBright(logo))
  const dirReply = await askForDirectory()
  const { directory } = dirReply
  const files = await getWavFilesInDirectory(directory)

  if (files.length) {
    log(`Found ${files.length} samples. Attempting to set root notes.`)
    const midiNotes = []
    for (const file of files) {
      let name = getBasename(file)
      const possibleNotes = name.match(/[a-h][#b]?[0-9]|[0-9]{1,3}/gi)
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
    estimates.unshift(['Sample name', 'Guesstimated note', 'MIDI note'])
    log(
      table(estimates, {
        drawHorizontalLine: (index, size) =>
          index < 2 || (index - 1) % 5 === 0 || index === size,
      })
    )

    // Ask user for action. Abort, do all or do some
    log('We found the above matches.')
    const confReply = await askForConfirmation()
    let results
    const { action } = confReply
    switch (action) {
      case 'abort':
        log('Ok, aborting! Have a nice day :)')
        process.exit(0)
        break

      case 'all':
        results = await handleFiles(files, midiNotes)
        log(`Done! Out of ${files.length} files:`)
        log(
          `${chalk.green(results.successes.length)} succeeded, ${chalk.yellow(
            results.skips.length
          )} were skipped, and ${chalk.red(results.fails.length)} failed.`
        )
        break

      case 'some':
        log('Pick the samples you want to update in the list below:')
        const allResults = await getBatchList(files, midiNotes)
        const { samples } = allResults
        const batchFiles = resolveSamples(samples, files)
        results = await handleFiles(batchFiles, midiNotes)
        log(results)

      default:
        process.exit(1)
    }
  }
}

main()
