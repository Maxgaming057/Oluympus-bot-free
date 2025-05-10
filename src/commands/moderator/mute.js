const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute member in the server')
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('Mute duration !').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for mute!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Mute.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }
        
        const user = await Utility.getUser(moi, type, args[0])
        const time = type == 'message' ? args[1] : moi.options.getString('time')
        const reason = type == 'message' ? args.slice(2).join(' ') : moi.options.getString('reason')

        if(!user || !reason || !time) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}mute [user] [duration] [reason]`
                        }
                    })
                ]
            }, true);
        }

        const member = await moi.guild.members.fetch(user.id).catch(() => { null });
        const regex = /[mshd]/

        if(!regex.test(time)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.InvalidDuration,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}mute [user] [duration] [reason]`
                        }
                    })
                ]
            }, true);
        }

        if(ms(time) > ms('28d')) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.InvalidDuration,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}mute [user] [duration] [reason]`
                        }
                    })
                ]
            }, true);
        }

        if (!member) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.NoMemberFound
                    })
                ]
            }, true);
        }

        if (Utility.permission(member, moi.guild, Utility.clientConfig.Mute.protect)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.NoStaffPunishment
                    })
                ]
            }, true);
        }

        if (member.roles.highest.position >= moi.member.roles.highest.position) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.RolePosition
                    })
                ]
            }, true);
        }

        if (member.roles.highest.position >= moi.guild.members.me.roles.highest.position) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.RolePosition
                    })
                ]
            }, true);
        }

        if (Utility.clientConfig.Mute.sendToMember === true) {
            await user.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Mute.MemberEmbed,
                        variables: {
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberId: user.id,
                            serverName: moi.guild.name,
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffId: moi.member.user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            memberIcon: user.displayAvatarURL({ size: 1024 }),
                            reason: reason,
                            duration: time
                        }
                    }, { title: "Ban"})
                ]
            }).catch(() => { });
        }

        client.emit('punishmentCreated', member, 'mute', time, reason, moi.member);

        const duration = ms(time)

        member.timeout(duration, reason).catch((e) => {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: e.message
                        }
                    })
                ]
            });
        });

        await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Mute.Embed,
                    variables: {
                        memberUser: `<@${user.id}>`,
                        memberUsername: user.username,
                        memberId: user.id,
                        serverName: moi.guild.name,
                        staffUser: `<@${moi.member.user.id}>`,
                        staffUsername: moi.member.user.username,
                        staffId: moi.member.user.id,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        memberIcon: user.displayAvatarURL({ size: 1024 }),
                        reason: reason,
                        duration: time
                    }
                })
            ]
        }, true);
    }
};
