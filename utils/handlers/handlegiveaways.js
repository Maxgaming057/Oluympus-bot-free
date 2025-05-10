const Database = require("../database/OlympusDatabase");
const embed = require("../modules/embed");
const db = new Database()
const yaml = require('js-yaml');
const fs = require('fs');
const { getWinners } = require("../modules/utils");
const fileContent = fs.readFileSync('./config/messages.yml', 'utf8')
const data = yaml.load(fileContent);
module.exports = async (guild) => {
    setInterval(async () => {
        const giveaways = await db.get('giveaway', { guild: guild.id })
        if (!giveaways) return;
        giveaways.forEach(async gw => {

            if (gw && gw.ended == false && gw.duration < Date.now()) {
                const message = await guild.channels.cache.get(gw?.channel).messages.fetch(gw.id).catch(() => { null });
                const enteries = JSON.parse(gw.users);
                if(enteries.length == 0 || enteries.length < gw.winners) {
                    const channel = await guild.channels.cache.get(gw?.channel);
                    if(channel) {
                        channel.send({
                            content: `<@${gw.host}>`,
                            embeds: [
                                embed({
                                    ...data.Giveaway.Noenoughmembers,
                                })
                            ]
                        })
                        await db.delete('giveaway', { id: gw.id })
                        if(message) message.edit({components: []})
                        return;
                    } else {
                        await db.delete('giveaway', { id: gw.id })
                    }
                }
                const choosed = getWinners(enteries, gw.winners)
                if(!message) {
                    await db.delete('giveaway', { id: gw.id })
                }
                if (message) {
                    message.reply({
                        content: choosed.map(u => `<@${u}>`).join(" , "),
                        embeds: [
                            embed({
                                ...data.Giveaway.end,
                                variables: {
                                    memberWinners: choosed.map(u => `<@${u}>`).join(" , "),
                                    prize: gw.prize,
                                    totalEnteries: enteries.length,
                                    host: `<@${gw.host}>`
                                }
                            })
                        ]
                    })
                    message.edit({ embeds: [
                        embed({
                            ...data.Giveaway.Endpanel,
                            variables: {
                                memberWinners: choosed.map(u => `<@${u}>`).join(" , "),
                                prize: gw.prize,
                                totalEnteries: enteries.length,
                                host: `<@${gw.host}>`
                            }
                        })
                    ], components: [] }).catch(() => { })
                    await db.update('giveaway', { ended: true }, { id: gw.id })
                    return
                }
            }

        });
    }, 10000);
}