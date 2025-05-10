const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'management',
    aliases: ['cmdisable', 'disablecmd'],
    data: new SlashCommandBuilder()
        .setName('disablecommand')
        .setDescription('Disable command !')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The commnad you want to disable')
            .setRequired(true)
        ),
        async execute(moi, args, client, { type, send }) {
           
            const command = type == 'message' ? args[0] : moi.options.getString('command');

            if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Disablecommand.permissions)) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission
                        })
                    ]
                }, true)
            }

            const commands = client.commands;

            if(!command) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Usage,
                            variables: {
                             usage: `${await Utility.getPrefix(moi.guild.id)}disablecommand [command]`
                           }
                        })
                    ]
                })
            }
            
            if(!commands.get(command.toLowerCase())) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Error,
                           variables: {
                             error: 'Command not found'
                           }
                        })
                    ]
                }, true)
            }

            if(command.toLowerCase() === 'disablecommand' || command.toLowerCase() === 'enablecommand') {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Disablecommand.Embed.Error,
                           variables: {
                             error: 'You can not disable or enable this command'
                           }
                        })
                    ]
                })
            }

            const hasData = await Utility.db.findOne('commands', { command: command.toLowerCase().toString() });
            if(!hasData || hasData && !hasData.disabled) {
                if (!hasData) {
                    Utility.db.insert('commands', { command: command.toLowerCase().toString(), disabled: true });
                } else {
                    Utility.db.update('commands', { disabled: true }, { command: command.toLowerCase().toString() });
                }
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Disablecommand.Embed.Success,
                           variables: {
                             commandName: command.toLowerCase(),
                             serverIcon: moi.guild.iconURL({ size: 1024 })
                           }
                        }, true)
                    ]
                })
            } else {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Disablecommand.Embed.Disabled,
                           variables: {
                             commandName: command.toLowerCase(),
                             serverIcon: moi.guild.iconURL({ size: 1024 })
                           }
                        })
                    ]
                }, true)
            }
            
        }
}