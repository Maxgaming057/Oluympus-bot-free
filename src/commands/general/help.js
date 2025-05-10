const { SlashCommandBuilder, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
module.exports = {
    category: 'general',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show client commands'),
    async execute(messageOrInteraction, args, client, { type, send }) {

        const data = Utility.lang;

        if (!Utility.permission(messageOrInteraction.member, messageOrInteraction.guild, Utility.clientConfig.Help.permissions)) {
            return send(type, messageOrInteraction, {
                embeds: [
                    Utility.embed({
                        ...data.Permission
                    })
                ]
            })
        }

        emojis = {
            'Admin': '⚙️',
            'Mod': '🛠️',
            'Util': '💎',
            'Giveaway': '🎉',
            'Fun': '😂',
            'Economy': '💰',
            'Music': '🎵',
            'General': '📒',
            'Management': '💻',
            'Addon': '➕',
            'Support': '🎫'
        }

        if (Utility.clientConfig.Help.type.toLowerCase() === 'list') {
            const commandsByCategory = new Map();
            client.commands.forEach(command => {
                const category = command.category;
                const isDisabled = Utility.clientConfig.Modules[category];
                if (isDisabled && command.category!== 'undefined') return;
                const name = command.data.name;
                const description = command.data.description;
                const commandInfo = { name, description };
                if (!commandsByCategory.has(category)) {
                    commandsByCategory.set(category, [commandInfo]);
                } else {
                    commandsByCategory.get(category).push(commandInfo);
                }
            });

            const commandList = [];
            commandsByCategory.forEach((commands, category) => {
                const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                const formattedCommands = commands.map(cmd => `- \`/${cmd.name}\`  ${cmd.description}`).join('\n');
                commandList.push(`**${emojis[formattedCategory] ? emojis[formattedCategory] : '❌'} ${formattedCategory}:**\n${formattedCommands}`);
            });

            return send(type, messageOrInteraction, {
                embeds: [
                    Utility.embed({
                        ...data.Help.Embed,
                        variables: {
                            commands: commandList.join('\n\n')
                        }
                    })
                ]
            }, true);
        }
        if (Utility.clientConfig.Help.type.toLowerCase() === 'categories') {
            const commandsByCategory = []
            client.commands.forEach(command => {
                if (!commandsByCategory.includes(command.category)) {
                    const isDisabled = Utility.clientConfig.Modules[command.category];
                    if (isDisabled && command.category !== 'undefined') return;
                    commandsByCategory.push(command.category)
                }
            });

            if (commandsByCategory == 0) {
                return send(type, messageOrInteraction, {
                    embeds: [
                        Utility.embed({
                            title: "No Modules Available",
                            description: "> All modules are currently disabled. Leave the `false` option in `./config/config.yml` to enable a module.",
                            color: 'error',
                            timestamp: true
                        })
                    ]
                })
            }

            const fields = [];
            const categories = []
            commandsByCategory.forEach(category => {
                const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                fields.push({ name: `**${emojis[formattedCategory] ? emojis[formattedCategory] : '❌'} ${formattedCategory}:**`, value: `> Commands from ${formattedCategory}`, inline: true });
                categories.push(category)
            });

            const buttons = [new ActionRowBuilder()];

            for (let i = 0; i < categories.length; i++) {
                const element = categories[i];
                const currentRow = buttons[buttons.length - 1];

                if (currentRow.components.length < 5) {
                    currentRow.components.push(
                        new ButtonBuilder()
                            .setCustomId(element)
                            .setLabel(element.charAt(0).toUpperCase() + element.slice(1))
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(emojis[element.charAt(0).toUpperCase() + element.slice(1)] ? emojis[element.charAt(0).toUpperCase() + element.slice(1)] : '❌')
                    );
                } else {
                    const newRow = new ActionRowBuilder();
                    newRow.components.push(
                        new ButtonBuilder()
                            .setCustomId(element)
                            .setLabel(element.charAt(0).toUpperCase() + element.slice(1))
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(emojis[element.charAt(0).toUpperCase() + element.slice(1)] ? emojis[element.charAt(0).toUpperCase() + element.slice(1)] : '❌')
                    );
                    buttons.push(newRow);
                }
            }

            await send(type, messageOrInteraction, {
                embeds: [
                    Utility.embed({
                        title: 'HELP',
                        fields: fields,
                        timestamp: true,
                        color: 'default',
                        thumbnail: '{serverIcon}',
                        variables: {
                            serverIcon: messageOrInteraction.guild.iconURL({ size: 1024 })
                        }
                    })
                ],
                components: buttons
            }, true).then(async message => {
                const collector = await message.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000
                })

                collector.on('collect', async i => {
                    if (type == 'message' ? i.user.id !== messageOrInteraction.author.id : i.user.id !== messageOrInteraction.user.id) {
                        return send({
                            embeds: [
                                Utility.embed(type, messageOrInteraction, {
                                    ...data.Permissions
                                })
                            ], ephemeral: true
                        })
                    }
                    const category = i.customId
                    if (categories.includes(i.customId)) {
                        const commandsByCategory = []
                        client.commands.forEach(command => {
                            if (command.category === category) {
                                commandsByCategory.push(command)
                            }
                        });
                        const prefix = await Utility.getPrefix(messageOrInteraction.guild.id)
                        i.update({
                            embeds: [
                                Utility.embed({
                                    title: `Help - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                                    description: commandsByCategory.map(cmd => `- \`${prefix}${cmd.data.name}\`  ${cmd.data.description}`).join('\n'),
                                    timestamp: true,
                                    color: 'default',
                                    thumbnail: '{serverIcon}',
                                    variables: {
                                        serverIcon: messageOrInteraction.guild.iconURL({ size: 1024 })
                                    }
                                })
                            ]
                        })
                    }
                })

                collector.on('end', async () => {
                    await message.edit({ components: [] }).catch((e) => { null })
                });
            })
        }
    }
}