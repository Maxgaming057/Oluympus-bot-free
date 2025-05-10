const chalk = require('chalk');
const fs = require('fs');
const yaml = require('js-yaml');
const log = require('./log');
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const OlympusMissingRoles = []
const OlympusMissingChannels = [];
const { foundChannel } = require('../../utils/modules/utils')
module.exports = async (guild) => {
    const roles = ['Management', 'Admin', 'Mod', 'Staff', 'Member', 'Unverified', 'Verified']
    const channels = ['logs', 'commandlogs', 'welcome', 'leave', 'invites']
    
    for (let i = 0; i < roles.length; i++) {
        const role = await guild.roles.cache.find((r) => r.name.toLowerCase() === roles[i].toLowerCase());
        if (!role) { 
            OlympusMissingRoles.push(roles[i]);
            continue;
        }
    }

    for (let i = 0; channels.length > i; i++) {
        const channel = await guild.channels.cache.find((c) => c.name.toLowerCase() === channels[i].toLowerCase());
        if (!channel) {
            OlympusMissingChannels.push(channels[i])
            continue;
        }
    }

    if (OlympusMissingRoles.length > 0) {
        log('missing', `The following roles are missing: ${OlympusMissingRoles.join(', ')}` )
    }

    if (OlympusMissingChannels.length > 0) {
        log('missing', `The following channels are missing: ${OlympusMissingChannels.join(', ')}` )
    }

    return {
        roles: OlympusMissingRoles,
        channels: OlympusMissingChannels
    }
}

