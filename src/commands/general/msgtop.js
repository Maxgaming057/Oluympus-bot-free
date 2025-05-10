const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
module.exports = {
    category: 'general',
    aliases: ['topmsg', 'lbmessages'],
    data: new SlashCommandBuilder()
        .setName('msgtop')
        .setDescription('Top 10 messages'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Msgtop.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }
        const messages = await Utility.db.get('messages', { guildid: moi.guild.id })
        if (!messages || messages && messages.length === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Msgtop.nomsg
                    })
                ]
            }, true)
        }
        const sortedMessages = messages.sort((a, b) => b.amount - a.amount)
        const top10 = sortedMessages.slice(0, 10)
        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Msgtop.Embed,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        msgTop: `${top10.map((c, index) => `\`[ ${index + 1 } ]\`- **${c.amount > 1 ? `${c.amount} messages` : `${c.amount} message`}** <@${c.userid}> `).join('\n') || '0'}`
                    }
                }),
            ]
        }, true)
    }
}