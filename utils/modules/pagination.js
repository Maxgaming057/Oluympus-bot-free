const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = async (interaction, pages, type = 'interaction') => {
    let currentPage = 0;

    if(type === 'interaction' && !interaction.isChatInputCommand()) return;

    const isInteraction = type === 'interaction';

    const sendMethod = isInteraction
        ? interaction.deferred ? interaction.editReply : interaction.reply
        : interaction.deferred ? interaction.deferredReply : interaction.reply;

    const firstPageButton = new ButtonBuilder()
        .setCustomId('firstPage')
        .setLabel('⏮️')
        .setStyle(ButtonStyle.Primary);

    const prevButton = new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Primary);

    const pageCounterButton = new ButtonBuilder()
        .setCustomId('pageCounter')
        .setLabel(`${currentPage + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('➡️')
        .setStyle(ButtonStyle.Primary);

    const lastPageButton = new ButtonBuilder()
        .setCustomId('lastPage')
        .setLabel('⏭️')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(firstPageButton, prevButton, pageCounterButton, nextButton, lastPageButton);

    const embed = pages[currentPage]; // Pretpostavka: pages sadrži embed objekte

    const message = await sendMethod.call(interaction, {
        embeds: [embed],
        components: [row],
        fetchReply: true
    });

    const filter = i => ['firstPage', 'prev', 'next', 'lastPage'].includes(i.customId);

    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if(type === interaction && i.user.id === interaction.user.id || type !== interaction && i.user.id === message.author.id) {
            return i.reply({embeds: [
                setupEmbed({
                    description: `This message is not yours. <@${i.user.id}>`,
                    color:"default"
                })
            ], ephemeral: true})
        }
        if (i.customId === 'firstPage') {
            currentPage = 0;
        } else if (i.customId === 'prev') {
            currentPage = Math.max(0, currentPage - 1);
        } else if (i.customId === 'next') {
            currentPage = Math.min(pages.length - 1, currentPage + 1);
        } else if (i.customId === 'lastPage') {
            currentPage = pages.length - 1;
        }
    
        pageCounterButton.setLabel(`${currentPage + 1}/${pages.length}`);
    
        if (currentPage <= 0) {
            firstPageButton.setDisabled(true);
            prevButton.setDisabled(true);
        } else {
            firstPageButton.setDisabled(false);
            prevButton.setDisabled(false);
        }
    
        if (currentPage === pages.length - 1) {
            nextButton.setDisabled(true);
            lastPageButton.setDisabled(true);
        } else {
            nextButton.setDisabled(false);
            lastPageButton.setDisabled(false);
        }
    
        const row = new ActionRowBuilder()
            .addComponents(firstPageButton, prevButton, pageCounterButton, nextButton, lastPageButton);
        await i.update({ embeds: [pages[currentPage]], components: [row] }).catch(e => { });
    });
    

    collector.on('end', async () => {
        row.components.forEach(component => component.setDisabled(true));
        type === 'intaraction' && interaction.deferred ? sendMethod.call(interaction, { components: [row] }).catch(() => { }) : message.edit({ components: [row] }).catch(() => { }) || message.edit({ components: [row] }).catch(() => { })
    });
    
};
