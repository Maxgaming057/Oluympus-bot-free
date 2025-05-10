const Database = require("../database/OlympusDatabase");
const embed = require("./embed");
const yaml = require('js-yaml');
const fs = require('fs');
const fileContents = fs.readFileSync('./config/messages.yml', 'utf8');
const data = yaml.load(fileContents);
const { hasPerms, foundChannel, foundRole, foundMember, generateCode, foundEmoji, getCoins, getTickets, formatTime, getWinners } = require("./utils");
const { addonConsole } = require("../handlers/addonmodule");
const log = require("./log");
const client = require("../..");
const handlebuttons = require("./handlebuttons");
const db = new Database();
const Config = require('../modules/config');
const { ActionRowBuilder, ButtonBuilder, Collection, Utils } = require("discord.js");
const { execSync } = require("child_process");
const ms = require("ms");
const DB = require("../database/OlympusDatabase")
const variables = require('./variables');
const implement = require("./implement");
const chalk = require('chalk')
const Utility = {
    embed: embed,
    db: db,
    permission: hasPerms,
    findChannel: foundChannel,
    findRole: foundRole,
    findMember: foundMember, 
    generateCode: generateCode, 
    findEmoji: foundEmoji, 
    coins: getCoins,
    getTickets: getTickets,
    addonConsole: addonConsole,
    lang: data,
    clientConfig: yaml.load(fs.readFileSync('./config/config.yml', 'utf8')),
    log: log,
    getPrefix: prefix,
    buttonAdd: handlebuttons,
    config:  Config,
    formatTime: formatTime,
    userVariables: function(user, prefix = 'user') {
        if (!user) {
            Utility.log('error', `[Utils] [userVariables] Invalid input for ${chalk.bold("user")}.`);
            return {};
        }

        return {
            [`${prefix}-id`]: user.user.id,
            [`${prefix}-displayname`]: user.displayName,
            [`${prefix}-username`]: user.user.username,
            [`${prefix}-tag`]: user.user.tag,
            [`${prefix}-mention`]: `<@${user.user.id}>`,
            [`${prefix}-pfp`]: user.user.displayAvatarURL({ dynamic: true }),
            [`${prefix}-createdate`]: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>`,
        };
    },
    channelVariables: function(channel, prefix = 'channel') {
        if (!channel) {
            Utility.log('error', `[Utils] [channelVariables] Invalid input for ${chalk.bold("channel")}.`);
            return {};
        }

        return {
            [`${prefix}-id`]: channel.id,
            [`${prefix}-name`]: channel.name,
            [`${prefix}-mention`]: `<#${channel.id}>`,
            [`${prefix}-type`]: channel.type,
            [`${prefix}-createdate`]: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
        };
    },
    serverVariables: function(guild, prefix = 'guild') {
        if (!guild) {
            Utility.log('error', `[Utils] [guildVariables] Invalid input for ${chalk.bold("guild")}.`);
            return {};
        }

        return {
            [`${prefix}-id`]: guild.id,
            [`${prefix}-name`]: guild.name,
            [`${prefix}-membercount`]: guild.memberCount,
            [`${prefix}-ownerid`]: guild.ownerId,
            [`${prefix}-createdate`]: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            [`${prefix}-icon`]: guild.iconURL({ size: 1024 }),
            [`${prefix}-region`]: guild.region,
            [`${prefix}-afkchannelid`]: guild.afkChannelId? `<#${guild.afkChannelId}>` : 'None',
            [`${prefix}-afktimeout`]: guild.afkTimeout / 60,
            [`${prefix}-verificationlevel`]: guild.verificationLevel,
        };
    },

    roleVariables: function(role, prefix = 'role') {
        if (!role) {
            Utility.log('error', `[Utils] [roleVariables] Invalid input for ${chalk.bold("role")}.`);
            return {};
        }

        return {
            [`${prefix}-id`]: role.id,
            [`${prefix}-name`]: role.name,
            [`${prefix}-mention`]: `<@&${role.id}>`,
            [`${prefix}-color`]: role.hexColor,
            [`${prefix}-createdate`]: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`,
        };
    },

    botVariables: function (bot, prefix = 'bot') {
        if (!bot) {
            Utility.log('error', `[Utils] [botVariables] Invalid input for ${chalk.bold("bot")}.`);
            return {};
        }

        return {
            [`${prefix}-id`]: bot.user.id,
            [`${prefix}-username`]: bot.user.username,
            [`${prefix}-mention`]: `<@${bot.user.id}>`,
            [`${prefix}-pfp`]: bot.user.displayAvatarURL({ dynamic: true }),
            [`${prefix}-createdate`]: `<t:${Math.floor(bot.user.createdTimestamp / 1000)}:D>`,
            [`${prefix}-for`]: `<t:${Math.floor(bot.user.createdTimestamp / 1000)}:R>`,
            [`${prefix}-guildcount`]: bot.guilds.cache.size,
            [`${prefix}-channelcount`]: bot.channels.cache.size,
            [`${prefix}-membercount`] : bot.users.cache.size,
        };
    },
    getUser: async function(messageOrInteraction, type, user) {
        if (type === 'message') {
            const foundUser = await messageOrInteraction.mentions.users.first() || messageOrInteraction.guild.members.cache.find((u) => u.user.id === user)?.user || messageOrInteraction.guild.members.cache.find((u) => u.user.username === user)?.user;
            if(foundMember) {
                return foundUser
            }
        } else if (type === 'interaction') {
            return messageOrInteraction.options.getUser('user');
        }
    },
    buildbuttons: buildButtons,
    installModule: async function installModule(modules) {
        if (!Array.isArray(modules)) {
            Utility.log('error', 'InstallModule function requires an array of modules to install.');
            return;
        }
        const packageJson = require('../../package.json');
        const dependencies = packageJson.dependencies || {};
    
        for (const module of modules) {
            if (!(module in dependencies)) {
                Utility.log('info', `[ Module Installer ] Beginning installation for: ${module}`);
                try {
                    execSync(`npm install ${module}`, { stdio: 'inherit' });
                    Utility.log('success', `[ Module Installer ] ${module} installed successfully.`);
                } catch (error) {
                    Utility.log('error', `[ Module Installer ] ${module} failed to install.\n${error}`);
                }
            } else {
                return; 
            }
        }
    },
    interval: function setInterval(time, action) {
        setInterval(() => {
            action;
        }, time && time < 1000 ? ms('5m') : ms(time));
    },
    getWinners: getWinners,
    variables: variables,

    awaitForReact: async function(message, user, emojis, time) {
        if(!time) time == '1m'
        return new Promise((resolve) => {
            const collector = message.createReactionCollector({
                filter: (reaction, reactingUser) => {
                    return emojis.includes(reaction.emoji.name) && !reactingUser.bot;
                },
                time: ms(time) 
            });

            collector.on('collect', (reaction, reactingUser) => {
                if (reactingUser.id === user.id) {
                    reaction.users.remove(user.id);
                    resolve({user: user, emoji: reaction.emoji.name});
                }
            });

            collector.on('end', () => {
                resolve(null);
            });
        });
    }, 

    implement: implement
    
};

client.handler = Utility;
module.exports = Utility;

async function prefix(guild) {
    const fileContents2 = fs.readFileSync('./config/config.yml', 'utf8');
    const data2 = yaml.load(fileContents2);
    const dbdata = await db.findOne('prefix', { guild: guild });
    if (!dbdata) {
        return data2.prefix;
    } else {
        return dbdata.prefix;
    }
}


let allButtons = [new ActionRowBuilder()];

function buildButtons(buttons) {
    if (!Array.isArray(buttons)) {
        Utility.log('error', 'Buttons must be an Array');
        return;
    }

    let currentRow = allButtons[allButtons.length - 1];
    let buttonCount = 0;

    for (const button of buttons) {
        if (!button.label || !button.emoji || !button.style) continue;

        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(button.customId)
                .setLabel(button.label)
                .setEmoji(button.emoji)
                .setStyle(button.style)
        );

        buttonCount++;

        if (buttonCount === 5) {
            currentRow = new ActionRowBuilder();
            allButtons.push(currentRow);
            buttonCount = 0;
        }
    }

    setTimeout(() => {
        allButtons = [new ActionRowBuilder()];
    }, 1500);

    return allButtons;
}
