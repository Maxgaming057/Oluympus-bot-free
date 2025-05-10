const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const pagination = require("../../../utils/modules/pagination");

module.exports = {
    category: 'giveaway',
    data: new SlashCommandBuilder()
    .setName('glist')
    .setDescription('Display all giveaways!'),
    async execute(moi, args, client, { type, send}) {


        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Glist.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...data.Permissions
                    })
                ]
            }, true)
        }

        const giveaways = await Utility.db.get('giveaway', { guild: moi.guild.id})
        if (!giveaways || giveaways.length === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Glist.NoGiveaways
                    })
                ]
            }, true)
        }

        const embeds = [];
        for (const giveaway of giveaways) {
            embeds.push(Utility.embed({
                title: Utility.lang.Glist.Embed.title,
                description: Utility.lang.Glist.Embed.description,
                color: Utility.lang.Glist.Embed.color,
                timestamp: Utility.lang.Glist.Embed.timestamp,
                variables: {
                    id: giveaway.id,
                    host: `<@${giveaway.host}>`,
                    ended: giveaway.ended ? "Yes" : "No",
                    prize: giveaway.prize,
                    winners: giveaway.winners,
                    channel: `<#${giveaway.channel}>`,
                    enteries: JSON.parse(giveaway.users).length || 0
                }
            }))
        }

        await pagination(moi, embeds, `${type}`)
    
    }
}