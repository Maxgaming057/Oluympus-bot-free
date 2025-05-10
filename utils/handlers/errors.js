const Utility = require('../modules/Utility');
const log = require('../modules/log');
const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    log('success', `[ Error Handler ] has been loaded.`);
    createErrorFile();

    process.on('uncaughtException', (err) => {
        if (err.message && err.message.includes('DiscordAPIError[10062]: Unknown interaction')) return;
        log('error', `${Utility.formatTime('dmy', Date.now())} : Exception Error: ${err.name} : ${err.message}`);
        const filePath = writeError(err);
        log('info', `Error has been saved to: ${filePath}`);
    });

    process.on('unhandledRejection', (err) => {
        if (err.message && err.message.includes('DiscordAPIError[10062]: Unknown interaction')) return;
        log('error', `${Utility.formatTime('dmy', Date.now())} : Unhandled Rejection Error: ${err.message}`);
        const filePath = writeError(err);
        log('info', `Error has been saved to: ${filePath}`);
    });
}

function createErrorFile() {
    const errorFilePath = path.join(__dirname, './errors.txt');
    if (!fs.existsSync(errorFilePath)) {
        try {
            fs.writeFileSync(errorFilePath, '');
            Utility.log('success', `➔ Created errors.txt file at ${errorFilePath}`);
        } catch (err) {
            Utility.log('error', err);
        }
    }
}

function writeError(error) {
    const errorFilePath = path.join(__dirname, './errors.txt');
    try {
        const errorDetails = `
        \n------- [ ${Utility.formatTime('dms', Date.now())} ] --------
        Error Name: ${error.name}
        Error Message: ${error.message}
        Stack Trace: ${error.stack}
        File Path: ${errorFilePath}
        -------------------------------------------------------
        \n`;

        fs.appendFileSync(errorFilePath, errorDetails, 'utf8');
        Utility.log('info', '➔ Error has been saved to errors.txt');
        return errorFilePath;
    } catch (err) {
        Utility.log('error', err);
    }
}
