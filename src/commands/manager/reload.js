const { SlashCommandBuilder, ChannelType, ButtonStyle, Collection } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const reloadBot = require('../../../utils/handlers/reloadbot')

module.exports = {
    category: 'management',
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Restart the bot')
        .addStringOption(options => options
            .setName('part')
            .setDescription('The part of bot you want to restart')
            .addChoices(
                { name: 'Commands', value: 'commands' },
                { name: 'Events', value: 'events' },
                { name: 'Addons', value: 'addons' },
                { name: 'Modules', value: 'modules' },
            )
            .setRequired(false)
        ),
    async execute(moi, args, client, { type, send }) {

        try {
            let toReload;
            if (type == 'interaction') toReload = moi.options.getString('part') || 'all';
            if (type == 'message') toReload = args[0] || 'all';

            const methods = ['commands', 'events', 'addons', 'modules']

            if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Reload.permissions)) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission,
                        })
                    ]
                }, true)
            }

            if (toReload !== 'all' && !methods.includes(toReload.toLowerCase())) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Usage,
                            variables: {
                                usage: `${await Utility.getPrefix(moi.guild.id)}reload [commands/events/addons/modules]`
                            }
                        })
                    ]
                })
            }

            const msg = await send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Reload.Reloading,
                        variables: {
                            reloadMethod: toReload.toLowerCase()
                        }
                    })
                ]
            })

            if (toReload.toLowerCase() == 'commands') {
                reloadBot.reloadCommands(client).then(s => {
                    if (s.status === 200) {
                        msg.edit({
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Reload.ReloadCommands,
                                })
                            ]
                        })
                    }
                })
            }

            if (toReload.toLowerCase() == 'events') {
                reloadBot.reloadEvents(client).then(s => {
                    if (s.status === 200) {
                        msg.edit({
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Reload.ReloadEvents,
                                })
                            ]
                        })
                    }
                })
            }

            if (toReload.toLowerCase() == 'addons') {
                reloadBot.reloadAddons(client).then(s => {
                    if (s.status === 200) {
                        msg.edit({
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Reload.ReloadAddons,
                                })
                            ]
                        })
                    }
                })
            }

            if (toReload.toLowerCase() == 'modules') {
                await Utility.lang;
                reloadBot.reloadModules(client).then(s => {
                    if (s.status === 200) {
                        msg.edit({
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Reload.ReloadModules,
                                })
                            ]
                        })
                    }
                })
            }

            if (toReload.toLowerCase() == 'all') {
                reloadBot.reloadAddons(client);
                reloadBot.reloadEvents(client);
                reloadBot.reloadCommands(client).then(s => {
                    if (s.status === 200) {
                        msg.edit({
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Reload.Reload,
                                })
                            ]
                        })
                    }
                })
            }
        } catch (error) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: error.message
                        }
                    })
                ]
            })
        }
    }
}