const inquirer = require('inquirer')

const { getBasename } = require('./files')

const askForDirectory = () => {
  const questions = [
    {
      name: 'directory',
      type: 'input',
      message: 'What directory do you want to check?',
      validate: function (value) {
        if (value.length) {
          return true
        } else {
          return 'Please pick a directory.'
        }
      },
    },
  ]
  return inquirer.prompt(questions)
}

const askForConfirmation = () => {
  const questions = [
    {
      name: 'action',
      type: 'list',
      message: 'What do you want to do?',
      choices: [
        {
          name: 'Set root note for all',
          value: 'all',
        },
        {
          name: 'Set root note for some',
          value: 'some',
        },
        {
          name: 'Abort',
          value: 'abort',
        },
      ],
    },
  ]
  return inquirer.prompt(questions)
}

const getBatchList = (files, notes) => {
  const choices = files.map((file, index) => {
    return {
      key: file,
      name: `${getBasename(file)} (${notes[index][0]})`,
    }
  })
  const questions = [
    {
      name: 'samples',
      type: 'checkbox',
      message: 'Which files do you want to work?',
      choices,
    },
  ]
  return inquirer.prompt(questions)
}

module.exports = {
  askForDirectory,
  askForConfirmation,
  getBatchList,
}
