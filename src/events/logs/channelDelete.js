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
    name: 'channelDelete',
    once: false,
    async execute(channel) {

        if (!channel.guild) return;

        const importedConfig = data.Logs.ChannelDelete
        const logChannel = await foundChannel(channel.guild, Utility.clientConfig.Logs.ChannelDelete.channel);
        
        if(Utility.clientConfig.Logs.ChannelDelete.enabled == false) return;
        if(!logChannel) return;

        logChannel.send({embeds: [
            embed({
                ...importedConfig.Embed,
                variables: {
                    channelName: channel.name,
                    channelId: channel.id,
                    channelParent: channel.parent,
                    channelMention: `<#${channel.id}>`,
                    date: formatTime('dms', Date.now()),
                    serverName: channel.guild.name,
                    serverIcon: channel.guild.iconURL({ size: 1024 })
                }
            })
        ]}).catch((e) = { })

       
    }
}