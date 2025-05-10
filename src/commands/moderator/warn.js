const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member !')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warn').setRequired(true)),
    async execute(moi, args, client, { type, send }) {  

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Warn.permissions)) {
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
                            usage: `${await Utility.getPrefix(moi.guild.id)}warn [user] [reason]`
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

        if (Utility.permission(member, moi.guild, Utility.clientConfig.Warn.protect)) {
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

        const id = Utility.generateCode(10)
        await Utility.db.insert('warn', { id: id.toString(), guild: moi.guild.id.toString(), user: user.id.toString(), staff: moi.member.user.id.toString(), reason: reason.toString()})

        if(Utility.clientConfig.Warn.sendToMember === true) {
            await user.send({
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Warn.MemberEmbed,
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
                            id: id
                        }
                    })
                ]
            }).catch(() => { })
        }

        await client.emit('punishmentCreated', member, 'warn', null, reason, moi.member)

        await send(type, moi, {embeds: [
            Utility.embed({
                ...Utility.lang.Warn.Embed,
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
                    id: id
                }
            })
            ]
        }, true) 
    }
};