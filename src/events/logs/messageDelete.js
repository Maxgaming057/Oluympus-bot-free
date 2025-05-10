const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundChannel } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase')
const db = new Database()
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {

        if (!message.guild) return;
        if (!message.author) return;
        if (!message.content) return;

        const importedConfig = data.Logs.MessageDelete
        const channel = foundChannel(message.guild, Utility.clientConfig.Logs.MessageDelete.channel);
        
        if(Utility.clientConfig.Logs.MessageDelete.enabled == false) return;
        if(!channel) return;

        const member = message.member;

        channel.send({embeds: [
            embed({
                ...importedConfig.Embed,
                variables: {
                    member: `<@${member?.user.id}>`,
                    memberpfp: member?.user.displayAvatarURL({ size: 1024 }),
                    serverIcon: member?.guild.iconURL({ size: 1024 }),
                    memberUser: member?.user.username,
                    memberId: member?.user.id,
                    messageContent: message?.content ? message.content : '❌'
                }
            })
        ]}).catch((e) = { }) 
    }
}