const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Check the all warnings for the user')
        .addUserOption(option => option.setName('user').setDescription('User to check warnings!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Warnings.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const user = await Utility.getUser(moi, type, args[0])

        if(!user) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}warnings [user]`
                        }
                    })
                ]
            }, true);
        }
        const caseId = await Utility.db.get('warn', { user: user.id, guild: moi.guild.id })

        if(!caseId || caseId.length === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Error,
                       variables: {
                        error: 'There is no warnings to show !'
                       }
                    })
                ]
            })
        }

        let showType = '';

        for (const caseinf of caseId) {
            showType += `${Utility.lang.Warnings.showType.replace(/{memberUser}/g, `<@${caseinf.user}>`).replace(/{memberUsername}/g, client.users.cache.get(caseinf.user).username).replace(/{memberId}/g, caseinf.user).replace(/{staffUser}/g, `<@${caseinf.staff}>`).replace(/{staffUsername}/g, client.users.cache.get(caseinf.staff).username).replace(/{staffId}/g, caseinf.staff).replace(/{id}/g, caseinf.id)}\n`
        }

        await send(type, moi, {embeds: [
            Utility.embed({
                ...Utility.lang.Warnings.Embed,
                variables: {
                    showType: showType,
                    memberUser: `<@${user.id}>`,
                    memberUsername: user.username,
                    memberAvatar: user.displayAvatarURL({ size: 1024 }),
                    memberId: user.id,
                    serverIcon: moi.guild.iconURL({ size: 1024 }),
                }
            })
            ]
        })

        
    }
};