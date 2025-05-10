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
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage, newMessage) {

        const importedConfig = data.Logs.MessageUpdate

        if (!oldMessage.guild) return;
        if (!oldMessage.author) return;
        if (!oldMessage.content) return;

        if(oldMessage.content === newMessage.content) return;
        
        const channel = foundChannel(oldMessage.guild, Utility.clientConfig.Logs.MessageUpdate.channel);

        if(Utility.clientConfig.Logs.MessageUpdate.enabled == false) return;
        if(!channel) return;
        const member = oldMessage.member

        channel.send({embeds: [
            embed({
                ...importedConfig.Embed,
                variables: {
                    member: `<@${member.user.id}>`,
                    memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                    serverIcon: member.guild.iconURL({ size: 1024 }),
                    memberUser: member.user.username,
                    memberId: member.user.id,
                    messageContent: oldMessage?.content ? oldMessage.content : '❌',
                    newMessageContent: newMessage?.content ? newMessage.content : '❌'
                }
            })
        ]}).catch((e) = { })

       
    }
}