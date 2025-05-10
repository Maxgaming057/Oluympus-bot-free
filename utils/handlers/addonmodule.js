const log = require('../modules/log');

function addonConsole(commands) {
    let message = '';
    
    if (!Array.isArray(commands)) {
        message = 'commands input must be array.';
    }
    else if (commands.length === 1) {
        message = `[ Cmd: /${commands.map(cmd => cmd.data.name).join(', ')} ] have been loaded`;
    }
    else if (commands.length > 1) {
        message = `[ Cmds: /${commands.map(cmd => cmd.data.name).join(', /')} ] has been loaded`;
    }
    
    log('addonload', message);
}

module.exports = {
    addonConsole
};
