const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'util',
    aliases: ['server'],
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get the info about the server!'),
    async execute(moi, args, client, { type, send }) {
        const { guild } = moi;

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Serverinfo.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        await send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Serverinfo.Embed,
                    variables: {
                        serverName: guild.name,
                        serverId: guild.id,
                        serverHumans: guild.members.cache.filter((isH) => !isH.user.bot).size,
                        serverBots: guild.members.cache.filter((isH) => isH.user.bot).size,
                        totalMembers: guild.members.cache.size,
                        roles: guild.roles.cache.map(r => `<@&${r.id}>`),
                        channelsText: guild.channels.cache.filter((c) => c.type == ChannelType.GuildText).size,
                        channelsAnnouncements: guild.channels.cache.filter((c) => c.type == ChannelType.GuildAnnouncement).size,
                        channelsVoice: guild.channels.cache.filter((c) => c.type == ChannelType.GuildVoice).size,
                        channelsCategories: guild.channels.cache.filter((c) => c.type == ChannelType.GuildCategory).size,
                        serverIcon: guild.iconURL({ size: 1024 }),
                        owner: `<@${guild.ownerId}>`,
                        createdAt: Utility.formatTime('dms', guild.createdAt)
                    }
                })
            ]
        }, true)
    }
}