const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
module.exports = {
    category: 'economy',
    data: new SlashCommandBuilder()
        .setName('cointop')
        .setDescription('Top 10 list'),
    async execute(moi, args, client, { type, send }) {
        
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Cointop.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }
        const coins = await Utility.db.get('economy', { guildid: moi.guild.id })
        if (!coins || coins && coins.length == 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Cointop.nocoins
                    })
                ]
            }, true)
        }
        
        const coinsSort = coins.sort((a, b) => (b.balance + b.bank) - (a.balance + a.bank));
		const top10 = coinsSort.slice(0, 10);

        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Cointop.Embed,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        coinTop: top10.map((c, index) => `\`[ ${index + 1} ]\` - **$${c.balance + c.bank}** <@${c.userid}> \`(${client.users.cache.get(c.userid)?.username || 'Unknown User'})\``).join('\n')
                    }
                })
            ]
        })
        
    }
}