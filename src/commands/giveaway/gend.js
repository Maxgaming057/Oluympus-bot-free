const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'giveaway',
    data: new SlashCommandBuilder()
        .setName('gend')
        .setDescription('End a giveaway')
        .addStringOption(options => options.setName('id').setDescription('Giveaway message id').setRequired(true)),
    async execute(moi, args, client, { type, send }) {


        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Gend.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const id = type === 'message' ? args[0] : moi.options.getString('id');

        if (!id) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}gend [id]`
                        }
                    })
                ]
            }, true)
        }

        const gw = await Utility.db.findOne('giveaway', { id: id });
        if (!gw) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Gend.Unknown
                    })
                ]
            }, true)
        }

        if (gw.ended) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Gend.Ended
                    })
                ]
            }, true)
        }

        const channel = moi.guild.channels.cache.get(gw.channel)
        const message = await moi.guild.channels.cache.get(gw?.channel).messages.fetch(gw.id).catch(() => { null })
        const users = JSON.parse(gw.users)

        if (users.length === 0) {
            await Utility.db.update('giveaway', { ended: true }, { id: id })
            if (message) {
                message.edit({
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Giveaway.Endpanel,
                            variables: {
                                prize: gw.prize,
                                totalEnteries: users.length,
                                host: `<@${gw.host}>`
                            }
                        })
                    ], components: []
                }).catch(() => { })
                await Utility.db.update('giveaway', { ended: true }, { id: gw.id })
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Giveaway.Noenoughmembers,
                            variables: {
                                host: `<@${gw.host}>`,
                                channel: `<#${gw.channel}>`,
                                prize: gw.prize,
                                time: gw.time,
                                ended: gw.ended ? 'Yes' : 'No'
                            }
                        })
                    ]
                }, true)
                return
            }
            await Utility.db.update('giveaway', { ended: true }, { id: gw.id })
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Giveaway.Noenoughmembers,
                        variables: {
                            host: `<@${gw.host}>`,
                            channel: `<#${gw.channel}>`,
                            prize: gw.prize,
                            time: gw.time,
                            ended: gw.ended ? 'Yes' : 'No'
                        }
                    })
                ]
            }, true)
            return;
        }
        const winners = Utility.getWinners(users, gw.winners)
        if (channel) {
            channel.send({
                content: winners.map(c => `<@${c}>`).join(' , '),
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Giveaway.end,
                        variables: {
                            host: `<@${gw.host}>`,
                            channel: `<#${gw.channel}>`,
                            memberWinners: winners.map(c => `<@${c}>`).join(' , '),
                            prize: gw.prize,
                            time: gw.time,
                            ended: gw.ended ? 'Yes' : 'No'
                        }
                    })
                ]
            })
            await Utility.db.update('giveaway', { ended: true }, { id: id })

            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Gend.Embed,
                        variables: {
                            host: `<@${gw.host}>`,
                            channel: `<#${gw.channel}>`,
                            memberWinners: winners.map(c => `<@${c}>`).join(' , '),
                            prize: gw.prize,
                            time: gw.time,
                            ended: gw.ended ? 'Yes' : 'No'
                        }
                    })
                ]
            }, true)

            if (message) {
                message.edit({
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Giveaway.Endpanel,
                            variables: {
                                memberWinners: winners.map(u => `<@${u}>`).join(" , "),
                                prize: gw.prize,
                                totalEnteries: users.length,
                                host: `<@${gw.host}>`
                            }
                        })
                    ], components: []
                }).catch(() => { })
                await Utility.db.update('giveaway', { ended: true }, { id: gw.id })
                return
            }
            return;
        } else {
            await Utility.db.update('giveaway', { ended: true }, { id: id })
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Gend.Embed,
                        variables: {
                            host: `<@${gw.host}>`,
                            channel: `<#${gw.channel}>`,
                            memberWinners: winners.map(c => `<@${c}>`).join(' , '),
                            prize: gw.prize,
                            time: gw.time,
                            ended: gw.ended ? 'Yes' : 'No'
                        }
                    })
                ]
            }, true)
        }


    }
}