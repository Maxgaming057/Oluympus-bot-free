const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'util',
    aliases: ['role'],
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Get role info')
        .addRoleOption(option => option.setName('role').setDescription('Role you want to check').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        const role = type === 'interaction' ? moi.options.getRole('role') : moi.mentions.roles.first() || Utility.findRole(moi.guild, args[0])

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Roleinfo.permissions)) {
            return interaction.editReply({
                embeds: [
                    Utility.embed({
                        ...data.Permission
                    })
                ]
            })
        }

        if(!role) {
            return send(type, moi, { embeds: [
                Utility.embed(
                    {
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}roleinfo [role]`
                        }
                    }
                )
            ]})
        }

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Roleinfo.Embed,
                    variables: {
                        roleName: role.name,
                        roleColor: role.hexColor,
                        roleId: role.id,
                        rolePosition: role.position,
                        memberCount: role.members.size,
                        roleMention: role.toString(),
                        roleHoisted: role.hoist,
                        roleMentionable: role.mentionable,
                        rolePermissions: role.permissions.toArray().join(', ') || 'No perms',
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        clientIcon: client.user.displayAvatarURL({ size: 1024 }),
                        userIcon: moi.member.user.displayAvatarURL({ size: 1024 })
                    }
                })
            ]
        }, true)




    }
}