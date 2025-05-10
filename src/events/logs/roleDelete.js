const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundChannel, formatTime } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase')
const db = new Database()
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'roleDelete',
    once: false,
    async execute(role) {

        if (!role.guild) return;

        const importedConfig = data.Logs.RoleDelete
        const logChannel = await foundChannel(role.guild, Utility.clientConfig.Logs.RoleDelete.channel);
        
        if(Utility.clientConfig.Logs.RoleDelete.enabled == false) return;
        if(!logChannel) return;

        logChannel.send({embeds: [
            embed({
                ...importedConfig.Embed,
                variables: {
                    roleName: role.name,
                    roleId: role.id,
                    roleMention: `<@&${role.id}>`,
                    date: formatTime('dms', Date.now()),
                    serverName: role.guild.name,
                    serverIcon: role.guild.iconURL({ size: 1024 })
                }
            })
        ]}).catch((e) = { })

       
    }
}