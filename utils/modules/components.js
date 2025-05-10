const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = (type, elements) => {
    const actionRows = [];

    if (type === 'buttons' && Array.isArray(elements)) {
        let currentActionRow = new ActionRowBuilder();
        elements.forEach((buttonProperties, index) => {
            if (index > 0 && index % 5 === 0) {
                actionRows.push(currentActionRow);
                currentActionRow = new ActionRowBuilder();
            }
            const button = new ButtonBuilder()
                .setCustomId(buttonProperties.customId)
                .setLabel(buttonProperties?.label)
                .setStyle(buttonProperties?.style)
                .setEmoji(buttonProperties?.emoji)
                .setDisabled(buttonProperties?.disabled ? true : false);

            currentActionRow.addComponents(button);
        });
        actionRows.push(currentActionRow);
    }

    if (type === 'selectmenus' && Array.isArray(elements)) {
        elements.forEach(menuProperties => {
            const selectMenu = new SelectMenuBuilder()
                .setCustomId(menuProperties.customId)
                .setPlaceholder(menuProperties.placeholder)
                .addOptions(menuProperties.options);

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);
            actionRows.push(actionRow);
        });
    }

    return { components: actionRows };
};
