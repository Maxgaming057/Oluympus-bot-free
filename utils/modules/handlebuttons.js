const chalk = require('chalk');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (config) => {
    const actionRow = new ActionRowBuilder(); 

    for (const button of config) {
        const { label, id, style, emoji, disabled } = button;

        if (!label || !id || !style || !emoji || !disabled) {
            console.log(chalk.hex('#ef8b81 ' + `[ Error ] `) + chalk.hex('#ef8b81 ' + `Invalid button configuration.`));
            return null; 
        }

        if (typeof label !== 'string' || typeof id !== 'string' || typeof style !== 'string' || typeof emoji !== 'string' || typeof disabled !== 'boolean') {
            console.log(chalk.hex('#ef8b81 ' + `[ Error ] `) + chalk.hex('#ef8b81 ' + `Invalid button parameters.`));
            return null; 
        }

        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(id)
                .setLabel(label)
                .setStyle(style)
                .setEmoji(emoji)
                .setDisabled(disabled)
        );
    }

    return actionRow; 
}
