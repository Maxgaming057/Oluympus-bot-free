const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'music',
    aliases: ['rs'],
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume a song!'),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Resume.permissions)) {
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
        if (!player) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.notready
                    })
                ]
            }, true)
        }

        if (player?.isPlaying) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.Other,
                        variables: {
                            status: 'resumed'
                        }
                    })
                ]
            }, true)
        }

        await player.pause(false);
        await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Music.Resume.Embed
                })
            ]
        }, true)
    }
}