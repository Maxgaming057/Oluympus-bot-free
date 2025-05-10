const { SlashCommandBuilder, ComponentType, ActionRow, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    aliases: ['closealltickets'],
    category: 'support',
    data: new SlashCommandBuilder()
        .setName('closeall')
        .setDescription('Close all tickets'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Closeall.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            })
        }

        const ticketed = await Utility.db.findAll('ticket');
        const tickets = ticketed?.filter(c => !c.closetime);


        if (!tickets || tickets.length === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Closeall.notickets,
                        variables: {
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            })
        }

        const msg = await send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Closeall.Confirmation,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 })
                    }
                })
            ], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('closeallconfirm')
                    .setLabel(Utility.lang.Closeall.Button.label)
                    .setStyle(Utility.lang.Closeall.Button.style)
                    .setEmoji(Utility.lang.Closeall.Button.emoji)
                )
            ]
        })

        const collector = await moi.channel.createMessageComponentCollector({time: 15000, ComponentType: ComponentType.Button });
        collector.on('collect', async m => {
            if(type == 'message' ? m.user.id !== moi.author.id : m.user.id !== moi.user.id) {
                m.reply({
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission
                        })
                    ], ephemeral: true
                })
            }
            if(m.customId === 'closeallconfirm') {
                tickets.forEach(async ticket => {
                    const foundDbTicket = await Utility.db.findOne('ticket', { id: ticket.id });
                    if(foundDbTicket) {
                        await Utility.db.update('ticket', { closetime: Date.now() }, { id: ticket.id });
                        const user = client.users.cache.get(ticket.opener);
                        const ticketChannel = await client.channels.cache.get(ticket.id);
                        if(ticketChannel) {
                            await ticketChannel.delete().catch(() => { null });
                        }
                    }
                });
                
                await m.update({embeds: [
                    Utility.embed({
                       ...Utility.lang.Closeall.Closed,
                        variables: {
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ], components: []})
                collector.stop();
            }
        })

        collector.on('end', (collected) => {
            if(collected.size === 0) {
                msg.delete().catch(() => { null })
                return;
            } else {
                return;
            }
        })
        return;
    }
}