const { SlashCommandBuilder, ChannelType } = require("discord.js")
const Utility = require("../../../utils/modules/Utility")

module.exports = {
    category: 'general',
    aliases: ['reportuser'],
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('User to report')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Reason for the report')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Report.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const user = await Utility.getUser(moi, type, args[0]);
        const reason = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('reason');

        if (!user || !reason) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}report [user] [reason]`
                        }
                    })
                ]
            }, true)
        }

        const channel = await Utility.findChannel(moi.guild, Utility.lang.Report.channel);
        if (!channel || channel && channel.type !== ChannelType.GuildText) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Report.Nochannel,
                        variables: {
                            channel: Utility.lang.Report.channel
                        }
                    })
                ]
            }, true)
        }

        if(type === 'message') moi.delete().catch(() => { })

        const pingRoles = [];
        for (const rol of Utility.lang.Report.staffRoles) {
            const role = await Utility.findRole(moi.guild, rol);
            if (role) {
                pingRoles.push(`<@&${role.id}>`)
            }
        }

        channel.send({
            content: Utility.clientConfig.Report.pingStaff ? pingRoles.length ? `${pingRoles.map(r => r).join(' , ')} ${Utility.lang.Report.message}` : '' : '',
            embeds: [
                Utility.embed({
                    ...Utility.lang.Report.Embed,
                    variables: {
                        memberUser: `<@${user.id}>`,
                        memberUsername: user.username,
                        memberId: user.id,
                        serverName: moi.guild.name,
                        reportAuthor: `<@${moi.member.user.id}>`,
                        reportAuthorId: moi.member.user.id,
                        reportAuthorUsername: moi.member.user.username,
                        reason: reason,
                        date: Utility.formatTime('dms', Date.now()),
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        authorIcon: moi.member.user.displayAvatarURL({ dynamic: true }),
                        reportedUserAvatar: user.displayAvatarURL({ dynamic: true })
                    }
                })
            ]
        }).catch((error) => {
            moi.channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: error.message
                        }
                    })
                ]
            })
        })

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Report.Sent,
                    variables: {
                        memberUser: `<@${user.id}>`,
                        memberUsername: user.username,
                        memberId: user.id,
                        serverName: moi.guild.name,
                        reportAuthor: `<@${moi.member.user.id}>`,
                        reportAuthorId: moi.member.user.id,
                        reportAuthorUsername: moi.member.user.username,
                        reason: reason,
                        date: Utility.formatTime('dms', Date.now())
                    }
                })
            ]
        })

    }
}