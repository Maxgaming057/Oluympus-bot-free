const client = require('../../../index.js')
const fs = require('fs')
const yaml = require('js-yaml');
const Utility = require('../../../utils/modules/Utility.js');
const { PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const content = fs.readFileSync('./config/config.yml', 'utf-8');
const data = yaml.load(content);
const cooldowns = yaml.load(fs.readFileSync('./config/cooldowns.yml', 'utf-8'))
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = await Utility.getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        
        if (command.devOnly && command.devOnly === true) {
            if (message.author.id !== '1068697564343439460') {
                return message.channel.send({
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Error,
                            variables: {
                                error: 'This command is only for developers'
                            }
                        })
                    ]
                });
            }
        }

        const isDisabled = await Utility.db.findOne('commands', { command: command.data.name });
        if (isDisabled && isDisabled.disabled) {
            return message.channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Interaction,
                        variables: {
                            command: commandName.toLowerCase(),
                            serverIcon: message.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            });
        }

        const isModuleDisabled = Utility.clientConfig.Modules;
        if (isModuleDisabled[command.category] === true) {
            return message.channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Interaction,
                        variables: {
                            command: `Command module disabled: ${commandName.toLowerCase()}`,
                            serverIcon: message.guild.iconURL({ size: 1024 })
                        }
                    })
                ],
                ephemeral: true
            });
        }

        if (cooldowns[command.data.name]) {
            const hasCooldown = await Utility.db.findOne('cooldowns', { id: `${command.data.name}_${message.author.id}` });
            const remainingTime = hasCooldown ? hasCooldown.duration - Date.now() : 0;
            if (hasCooldown && remainingTime > 0) {
                return message.channel.send({
                    embeds: [
                        Utility.embed({
                            title: 'Cooldown',
                            description: `You can run this command again <t:${parseInt(hasCooldown.duration / 1000)}:R> (<t:${parseInt(hasCooldown.duration / 1000)}:F>)`,
                            color: 'default',
                            timestamp: true,
                        })
                    ]
                });
            }

            let canBypass = false;

            if (cooldowns.ByPass.channels.includes(message.channel.id) || cooldowns.ByPass.channels.includes(message.channel.name)) canBypass = true;
            if (cooldowns.ByPass.users.includes(message.author.id) || cooldowns.ByPass.users.includes(message.author.username)) canBypass = true;

            // Bypass cooldown for specific roles
            if (cooldowns.roles && Array.isArray(cooldowns.commands)) {
                for (const roleName of cooldowns.roles) {
                    const role = await Utility.findRole(message.guild, roleName);
                    if (role && message.member.roles.cache.has(role.id)) {
                        canBypass = true;
                        break;
                    }
                }
            }

            if (!canBypass) {
                const until = Date.now() + ms(cooldowns[command.data.name]);
                const existingCooldown = await Utility.db.findOne('cooldowns', { id: `${command.data.name}_${message.author.id}` });

                if (existingCooldown) {
                    await Utility.db.update('cooldowns', { duration: until }, { id: `${command.data.name}_${message.author.id}` });
                } else {
                    await Utility.db.insert('cooldowns', { cid: `${command.data.name}_${message.author.id}`, duration: until });
                }
            }
        }


        await command.execute(message, args, client, { type: 'message', send: send });


        if (data.debug) {
            Utility.log('info', `${message.member.user.username} ran the command: ${await Utility.getPrefix(message.guild.id)}${commandName} in channel: ${message.channel.name} (${message.channel.id}) [Prefix]`);
        }
    } catch (error) {

        writeError(error);
        Utility.log('error', error.message);

        return message.channel.send({
            embeds: [
                Utility.embed({
                    ...Utility.lang.ResponsError,
                    variables: {
                        error: error.message
                    }
                })
            ]
        });
    }
});
;

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) {
        return interaction.reply({ content: 'Commands are `Guild Only`!' });
    }

    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);
    if (!command) return;

    try {

        if (command.devOnly && command.devOnly === true) {
            if (interaction.user.id !== '1068697564343439460') {
                return interaction.reply({
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Error,
                            variables: {
                                error: 'This command is only for developers'
                            }
                        })
                    ],
                    ephemeral: true
                });
            }
        }

        const isDisabled = await Utility.db.findOne('commands', { command: commandName });
        if (isDisabled && isDisabled.disabled) {
            return interaction.reply({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Interaction,
                        variables: {
                            command: interaction.commandName.toLowerCase(),
                            serverIcon: interaction.guild.iconURL({ size: 1024 })
                        }
                    })
                ],
                ephemeral: true
            });
        }

        const isModuleDisabled = Utility.clientConfig.Modules;
        if (isModuleDisabled[command.category] === true) {
            return interaction.reply({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Interaction,
                        variables: {
                            command: `Command Category disabled: ${interaction.commandName.toLowerCase()}`,
                            serverIcon: interaction.guild.iconURL({ size: 1024 })
                        }
                    })
                ],
                ephemeral: true
            });
        }

        if (cooldowns[command.data.name]) {
            const hasCooldown = await Utility.db.findOne('cooldowns', { id: `${command.data.name}_${interaction.user.id}` });
            const remainingTime = hasCooldown ? hasCooldown.duration - Date.now() : 0;

            if (hasCooldown && remainingTime > 0) {
                return interaction.reply({
                    embeds: [
                        Utility.embed({
                            title: 'Cooldown',
                            description: `You can run this command again <t:${parseInt(hasCooldown.duration / 1000)}:R> (<t:${parseInt(hasCooldown.duration / 1000)}:F>)`,
                            color: 'default',
                            timestamp: true
                        })
                    ],
                    ephemeral: true
                });
            }

            let canBypass = false;

            if (cooldowns.ByPass.channels.includes(interaction.channel.id) || cooldowns.ByPass.channels.includes(interaction.channel.name)) canBypass = true;
            if (cooldowns.ByPass.users.includes(interaction.user.id) || cooldowns.ByPass.users.includes(interaction.user.username)) canBypass = true;

            if (cooldowns.roles && Array.isArray(cooldowns.commands)) {
                for (const roleName of cooldowns.roles) {
                    const role = await Utility.findRole(interaction.guild, roleName);
                    if (role && interaction.member.roles.cache.has(role.id)) {
                        canBypass = true;
                        break;
                    }
                }
            }

            if (!canBypass) {
                const until = Date.now() + ms(cooldowns[command.data.name]);
                const existingCooldown = await Utility.db.findOne('cooldowns', { id: `${command.data.name}_${interaction.user.id}` });

                if (existingCooldown) {
                    await Utility.db.update('cooldowns', { duration: until }, { id: `${command.data.name}_${interaction.user.id}` });
                } else {
                    await Utility.db.insert('cooldowns', { cid: `${command.data.name}_${interaction.user.id}`, duration: until });
                }
            }
        }

        await command.execute(
            interaction,
            [],
            client,
            {
                type: 'interaction',
                send: send
            }
        );

        if (data.debug) {
            Utility.log('info', `${interaction.member.user.username} run the command: /${commandName} in channel: ${interaction.channel.name} (${interaction.channel.id}) [ Slash ]`);
        }

    } catch (error) {
        // Rukovanje greškama
        Utility.log('error', error.message);
        writeError(error);
        interaction.reply({
            embeds: [
                Utility.embed({
                    ...Utility.lang.ResponsError,
                    variables: {
                        error: error.message
                    }
                })
            ]
        });
    }
});


async function send(type, moi, data, deffered) {
    return new Promise((resolve, reject) => {
        if (type === 'interaction') {
            if (deffered != true) {
                resolve(moi.reply(data));
            } else if (deffered == true) {
                moi.deferReply().then(() => {
                    resolve(moi.editReply(data));
                }).catch(reject);
            } else {
                resolve(moi.reply(data));
            }
        }
        if (type === 'message') {
            resolve(moi.channel.send(data));
        }
    });
}

function writeError(error) {
    try {
        fs.appendFileSync('./utils/handlers/errors.txt', `\n------- [ ${Utility.formatTime('dms', Date.now())} ] --------\n` + '➔ ' + error + '\n-------------------------------------------------------\n', 'utf8'); // Promenio sam na appendFileSync
        Utility.log('info', '➔ Error has been saved to: ./utils/handlers/errors.txt');
    } catch (err) {
        Utility.log('error', err);
    }
}
