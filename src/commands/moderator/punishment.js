const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('punishment')
        .setDescription('Check the punishemnt for the user')
        .addStringOption(option => option.setName('id').setDescription('Punishment id').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        const id = type == 'message' ? args[0] : moi.options.getString('id')

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Punishment.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        if(!id) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Usage,
                       variables: {
                        usage: `${await Utility.getPrefix(moi.guild.id)}punishment [id]`
                       }
                    })
                ]
            }, true)
        }
        const caseId = await Utility.db.findOne('warn', { id: id})

        if(!caseId) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Error,
                       variables: {
                        error: 'Invalid warn id provided !'
                       }
                    })
                ]
            }, true)
        }


        await send(type, moi, {embeds: [
            Utility.embed({
                ...Utility.lang.Punishment.Embed,
                variables: {
                    memberUser: `<@${caseId.user}>`,
                    memberUsername: client.users.cache.get(caseId.user).username,
                    memberAvatar: client.users.cache.get(caseId.user).displayAvatarURL({ size: 1024 }),
                    memberId: caseId.user,
                    serverIcon: moi.guild.iconURL({ size: 1024 }),
                    id: caseId.id,
                    staffUser: `<@${caseId.staff}>`,
                    reason: caseId.reason,
                    serverName: moi.guild.name,
                    staffUsername: client.users.cache.get(caseId.staff).username,
                    staffId: client.users.cache.get(caseId.staff).id,
                }
            })
            ]
        }, true)

        
    }
};