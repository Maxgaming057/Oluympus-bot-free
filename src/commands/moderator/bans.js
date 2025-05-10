const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    aliases: ['banned'],
    data: new SlashCommandBuilder()
        .setName('bans')
        .setDescription('List banned users'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.lang.Bans.permissions)) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            })
            return;
        }

        const allBanned = await moi.guild.bans.fetch();
        if (allBanned.size === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Bans.Nobans,
                        variables: {
                            serverName: moi.guild.name,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            bansTotal: 0
                        }
                    })
                ]
            })
        }

        const formated = []
        allBanned.forEach(u => {
            formated.push({
                user: u.user.tag,
                userId: u.user.id,
                reason: u.reason
            })
        })

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Bans.Embed,
                    variables: {
                        serverName: moi.guild.name,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        bans: formated.map((c) => `**${c.user} (${c.userId})** - ${c.reason === null ? 'No reason' : c.reason}`).join('\n'),
                        bansTotal: formated.length
                    }
                })
            ]
        })
    }
}