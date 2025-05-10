const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'music',
    aliases: ['p'],
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song!')
        .addStringOption(option => option
            .setName('song')
            .setDescription('The song you want to play!')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Play.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission,
                    })
                ]
            }, true)
        }

        
        const track = type == 'interaction' ? moi.options.getString('song') : args.slice(0).join(' ')
        
        if(!client.music) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Errors.Node
                    })
                ]
            }, true)
        }
        
        const res = await client.music.resolve({ query: track, source: "ytsearch", requester: moi.member });


        if (!track) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}play [song]`
                        }
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

        if (res.loadType === "error") {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Play.onerror
                    })
                ]
            }, true)
            
        } else if (res.loadType === "empty") {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Play.onempty
                    })
                ]
            }, true)
        }

        const msg = await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Music.Play.loading,
                })
            ]
        }, true)
        const player = client.music.createConnection({
            guildId: moi.guild.id,
            voiceChannel: moi.member.voice.channelId,
            textChannel: moi.channel.id,
            deaf: true,
        });
        console.log(player)

        if (res.loadType === "playlist") {
            for (const track of res.tracks) {
                track.info.requester = moi.member.user;
                player.queue.add(track);
            }

            msg.edit({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Play.PlaylistLoad,
                        variables: {
                            playListLength: res.tracks.length
                        }
                    })
                ]
            })
        } else {
            const track = res.tracks[0];
            track.info.requester = moi.member.user;
            player.queue.add(track);
            await msg.edit({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Play.TrackLoad,
                        variables: {
                            trackName: track ? track.info.title : track,
                            trackAuthor: track.info.author,
                            trackDuration: ms(track.info.length),
                        }
                    })
                ]
            })
        }

        if (!player.isPlaying && player.isConnected) player.play()
    }
}