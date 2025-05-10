const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'management',
    data: new SlashCommandBuilder()
        .setName('enablecommand')
        .setDescription('Enable command !')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The commnad you want to enable')
            .setRequired(true)
        ),
        async execute(moi, args, client, { type, send }) {
           
            const command = type == 'message' ? args[0] : moi.options.getString('command');

            if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Enablecommand.permissions)) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Permission
                        })
                    ]
                }, true)
            }

            if(!command) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Usage,
                            variables: {
                             usage: `${await Utility.getPrefix(moi.guild.id)}enablecommand [command]`
                           }
                        })
                    ]
                })
            }

            const commands = client.commands;
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
                            ...Utility.lang.Enablecommand.Embed.Error,
                           variables: {
                             error: 'You can not disable or enable this command'
                           }
                        })
                    ]
                })
            }

            const hasData = await Utility.db.findOne('commands', { command: command.toLowerCase().toString() })
            if(hasData && hasData.disabled) {
                Utility.db.update('commands', { disabled: false }, { command: command.toLowerCase().toString()});
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Enablecommand.Embed.Success,
                           variables: {
                             commandName: command.toLowerCase(),
                             serverIcon: moi.guild.iconURL({ size: 1024 })
                           }
                        })
                    ]
                })
            } else {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                           ...Utility.lang.Enablecommand.Embed.Enabled,
                           variables: {
                             commandName: command.toLowerCase(),
                             serverIcon: moi.guild.iconURL({ size: 1024 })
                           }
                        })
                    ]
                })
            }
            
        }
}