const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'music',
    aliases: ['s'],
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop a song!'),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Stop.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission,
                    })
                ]
            }, true)
        }

        if(!client.music) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.Node
                    })
                ]
            }, true)
        }

        if (!moi.member.voice.channelId) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.notinvoice
                    })
                ]
            }, true)
        }

        if (moi.member.voice.channelId && moi.guild.members.me.voice.channelId && moi.member.voice.channelId != moi.guild.members.me.voice.channelId) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.notsamechannel
                    })
                ]
            }, true)
        }

        const player = await client.music.players.get(moi.guild.id);
        if(!player) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Music.Errors.notready
                    })
                ]
            }, true)
        }

        await player.destroy();
        await send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Music.Stop.Embed
                })
            ]
        }, true)
    }
}