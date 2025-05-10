const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'admin',
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to unlock').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
    async execute(moi, args, client, { type, send }) {

        let channel;
        if (type === 'interaction') channel = moi.options.getChannel('channel')
        if (type === 'message') channel = moi.mentions?.channels.first() || Utility.findChannel(moi.guild, args[0])
        
        if(!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Unlock.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Permission,
                    })
                ]
            });
        }

        if(!channel) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Usage,
                       variables: {
                         usage: `${await Utility.getPrefix(moi.guild.id)}unlock [channel]`
                       }
                    })
                ]
            });
        }

        channel.permissionOverwrites.edit(moi.guild.id, {
            SendMessages: null,
            EmbedLinks: null,
            AddReactions: null
        })

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Unlock.Embed,
                    variables: {
                        channelName: channel.name,
                        channelId: channel.id,
                        channel: `<#${channel.id}>`,
                        serverName: moi.guild.name,
                        serverIcon: moi.guild.iconURL({ size: 1024 })
                    }
                })
            ]
        });
    }
}