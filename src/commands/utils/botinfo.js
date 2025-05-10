const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'util',
    aliases: ['bot'],
    data: new SlashCommandBuilder()
       .setName('botinfo')
       .setDescription('Check the bot info !'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Botinfo.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Permission,
                    })
                ]
            });
        }

        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Botinfo.Embed,
                   variables: {
                     botName: client.user.username,
                     botId: client.user.id,
                     botAvatar: client.user.avatarURL({ size: 1024 }),
                     botGuilds: client.guilds.cache.size,
                     botChannels: client.channels.cache.size,
                     botUsers: client.users.cache.size,
                     botCommands: client.commands.size,
                     botVersion: '2.2.0',
                     botVerified: '✅',
                     botOnlineSince: ms(client.uptime)
                   }
                })
            ]
        })
        

    }
}