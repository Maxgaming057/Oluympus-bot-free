const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    async execute(moi, args, client, { type, send }) {

        
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Ping.permissions)) {
           return send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Permission
                })
            ]
           })
        }

        const msg = await send(type, moi, {
            embeds: [
                Utility.embed({
                    title: `Loading system ping, please wait...`,
                    color: '#2f3031'
                })
            ]
        }, true)

        await msg.edit({
            embeds: [
                Utility.embed({
                    ...Utility.lang.Ping.Embed,
                    variables: {
                        clientName: client.user.username,
                        clientIcon: client.user.displayAvatarURL({ dynamic: true, size: 1024 }),
                        ping: client.ws.ping,
                        latency: Date.now() - moi.createdTimestamp,
                    }
                })
            ]
        })
    }
}