const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'general',
    aliases: ['xptop', 'toplevel'],
    data: new SlashCommandBuilder()
        .setName('leveltop')
        .setDescription('Top 10 level'),
    async execute(moi, args, client, { type, send }) {

            if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Leveltop.permission)) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission
                        })
                    ]
                }, true)
            }
            const levels = await Utility.db.get('level', { guild: moi.guild.id })
            if (!levels || levels && levels.length == 0) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Leveltop.nolevel
                        })
                    ]
                }, true)
            }
            const sortedMessages = levels.sort((a, b) => b.level - a.level) || levels.sort((a, b) => b.xp - a.xp)
            const top10 = sortedMessages.slice(0, 10)
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Leveltop.Embed,
                        variables: {
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            levelTop: top10.map((c, index) => `\`[ ${index + 1} ]\` | **Level:** \`${c.level}\` **Xp:** \`${c.xp}\` - <@${c.id}> \`(${c.id})\``).join('\n')
                        }
                    }, true)
                ]
            })
    }

}