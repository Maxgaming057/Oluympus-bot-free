const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member')
        .addStringOption(option => option.setName('user').setDescription('The user to unban').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Unban.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }

        const user = type === 'message' ? args[0] : moi.options.getString('user')

        if(!user || isNaN(user)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}unban [userId]`
                        }
                    })
                ]
            }, true);
        }

        const bans = await moi.guild.bans.fetch()
        const bannedId = [];

        bans.forEach(ban => {
            bannedId.push(ban.user.id)
        })

        if(!bannedId.includes(user)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unban.NotBanned,
                        variables: {
                            memberUsername: await client.users.cache.get(user)?.username || 'unnamed',
                            memberId: user,
                            memberUser: `<@${user}>`,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            memberIcon: await client.users.cache.get(user)?.displayAvatarURL({ size: 1024 }),
                        }
                    })
                ]
            }, true);
        } else {

            await moi.guild.members.unban(user).catch((e) => {
                return moi.channel.send({ embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: e.message
                        }
                    })
                ] })
            })

            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Unban.Embed,
                        variables: {
                            memberUsername: await client.users.cache.get(user)?.username || 'unnamed',
                            memberId: user,
                            memberUser: `<@${user}>`,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            memberIcon: await client.users.cache.get(user).displayAvatarURL({ size: 1024 }),
                        }
                    })
                ]
            }, true);
        }
    }
}