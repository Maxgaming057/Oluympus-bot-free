const chalk = require('chalk')
const figlet = require('figlet')

module.exports = async () => {
    const text = await figlet.text('Olympus', {
        font: '3D-ASCII',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })
    console.log(chalk.hex('#4995ec -----------------------------------------------------------------------------------------------'))
    console.log(chalk.hex('#4995ec                                  Thanks for choosing:                             '))
    console.log(chalk.hex('#4995ec ' + text))
    console.log(chalk.hex('#4995ec5                            https://discord.gg/xjDFBPy8kZ                       '))
    console.log(chalk.hex('#4995ec -----------------------------------------------------------------------------------------------'))
}