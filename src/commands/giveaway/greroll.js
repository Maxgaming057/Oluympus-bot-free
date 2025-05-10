const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

const config = Utility.lang.Greroll;
const data = Utility.lang
module.exports = {
    category: 'giveaway',
    data: new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('Reroll a giveaway')
    .addStringOption(options => options.setName('id').setDescription('Giveaway message id').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Greroll.permissions)) {
            return send(type , moi, {
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
                            usage: `${await Utility.getPrefix(moi.guild.id)}greroll [id]`
                        }
                    })
                ]
            }, true)
        }


        const gw = await Utility.db.findOne('giveaway', { id: id });
        if(!gw) {
            return send(type , moi, {
                embeds: [
                    Utility.embed({
                        ...config.Unknown
                    })
                ]
            }, true)
        }

        const channel = moi.guild.channels.cache.get(gw.channel)
        const message = await moi.guild.channels.cache.get(gw?.channel).messages.fetch(gw.id).catch(() => { null })
        const users = JSON.parse(gw.users)

        if(!gw.ended) {
            return send(type , moi, {
                embeds: [
                    Utility.embed({
                        ...config.Ended
                    })
                ]
            })
        }

        if(users.length === 0) {
            if (message) {
                message.edit({
                    embeds: [
                        Utility.embed({
                            ...data.Giveaway.Endpanel,
                            variables: {
                                prize: gw.prize,
                                totalEnteries: users.length,
                                host: `<@${gw.host}>`
                            }
                        })
                    ], components: []
                }).catch(() => { })
                send(type , moi, {
                    embeds: [
                        Utility.embed({
                            ...data.Giveaway.Noenoughmembers,
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
            send(type , moi, {
                embeds: [
                    Utility.embed({
                        ...data.Giveaway.Noenoughmembers,
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
        } else {
            const winners = Utility.getWinners(users, gw.winners);
            if (channel) {
                channel.send({
                    content: winners.map(c => `<@${c}>`).join(' , '),
                    embeds: [
                        Utility.embed({
                            ...data.Giveaway.end,
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
    
                send(type , moi, {
                    embeds: [
                        Utility.embed({
                            ...config.Embed,
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
                                ...data.Giveaway.Endpanel,
                                variables: {
                                    memberWinners: winners.map(u => `<@${u}>`).join(" , "),
                                    prize: gw.prize,
                                    totalEnteries: users.length,
                                    host: `<@${gw.host}>`
                                }
                            })
                        ], components: []
                    }).catch(() => { })
                    return
                }
                return;
            } else {
                send(type , moi, {
                    embeds: [
                        Utility.embed({
                            ...config.Embed,
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
}