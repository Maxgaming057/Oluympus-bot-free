const { SlashCommandBuilder, ChannelType, ButtonStyle } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
module.exports = {
    category: 'support',
    aliases: ['ticket'],
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Create a support ticket')
        .addStringOption(options => options.setName('reason').setDescription('Subject of the ticket').setRequired(Utility.lang.New.requirereason ? true : false)),
    async execute(moi, args, client, { type, send }) {

        const reason = type === 'message' ? args.slice(0).join(' ') || 'No reason provided' : moi.options.getString('reason') || 'No reason provided';

        const category = await Utility.findChannel(moi.guild, Utility.clientConfig.New.category);
        const ticketsTotal = (await Utility.db.get('ticket', { guild: moi.guild.id }))?.length || 0;
        const ticketNumber = (ticketsTotal + 1).toString().padStart(4, '0')

        if (!category || category && category.type !== ChannelType.GuildCategory) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.New.Missingcategory,
                        variables: {
                            category: Utility.lang.New.category
                        }
                    })
                ]
            })
        }
        let missingroles = ''
        for (const role of Utility.clientConfig.New.staffroles) {
            const rol = await Utility.findRole(moi.guild, role);
            if (!role) {
                missingroles += `<@&${role}>`
            }
        }

        if (missingroles !== '') {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.New.Missingrole,
                        variables: {
                            roles: missingroles
                        }
                    })
                ]
            })
        }

        await moi.guild.channels.create({
            name: `ticket-${ticketNumber}`,
            parent: category,
            permissionOverwrites: [
                {
                    id: moi.guild.id,
                    deny: ['ViewChannel', 'SendMessages']
                },
                {
                    id: moi.member.user.id,
                    allow: ['ViewChannel', 'SendMessages']
                },
            ]
        }).then(async (c) => {
            await Utility.db.insert('ticket', { id: c.id, guild: moi.guild.id, opener: moi.member.user.id, name: `ticket-${ticketNumber}`, staff: JSON.stringify(Utility.lang.New.staffroles), addedusers: JSON.stringify([]), opentime: Date.now(), closetime: null })
            await send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.New.Created,
                        variables: {
                            channel: `<#${c.id}>`,
                            userpfp: moi.member.user.displayAvatarURL({ size: 1024 }),
                            clientpfp: client.user.displayAvatarURL({ size: 1024 }),
                            servericon: moi.guild.iconURL({ size: 1024 }),
                            ticketMember: `<@${moi.member.user.id}>`,
                            ticketMemberId: moi.member.user.id,
                            ticketMemberUsername: moi.member.user.username,
                            reason: reason,
                            created: Utility.formatTime('showall', Date.now()),
                        }
                    })
                ]
            })

            const staffs = []
            for (const rol of Utility.lang.New.staffroles) {
                const role = await Utility.findRole(moi.guild, rol)
                if (role) {
                    staffs.push(role)
                    c.permissionOverwrites.edit(role.id, {
                        ViewChannel: true,
                        SendMessages: true
                    })
                    c.send({ content: `<@&${role.id}>` }).then((msg) => {
                        setTimeout(() => {
                            msg.delete().catch(() => { null })
                        }, 1000);
                    }).catch(() => { null })
                }
            }

            c.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.New.Ticketembed,
                        variables: {
                            channel: `<#${c.id}>`,
                            userpfp: moi.member.user.displayAvatarURL({ size: 1024 }),
                            clientpfp: client.user.displayAvatarURL({ size: 1024 }),
                            servericon: moi.guild.iconURL({ size: 1024 }),
                            ticketMember: `<@${moi.member.user.id}>`,
                            ticketMemberId: moi.member.user.id,
                            ticketMemberUsername: moi.member.user.username,
                            reason: reason,
                            created: Utility.formatTime('showall', Date.now()),
                            staffMembers: staffs.map((r) => `<@&${r.id}>`)
                        }
                    })
                ]
            })
        })

    }
}