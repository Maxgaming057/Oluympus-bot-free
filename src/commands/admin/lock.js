const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'admin',
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to lock').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
    async execute(moi, args, client, { type, send }) {

        let channel;
        if (type === 'interaction') channel = moi.options.getChannel('channel')
        if (type === 'message') channel = moi.mentions?.channels.first() || Utility.findChannel(moi.guild, args[0])
        
        if(!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Lock.permissions)) {
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
                         usage: `${await Utility.getPrefix(moi.guild.id)}lock [channel]`
                       }
                    })
                ]
            });
        }

        channel.permissionOverwrites.edit(moi.guild.id, {
            SendMessages: false,
            EmbedLinks: false,
            AddReactions: false
        })

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Lock.Embed,
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
