const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'support',
    aliases: ['add'],
    data: new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Add a user to a ticket')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to add to the ticket')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Adduser.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const user = await Utility.getUser(moi, type, args[0])
        if (!user) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}adduser [user]`
                        }
                    })
                ]
            }, true)
        }

        const ticket = await Utility.db.findOne('ticket', { id: moi.channel.id });
        if (!ticket) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Adduser.NoTicket,
                    })
                ]
            }, true)
        }

        const added = JSON.parse(ticket.addedusers);
        
        if (added.includes(user.id)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Adduser.Exist,
                        variables: {
                            memberUsername: user.username,
                            memberPfp: user.displayAvatarURL({ size: 1024 }),
                            memberUser: `<@${user.id}>`,
                            memberId: user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                        }
                    })
                ]
            }, true)
        }

        await added.push(user.id);
        await Utility.db.update('ticket', { addedusers: JSON.stringify(added) }, { id: moi.channel.id })

        moi.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            EmbedLinks: true,
            AddReactions: true
        });

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Adduser.Embed,
                    variables: {
                        memberUsername: user.username,
                        memberPfp: user.displayAvatarURL({ size: 1024 }),
                        memberUser: `<@${user.id}>`,
                        memberId: user.id,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        staffUser: `<@${moi.member.user.id}>`,
                        staffUsername: moi.member.user.username,
                        staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                    }
                })
            ]
        })

    }
}
