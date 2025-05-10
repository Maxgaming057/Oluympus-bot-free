const chalk = require("chalk");

module.exports = (preset , input) => {

    if(!input) return;

    if(preset.toLowerCase() === 'error') {
        return console.log(chalk.hex('#ef8b81').bold(`[ Error ] ` + input));
    }

    if(preset.toLowerCase() === 'info') {
        return console.log(chalk.hex('#81ef8e').bold(`[ Info ] ` + input));
    }

    if(preset.toLowerCase() ==='success') {
        // return console.log(chalk('test').hex('#81ef8e') +  `[ Success ] ` + chalk.hex('#81ef8e').bold(input));
        return console.log(chalk.hex('#81ef8e').bold('[ Success ] ' + input))
    }

    if(preset.toLowerCase() === 'debug') {
        return console.log(chalk.hex('#81ef8e').bold(`[ Debug ] ` + input));
    }

    if(preset.toLowerCase() === 'addonload') {
        return console.log(chalk.hex('#e7cb94').bold(`[ Addon Load ] ` + input));
    }

    if (preset.toLowerCase() === 'missing') {
        return console.log(chalk.hex('#e7cb94').bold(`[ Missing Module ] ` + input));
    }
    
}