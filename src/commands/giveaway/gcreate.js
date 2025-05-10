const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js")
const Utility = require("../../../utils/modules/Utility")
const ms = require("ms")

module.exports = {
    aliases: ['gcreate', 'startgiveaway'],
    category: 'giveaway',
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Start a giveaway'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Gstart.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            })
        }

        let i = 0

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Gstart.Ask,
                    variables: {
                        questionNumber: i + 1,
                        question: Utility.clientConfig.Gstart.questions[i]
                    }
                })
            ]
        }, true).then(async thisMsg => {


            const answers = []
            const collector = await thisMsg.channel.createMessageCollector({ time: 300000 })
            collector.on('collect', async (msg) => {
                if (!msg.guild) return;
                if (msg.author.bot) return;
                if (type === 'message' ? msg.author.id != moi.author.id : msg.author.id !== moi.user.id) return;
                if (i >= Utility.clientConfig.Gstart.questions.length - 1) {
                    msg.delete().catch((error) => { Utility.log('error', error.message) })
                    answers.push(msg.content)
                    collector.stop()

                    let prize = answers[0];
                    let time = answers[1];
                    let winner = isNaN(answers[2]) ? 1 : answers[2]
                    let host = await getUserId(answers[3], moi.guild) || moi.member.user.id
                    let channel = await getChannelId(answers[4], moi.guild)
                    if (time && ms(time) < 10000) time = ms('1m');

                    thisMsg.edit({
                        embeds: [
                            Utility.embed({
                                ...Utility.lang.Gstart.Question,
                            })
                        ], components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('msgreq')
                                    .setLabel(Utility.lang.Gstart.buttons.messages.label)
                                    .setStyle(Utility.lang.Gstart.buttons.messages.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.messages.emoji),
                                new ButtonBuilder()
                                    .setCustomId('voicereq')
                                    .setLabel(Utility.lang.Gstart.buttons.voice.label)
                                    .setStyle(Utility.lang.Gstart.buttons.voice.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.voice.emoji),
                                new ButtonBuilder()
                                    .setCustomId('invitesreq')
                                    .setLabel(Utility.lang.Gstart.buttons.invites.label)
                                    .setStyle(Utility.lang.Gstart.buttons.invites.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.invites.emoji),
                                new ButtonBuilder()
                                    .setCustomId('levelreq')
                                    .setLabel(Utility.lang.Gstart.buttons.level.label)
                                    .setStyle(Utility.lang.Gstart.buttons.level.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.level.emoji),
                                new ButtonBuilder()
                                    .setCustomId('xpreq')
                                    .setLabel(Utility.lang.Gstart.buttons.xp.label)
                                    .setStyle(Utility.lang.Gstart.buttons.xp.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.xp.emoji)
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('coinsreq')
                                    .setLabel(Utility.lang.Gstart.buttons.coins.label)
                                    .setStyle(Utility.lang.Gstart.buttons.coins.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.coins.emoji),
                                new ButtonBuilder()
                                    .setCustomId('rolereq')
                                    .setLabel(Utility.lang.Gstart.buttons.role.label)
                                    .setStyle(Utility.lang.Gstart.buttons.role.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.role.emoji),
                                new ButtonBuilder()
                                    .setCustomId('confirmreq')
                                    .setLabel(Utility.lang.Gstart.buttons.confirm.label)
                                    .setStyle(Utility.lang.Gstart.buttons.confirm.style)
                                    .setEmoji(Utility.lang.Gstart.buttons.confirm.emoji)
                            )
                        ]
                    }).then(async mes => {
                        const requirements = []

                        const data = Utility.lang;
                        const config = data.Gstart

                        const coll2 = await mes.createMessageComponentCollector({ time: 300000, ComponentType: ComponentType.Button });

                        coll2.on('collect', async i => {
                            if (!i.isButton()) return;
                            if (i.user.id !== moi.member.user.id) {
                                return send(type, moi, {
                                    embeds: [
                                        Utility.embed({
                                            ...data.Permissions
                                        })
                                    ]
                                })
                            }

                            if (i.customId === 'msgreq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    if (isNaN(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: 'Input must be a number.'
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'messages',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Messages',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                    msgc.stop()
                                })
                            }

                            if (i.customId == 'levelreq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    if (isNaN(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: 'Input must be a number.'
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'level',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Level',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                    msgc.stop()
                                })
                            }

                            if (i.customId == 'xpreq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    if (m.user.bot) return;

                                    if (isNaN(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: 'Input must be a number.'
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'xp',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Xp',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        ss.delete({ timeout: 3000 }).catch((e) => { })
                                    })
                                    msgc.stop()
                                })
                            }

                            if (i.customId == 'coinsreq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    if (isNaN(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: 'Input must be a number.'
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'coins',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Coins',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                    msgc.stop()
                                })
                            }

                            if (i.customId == 'invitesreq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    if (isNaN(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: 'Input must be a number.'
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'invites',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Invites',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                    msgc.stop()
                                })
                            }

                            if (i.customId == 'voicereq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    const regex = /^(?:(\d+d)?)?(?:(\d+h)?)?(?:(\d+m)?)?(?:(\d+s)?)?$/;
                                    if (!regex.test(m.content)) {
                                        return m.channel.send({
                                            embeds: [
                                                embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: "Invalid time input: `1d, 1h, 1m, 15m 30s, 1h 30m`"
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'voice',
                                        amount: m.content
                                    }
                                    requirements.push(req)
                                    msgc.stop()
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Voice',
                                                    amount: m.content
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                })
                            }

                            if (i.customId == 'rolereq') {

                                i.reply({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Await,
                                        })
                                    ]
                                }).then((ss) => {
                                    setTimeout(() => {
                                        ss.delete().catch((e) => { })
                                    }, 5000);
                                })

                                const msgc = await i.channel.createMessageCollector({ time: 60000 })
                                msgc.on('collect', async m => {
                                    if (m.author.id !== i.user.id) {
                                        return;
                                    }

                                    const role = await m.guild.roles.cache.find((r) => r.name === m.content) || m.guild.roles.cache.find((r) => r.id === m.content) || m.mentions.roles.first()
                                    if (!role) {
                                        return m.channel.send({
                                            embeds: [
                                                Utility.embed({
                                                    ...data.Error,
                                                    variables: {
                                                        error: "Mention a role, provide a name or Id."
                                                    }
                                                })
                                            ]
                                        }).then((ss) => {
                                            setTimeout(() => {
                                                ss.delete().catch((e) => { })
                                            }, 5000);
                                        })
                                    }

                                    const req = {
                                        type: 'role',
                                        amount: role.id
                                    }
                                    requirements.push(req)
                                    m.delete().catch((e) => { })
                                    m.channel.send({
                                        embeds: [
                                            Utility.embed({
                                                ...config.Response,
                                                variables: {
                                                    requirement: 'Role',
                                                    amount: `<@&${role.id}>`
                                                }
                                            })
                                        ]
                                    }).then((ss) => {
                                        setTimeout(() => {
                                            ss.delete().catch((e) => { })
                                        }, 5000);
                                    })
                                    msgc.stop()
                                })
                            }



                            let timetoend = Date.now() + ms(time)
                            if (i.customId === 'confirmreq') {
                                const chToSend = client.channels.cache.get(channel)
                                const hostToUser = await client.users.cache.get(host)
                                chToSend.send({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Embed,
                                            variables: {
                                                authorIcon: hostToUser.displayAvatarURL({ dynamic: true, size: 512 }),
                                                prize: prize,
                                                duration: Utility.formatTime('untilTime', parseInt(timetoend / 1000)),
                                                durationDate: Utility.formatTime('untilDay', parseInt(timetoend / 1000)),
                                                winners: winner,
                                                requirements: requirements.map((r, i) => `${i + 1} : ${r.type.charAt(0).toUpperCase() + r.type.slice(1)} : ${r.type === 'role' ? `<@&${r.amount}>` : r.amount}` || '❌').join('\n') || '❌',
                                                host: hostToUser,
                                                serverIcon: moi.guild.iconURL({ size: 512 })
                                            }
                                        })
                                    ], components: [
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('entergw')
                                                .setLabel(config.buttons.Join.label)
                                                .setEmoji(config.buttons.Join.emoji)
                                                .setStyle(config.buttons.Join.style),
                                        )
                                    ]
                                }).then(async (msg) => {
                                    await Utility.db.insert('giveaway', { id: msg.id.toString(), guild: i.guild.id.toString(), channel: channel, host: host, ended: false, users: JSON.stringify([]), prize: prize, winers: winner, duration: timetoend, require: JSON.stringify(requirements) })
                                })

                                i.update({
                                    embeds: [
                                        Utility.embed({
                                            ...config.Created,
                                            variables: {
                                                authorIcon: hostToUser.displayAvatarURL({ dynamic: true, size: 512 }),
                                                prize: prize,
                                                duration: Utility.formatTime('untilTime', parseInt(timetoend / 1000)),
                                                durationDate: Utility.formatTime('untilDay', parseInt(timetoend / 1000)),
                                                winners: winner,
                                                requirements: requirements.map(r => `${r.type}: ${r.amount}`).join('\n'),
                                                host: hostToUser,
                                                serverIcon: moi.guild.iconURL({ size: 512 }),
                                                channel: `<#${channel}>`
                                            }
                                        })
                                    ], components: []
                                })
                                collector.stop()
                                coll2.stop()
                                setTimeout(() => {
                                    requirements.splice(0, requirements.length)
                                }, 3000);
                                return;
                            }
                        })
                    })
                } else {
                    answers.push(msg.content)
                    i++
                    thisMsg.edit({
                        embeds: [
                            Utility.embed({
                                ...Utility.lang.Gstart.Ask,
                                variables: {
                                    questionNumber: i + 1,
                                    question: Utility.clientConfig.Gstart.questions[i]
                                }
                            })
                        ]
                    }, true)
                }
            })
        })
    }
}


async function getUserId(host, guild) {
    const client = require("../../..")

    const mentionMatch = host.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
        return mentionMatch[1];
    }

    if (/^\d+$/.test(host)) {
        const user = await client.users.fetch(host).catch(() => null);
        if (user) {
            return user.id;
        }
    }

    const member = guild.members.cache.find(member =>
        member.user.username === host || member.nickname === host
    );
    if (member) {
        return member.user.id;
    }

    return null;
}

async function getChannelId(host, guild) {
    const client = require("../../..");

    const mentionMatch = host.match(/^<#(\d+)>$/);
    if (mentionMatch) {
        return mentionMatch[1];
    }

    if (/^\d+$/.test(host)) {
        const channel = await client.channels.fetch(host).catch(() => null);
        if (channel) {
            return channel.id;
        }
    }

    const channel = guild.channels.cache.find(ch => ch.name === host);
    if (channel) {
        return channel.id;
    }

    return null;
}
