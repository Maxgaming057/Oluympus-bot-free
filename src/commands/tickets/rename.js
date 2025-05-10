const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'support',
    aliases: ['renameticket'],
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename this ticket')
        .addStringOption(options => options.setName('name').setDescription('New name for this ticket!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        const name = type === 'message' ? args.slice(0).join(' ') : moi.options.getString('name')
        const ticket = await Utility.db.findOne('ticket', { id: moi.channel.id })

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Rename.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        if (!ticket) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Rename.Ticketunknown
                    })
                ]
            }, true)
        }


        if (!name) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}rename [new name]`
                        }
                    })
                ]
            }, true)
        }

        await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Rename.Renamed,
                    variables: {
                        name: name,
                        ticket: `<#${moi.channel.id}>`,
                        ticketMember: `<@${client.users.cache.get(ticket.opener).id}>`,
                        ticketMemberId: client.users.cache.get(ticket.opener).id,
                        ticketMemberUsername: client.users.cache.get(ticket.opener).username,
                    }
                })
            ]
        }, true)

        moi.channel.setName(name).catch((error) => {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: error.message
                        }
                    })
                ]
            })
        }, true)

        client.emit('ticketRename', ticket, moi.member.user, name, moi.guild, ticket.opener);
    }
}