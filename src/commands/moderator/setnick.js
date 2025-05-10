const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    aliases: ['setnickname'],
    data: new SlashCommandBuilder()
        .setName('setnick')
        .setDescription('Set nickname of a member !')
        .addUserOption(option => option.setName('user').setDescription('The user to set nickname').setRequired(true))
        .addStringOption(option => option.setName('nickname').setDescription('The nickname to set').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        try {
            if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Setnickname.permissions)) {
                moi.channel.send('radi ovo 2')
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission
                        })
                    ]
                }, true)
            }

            const user = await Utility.getUser(moi, type, args[0])
            const nickname = type == 'message' ? args.slice(1).join(' ') : moi.options.getString('nickname')

            if (!user || !nickname) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Usage,
                            variables: {
                                usage: `${await Utility.getPrefix(moi.guild.id)}setnick [user] [nickname]`
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
                }, true)
            }

            if (user.id === moi.guild.ownerId) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Error,
                            variables: {
                                error: 'Can not set nickname for the server owner.'
                            }
                        })
                    ]
                }, true)
            }

            if (member.roles.highest.position >= moi.member.roles.highest.position) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.RolePosition,
                        })
                    ]
                }, true)
            }

            if (user.id === client.user.id) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Error,
                            variables: {
                                error: 'You can not set my nickname.'
                            }
                        })
                    ]
                }, true)
            }

            member.setNickname(nickname)
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Setnickname.Embed,
                        variables: {
                            nickname: nickname,
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberId: user.id,
                            serverName: moi.guild.name,
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffId: moi.member.user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            memberIcon: user.displayAvatarURL({ size: 1024 }),
                        }
                    })
                ]
            }, true)
        } catch (error) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: error.message
                        }
                    })
                ]
            })
        }
    }
}