const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const config = Utility.lang.Close
module.exports = {
    category: 'support',
    aliases: ['closeticket'],
    data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close this ticket')
    .addStringOption(options => options.setName('reason').setDescription('Subject of the ticket').setRequired(config.requirereason ? true : false)),
    async execute(moi, args, client , { type, send }) {
        
        const reason = type === 'interaction' ? moi.options.getString('reason') || 'No reason provided' : args.slice(0).join(" ") || 'No reason provided'
        const ticket = await Utility.db.findOne('ticket', { id: moi.channel.id })

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Close.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

       if(!ticket) {
        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...config.Ticketunknown
                })
            ]
        })
       } 


       await Utility.db.update('ticket', { closetime: Date.now() }, { id: moi.channel.id });
       await send(type, moi, {
        embeds: [
            Utility.embed({
               ...config.Closed,
                variables: {
                    reason: reason,
                    ticket: `<#${moi.channel.id}>`,
                    ticketMember: `<@${client.users.cache.get(ticket.opener).id}>`,
                    ticketMemberId: client.users.cache.get(ticket.opener).id,
                    ticketMemberUsername: client.users.cache.get(ticket.opener).username,
                    status: 'success'
                }
            })
        ]
        })

        setTimeout(() => {
            moi.channel.delete().catch(() => { })
        }, 5000);

        client.emit('ticketClose', ticket, moi.member.user, client.users.cache.get(ticket.opener), reason, moi.guild)
    }
}