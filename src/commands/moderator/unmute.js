const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute member in the server')
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for mute!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Unmute.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }
        
        const user = await Utility.getUser(moi, type, args[0])
        const reason = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('reason')

        if(!user || !reason) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}unmute [user] [reason]`
                        }
                    })
                ]
            }, true);
        }

        const member = await moi.guild.members.fetch(user.id).catch(() => { null });


        if (!member) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.NoMemberFound
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

        if(!member.communicationDisabledUntilTimestamp) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unmute.NotMuted,
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
                        }
                    })
                ]
            }, true);
        }

        if (Utility.clientConfig.Unmute.sendToMember === true) {
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
                        }
                    }, { title: "Ban"})
                ]
            }).catch(() => { });
        }

        client.emit('punishmentCreated', member, 'unmute', null, reason, moi.member);

        member.timeout(null, reason).catch((e) => {
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
                    ...Utility.lang.Unmute.Embed,
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
                    }
                })
            ]
        }, true);
    }
};
