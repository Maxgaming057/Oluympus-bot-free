const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'music',
    aliases: ['q'],
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show song queue!'),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Queue.permissions)) {
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

        const songsPerPage = 30;
        let currentPage = 1;
        const totalPages = Math.ceil(player.queue.length / songsPerPage);

        function generateQueueEmbed(page) {
            const start = (page - 1) * songsPerPage;
            const end = page * songsPerPage;
            const queueSlice = player.queue.slice(start, end);

            return Utility.embed({
                ...Utility.lang.Music.Queue.Embed,
                variables: {
                    showSongs: queueSlice.map((song, index) =>
                        `**${start + index + 1}** ➔ [${song.info.title}](${song.info.uri})`
                    ).join('\n'),
                    totalSongs: player.queue.length
                },
                footer: {
                    text: `Page ${page} of ${totalPages}`
                }
            });
        }

        if (!player.queue.length) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Music.Errors.emptyqueue
                    })
                ]
            }, true)
        }

        const queueEmbed = generateQueueEmbed(currentPage);
        const message = await send(type, moi, { embeds: [queueEmbed] }, true);

        if (totalPages > 1) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === totalPages)
                );

            const msg = await send(type, moi, {
                embeds: [queueEmbed],
                components: [row]
            }, true);

            const filter = i => i.customId === 'prev' || i.customId === 'next';
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if(moi.member.user.id !== i.user.id) {
                    return i.reply({embeds: [
                        setupEmbed({
                            description: `This message is not yours. <@${i.user.id}>`,
                            color: "default"
                        })
                    ], ephemeral: true})
                }

                if (i.customId === 'prev' && currentPage > 1) {
                    currentPage--;
                } else if (i.customId === 'next' && currentPage < totalPages) {
                    currentPage++;
                }

                const newEmbed = generateQueueEmbed(currentPage);

                const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === totalPages)
                );

                await i.update({ embeds: [newEmbed], components: [newRow] });
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });
        }
    }
};
