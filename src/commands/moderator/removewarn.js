const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    aliases: ['delwarn', 'remwarn'],
    data: new SlashCommandBuilder()
        .setName('removewarn')
        .setDescription('Remove warn from a member!')
        .addStringOption(options => options.setName('id').setDescription('Warning id ?').setRequired(true)),
    async execute(moi, args, client, { type, send }) {
        

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Removewarn.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...data.Permission
                    })
                ]
            })
        }

        const id = type == 'interaction' ? options.getString('id') : args[0]

        if(!id) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}removewarn [id]`
                        }
                    })
                ]
            }, true);
        }

        const caseId = await Utility.db.findOne('warn', { id: id })

        if(!caseId) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Error,
                       variables: {
                        error: `Warning: \`${id}\` can not be found in the database.`
                       }
                    })
                ]
            })
        }

        await send(type, moi, {embeds: [
            Utility.embed({
                ...Utility.lang.Removewarn.Embed,
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
        })

        await Utility.db.delete('warn', { id: id, guild: moi.guild.id }).catch((e)=> { log('error', e) })
        
    }
};